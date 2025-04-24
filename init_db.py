import sqlite3


def create_db():
    # Connect or create a new database
    conn = sqlite3.connect('tasks.db')

    # Create a cursor to execute SQL
    cursor = conn.cursor()

    # Create table
    cursor.execute('''
    CREATE TABLE tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('pending', 'completed')),
        priority TEXT NOT NULL DEFAULT 'Medium'
    );
    ''')

    # Commit changes and close connection
    conn.commit()
    conn.close()
