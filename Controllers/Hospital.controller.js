
const mongoose = require("mongoose");
const Hospital = require("../Model/Hospital.model");
const { encrypt, decrypt } = require("../Utils/encryption");

const AI_SERVICE_URL =
    process.env.AI_SERVICE_URL || "http://127.0.0.1:8001";

const ENCRYPTED_FIELDS = [
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

    for (const field of ENCRYPTED_FIELDS) {
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

async function getAIDashboard() {
    const response = await fetch(`${AI_SERVICE_URL}/dashboard`, {
        signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
        throw new Error("AI service failed to return dashboard data");
    }

    const result = await response.json();

    if (!result.success || !result.data) {
        throw new Error("Invalid AI dashboard response");
    }

    return result.data;
}

async function syncHospitalParticipants(aiData) {
    const participants = aiData.hospitalCounts;

    if (!Array.isArray(participants)) {
        throw new Error("AI hospitalCounts must be an array");
    }

    const currentRound = Number(aiData.currentRound) || 0;
    const totalRounds = Number(aiData.totalRounds) || 0;

    const trainingStatus =
        totalRounds > 0 && currentRound >= totalRounds
            ? "completed"
            : "idle";

    // قراءة السجلات الموجودة وفك تشفيرها لمطابقتها بالمشاركين
    const existingHospitals = await Hospital.find({});
    const existingByNumber = new Map();

    for (const hospital of existingHospitals) {
        const decoded = decryptHospital(hospital);
        const number = Number(decoded.participantNumber);

        if (!Number.isFinite(number)) {
            throw new Error(
                `Invalid participantNumber in hospital ${hospital._id}`
            );
        }

        if (existingByNumber.has(number)) {
            throw new Error(
                `Duplicate participantNumber found: ${number}`
            );
        }

        existingByNumber.set(number, hospital);
    }

    const seenNumbers = new Set();
    const syncedHospitals = [];

    for (const participant of participants) {
        const number = Number(participant.hospitalNumber);
        const patientCount = Number(participant.patientCount);

        if (
            !Number.isSafeInteger(number) ||
            number < 1 ||
            seenNumbers.has(number)
        ) {
            throw new Error("AI returned an invalid or duplicate hospitalNumber");
        }

        if (
            !Number.isSafeInteger(patientCount) ||
            patientCount < 0
        ) {
            throw new Error("AI returned an invalid patientCount");
        }

        seenNumbers.add(number);

        const plainData = {
            name: `AI Training Participant ${number}`,
            code: `FL_HOSPITAL_${number}`,
            participantNumber: number,
            status: "connected",
            patientCount,
            trainingStatus,
            currentRound
        };

        const encryptedData = {};

        for (const [field, value] of Object.entries(plainData)) {
            encryptedData[field] = encrypt(value);
        }

        const existing = existingByNumber.get(number);
        let savedHospital;

        if (existing) {
            savedHospital = await Hospital.findByIdAndUpdate(
                existing._id,
                { $set: encryptedData },
                {
                    new: true,
                    runValidators: true
                }
            );
        } else {
            savedHospital = await Hospital.create(encryptedData);
        }

        if (!savedHospital) {
            throw new Error(`Failed to sync participant ${number}`);
        }

        syncedHospitals.push(decryptHospital(savedHospital));
    }

    return syncedHospitals.sort(
        (a, b) => a.participantNumber - b.participantNumber
    );
}

const getAllHospitals = async (req, res) => {
    try {
        const aiData = await getAIDashboard();
        const hospitals = await syncHospitalParticipants(aiData);

        return res.status(200).json({
            success: true,
            results: hospitals.length,
            data: hospitals
        });
    } catch (error) {
        console.error("Get All Hospitals Error:", error.message);

        return res.status(503).json({
            success: false,
            message: "Failed to sync hospitals from AI service"
        });
    }
};

const getHospitalById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid hospital ID"
            });
        }

        const aiData = await getAIDashboard();
        await syncHospitalParticipants(aiData);

        const hospital = await Hospital.findById(id);

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: "Hospital not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: decryptHospital(hospital)
        });
    } catch (error) {
        console.error("Get Hospital By ID Error:", error.message);

        return res.status(503).json({
            success: false,
            message: "Failed to retrieve hospital"
        });
    }
};

module.exports = {
    getAllHospitals,
    getHospitalById
};
