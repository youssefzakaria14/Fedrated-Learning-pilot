
const mongoose = require("mongoose");
const Hospital = require("../Model/Hospital.model");

const createHospital = async (req, res) => {
    try {
        const {
            name,
            code,
            status,
            patientCount,
            trainingStatus,
            currentRound,
            lastTrainingAt
        } = req.body;

        const hospital = await Hospital.create({
            name,
            code,
            status,
            patientCount,
            trainingStatus,
            currentRound,
            lastTrainingAt
        });

        return res.status(201).json({
            success: true,
            message: "Hospital created successfully",
            data: hospital
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.code === 11000
                ? "Hospital code already exists"
                : error.message
        });
    }
};

const getAllHospitals = async (req, res) => {
    try {
        const hospitals = await Hospital.find();

        return res.status(200).json({
            success: true,
            results: hospitals.length,
            data: hospitals
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
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

        const hospital = await Hospital.findById(id);

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
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const updateHospital = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            name,
            code,
            status,
            patientCount,
            trainingStatus,
            currentRound,
            lastTrainingAt
        } = req.body;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid hospital ID"
            });
        }

        const hospital = await Hospital.findByIdAndUpdate(
            id,
            {
                name,
                code,
                status,
                patientCount,
                trainingStatus,
                currentRound,
                lastTrainingAt
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: "Hospital not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Hospital updated successfully",
            data: hospital
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.code === 11000
                ? "Hospital code already exists"
                : error.message
        });
    }
};

const deleteHospital = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid hospital ID"
            });
        }

        const hospital = await Hospital.findByIdAndDelete(id);

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: "Hospital not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Hospital deleted successfully",
            data: hospital
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createHospital,
    getAllHospitals,
    getHospitalById,
    updateHospital,
    deleteHospital
};
