
const mongoose = require("mongoose");

const hospitalSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Hospital name is required"],
            trim: true
        },
        code: {
            type: String,
            required: [true, "Hospital code is required"],
            unique: true,
            trim: true
        },
        participantNumber: {
            type: Number,
            default: null,
            unique: true,
            sparse: true,
            min: 1,
            max: 3,
            validate: {
                validator: Number.isInteger,
                message: "Participant number must be an integer"
            }
        },
        status: {
            type: String,
            enum: ["connected", "disconnected"],
            default: "disconnected"
        },
        patientCount: {
            type: Number,
            default: 0,
            min: [0, "Patient count cannot be negative"]
        },
        trainingStatus: {
            type: String,
            enum: ["idle", "training", "completed", "failed"],
            default: "idle"
        },
        currentRound: {
            type: Number,
            default: 0,
            min: [0, "Current round cannot be negative"],
            validate: {
                validator: Number.isInteger,
                message: "Current round must be an integer"
            }
        },
        lastTrainingAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Hospital", hospitalSchema);
