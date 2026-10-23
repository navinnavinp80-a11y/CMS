"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dns_1 = __importDefault(require("dns"));
dns_1.default.setServers(["8.8.8.8", "1.1.1.1"]);
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
async function run() {
    try {
        await mongoose_1.default.connect(process.env.MONGODB_URI);
        const users = await mongoose_1.default.connection.collection("users").find().toArray();
        console.log("USERS COUNT:", users.length);
        for (const u of users) {
            console.log("User:", JSON.stringify({
                _id: u._id,
                name: u.name,
                email: u.email,
                phone: u.phone,
                contact: u.contact,
                mobile: u.mobile,
                phoneNumber: u.phoneNumber,
                role: u.role,
                plan: u.plan
            }));
        }
        const payments = await mongoose_1.default.connection.collection("payments").find().toArray();
        console.log("PAYMENTS COUNT:", payments.length);
        for (const p of payments) {
            console.log("Payment:", JSON.stringify({
                _id: p._id,
                user: p.user,
                orderId: p.orderId,
                razorpayOrderId: p.razorpayOrderId,
                status: p.status
            }));
        }
        await mongoose_1.default.disconnect();
    }
    catch (e) {
        console.error("Error:", e);
    }
}
run();
