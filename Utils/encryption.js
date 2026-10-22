
const crypto = require("crypto");

const keyHex = process.env.PREDICTION_ENCRYPTION_KEY || "";

if (!/^[0-9a-fA-F]{64}$/.test(keyHex)) {
    throw new Error("Invalid PREDICTION_ENCRYPTION_KEY");
}

const key = Buffer.from(keyHex, "hex");

function encrypt(value) {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

    const plaintext = Buffer.from(JSON.stringify(value), "utf8");
    const encrypted = Buffer.concat([
        cipher.update(plaintext),
        cipher.final()
    ]);

    return [
        "enc:v1",
        iv.toString("base64"),
        cipher.getAuthTag().toString("base64"),
        encrypted.toString("base64")
    ].join(":");
}

function decrypt(value) {
    if (typeof value !== "string" || !value.startsWith("enc:v1:")) {
        return value; // بيانات قديمة غير مشفرة
    }

    const parts = value.split(":");

    if (parts.length !== 5) {
        throw new Error("Invalid encrypted value");
    }

    const [, version, iv64, tag64, data64] = parts;

    if (version !== "v1") {
        throw new Error("Unsupported encryption version");
    }

    const iv = Buffer.from(iv64, "base64");
    const tag = Buffer.from(tag64, "base64");
    const data = Buffer.from(data64, "base64");

    if (iv.length !== 12 || tag.length !== 16 || data.length === 0) {
        throw new Error("Invalid encrypted data");
    }

    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);

    const plaintext = Buffer.concat([
        decipher.update(data),
        decipher.final()
    ]);

    return JSON.parse(plaintext.toString("utf8"));
}

module.exports = { encrypt, decrypt };
