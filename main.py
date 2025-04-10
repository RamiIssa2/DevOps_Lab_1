from init_db import create_db
from db_controller import run_app


# Press the green button in the gutter to run the script.
if __name__ == '__main__':
    create_db()
    print("Database initialized.")
    run_app()
