"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dns_1 = __importDefault(require("dns"));
dns_1.default.setServers(["8.8.8.8", "1.1.1.1"]);
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, "../../.env") });
const BASE_URL = "http://localhost:5000";
const JWT_SECRET = process.env.JWT_SECRET || "cms_super_secret_2026";
const ADMIN_ID = "6ac165c364ba5b73802ffe35";
const adminToken = jsonwebtoken_1.default.sign({ id: ADMIN_ID, role: "admin" }, JWT_SECRET, { expiresIn: "1d" });
async function testMedia() {
    console.log("Testing Media Upload Scoping...");
    // 1. Get legacy website ID
    const listRes = await fetch(`${BASE_URL}/api/websites`, {
        headers: { Authorization: `Bearer ${adminToken}` },
    });
    const listData = (await listRes.json());
    const legacySite = listData.websites.find((w) => w.slug === "default-site");
    if (!legacySite)
        throw new Error("Legacy site not found");
    // 2. Fetch media list for legacy site
    const mediaRes = await fetch(`${BASE_URL}/api/media?websiteId=${legacySite._id}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
    });
    const mediaData = (await mediaRes.json());
    const items = mediaData.media || mediaData;
    console.log(`[PASS] Media list for legacy site returned ${items.length} items`);
    // Verify all returned items belong to legacy site (or are unassigned legacy assets)
    const allCorrect = items.every((m) => !m.website || m.website === legacySite._id || m.website?._id === legacySite._id);
    if (!allCorrect)
        throw new Error("Found media items from different websites!");
    console.log("[PASS] All media items are correctly isolated to the active website");
    console.log("Media scoping test completed successfully!");
}
testMedia().catch(err => {
    console.error("Media test failed:", err);
    process.exit(1);
});
