# SigNet - Signature Verification Web Application

A comprehensive signature verification system built with Flask backend and React frontend, utilizing advanced machine learning techniques for handwritten signature authentication.

## 🎯 Overview

SigNet is a secure web application that enables organizations to verify handwritten signatures using machine learning. The system employs a triplet neural network trained on the CEDAR signature dataset to provide accurate signature authentication with confidence scores.

## ✨ Features

### Core Functionality
- **Signature Verification**: Real-time signature verification with confidence percentages
- **Customer Management**: Complete CRUD operations for customer records
- **Multi-Input Methods**: Support for both file upload and digital drawing of signatures
- **Secure Authentication**: Admin-only access with session-based authentication
- **Database Integration**: PostgreSQL with encrypted signature storage

### Advanced Features
- **Machine Learning**: Triplet neural network for signature embedding and comparison
- **Encryption**: Secure storage of signature embeddings using Fernet encryption
- **File Management**: Automatic cleanup of orphaned signature files
- **Responsive UI**: Modern React interface with Bootstrap styling
- **Real-time Canvas**: Digital signature drawing with pressure sensitivity support

## 🛠️ Technology Stack

### Backend
- **Framework**: Flask (Python 3.11)
- **Database**: PostgreSQL with pgvector extension
- **ML/AI**: TensorFlow/Keras for signature analysis
- **Security**: Cryptography (Fernet) for data encryption
- **Image Processing**: PIL (Pillow) for signature preprocessing

### Frontend
- **Framework**: React 19+ with Vite
- **UI Components**: React Bootstrap + Chakra UI
- **Routing**: React Router DOM
- **Styling**: Custom CSS with Bootstrap theming

### Database
- **Primary**: PostgreSQL
- **Extensions**: pgvector for embedding similarity searches
- **Tables**: Customer, HandSignature, Admin, Verification

## 📁 Project Structure

```
SigNet final/
├── backend/
│   ├── app.py                     # Main Flask application
│   ├── best_triplet_model.h5      # Trained ML model
│   ├── create_admin.py            # Admin user creation script
│   ├── migrate_embeddings.py      # Database migration utilities
│   ├── Pipfile                    # Python dependencies
│   └── uploads/                   # Customer signature files
├── frontend/
│   ├── src/
│   │   ├── components/            # Reusable React components
│   │   ├── pages/                 # Application pages
│   │   ├── apiService.js          # API communication layer
│   │   └── App.jsx                # Main application component
│   ├── package.json               # Node.js dependencies
│   └── vite.config.js             # Vite configuration
├── dataset/
│   ├── CEDAR/                     # CEDAR signature dataset
│   └── ICDAR2011/                 # ICDAR signature dataset
└── trained models and report/
    ├── signet-keras-triplet-gpu-2.ipynb
    └── output_triplet_signet_cnn/  # Model training outputs
```

## 🚀 Installation & Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 13+
- Git

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/syauu/signature-verification-web-app.git
   cd "SigNet final"
   ```

2. **Install Python dependencies**
   ```bash
   cd backend
   pip install pipenv
   pipenv install
   pipenv shell
   ```

3. **Database Setup**
   ```bash
   # Create PostgreSQL database
   createdb signature_db
   
   # Install pgvector extension
   psql signature_db -c "CREATE EXTENSION vector;"
   ```

4. **Environment Configuration**
   Create `.env` file in the backend directory:
   ```env
   SECRET_KEY=your_secret_key_here
   ENCRYPTION_KEY=your_32_byte_base64_key_here
   DB_NAME=signature_db
   DB_USER=your_db_user
   DB_PASS=your_db_password
   DB_HOST=localhost
   DB_PORT=5432
   ```

5. **Create Admin User**
   ```bash
   python create_admin.py
   ```

6. **Start Backend Server**
   ```bash
   python app.py
   ```

### Frontend Setup

1. **Install Node.js dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

## 🎮 Usage

### Admin Authentication
1. Navigate to `http://localhost:5173/login`
2. Login with admin credentials created during setup

### Customer Registration
1. Go to "Register Customer" page
2. Fill in customer details (name, email, phone, national ID)
3. Upload or draw the customer's genuine signature
4. Submit to create customer record

### Signature Verification
1. Access "Verify Signature" page
2. Enter customer's National ID
3. Upload or draw the signature to verify
4. View verification results with confidence percentage

### Customer Management
1. Use "Manage Customers" to view all registered customers
2. Edit customer information or add additional signatures
3. Delete customers and their associated data

## 🔬 Machine Learning Model

### Architecture
- **Model Type**: Triplet Neural Network
- **Training Dataset**: CEDAR Signature Dataset
- **Embedding Dimension**: 128-dimensional vectors
- **Distance Metric**: Euclidean distance with optimized threshold

### Performance
- **Optimal Threshold**: 10.9226
- **Accuracy**: High precision on genuine vs. forged signatures
- **Real-time**: Fast inference for web application use

### Training Details
The model was trained using:
- Triplet loss function for learning discriminative embeddings
- Data augmentation techniques for robustness
- GPU acceleration for efficient training
- Comprehensive evaluation on test datasets

## 🔐 Security Features

### Data Protection
- **Encryption**: All signature embeddings encrypted at rest
- **Session Management**: Secure admin authentication
- **File Security**: Automatic cleanup of orphaned files
- **Input Validation**: Comprehensive server-side validation

### Access Control
- **Admin-only Interface**: All operations require admin authentication
- **CORS Configuration**: Restricted cross-origin requests
- **Session Timeout**: Automatic logout for security

## 📊 API Endpoints

### Authentication
- `POST /api/login` - Admin login
- `POST /api/logout` - Logout
- `GET /api/auth/status` - Check authentication status

### Customer Management
- `GET /api/admin/customers` - List all customers
- `POST /api/admin/customer_with_signature` - Create customer with signature
- `GET /api/admin/customer/{id}` - Get customer details
- `PUT /api/admin/customer/{id}` - Update customer
- `DELETE /api/admin/customer/{id}` - Delete customer

### Signature Operations
- `POST /api/admin/signature/verify` - Verify signature against customer

## 🧪 Testing

### Backend Tests
```bash
cd backend
python test_cleanup.py          # Test file cleanup functionality
python test_embedding_encryption.py  # Test encryption/decryption
python test_encryption_timing.py     # Performance benchmarks
```

### Frontend Testing
```bash
cd frontend
npm run lint                    # Code linting
npm run build                   # Production build test
```

## 🚀 Production Deployment

### Backend Deployment
1. Set environment variables for production
2. Configure production database
3. Use WSGI server (e.g., Gunicorn)
4. Set up SSL/TLS certificates

### Frontend Deployment
1. Build production assets: `npm run build`
2. Serve static files with web server (Nginx/Apache)
3. Configure environment variables for API endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Create a Pull Request

## 👥 Authors

- **Syauqi** - *Initial work* - [@syauu](https://github.com/syauu)

## 🙏 Acknowledgments

- CEDAR Signature Dataset for training data
- ICDAR2011 Signature Verification Competition
- TensorFlow/Keras for machine learning framework
- React and Flask communities for excellent documentation

---
