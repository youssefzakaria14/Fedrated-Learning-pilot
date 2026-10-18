require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./Model/User.model");
const Hospital = require("./Model/Hospital.model");

async function main() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const user = await User.collection.findOne({
            email: "admin@example.com"
        });

        if (!user) {
            throw new Error("Admin account not found");
        }

        const hospital = await Hospital.findOne({
            participantNumber: 1
        }).select("_id");

        if (!hospital) {
            throw new Error("Hospital participant 1 not found");
        }

        const password = "Admin@12345";
        const hashedPassword = await bcrypt.hash(password, 12);

        await User.collection.updateOne(
            { _id: user._id },
            {
                $set: {
                    password: hashedPassword,
                    hospital: hospital._id,
                    status: "active"
                }
            }
        );

        const updatedUser = await User.collection.findOne({
            _id: user._id
        });

        console.log("ROLE:", updatedUser.role);
        console.log("HOSPITAL_ID:", String(updatedUser.hospital));
        console.log(
            "PASSWORD_MATCH:",
            await bcrypt.compare(password, updatedUser.password)
        );
    } finally {
        await mongoose.disconnect();
    }
}

main().catch(error => {
    console.error("ERROR:", error.message);
    process.exitCode = 1;
});
