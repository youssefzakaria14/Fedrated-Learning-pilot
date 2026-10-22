
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../Model/User.model");
const Hospital = require("../Model/Hospital.model");
const { decrypt } = require("../Utils/encryption");

const HOSPITAL_FIELDS = [
    "name",
    "code",
    "participantNumber",
    "status",
    "patientCount",
    "trainingStatus",
    "currentRound"
];

function decryptHospital(hospital) {
    if (!hospital) return null;

    const data = hospital.toObject
        ? hospital.toObject()
        : { ...hospital };

    for (const field of HOSPITAL_FIELDS) {
        if (data[field] !== undefined && data[field] !== null) {
            data[field] = decrypt(data[field]);
        }
    }

    for (const field of [
        "participantNumber",
        "patientCount",
        "currentRound"
    ]) {
        if (data[field] !== undefined && data[field] !== null) {
            data[field] = Number(data[field]);
        }
    }

    return data;
}

async function findHospitalByCode(code) {
    const hospitals = await Hospital.find({});

    for (const hospital of hospitals) {
        const decoded = decryptHospital(hospital);

        if (decoded.code === code) {
            return {
                document: hospital,
                data: decoded
            };
        }
    }

    return null;
}

const signToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || "7d"
        }
    );
};

const register = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            medicalId,
            hospitalCode,
            role
        } = req.body || {};

        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string" ||
            typeof hospitalCode !== "string" ||
            !name.trim() ||
            !email.trim() ||
            !password ||
            !hospitalCode.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide valid name, email, password and hospitalCode"
            });
        }

        if (role && !["doctor", "admin"].includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Role must be doctor or admin"
            });
        }

        if (role === "admin") {
            return res.status(403).json({
                success: false,
                message: "Admin registration is not allowed here"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        const found = await findHospitalByCode(hospitalCode.trim());

        if (!found) {
            return res.status(404).json({
                success: false,
                message: "Hospital not found"
            });
        }

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: await bcrypt.hash(password, 12),
            medicalId: medicalId ? medicalId.trim() : undefined,
            role: "doctor",
            hospital: found.document._id,
            status: "active"
        });

        return res.status(201).json({
            success: true,
            message: "Doctor registered successfully",
            data: {
                token: signToken(user),
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    medicalId: user.medicalId,
                    role: user.role,
                    hospital: {
                        _id: found.document._id,
                        name: found.data.name,
                        code: found.data.code,
                        participantNumber: found.data.participantNumber
                    },
                    status: user.status
                }
            }
        });
    } catch (error) {
        console.error("Register Error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Email, medical ID or another unique field is already registered"
            });
        }

        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: "Registration failed"
        });
    }
};

const createAdmin = async (req, res) => {
    try {
        if (!req.user || req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Only an admin can create another admin"
            });
        }

        const {
            name,
            email,
            password,
            medicalId,
            hospitalCode
        } = req.body || {};

        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string" ||
            typeof hospitalCode !== "string" ||
            !name.trim() ||
            !email.trim() ||
            !password ||
            !hospitalCode.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide valid name, email, password and hospitalCode"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        const found = await findHospitalByCode(hospitalCode.trim());

        if (!found) {
            return res.status(404).json({
                success: false,
                message: "Hospital not found"
            });
        }

        const admin = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: await bcrypt.hash(password, 12),
            medicalId: medicalId ? medicalId.trim() : undefined,
            role: "admin",
            hospital: found.document._id,
            status: "active"
        });

        return res.status(201).json({
            success: true,
            message: "Admin created successfully",
            data: {
                _id: admin._id,
                name: admin.name,
                email: admin.email,
                medicalId: admin.medicalId,
                role: admin.role,
                hospital: found.document._id,
                status: admin.status
            }
        });
    } catch (error) {
        console.error("Create Admin Error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Email or medical ID is already registered"
            });
        }

        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to create admin"
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body || {};

        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide email and password"
            });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        }).select("+password");

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({
                success: false,
                message: "Incorrect email or password"
            });
        }

        if (!["doctor", "admin"].includes(user.role)) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to login"
            });
        }

        const hospital = await Hospital.findById(user.hospital);

        if (!hospital) {
            return res.status(403).json({
                success: false,
                message: "Your account is not linked to a valid hospital"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                token: signToken(user),
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    medicalId: user.medicalId,
                    role: user.role,
                    hospital: decryptHospital(hospital),
                    status: user.status
                }
            }
        });
    } catch (error) {
        console.error("Login Error:", error);

        return res.status(500).json({
            success: false,
            message: "Login failed"
        });
    }
};

const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const data = user.toObject();
        data.hospital = decryptHospital(
            await Hospital.findById(user.hospital)
        );

        return res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error("Get Me Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to get user profile"
        });
    }
};

const updateMe = async (req, res) => {
    try {
        const updates = {};

        for (const field of ["name", "preferences"]) {
            if (req.body?.[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updates,
            {
                new: true,
                runValidators: true
            }
        ).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const data = user.toObject();
        data.hospital = decryptHospital(
            await Hospital.findById(user.hospital)
        );

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data
        });
    } catch (error) {
        console.error("Update Me Error:", error);

        return res.status(400).json({
            success: false,
            message: "Failed to update profile"
        });
    }
};

const getHospitals = async (req, res) => {
    try {
        const allHospitals = await Hospital.find({});
        const hospitals = allHospitals.map(decryptHospital);

        hospitals.sort((a, b) => {
            return Number(a.participantNumber) - Number(b.participantNumber);
        });

        return res.status(200).json({
            success: true,
            results: hospitals.length,
            data: hospitals
        });
    } catch (error) {
        console.error("Get Hospitals Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve hospitals"
        });
    }
};

module.exports = {
    register,
    createAdmin,
    login,
    getMe,
    updateMe,
    getHospitals
};