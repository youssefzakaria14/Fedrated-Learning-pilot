# 🏥 Federated Learning Healthcare Platform

<p align="center">
  <img src="https://img.shields.io/badge/Healthcare-AI%20Platform-0D9488?style=for-the-badge&logo=heart&logoColor=white" alt="Healthcare AI"/>
  <img src="https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/Express.js-REST%20API-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js"/>
  <img src="https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB"/>
</p>

<p align="center">
  <b>A secure backend for collaborative healthcare AI.</b>
  <br/>
  Connecting hospital management, AI-powered predictions, and federated learning workflows through a modular REST API.
</p>

---

## 🧠 About the Project

The **Federated Learning Healthcare Platform** is a backend system designed to support collaboration between healthcare institutions through a centralized API layer and an AI-powered prediction service.

Federated Learning enables participating institutions to contribute to collaborative model training without requiring their raw training data to be pooled into one central dataset.

The backend provides authentication, hospital management, prediction processing, dashboard integration, and database protection to support the platform's healthcare workflows.

## ✨ Core Features

| Feature | Description |
|---|---|
| 🔐 Authentication | User registration, login, JWT-based authentication, and protected routes |
| 👥 Role-Based Access | Separate permissions for doctors and administrators |
| 🏥 Hospital Management | Manage hospital records and participant information |
| 🤖 AI Integration | Send prediction requests to the Python AI service and process its results |
| 📊 Dashboard APIs | Retrieve training metrics, hospital information, and evaluation results |
| 🔒 Data Encryption | Application-level encryption for selected sensitive hospital and prediction fields |
| 📚 API Documentation | Explore and test endpoints through Swagger UI |
| 🗄️ Database Integration | MongoDB Atlas integration using Mongoose |

## 🏗️ System Architecture

<p align="center">
  <img src="https://img.shields.io/badge/Client-Frontend-2563EB?style=flat-square" alt="Client"/>
  <b> → </b>
  <img src="https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?style=flat-square" alt="Backend"/>
  <b> → </b>
  <img src="https://img.shields.io/badge/Database-MongoDB-47A248?style=flat-square" alt="Database"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/AI%20Service-Python%20%2B%20FastAPI-009688?style=flat-square" alt="AI Service"/>
  <img src="https://img.shields.io/badge/Model-Federated%20Learning-7C3AED?style=flat-square" alt="Federated Learning"/>
</p>

**Request flow:**

1. The client sends an authenticated request to the Express API.
2. Middleware validates authentication, permissions, and request data.
3. The backend reads or updates application data in MongoDB.
4. For prediction requests, the backend communicates with the Python AI service.
5. The API returns the appropriate result to the client.

## 🛠️ Technology Stack

| Technology | Role |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | REST API framework |
| MongoDB Atlas | Cloud database |
| Mongoose | Data modeling and database operations |
| JWT | Authentication |
| bcryptjs | Password hashing |
| Python | AI service implementation |
| FastAPI | AI service API |
| Swagger | API documentation |
| AES-256-GCM | Application-level encryption for selected fields |

## 📂 Project Structure

```text
Fedrated-Learning-pilot/
├── Controllers/
│   ├── auth.controller.js
│   ├── Dashboard.controller.js
│   ├── Hospital.controller.js
│   └── Prediction.controller.js
├── Middleware/
│   └── auth.middleware.js
├── Model/
│   ├── User.model.js
│   ├── Hospital.model.js
│   ├── Dashboard.model.js
│   └── Prediction.model.js
├── Routes/
│   ├── auth.route.js
│   ├── Dashboard.route.js
│   ├── Hospital.route.js
│   └── prediction.route.js
├── Utils/
│   └── encryption.js
├── app.js
├── swagger.js
├── package.json
└── .env.example
```

## ⚙️ Getting Started

### Prerequisites

- Node.js and npm
- A MongoDB database
- Python environment for the AI service
- Git

### 1. Clone the Repository

```bash
git clone <https://github.com/youssefzakaria14/Fedrated-Learning-pilot>
cd Fedrated-Learning-pilot
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
AI_SERVICE_URL=http://127.0.0.1:8002
PREDICTION_ENCRYPTION_KEY=your_64_character_hex_key
```

Use the exact environment variable names and configuration required by your current code. Keep real credentials and encryption keys private. Never commit your actual `.env` file.

### 4. Start the Backend

```bash
npm start
```

### 5. Start the AI Service

Run the Python FastAPI service in its own environment and configure `AI_SERVICE_URL` to match its actual host and port.

### 6. Open the API Documentation

When the server is running, open:

```text
http://localhost:3000/api-docs
```

If you configured a different port, replace `3000` with that port.

## 📡 API Modules

| Module | Purpose |
|---|---|
| Authentication | Registration, login, user identity, and access control |
| Hospitals | Hospital records and participant management |
| Predictions | Prediction requests and saved prediction results |
| Dashboard | Hospital statistics and AI training metrics |
| Swagger | Interactive API documentation |

For the exact routes, request schemas, and response formats, refer to `swagger.js` and the route definitions.

## 🔒 Security

Security is an important part of a healthcare-oriented system.

- **JWT authentication** protects private endpoints.
- **Role-based authorization** separates doctor and administrator access.
- **Password hashing** helps protect stored user credentials.
- **Field-level encryption** protects selected sensitive values stored in MongoDB.
- **Environment variables** keep database credentials and encryption keys outside source code.
- **Input validation** helps reject invalid request data.

> Encryption keys must be stored securely and separately from encrypted data. Field encryption is one layer of protection; it does not replace authentication, authorization, secure key management, or transport encryption.

## 🎯 Project Goals

- Support collaboration between healthcare institutions.
- Integrate AI-powered prediction workflows into a REST API.
- Provide structured hospital and user management.
- Protect selected sensitive database fields.
- Make backend functionality accessible through documented endpoints.

## 🚀 Future Improvements

- Automated API testing and CI/CD.
- More granular database permissions.
- Improved audit logging for sensitive operations.
- Production-ready secret and encryption-key management.
- Expanded monitoring and error reporting.

---

<p align="center">
  <b>Built for Healthcare • AI • Secure Backend Engineering</b>
  <br/>
  <sub>Node.js · Express.js · MongoDB · Python · FastAPI</sub>
</p>
