import os
import psycopg2
import psycopg2.extras
from flask import Flask, request, jsonify, session
from flask_cors import CORS, cross_origin
from werkzeug.security import generate_password_hash, check_password_hash
from PIL import Image
from functools import wraps
import numpy as np
import io
import tensorflow as tf
from psycopg2.extensions import register_adapter, AsIs
from dotenv import load_dotenv


# ===================================================================
#                      INITIALIZATION & SETUP
# ===================================================================

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY')
app.config['UPLOAD_FOLDER'] = 'uploads'
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

CORS(
    app,
    resources={r"/api/*": {"origins": "http://localhost:5173"}},
    methods=['GET', 'POST', 'PUT', 'DELETE'],
    supports_credentials=True
)

DB_NAME = "signature_db"
DB_USER = "syauqi" # <-- CHANGE THIS
DB_PASS = ""
DB_HOST = "localhost"
DB_PORT = "5432"

try:
    triplet_model = tf.keras.models.load_model('best_triplet_model.h5', custom_objects={'triplet_loss': None}, compile=False)
    embedding_model = triplet_model.get_layer('embedding_model')
    print("--- AI model loaded successfully ---")
except Exception as e:
    print(f"Error loading model: {e}")
    embedding_model = None

def get_db_connection():
    conn = psycopg2.connect(database=DB_NAME, user=DB_USER, password=DB_PASS, host=DB_HOST, port=DB_PORT)
    return conn

def adapt_numpy_array(numpy_array):
    return AsIs(list(numpy_array))
register_adapter(np.ndarray, adapt_numpy_array)

def preprocess_image(image_bytes):
    img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    img = img.resize((224, 224))
    img_array = np.array(img) / 255.0
    img_array = 1.0 - img_array
    return np.expand_dims(img_array, axis=0)

# ===================================================================
#                       API ENDPOINTS (MODEL B)
# ===================================================================

# ----------------- Admin Authentication -----------------

@app.route('/api/login', methods=['POST'])
def api_admin_login():
    # MODIFIED: This endpoint now ONLY checks the Admin table.
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("SELECT * FROM Admin WHERE admin_email = %s", (email,))
            admin = cur.fetchone()
        
        if admin and check_password_hash(admin['admin_password'], password):
            session.clear()
            session['user_id'] = admin['admin_id']
            session['user_type'] = 'admin' # The only user type is now 'admin'
            session['user_email'] = admin['admin_email']
            return jsonify({'message': 'Admin login successful', 'user_type': 'admin', 'user_id': session['user_id']})
        else:
            return jsonify({'error': 'Invalid admin credentials'}), 401
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/logout', methods=['POST'])
def api_logout():
    session.clear()
    return jsonify({'message': 'Logout successful'})
    
@app.route('/api/auth/status', methods=['GET'])
def auth_status():
    """An endpoint to check if a user is logged in."""
    if 'user_id' in session and session.get('user_type') == 'admin':
        return jsonify({
            'isLoggedIn': True,
            'user': {'id': session['user_id'], 'email': session['user_email'], 'type': 'admin'}
        })
    return jsonify({'isLoggedIn': False})


# ----------------- Admin-Managed Customer & Signature Actions -----------------

