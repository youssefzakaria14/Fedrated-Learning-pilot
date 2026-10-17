
const mongoose = require("mongoose");
const validator = require("validator");

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
        status: {
            type: String,
            enum: ["connected", "disconnected"],
            default: "connected"
        },
        patientCount: {
            type: Number,
            default: 0,
            min: [0, "Patient count cannot be negative"]
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Hospital", hospitalSchema);
