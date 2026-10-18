
const mongoose = require("mongoose");

const { Schema } = mongoose;

const hospitalSchema = new Schema(
    {
        hospital: {
            type: Schema.Types.ObjectId,
            ref: "Hospital",
            required: true
        },
        status: {
            type: String,
            enum: ["connected", "disconnected"],
            default: "disconnected",
            required: true
        }
    },
    { _id: false }
);

const trainingCurveSchema = new Schema(
    {
        round: {
            type: Number,
            required: true,
            min: 1,
            validate: {
                validator: Number.isInteger,
                message: "Round must be an integer"
            }
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
            min: 0,
            validate: {
                validator: Number.isInteger,
                message: "Total patients must be an integer"
            }
        },
        participatingHospitals: {
            type: Number,
            required: true,
            min: 0,
            validate: {
                validator: Number.isInteger,
                message: "Participating hospitals must be an integer"
            }
        },
        globalAccuracy: {
            type: Number,
            default: null,
            min: 0,
            max: 100
        },
        currentRound: {
            type: Number,
            default: 0,
            min: 0,
            validate: {
                validator: Number.isInteger,
                message: "Current round must be an integer"
            }
        },
        totalRounds: {
            type: Number,
            default: 0,
            min: 0,
            validate: {
                validator: Number.isInteger,
                message: "Total rounds must be an integer"
            }
        },
        trainingStatus: {
            type: String,
            enum: ["idle", "training", "completed", "failed"],
            default: "idle"
        },
        lastTrainingAt: {
            type: Date,
            default: null
        },
        hospitals: {
            type: [hospitalSchema],
            default: []
        },
        trainingCurve: {
            iid: {
                type: [trainingCurveSchema],
                default: []
            },
            nonIid: {
                type: [trainingCurveSchema],
                default: []
            }
        },
        evaluations: {
            type: [evaluationSchema],
            default: []
        }
    },
    {
        timestamps: true
    }
);

dashboardSchema.pre("validate", function (next) {
    if (this.totalRounds > 0 && this.currentRound > this.totalRounds) {
        this.invalidate(
            "currentRound",
            "Current round cannot exceed total rounds"
        );
    }

    next();
});

module.exports = mongoose.model("Dashboard", dashboardSchema);
