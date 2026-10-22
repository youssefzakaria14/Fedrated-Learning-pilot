
const mongoose = require("mongoose");
const Prediction = require("../Model/Prediction.model");
const Hospital = require("../Model/Hospital.model");
const { encrypt, decrypt } = require("../Utils/encryption");

const ENCRYPTED_FIELDS = [
    "age",
    "operationYear",
    "positiveNodes",
    "outcome",
    "confidence"
];

function encryptPrediction(data) {
    const encrypted = { ...data };

    for (const field of ENCRYPTED_FIELDS) {
        encrypted[field] = encrypt(data[field]);
    }

    return encrypted;
}

function decryptPrediction(prediction) {
    if (!prediction) return null;

    const data = prediction.toObject
        ? prediction.toObject()
        : { ...prediction };

    for (const field of ENCRYPTED_FIELDS) {
        if (data[field] !== undefined && data[field] !== null) {
            data[field] = decrypt(data[field]);
        }
    }

    return data;
}

function getHospitalId(user) {
    return user?.hospital?._id || user?.hospital;
}

const createPrediction = async (req, res) => {
    try {
        const { age, operationYear, positiveNodes } = req.body || {};

        // Validate input
        if (
            age == null ||
            operationYear == null ||
            positiveNodes == null
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide age, operationYear and positiveNodes"
            });
        }

        if (
            !Number.isInteger(age) ||
            !Number.isInteger(operationYear) ||
            !Number.isInteger(positiveNodes) ||
            age < 0 ||
            age > 120 ||
            operationYear < 0 ||
            positiveNodes < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide valid age, operationYear and positiveNodes"
            });
        }

        // Validate user
        if (!req.user || !["admin", "doctor"].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to create predictions"
            });
        }

        // Get hospital ID
        let hospitalId;

        if (req.user.role === "admin") {
            hospitalId = req.body.hospital;

            if (!hospitalId || !mongoose.isValidObjectId(hospitalId)) {
                return res.status(400).json({
                    success: false,
                    message: "Admin must provide a valid hospital ID"
                });
            }
        } else {
            hospitalId = getHospitalId(req.user);

            if (!hospitalId || !mongoose.isValidObjectId(hospitalId)) {
                return res.status(403).json({
                    success: false,
                    message: "Your account is not linked to a valid hospital"
                });
            }
        }

        // Find hospital by ID first because participantNumber is encrypted
        const hospital = await Hospital.findById(hospitalId);

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: "Hospital not found"
            });
        }

        // Decrypt participantNumber before validation
        const participantNumber = Number(
            decrypt(hospital.participantNumber)
        );

        if (![1, 2, 3].includes(participantNumber)) {
            return res.status(404).json({
                success: false,
                message: "Training participant hospital not found"
            });
        }

        // Call AI service
        const aiServiceUrl =
            process.env.AI_SERVICE_URL || "http://127.0.0.1:8002";

        let aiResponse;

        try {
            aiResponse = await fetch(`${aiServiceUrl}/predict`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    Age: age,
                    Year: operationYear,
                    Nodes: positiveNodes
                }),
                signal: AbortSignal.timeout(30000)
            });
        } catch (error) {
            console.error("AI Service Connection Error:", error.message);

            return res.status(502).json({
                success: false,
                message: "Cannot connect to AI service"
            });
        }

        let result;

        try {
            result = await aiResponse.json();
        } catch {
            return res.status(502).json({
                success: false,
                message: "AI service returned an invalid response"
            });
        }

        if (!aiResponse.ok) {
            return res.status(502).json({
                success: false,
                message: result.detail || "AI service returned an error"
            });
        }

        const confidence = Number.parseFloat(
            result.survival_probability
        );

        if (
            ![0, 1].includes(result.prediction) ||
            !Number.isFinite(confidence) ||
            confidence < 0 ||
            confidence > 100
        ) {
            return res.status(502).json({
                success: false,
                message: "AI returned an invalid prediction result"
            });
        }

        // Prepare prediction data
        const predictionData = {
            age,
            operationYear,
            positiveNodes,
            outcome: result.prediction === 1 ? "positive" : "negative",
            confidence,
            hospital: hospital._id,
            createdBy: req.user._id
        };

        // Encrypt sensitive fields before saving
        const prediction = await Prediction.create(
            encryptPrediction(predictionData)
        );

        return res.status(201).json({
            success: true,
            message: "Prediction created successfully",
            data: {
                _id: prediction._id,
                ...predictionData,
                createdAt: prediction.createdAt,
                updatedAt: prediction.updatedAt,
                aiStatus: result.status
            }
        });
    } catch (error) {
        console.error("Prediction Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};

const getAllPredictions = async (req, res) => {
    try {
        if (!req.user || !["admin", "doctor"].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to view predictions"
            });
        }

        const filter = {};

        if (req.user.role === "doctor") {
            const hospitalId = getHospitalId(req.user);

            if (!hospitalId || !mongoose.isValidObjectId(hospitalId)) {
                return res.status(403).json({
                    success: false,
                    message: "Your account is not linked to a valid hospital"
                });
            }

            filter.hospital = hospitalId;
        }

        const predictions = await Prediction.find(filter)
            .populate("hospital", "name code participantNumber status")
            .populate("createdBy", "name email role")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            results: predictions.length,
            data: predictions.map(decryptPrediction)
        });
    } catch (error) {
        console.error("Get Predictions Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Failed to retrieve predictions"
        });
    }
};

const getPredictionById = async (req, res) => {
    try {
        if (!req.user || !["admin", "doctor"].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to view predictions"
            });
        }

        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid prediction ID"
            });
        }

        const filter = { _id: id };

        if (req.user.role === "doctor") {
            const hospitalId = getHospitalId(req.user);

            if (!hospitalId || !mongoose.isValidObjectId(hospitalId)) {
                return res.status(403).json({
                    success: false,
                    message: "Your account is not linked to a valid hospital"
                });
            }

            filter.hospital = hospitalId;
        }

        const prediction = await Prediction.findOne(filter)
            .populate("hospital", "name code participantNumber status")
            .populate("createdBy", "name email role");

        if (!prediction) {
            return res.status(404).json({
                success: false,
                message: "Prediction not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: decryptPrediction(prediction)
        });
    } catch (error) {
        console.error("Get Prediction By ID Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Failed to retrieve prediction"
        });
    }
};

module.exports = {
    createPrediction,
    getAllPredictions,
    getPredictionById
};
