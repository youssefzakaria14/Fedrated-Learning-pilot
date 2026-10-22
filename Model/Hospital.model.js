
const mongoose = require("mongoose");

const hospitalSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        code: {
            type: String,
            required: true,
            unique: true
        },
        participantNumber: {
            type: String,
            required: true
        },
        status: {
            type: String,
            required: true
        },
        patientCount: {
            type: String,
            required: true
        },
        trainingStatus: {
            type: String,
            required: true
        },
        currentRound: {
            type: String,
            required: true
        },
        lastTrainingAt: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Hospital", hospitalSchema);
