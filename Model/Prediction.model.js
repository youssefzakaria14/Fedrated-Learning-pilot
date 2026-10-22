
const mongoose = require("mongoose");

const predictionSchema = new mongoose.Schema(
    {
        age: {
            type: String,
            required: true
        },

        operationYear: {
            type: String,
            required: true
        },

        positiveNodes: {
            type: String,
            required: true
        },

        outcome: {
            type: String,
            required: true
        },

        confidence: {
            type: String,
            required: true
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },

        hospital: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hospital",
            required: true
        }
    },
    {
        timestamps: true,
        collection: "predictions"
    }
);

module.exports = mongoose.model("Prediction", predictionSchema);
