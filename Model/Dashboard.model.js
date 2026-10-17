
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const hospitalSchema = new Schema(
    {
        hospital: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hospital",
            required: true
        },
        status: {
            type: String,
            enum: ["connected", "disconnected"],
            default: "connected"
        }
    },
    { _id: false }
);

const trainingCurveSchema = new Schema(
    {
        round: {
            type: Number,
            required: true,
            min: 1
        },
        accuracy: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        }
    },
    { _id: false }
);

const evaluationSchema = new Schema(
    {
        approach: {
            type: String,
            enum: ["local", "federated", "centralized"],
            required: true
        },
        split: {
            type: String,
            enum: ["iid", "non-iid"],
            required: true
        },
        accuracy: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },
        f1: {
            type: Number,
            required: true,
            min: 0,
            max: 1
        },
        auc: {
            type: Number,
            required: true,
            min: 0,
            max: 1
        }
    },
    { _id: false }
);

const dashboardSchema = new Schema(
    {
        dataset: {
            type: String,
            required: true,
            trim: true
        },
        isDemo: {
            type: Boolean,
            default: false
        },
        totalPatients: {
            type: Number,
            required: true,
            min: 0
        },
        participatingHospitals: {
            type: Number,
            required: true,
            min: 0
        },
        globalAccuracy: {
            type: Number,
            min: 0,
            max: 100,
            default: null
        },
        currentRound: {
            type: Number,
            default: 0,
            min: 0
        },
        totalRounds: {
            type: Number,
            default: 0,
            min: 0
        },
        hospitals: [hospitalSchema],
        trainingCurve: {
            iid: [trainingCurveSchema],
            nonIid: [trainingCurveSchema]
        },
        evaluations: [evaluationSchema]
    },
    { timestamps: true }
);

module.exports = mongoose.model("Dashboard", dashboardSchema);