def admin_required(f):
    """A decorator to protect routes that require admin access."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session or session.get('user_type') != 'admin':
            return jsonify({'error': 'Unauthorized: Admin access required'}), 401
        return f(*args, **kwargs)
    return decorated_function

# DELETE your existing 'api_create_customer_and_signature' function
# and REPLACE it with this corrected version.

@app.route('/api/admin/customer_with_signature', methods=['POST'])
@admin_required
def api_create_customer_and_signature():
    """
    A single endpoint to create a customer, log the registration,
    and upload their first genuine signature.
    """
    # For multipart/form-data, we use request.form for text fields
    if 'name' not in request.form or 'email' not in request.form or 'national_id' not in request.form:
        return jsonify({'error': 'Name, email, and national ID are required'}), 400
    if 'signature_file' not in request.files:
        return jsonify({'error': 'Signature file is required'}), 400

    customer_name = request.form.get('name')
    customer_email = request.form.get('email')
    customer_phone = request.form.get('phone')
    national_id = request.form.get('national_id')
    file = request.files['signature_file']
    admin_id = session['user_id']
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            # --- THIS IS THE CORRECTED PART ---
            # The SQL query now has 4 columns and 4 placeholders, which perfectly
            # matches the 4 variables in the tuple below.
            cur.execute(
                "INSERT INTO Customer (customer_name, customer_email, customer_phone, national_id) VALUES (%s, %s, %s, %s) RETURNING customer_id",
                (customer_name, customer_email, customer_phone, national_id)
            )
            customer_id = cur.fetchone()['customer_id']

            # Log the registration event
            cur.execute(
                "INSERT INTO Registration (customer_id, admin_id) VALUES (%s, %s)",
                (customer_id, admin_id)
            )

            # Save the file and process the signature
            filename = f"customer_{customer_id}_{file.filename}"
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)

            # Get embedding from the AI model
            with open(filepath, 'rb') as f:
                img_bytes = f.read()
            preprocessed_img = preprocess_image(img_bytes)
            embedding = embedding_model.predict(preprocessed_img)[0]
            embedding_list = embedding.tolist()

            # Insert the signature record
            cur.execute(
                "INSERT INTO HandSignature (customer_id, signature_image, embedding) VALUES (%s, %s, %s)",
                (customer_id, filename, embedding_list)
            )
            
            conn.commit()

        return jsonify({'message': 'Customer and signature registered successfully', 'customer_id': customer_id}), 201
    except psycopg2.IntegrityError as e:
        conn.rollback()
        if 'customer_email_key' in str(e):
            return jsonify({'error': 'Customer email already exists'}), 409
        if 'customer_national_id_key' in str(e):
            return jsonify({'error': 'National ID already exists'}), 409
        return jsonify({'error': 'A unique field already exists.'}), 409
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/admin/customer/<int:customer_id>', methods=['PUT'])
@admin_required
def api_update_customer(customer_id):
    """
    UPDATED: Handles updating customer text details AND optionally replacing
    their reference signature file and embedding.
    """
    # This endpoint now handles multipart/form-data
    if 'customer_name' not in request.form or 'customer_email' not in request.form or 'national_id' not in request.form:
         return jsonify({'error': 'Name, email, and national ID are required in form data.'}), 400

    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            # Step 1: Update the customer's text details first.
            cur.execute(
                "UPDATE Customer SET customer_name = %s, customer_email = %s, customer_phone = %s, national_id = %s WHERE customer_id = %s",
                (
                    request.form.get('customer_name'),
                    request.form.get('customer_email'),
                    request.form.get('customer_phone'),
                    request.form.get('national_id'),
                    customer_id
                )
            )

            # Step 2: Check if a new signature file was uploaded.
            if 'signature_file' in request.files:
                new_file = request.files['signature_file']
                
                # First, find the old signature record to get the filename to delete.
                cur.execute("SELECT signature_id, signature_image FROM HandSignature WHERE customer_id = %s LIMIT 1", (customer_id,))
                old_signature = cur.fetchone()

                if old_signature:
                    # Delete the old file from the /uploads folder.
                    old_filepath = os.path.join(app.config['UPLOAD_FOLDER'], old_signature['signature_image'])
                    if os.path.exists(old_filepath):
                        os.remove(old_filepath)
                    
                    # Delete the old record from the database.
                    cur.execute("DELETE FROM HandSignature WHERE signature_id = %s", (old_signature['signature_id'],))

                # Now, process and save the new signature.
                new_filename = f"customer_{customer_id}_{new_file.filename}"
                new_filepath = os.path.join(app.config['UPLOAD_FOLDER'], new_filename)
                new_file.save(new_filepath)

                with open(new_filepath, 'rb') as f:
                    img_bytes = f.read()
                
                embedding = embedding_model.predict(preprocess_image(img_bytes))[0]
                embedding_list = embedding.tolist()

                # Insert the new signature record.
                cur.execute(
                    "INSERT INTO HandSignature (customer_id, signature_image, embedding) VALUES (%s, %s, %s)",
                    (customer_id, new_filename, embedding_list)
                )

            # Commit all changes as a single transaction.
            conn.commit()
        return jsonify({'message': 'Customer updated successfully'})
    except psycopg2.IntegrityError:
        conn.rollback()
        return jsonify({'error': 'Email or National ID already exists for another customer.'}), 409
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        if conn:
            conn.close()


@app.route('/api/admin/customers', methods=['GET'])
@admin_required
def api_get_all_customers():
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("SELECT customer_id, customer_name, customer_email, national_id FROM Customer ORDER BY customer_name ASC")
            customers = cur.fetchall()
        return jsonify(customers)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/admin/customer/<int:customer_id>', methods=['GET'])
@admin_required
def api_get_customer_details(customer_id):
    """Fetches the details for a single customer by their ID."""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("SELECT * FROM Customer WHERE customer_id = %s", (customer_id,))
            customer = cur.fetchone()
        
        if not customer:
            return jsonify({'error': 'Customer not found'}), 404
            
        return jsonify(customer)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/admin/signature/verify', methods=['POST'])
@admin_required
def api_admin_verify_signature():
    """Verifies a new signature against a specific customer's stored signatures."""
    if 'national_id' not in request.form:
        return jsonify({'error': 'national_id is required'}), 400
    if 'signature_file' not in request.files:
        return jsonify({'error': 'No signature file provided for verification'}), 400

    file = request.files['signature_file']
    national_id = request.form.get('national_id')
    admin_id = session['user_id']
    optimal_threshold = 1.4698  # The threshold from model evaluation

    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("SELECT customer_id FROM Customer WHERE national_id = %s", (national_id,))
            customer_record = cur.fetchone()
        
        if not customer_record:
            return jsonify({'error': 'No customer found with that National ID'}), 404
        
        customer_id = customer_record['customer_id']
        # Get embedding for the new signature to verify
        img_bytes = file.read()
        new_embedding = embedding_model.predict(preprocess_image(img_bytes))[0]
        new_embedding_list = new_embedding.tolist()

        # Find the closest stored signature for the specified customer
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(
                "SELECT embedding <-> %s::vector AS distance FROM HandSignature WHERE customer_id = %s ORDER BY distance ASC LIMIT 1",
                (new_embedding_list, customer_id)
            )
            result = cur.fetchone()

        if not result:
            return jsonify({'error': 'No genuine signatures found for this user to compare against.'}), 404

        distance = result['distance']
        is_verified = bool(distance < optimal_threshold)
        status = 'passed' if is_verified else 'failed'
        
        # Log the verification attempt
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO Verification (customer_id, admin_id, verification_status) VALUES (%s, %s, %s)",
                (customer_id, admin_id, status)
            )
            conn.commit()

        # Calculate a "percentage match" for the UI. This is a simple inverse of the distance.
        # NOTE: This is a cosmetic calculation and not a true statistical probability.
        match_percentage = max(0, (1 - (distance / (optimal_threshold * 2)))) * 100
        
        return jsonify({
            'is_verified': is_verified,
            'status': status,
            'distance': float(distance),
            'match_percentage': round(match_percentage), # Round to a whole number
            'threshold': optimal_threshold
        })
    except Exception as e:
        conn.rollback()
        return jsonify({'error': f'Verification failed: {str(e)}'}), 500
    finally:
        if conn:
            conn.close()

