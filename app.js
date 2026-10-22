
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

const predictionRoutes = require("./Routes/prediction.route");
const hospitalRoutes = require("./Routes/Hospital.route");
const dashboardRoutes = require("./Routes/Dashboard.route");
const authRoutes = require("./Routes/auth.route");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Federated Learning API is running"
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/v1/predict", predictionRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use((req, res) => {
    return res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

app.use((err, req, res, next) => {
    console.error("Server Error:", err);

    return res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
});

if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing from .env");
}

if (!/^[0-9a-fA-F]{64}$/.test(
    process.env.PREDICTION_ENCRYPTION_KEY || ""
)) {
    throw new Error(
        "PREDICTION_ENCRYPTION_KEY must be a 64-character hexadecimal key"
    );
}

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI, {
    dbName: "federated_learning"
})
    .then(() => {
        console.log("MongoDB Connected Successfully");
        console.log("Database name:", mongoose.connection.name);

        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB Connection Failed:", error.message);
        process.exitCode = 1;
    });
