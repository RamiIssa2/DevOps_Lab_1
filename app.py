from transformers import pipeline
from flask import Flask, request, jsonify
from flask_cors import CORS
import time
import os

import sqlite3

app = Flask(__name__)
CORS(app)
DB_FILE = os.environ.get("DB_FILE", "tasks.db")

# Loading zero-shot classification pipeline (once)
classifier = pipeline(
    "zero-shot-classification",
    model="facebook/bart-large-mnli",
    cache_dir="/root/.cache/huggingface",
    local_files_only=True
)

# WARM-UP CALL to reduce first-time inference latency
print("Warming up model...")
start = time.time()
_ = classifier("Initial model warm-up", ["High", "Medium", "Low"])
print(f"Model warmed up in {time.time() - start:.2f} seconds.")

# Defining priority levels
PRIORITY_LABELS = ["High", "Medium", "Low"]


def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn


@app.route('/tasks', methods=['GET'])
def get_tasks():
    conn = get_db_connection()
    tasks = conn.execute('SELECT * FROM tasks').fetchall()
    conn.close()
    return jsonify([dict(task) for task in tasks])


@app.route('/tasks/<int:id>', methods=['GET'])
def get_task(id):
    conn = get_db_connection()
    task = conn.execute('SELECT * FROM tasks WHERE id = ?', (id,)).fetchone()
    conn.close()
    if task is None:
        return jsonify({'error': 'Task not found'}), 404
    return jsonify(dict(task))


@app.route('/tasks', methods=['POST'])
def create_task():
    data = request.get_json()
    title = data.get('title')
    description = data.get('description')
    status = data.get('status', 'pending')

    if status not in ['pending', 'completed']:
        return jsonify({"error": "Invalid status"}), 400

    full_text = f"{title}. {description}"
    # Predict priority using zero-shot model
    result = classifier(full_text, PRIORITY_LABELS)
    predicted_priority = result['labels'][0]  # Top label

    priority = data.get('priority', predicted_priority)

    if not title or not description:
        return jsonify({'error': 'Title and description are required'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        'INSERT INTO tasks (title, description, status, priority) VALUES (?, ?, ?, ?)',
        (title, description, status, priority)
    )
    conn.commit()
    task_id = cursor.lastrowid
    conn.close()
    return jsonify({'id': task_id, 'title': title, 'description': description,
                    'status': status, 'priority': priority}), 201


@app.route('/tasks/<int:id>', methods=['PUT'])
def update_task(id):
    data = request.get_json()
    conn = get_db_connection()
    cursor = conn.cursor()

    # Fetch current task to preserve unchanged fields
    existing = conn.execute('SELECT * FROM tasks WHERE id = ?', (id,)).fetchone()
    if not existing:
        conn.close()
        return jsonify({'error': 'Task not found'}), 404

    title = data.get('title', existing['title'])
    description = data.get('description', existing['description'])
    status = data.get('status', existing['status'])
    priority = data.get('priority', existing['priority'])

    cursor.execute('UPDATE tasks SET title = ?, description = ?, status = ?, priority = ? WHERE id = ?',
                   (title, description, status, priority, id))
    conn.commit()
    conn.close()

    return jsonify({'id': id, 'title': title, 'description': description, 'status': status, 'priority': priority})


@app.route('/tasks/<int:id>', methods=['DELETE'])
def delete_task(id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM tasks WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    return jsonify({'message': f'Task {id} deleted.'})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
