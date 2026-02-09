import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import inspect, text
from database import engine


def main():
    inspector = inspect(engine)
    try:
        cols = [c["name"] for c in inspector.get_columns("users")]
    except Exception as e:
        print("Error inspecting 'users' table:", e)
        return 1

    if "course" in cols:
        print("Column 'course' already exists on 'users' table. No action taken.")
        return 0

    # Add column (nullable VARCHAR)
    try:
        with engine.begin() as conn:
            conn.execute(text('ALTER TABLE users ADD COLUMN course VARCHAR;'))
        print("Added column 'course' to 'users' table.")
        return 0
    except Exception as e:
        print("Failed to add column 'course':", e)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
