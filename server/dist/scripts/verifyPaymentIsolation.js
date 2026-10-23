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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const Payment_1 = __importDefault(require("../models/Payment"));
const BASE_URL = "http://localhost:5000/api";
const results = [];
function recordTest(result) {
    results.push(result);
    const statusStr = result.passed ? "✓ PASS" : "✗ FAIL";
    console.log(`[${statusStr}] [${result.category}] ${result.test}`);
    if (!result.passed && result.details) {
        console.error(`       Details: ${result.details}`);
    }
}
async function request(endpoint, method = "GET", token, body) {
    const headers = {};
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    if (body) {
        headers["Content-Type"] = "application/json";
    }
    const res = await fetch(`${BASE_URL}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
}
async function runPaymentIsolationAudit() {
    console.log("================================================================================");
    console.log("   RAZORPAY PREFILL & USER CONTACT DATA PRIVACY VERIFICATION SUITE              ");
    console.log("================================================================================\n");
    await mongoose_1.default.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB successfully.\n");
    const jwtSecret = process.env.JWT_SECRET;
    const emailA = "test_pay_user_a@test.com";
    const emailB = "test_pay_user_b@test.com";
    const emailC = "test_pay_user_c@test.com";
    // Clean previous runs
    await User_1.default.deleteMany({ email: { $in: [emailA, emailB, emailC] } });
    // 1. User A: Has a verified phone number
    const userA = await User_1.default.create({
        name: "User A Verified",
        email: emailA,
        password: "hashedpassword123",
        role: "editor",
        plan: "free",
        phone: "+919876543210",
        phoneVerified: true,
    });
    // 2. User B: Has NO phone number stored
    const userB = await User_1.default.create({
        name: "User B No Phone",
        email: emailB,
        password: "hashedpassword123",
        role: "editor",
        plan: "free",
        phone: null,
        phoneVerified: false,
    });
    // 3. User C: Has an UNVERIFIED phone number (exists in DB but phoneVerified: false)
    const userC = await User_1.default.create({
        name: "User C Unverified Phone",
        email: emailC,
        password: "hashedpassword123",
        role: "editor",
        plan: "free",
        phone: "+919111122222",
        phoneVerified: false,
    });
    const tokenA = jsonwebtoken_1.default.sign({ id: userA._id.toString(), role: "editor" }, jwtSecret, { expiresIn: "1h" });
    const tokenB = jsonwebtoken_1.default.sign({ id: userB._id.toString(), role: "editor" }, jwtSecret, { expiresIn: "1h" });
    const tokenC = jsonwebtoken_1.default.sign({ id: userC._id.toString(), role: "editor" }, jwtSecret, { expiresIn: "1h" });
    console.log(`User A (Verified Phone):   ${userA._id} | ${userA.email}`);
    console.log(`User B (No Phone):         ${userB._id} | ${userB.email}`);
    console.log(`User C (Unverified Phone): ${userC._id} | ${userC.email}\n`);
    // ==========================================================================
    // SCENARIO 1: User A Creates Payment Order (Verified Phone)
    // ==========================================================================
    console.log("--- SCENARIO 1: User A (Verified Phone Number) ---");
    const orderResA = await request("/payments/create-order", "POST", tokenA);
    recordTest({
        category: "User A Order",
        test: "User A create-order returns HTTP 201",
        passed: orderResA.status === 201 && orderResA.data.success === true,
        details: `Got status ${orderResA.status}`,
    });
    const prefillA = orderResA.data.data?.prefill;
    recordTest({
        category: "User A Order",
        test: "User A prefill.name matches User A's name",
        passed: prefillA?.name === userA.name,
        details: `Expected ${userA.name}, got ${prefillA?.name}`,
    });
    recordTest({
        category: "User A Order",
        test: "User A prefill.email matches User A's email",
        passed: prefillA?.email === userA.email,
        details: `Expected ${userA.email}, got ${prefillA?.email}`,
    });
    recordTest({
        category: "User A Order",
        test: "User A prefill.contact includes verified phone (+919876543210)",
        passed: prefillA?.contact === "+919876543210",
        details: `Expected +919876543210, got ${prefillA?.contact}`,
    });
    console.log("");
    // ==========================================================================
    // SCENARIO 2: User B Creates Payment Order (No Phone Stored)
    // ==========================================================================
    console.log("--- SCENARIO 2: User B (No Phone Stored) ---");
    const orderResB = await request("/payments/create-order", "POST", tokenB);
    recordTest({
        category: "User B Order",
        test: "User B create-order returns HTTP 201",
        passed: orderResB.status === 201 && orderResB.data.success === true,
        details: `Got status ${orderResB.status}`,
    });
    const prefillB = orderResB.data.data?.prefill;
    recordTest({
        category: "User B Order",
        test: "User B prefill.name matches User B's name",
        passed: prefillB?.name === userB.name,
        details: `Expected ${userB.name}, got ${prefillB?.name}`,
    });
    recordTest({
        category: "User B Order",
        test: "User B prefill.email matches User B's email",
        passed: prefillB?.email === userB.email,
        details: `Expected ${userB.email}, got ${prefillB?.email}`,
    });
    recordTest({
        category: "User B Order",
        test: "User B prefill.contact is strictly omitted (undefined)",
        passed: prefillB?.contact === undefined,
        details: `Expected undefined, got: ${prefillB?.contact}`,
    });
    recordTest({
        category: "Privacy Isolation",
        test: "User A's phone number is NEVER leaked in User B's order response",
        passed: JSON.stringify(orderResB.data).includes("+919876543210") === false,
        details: "Found User A's phone number in User B's response payload!",
    });
    console.log("");
    // ==========================================================================
    // SCENARIO 3: User C Creates Payment Order (Unverified Phone in DB)
    // ==========================================================================
    console.log("--- SCENARIO 3: User C (Unverified Phone Number) ---");
    const orderResC = await request("/payments/create-order", "POST", tokenC);
    const prefillC = orderResC.data.data?.prefill;
    recordTest({
        category: "Unverified Phone",
        test: "User C prefill.contact is strictly omitted because phoneVerified is false",
        passed: prefillC?.contact === undefined,
        details: `Expected undefined for unverified phone, but got: ${prefillC?.contact}`,
    });
    console.log("");
    // ==========================================================================
    // SCENARIO 4: Tampering & Horizontal Privilege Escalation Attempt
    // ==========================================================================
    console.log("--- SCENARIO 4: Tampering Attempt by User B ---");
    const tamperedRes = await request("/payments/create-order", "POST", tokenB, {
        userId: userA._id.toString(),
        phone: "+910000000000",
        contact: "+910000000000",
    });
    const tamperedPrefill = tamperedRes.data.data?.prefill;
    recordTest({
        category: "Anti-Tampering",
        test: "Server ignores spoofed body userId and scopes strictly to authenticated User B",
        passed: tamperedPrefill?.email === userB.email && tamperedPrefill?.contact === undefined,
        details: `Prefill email: ${tamperedPrefill?.email}, contact: ${tamperedPrefill?.contact}`,
    });
    console.log("");
    // ==========================================================================
    // SCENARIO 5: Payment Amount and Verification Integrity
    // ==========================================================================
    console.log("--- SCENARIO 5: Payment Amount & Verification Integrity ---");
    const orderData = orderResB.data.data;
    recordTest({
        category: "Pricing & Currency",
        test: "Premium plan order amount is ₹399 (39900 paise)",
        passed: orderData?.amount === 39900,
        details: `Expected 39900, got ${orderData?.amount}`,
    });
    recordTest({
        category: "Pricing & Currency",
        test: "Currency is INR",
        passed: orderData?.currency === "INR",
        details: `Expected INR, got ${orderData?.currency}`,
    });
    // Test invalid payment signature rejection
    const invalidVerify = await request("/payments/verify", "POST", tokenB, {
        razorpay_order_id: orderData.orderId,
        razorpay_payment_id: "pay_fake1234567890",
        razorpay_signature: "invalidsignaturehash1234567890abcdef1234567890abcdef1234567890abcdef",
    });
    recordTest({
        category: "Verification Security",
        test: "Server rejects forged Razorpay signature with HTTP 400",
        passed: invalidVerify.status === 400 && invalidVerify.data.success === false,
        details: `Expected 400, got ${invalidVerify.status}`,
    });
    console.log("");
    // ==========================================================================
    // Summary & Cleanup
    // ==========================================================================
    await Payment_1.default.deleteMany({ user: { $in: [userA._id, userB._id, userC._id] } });
    await User_1.default.deleteMany({ _id: { $in: [userA._id, userB._id, userC._id] } });
    await mongoose_1.default.disconnect();
    const total = results.length;
    const passed = results.filter((r) => r.passed).length;
    const failed = results.filter((r) => !r.passed).length;
    console.log("================================================================================");
    console.log(`TOTAL PAYMENT ISOLATION TESTS: ${total} | PASSED: ${passed} | FAILED: ${failed}`);
    console.log("================================================================================\n");
    if (failed > 0) {
        process.exit(1);
    }
    else {
        process.exit(0);
    }
}
runPaymentIsolationAudit().catch((err) => {
    console.error("Test execution fatal error:", err);
    process.exit(1);
});
