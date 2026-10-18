# 🏥 Federated Learning Platform

### A Backend System for Collaborative AI in Healthcare

A Node.js and Express.js backend designed to support a Federated Learning platform for healthcare institutions, providing authentication, hospital management, AI-powered prediction services, and dashboard functionality.

The platform aims to support collaboration between hospitals while keeping hospital data management distributed.

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-Backend-green?style=for-the-badge&logo=nodedotjs" alt="Node.js"/>
  <img src="https://img.shields.io/badge/Express.js-Framework-black?style=for-the-badge&logo=express" alt="Express.js"/>
  <img src="https://img.shields.io/badge/MongoDB-Database-green?style=for-the-badge&logo=mongodb" alt="MongoDB"/>
  <img src="https://img.shields.io/badge/JWT-Authentication-purple?style=for-the-badge&logo=jsonwebtokens" alt="JWT"/>
</p>

---

## 🚀 Overview

Federated Learning enables multiple institutions to contribute to collaborative machine learning without requiring all their raw data to be centralized.

This project provides backend APIs for managing users, hospitals, predictions, and dashboard data as part of a healthcare-oriented Federated Learning system.

## ✨ Key Features

- 🔐 **Authentication & Authorization** — User registration, login, JWT authentication, and role-based access control.
- 👑 **Admin Management** — Administrative account creation and protected operations.
- 🏥 **Hospital Management** — Manage hospital records and related information.
- 🤖 **Prediction Services** — Backend endpoints for submitting prediction inputs and handling prediction results.
- 📊 **Dashboard APIs** — Access dashboard data for monitoring and management.
- 📚 **API Documentation** — Swagger-based API documentation.
- 🗄️ **Database Integration** — MongoDB integration using Mongoose.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | REST API development |
| MongoDB | Database |
| Mongoose | Data modeling |
| JWT | Authentication |
| bcryptjs | Password hashing |
| Swagger | API documentation |

## 📁 Project Structure

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
├── app.js
├── swagger.js
├── package.json
└── .env
```

## ⚙️ Getting Started

### Prerequisites

- Node.js and npm
- MongoDB instance
- Git

### Installation

**1. Clone the repository**

```bash
git clone <YOUR_REPOSITORY_URL>
cd Fedrated-Learning-pilot
```

**2. Install dependencies**

```bash
npm install
```

**3. Configure environment variables**

Create a `.env` file in the root directory:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
```

Use the exact variable names expected by the application.

**4. Start the server**

```bash
npm start
```

The server will run on the configured port.

## 📡 API Modules

| Module | Description |
|---|---|
| Authentication | Registration, login, and access control |
| Hospitals | Hospital record management |
| Predictions | Prediction request handling |
| Dashboard | Dashboard data and monitoring |

For the exact endpoints and request schemas, refer to the Swagger configuration in `swagger.js`.

## 🔒 Security Considerations

- Hash passwords before storing them.
- Protect private endpoints with authentication middleware.
- Restrict administrative operations using role-based authorization.
- Keep `.env` and other secrets out of version control.
- Validate incoming request data.

## 🎯 Project Objective

To provide a structured backend foundation for a healthcare Federated Learning platform, connecting hospital management, prediction workflows, and administrative monitoring through RESTful APIs.

## 👨‍💻 Development

This project follows a modular architecture that separates routes, controllers, models, and middleware to improve maintainability and simplify future development.

---

<p align="center">
  <b>Built with Node.js, Express.js, and MongoDB</b>
  <br/>
  <i>Federated Learning • Healthcare • Backend Development</i>
</p>
