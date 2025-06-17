import psycopg2
from werkzeug.security import generate_password_hash
from getpass import getpass # A library to hide password input

# --- IMPORTANT: Copy your DB credentials from app.py ---
DB_NAME = "signature_db"
DB_USER = "syauqi" # <-- CHANGE THIS
DB_PASS = ""
DB_HOST = "localhost"
DB_PORT = "5432"

def create_first_admin():
    """
    A command-line script to securely create the first admin user.
    """
    print("--- Create First Admin User ---")
    
    try:
        # Get admin details from user input
        email = input("Enter admin email: ")
        # Use getpass to hide the password as you type
        password = getpass("Enter admin password: ")
        password_confirm = getpass("Confirm admin password: ")

        if password != password_confirm:
            print("Passwords do not match. Aborting.")
            return

        if not email or not password:
            print("Email and password cannot be empty. Aborting.")
            return

        # Hash the password securely
        hashed_password = generate_password_hash(password)

        # Connect to the database and insert the new admin
        conn = psycopg2.connect(
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASS,
            host=DB_HOST,
            port=DB_PORT
        )
        
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO Admin (admin_email, admin_password) VALUES (%s, %s)",
                (email, hashed_password)
            )
            conn.commit()
            
        print(f"\n✅ Admin '{email}' created successfully!")

    except psycopg2.IntegrityError:
        print(f"\n❌ ERROR: An admin with the email '{email}' already exists.")
    except Exception as e:
        print(f"\n❌ An error occurred: {e}")
    finally:
        if 'conn' in locals() and conn:
            conn.close()

# --- Run the function when the script is executed ---
if __name__ == '__main__':
    create_first_admin()