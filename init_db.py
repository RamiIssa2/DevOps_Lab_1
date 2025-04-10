import sqlite3

# Connect or create a new database
conn = sqlite3.connect('tasks.db')

# Create a cursor to execute SQL
cursor = conn.cursor()

# Create table
cursor.execute('''
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed'))
)
''')

# Commit changes and close connection
conn.commit()
conn.close()