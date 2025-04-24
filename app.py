from flask import Flask, request, jsonify
import sqlite3

app = Flask(__name__)
DB_FILE = 'tasks.db'


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
    priority = data.get('priority', 'Medium')

    if not title or not description:
        return jsonify({'error': 'Title and description are required'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    conn.execute(
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
    title = data.get('title')
    description = data.get('description')
    status = data.get('status')
    priority = data.get('priority', 'Medium')

    conn = get_db_connection()
    cursor = conn.cursor()
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
    app.run(debug=True)
