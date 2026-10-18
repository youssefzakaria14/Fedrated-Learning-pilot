# Federated Learning Backend

## About The Project

This project is a backend system for a Federated Learning platform that allows multiple hospitals to participate in AI model training while maintaining a distributed healthcare environment.

The system provides authentication, role-based access control, hospital management, prediction services, and dashboard APIs.

## Technologies Used

- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Token (JWT)
- bcryptjs
- Swagger

## Features

- User registration and login
- JWT-based authentication
- Role-based authorization for admin and users
- Admin account management
- Hospital management
- Prediction management
- Dashboard statistics and monitoring
- RESTful API architecture
- API documentation using Swagger

## Project Structure

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

## Requirements

- Node.js
- npm
- MongoDB

## Installation

1. Clone the repository:

```bash
git clone <YOUR_REPOSITORY_URL>
```

2. Navigate to the project directory:

```bash
cd Fedrated-Learning-pilot
```

3. Install dependencies:

```bash
npm install
```

4. Create a `.env` file in the root directory and configure the required environment variables.

Example:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Make sure the environment variable names match those used in your application.

5. Start the server:

```bash
npm start
```

## API Documentation

Swagger is used to document the available API endpoints.

After starting the server, open the Swagger documentation URL configured in `swagger.js`.

## Security

- Passwords should be hashed before storage.
- Protected routes require valid authentication.
- Administrative operations should be restricted to authorized users.
- Sensitive environment variables must not be committed to GitHub.

## Project Goal

The goal of this project is to provide backend services for a Federated Learning platform that supports hospital management and AI-powered prediction workflows.

## Author

Developed as part of a Federated Learning project.
