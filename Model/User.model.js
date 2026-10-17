
const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            validate: {
                validator: (value) => validator.isEmail(value),
                message: "Please enter a valid email"
            }
        },
        medicalId: {
            type: String,
            unique: true,
            sparse: true,
            trim: true
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [8, "Password must be at least 8 characters"],
            select: false
        },
        role: {
            type: String,
            enum: ["doctor", "admin"],
            required: true
        },
        hospital: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hospital",
            required: true
        },
        status: {
            type: String,
            enum: ["pending", "active"],
            default: "pending"
        },
        preferences: {
            theme: {
                type: String,
                enum: ["light", "dark"],
                default: "light"
            },
            language: {
                type: String,
                enum: ["en", "ar"],
                default: "en"
            }
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);
