
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./Model/User.model");

async function main() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const user = await User.collection.findOne({
            email: "admin@example.com"
        });

        if (!user) {
            throw new Error("Admin account not found");
        }

        const password = "Admin@12345";
        const hashedPassword = await bcrypt.hash(password, 12);

        await User.collection.updateOne(
            { _id: user._id },
            {
                $set: {
                    password: hashedPassword,
                    status: "active"
                }
            }
        );

        const updatedUser = await User.collection.findOne({
            _id: user._id
        });

        const passwordMatches = await bcrypt.compare(
            password,
            updatedUser.password
        );

        console.log("Role:", updatedUser.role);
        console.log("Password matches:", passwordMatches);
    } catch (error) {
        console.error("Error:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

main();
