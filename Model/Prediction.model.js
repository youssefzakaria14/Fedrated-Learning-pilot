
const mongoose = require("mongoose");

const predictionSchema = new mongoose.Schema(
    {
        age: {
            type: Number,
            required: [true, "Age is required"],
            min: [0, "Age cannot be negative"],
            max: [120, "Age cannot exceed 120"]
        },
        operationYear: {
            type: Number,
            required: [true, "Operation year is required"]
        },
        positiveNodes: {
            type: Number,
            required: [true, "Positive nodes are required"],
            min: [0, "Positive nodes cannot be negative"]
        },
        outcome: {
            type: String,
            enum: ["positive", "negative"],
            required: [true, "Outcome is required"]
        },
        confidence: {
            type: Number,
            min: [0, "Confidence cannot be less than 0"],
            max: [100, "Confidence cannot exceed 100"]
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        hospital: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hospital",
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Prediction", predictionSchema);
