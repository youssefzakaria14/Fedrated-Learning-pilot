
const mongoose = require("mongoose");
const Prediction = require("../Model/Prediction.model");
const Hospital = require("../Model/Hospital.model");

const createPrediction = async (req, res) => {
    try {
        const { age, operationYear, positiveNodes } = req.body || {};

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

        if (!req.user || !["admin", "doctor"].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to create predictions"
            });
        }

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
            hospitalId = req.user.hospital?._id || req.user.hospital;

            if (!hospitalId) {
                return res.status(403).json({
                    success: false,
                    message: "Your account is not linked to a hospital"
                });
            }
        }

        const hospital = await Hospital.findOne({
            _id: hospitalId,
            participantNumber: { $in: [1, 2, 3] }
        });

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: "Training participant hospital not found"
            });
        }

        const aiServiceUrl =
            process.env.AI_SERVICE_URL || "http://127.0.0.1:8001";

        const aiResponse = await fetch(
            `${aiServiceUrl}/predict`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    Age: age,
                    Year: operationYear,
                    Nodes: positiveNodes
                }),
                signal: AbortSignal.timeout(10000)
            }
        );

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

        const prediction = await Prediction.create({
            age,
            operationYear,
            positiveNodes,
            outcome: result.prediction === 1 ? "positive" : "negative",
            confidence,
            hospital: hospital._id,
            createdBy: req.user._id
        });

        return res.status(201).json({
            success: true,
            message: "Prediction created successfully",
            data: {
                ...prediction.toObject(),
                aiStatus: result.status
            }
        });
    } catch (error) {
        console.error("Prediction Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to create prediction. Check that the AI service is running."
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
            const hospitalId =
                req.user.hospital?._id || req.user.hospital;

            if (!hospitalId) {
                return res.status(403).json({
                    success: false,
                    message: "Your account is not linked to a hospital"
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
            data: predictions
        });
    } catch (error) {
        console.error("Get Predictions Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve predictions"
        });
    }
};

module.exports = {
    createPrediction,
    getAllPredictions
};
