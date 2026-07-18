import tempfile
import unittest
from pathlib import Path

from fastapi.testclient import TestClient

import tinydb_app
from tinydb_app import TinyDBManager


class TinyDBManagerTests(unittest.TestCase):
    def test_prepare_db_file_initializes_empty_file(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            db_path = Path(tmpdir) / 'staff_db.json'
            db_path.write_text('', encoding='utf-8')

            manager = TinyDBManager(str(db_path))

            self.assertEqual(manager.get_users(), [])
            self.assertEqual(db_path.read_text(encoding='utf-8').strip(), '{}')
            manager.close()

    def test_prepare_db_file_resets_invalid_json(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            db_path = Path(tmpdir) / 'staff_db.json'
            db_path.write_text('{invalid', encoding='utf-8')

            manager = TinyDBManager(str(db_path))

            self.assertEqual(manager.get_shifts(), [])
            self.assertEqual(db_path.read_text(encoding='utf-8').strip(), '{}')
            manager.close()

    def test_add_user_and_shift_round_trip(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            db_path = Path(tmpdir) / 'staff_db.json'
            manager = TinyDBManager(str(db_path))

            user_id = manager.add_user('Jane', 'jane@example.com', '555-0100', 'Cook')
            shift_id = manager.add_shift(user_id, 'Cook', '2026-07-18', '09:00', '17:00')

            users = manager.get_users()
            shifts = manager.get_shifts()

            self.assertEqual(user_id, 1)
            self.assertEqual(shift_id, 1)
            self.assertEqual(users[0]['name'], 'Jane')
            self.assertEqual(shifts[0]['role'], 'Cook')
            self.assertTrue(manager.user_exists(user_id))
            manager.close()


class ApiEndpointTests(unittest.TestCase):
    def setUp(self):
        self.tempdir = tempfile.TemporaryDirectory()
        db_path = str(Path(self.tempdir.name) / 'staff_db.json')
        self.original_db = tinydb_app.db
        tinydb_app.db = TinyDBManager(db_path)
        self.client = TestClient(tinydb_app.app)

    def tearDown(self):
        tinydb_app.db.close()
        tinydb_app.db = self.original_db
        self.tempdir.cleanup()

    def test_add_user_endpoint(self):
        response = self.client.post(
            '/users',
            json={
                'name': 'Alex',
                'email': 'alex@example.com',
                'phone': '555-0101',
                'role': 'Manager',
            },
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['role'], 'Manager')

    def test_add_shift_endpoint_requires_existing_user(self):
        response = self.client.post(
            '/shifts',
            json={
                'user_id': 999,
                'role': 'Cook',
                'day': '2026-07-19',
                'start_time': '10:00',
                'end_time': '18:00',
            },
        )

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json()['detail'], 'User not found')

    def test_add_shift_and_list_endpoints(self):
        user_response = self.client.post(
            '/users',
            json={
                'name': 'Sam',
                'email': 'sam@example.com',
                'phone': '555-0102',
                'role': 'Server',
            },
        )
        user_id = user_response.json()['id']

        shift_response = self.client.post(
            '/shifts',
            json={
                'user_id': user_id,
                'role': 'Server',
                'day': '2026-07-20',
                'start_time': '11:00',
                'end_time': '19:00',
            },
        )

        users_response = self.client.get('/users')
        shifts_response = self.client.get('/shifts')

        self.assertEqual(shift_response.status_code, 200)
        self.assertEqual(shift_response.json()['role'], 'Server')
        self.assertEqual(len(users_response.json()), 1)
        self.assertEqual(len(shifts_response.json()), 1)
        self.assertEqual(shifts_response.json()[0]['user_id'], user_id)


if __name__ == '__main__':
    unittest.main()