
const mongoose = require("mongoose");
const Dashboard = require("../Model/Dashboard.model.js");
const Hospital = require("../Model/Hospital.model.js");
const Prediction = require("../Model/Prediction.model.js");

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
        throw new Error("AI dashboard must return exactly 3 participants");
    }

    const trainingCompleted =
        Number(aiData.totalRounds) > 0 &&
        Number(aiData.currentRound) >= Number(aiData.totalRounds);

    for (const participant of participants) {
        const number = Number(participant.hospitalNumber);
        const patientCount = Number(participant.patientCount);

        if (
            ![1, 2, 3].includes(number) ||
            !Number.isInteger(patientCount) ||
            patientCount < 0
        ) {
            throw new Error("Invalid AI participant data");
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
                    trainingStatus: trainingCompleted
                        ? "completed"
                        : "idle",
                    currentRound: Number(aiData.currentRound) || 0
                }
            },
            {
                new: true,
                upsert: true,
                runValidators: true,
                setDefaultsOnInsert: true
            }
        );
    }
};

const getDashboard = async (req, res) => {
    try {
        const aiData = await getAIDashboard();

        await syncHospitalParticipants(aiData);

        const participantFilter = {
            participantNumber: { $in: [1, 2, 3] }
        };

        const [
            totalHospitals,
            connectedHospitals,
            latestDashboard,
            hospitals
        ] = await Promise.all([
            Hospital.countDocuments(participantFilter),
            Hospital.countDocuments({
                ...participantFilter,
                status: "connected"
            }),
            Dashboard.findOne().sort({ updatedAt: -1 }),
            Hospital.find(participantFilter)
                .select(
                    "name code participantNumber status patientCount trainingStatus currentRound lastTrainingAt"
                )
                .sort({ participantNumber: 1 })
        ]);

        const dashboard = latestDashboard
            ? latestDashboard.toObject()
            : {};

        const evaluations = aiData.evaluations || [];

        const federatedEvaluation = evaluations.find(
            (item) => item.approach === "federated"
        );

        const trainingCompleted =
            Number(aiData.totalRounds) > 0 &&
            Number(aiData.currentRound) >= Number(aiData.totalRounds) &&
            Boolean(federatedEvaluation);

        return res.status(200).json({
            success: true,
            data: {
                dataset: aiData.dataset || dashboard.dataset || null,
                isDemo: false,
                totalPatients: aiData.trainingPatientCount ?? 0,
                testPatientCount: aiData.testPatientCount ?? 0,
                totalHospitals,
                connectedHospitals,
                disconnectedHospitals:
                    totalHospitals - connectedHospitals,
                participatingHospitals: hospitals.length,
                globalAccuracy:
                    federatedEvaluation?.accuracy ??
                    dashboard.globalAccuracy ??
                    null,
                currentRound: aiData.currentRound ?? 0,
                totalRounds: aiData.totalRounds ?? 0,
                trainingStatus: trainingCompleted
                    ? "completed"
                    : "idle",
                trainingCurve:
                    aiData.trainingCurve ??
                    dashboard.trainingCurve ??
                    { iid: [], nonIid: [] },
                evaluations,
                hospitalCounts: aiData.hospitalCounts,
                hospitals,
                aiServiceAvailable: true,
                updatedAt: dashboard.updatedAt ?? null
            }
        });
    } catch (error) {
        console.error("Get Dashboard Error:", error.message);

        return res.status(503).json({
            success: false,
            message: "Failed to retrieve dashboard data"
        });
    }
};

const getDashboardEvaluations = async (req, res) => {
    try {
        const aiData = await getAIDashboard();

        return res.status(200).json({
            success: true,
            data: aiData.evaluations || []
        });
    } catch (error) {
        console.error("Get Dashboard Evaluations Error:", error.message);

        return res.status(503).json({
            success: false,
            message: "AI service is unavailable"
        });
    }
};

const getHospitalDashboard = async (req, res) => {
    try {
        const { hospitalId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(hospitalId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid hospital ID"
            });
        }

        const hospital = await Hospital.findById(hospitalId).select(
            "name code participantNumber status patientCount trainingStatus currentRound lastTrainingAt"
        );

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: "Hospital not found"
            });
        }

        const [
            totalPredictions,
            positivePredictions,
            negativePredictions,
            predictions,
            aiData
        ] = await Promise.all([
            Prediction.countDocuments({ hospital: hospital._id }),
            Prediction.countDocuments({
                hospital: hospital._id,
                outcome: "positive"
            }),
            Prediction.countDocuments({
                hospital: hospital._id,
                outcome: "negative"
            }),
            Prediction.find({ hospital: hospital._id })
                .select(
                    "age operationYear positiveNodes outcome confidence createdBy hospital createdAt"
                )
                .populate("createdBy", "name email")
                .sort({ createdAt: -1 }),
            getAIDashboard()
        ]);

        const hospitalEvaluation = (aiData.evaluations || []).find(
            (item) =>
                item.approach === "local" &&
                Number(
                    String(item.model || "").match(/Hospital\s+(\d+)/i)?.[1]
                ) === hospital.participantNumber
        );

        const federatedEvaluation = (aiData.evaluations || []).find(
            (item) => item.approach === "federated"
        );

        return res.status(200).json({
            success: true,
            data: {
                hospital,
                statistics: {
                    totalPredictions,
                    positivePredictions,
                    negativePredictions,
                    patientCount: hospital.patientCount,
                    trainingStatus: hospital.trainingStatus,
                    currentRound: hospital.currentRound
                },
                predictions,
                training: {
                    dataset: aiData.dataset ?? null,
                    currentRound: aiData.currentRound ?? 0,
                    totalRounds: aiData.totalRounds ?? 0,
                    status: hospital.trainingStatus,
                    hospitalAccuracy: hospitalEvaluation?.accuracy ?? null,
                    hospitalF1: hospitalEvaluation?.f1 ?? null,
                    hospitalAuc: hospitalEvaluation?.auc ?? null,
                    globalAccuracy: federatedEvaluation?.accuracy ?? null,
                    globalF1: federatedEvaluation?.f1 ?? null,
                    globalAuc: federatedEvaluation?.auc ?? null
                }
            }
        });
    } catch (error) {
        console.error("Get Hospital Dashboard Error:", error.message);

        return res.status(503).json({
            success: false,
            message: "Failed to retrieve hospital dashboard"
        });
    }
};

module.exports = {
    getDashboard,
    getDashboardEvaluations,
    getHospitalDashboard
};
