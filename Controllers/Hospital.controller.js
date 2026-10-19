const mongoose = require("mongoose");
const Hospital = require("../Model/Hospital.model");

const AI_SERVICE_URL =
    process.env.AI_SERVICE_URL || "http://127.0.0.1:8001";

const getAIDashboard = async () => {
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
};

const syncHospitalParticipants = async (aiData) => {
    const participants = aiData.hospitalCounts;

    if (!Array.isArray(participants) || participants.length !== 3) {
        throw new Error("AI dashboard must return exactly 3 hospitals");
    }

    const numbers = participants.map((item) => Number(item.hospitalNumber));

    if (
        new Set(numbers).size !== 3 ||
        ![1, 2, 3].every((number) => numbers.includes(number))
    ) {
        throw new Error("AI must return hospital numbers 1, 2 and 3");
    }

    const currentRound = Number(aiData.currentRound) || 0;
    const totalRounds = Number(aiData.totalRounds) || 0;

    const trainingStatus =
        totalRounds > 0 && currentRound >= totalRounds
            ? "completed"
            : "idle";

    for (const participant of participants) {
        const number = Number(participant.hospitalNumber);
        const patientCount = Number(participant.patientCount);

        if (!Number.isInteger(patientCount) || patientCount < 0) {
            throw new Error("Invalid patient count from AI");
        }

        await Hospital.findOneAndUpdate(
            { participantNumber: number },
            {
                $set: {
                    name: `AI Training Participant ${number}`,
                    code: `FL_HOSPITAL_${number}`,
                    participantNumber: number,
                    status: "connected",
                    patientCount,
                    trainingStatus,
                    currentRound
                }
            },
            {
                upsert: true,
                new: true,
                runValidators: true,
                setDefaultsOnInsert: true
            }
        );
    }

    return Hospital.find({
        participantNumber: { $in: [1, 2, 3] }
    }).sort({ participantNumber: 1 });
};

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
            message: "Failed to retrieve hospitals from AI service"
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

        const hospital = await Hospital.findOne({
            _id: id,
            participantNumber: { $in: [1, 2, 3] }
        });

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: "Hospital not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: hospital
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