#@cross_origin(supports_credentials=True)
@app.route('/api/admin/customer/<int:customer_id>', methods=['DELETE'])
@admin_required
def api_delete_customer(customer_id):
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            # To maintain data integrity, we must delete records referencing the customer first.
            cur.execute("DELETE FROM HandSignature WHERE customer_id = %s", (customer_id,))
            cur.execute("DELETE FROM Verification WHERE customer_id = %s", (customer_id,))
            cur.execute("DELETE FROM Registration WHERE customer_id = %s", (customer_id,))
            # Finally, delete the customer themselves.
            cur.execute("DELETE FROM Customer WHERE customer_id = %s", (customer_id,))
            conn.commit()
        # Ensure a JSON response is always returned for successful DELETE
        return jsonify({'message': 'Customer and all related data deleted successfully'}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        if conn:
            conn.close()

# ===================================================================
#                       MAIN EXECUTION BLOCK
# ===================================================================
with app.app_context():
    print("--- REGISTERED URL ROUTES ---")
    for rule in app.url_map.iter_rules():
        print(f"Endpoint: {rule.endpoint}, Methods: {rule.methods}, URL: {rule}")
    print("-----------------------------")

if __name__ == '__main__':
    # We need to import wraps for our decorator
    app.run(host='0.0.0.0', port=5001, debug=True)