import os
import sqlite3
import pytest
from unittest.mock import patch

# Set environment variable to use test database
TEST_DB = 'test_tasks.db'
os.environ["DB_FILE"] = TEST_DB

from app import app

# Override DB_FILE for testing
app.config['TESTING'] = True


def setup_test_db():
    conn = sqlite3.connect(TEST_DB)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            status TEXT NOT NULL CHECK (status IN ('pending', 'completed')),
            priority TEXT NOT NULL DEFAULT 'Medium'
        );
    ''')
    conn.commit()
    conn.close()


@pytest.fixture
def client():
    setup_test_db()
    with app.test_client() as client:
        yield client
    os.remove(TEST_DB)


# Mock classifier output to always return 'Medium'
mock_classifier_output = {
    'labels': ['Medium', 'Low', 'High'],
    'scores': [0.8, 0.1, 0.1]
}


# Patch get_db_connection to use test DB
def get_test_db_connection():
    conn = sqlite3.connect(TEST_DB)
    conn.row_factory = sqlite3.Row
    return conn


# Inject test DB connection function
app.view_functions['get_db_connection'] = get_test_db_connection


# ---------- TEST CASES BELOW ----------

@patch("app.classifier", return_value=mock_classifier_output)
def test_get_empty_tasks(mocked_classifier, client):
    response = client.get('/tasks')
    assert response.status_code == 200
    assert response.get_json() == []


@patch("app.classifier", return_value=mock_classifier_output)
def test_create_task(mocked_classifier, client):
    task_data = {
        "title": "Test Task",
        "description": "This is a test task",
        "status": "pending"
    }
    response = client.post('/tasks', json=task_data)
    assert response.status_code == 201
    json_data = response.get_json()
    assert json_data['title'] == "Test Task"
    assert json_data['description'] == "This is a test task"
    assert json_data['status'] == "pending"
    assert json_data['priority'] in ["High", "Medium", "Low"]


@patch("app.classifier", return_value=mock_classifier_output)
def test_update_task(mocked_classifier, client):
    # Create a task first
    task_data = {
        "title": "Original Task",
        "description": "Original description",
        "status": "pending"
    }
    post = client.post('/tasks', json=task_data).get_json()
    print("POST response:", post)
    task_id = post['id']

    # Update it
    update_data = {
        "title": "Updated Task",
        "description": "Updated description",
        "status": "completed",
        "priority": "High"
    }
    response = client.put(f'/tasks/{task_id}', json=update_data)
    assert response.status_code == 200
    assert response.get_json()['status'] == "completed"


@patch("app.classifier", return_value=mock_classifier_output)
def test_delete_task(mocked_classifier, client):
    # Create a task
    task_data = {
        "title": "To be deleted",
        "description": "Will delete",
        "status": "pending"
    }
    post = client.post('/tasks', json=task_data).get_json()
    task_id = post['id']

    # Delete the task
    response = client.delete(f'/tasks/{task_id}')
    assert response.status_code == 200
    assert "deleted" in response.get_json()['message']
