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
async function check() {
    await mongoose_1.default.connect(process.env.MONGODB_URI);
    const unownedWebsites = await mongoose_1.default.connection.collection("websites").find({
        $or: [{ owner: { $exists: false } }, { owner: null }],
    }).toArray();
    console.log("Unowned Websites:", unownedWebsites.length);
    const unownedContent = await mongoose_1.default.connection.collection("contents").find({
        $or: [{ author: { $exists: false } }, { author: null }],
    }).toArray();
    console.log("Unowned Content:", unownedContent.length);
    const unownedMedia = await mongoose_1.default.connection.collection("media").find({
        $or: [{ uploadedBy: { $exists: false } }, { uploadedBy: null }],
    }).toArray();
    console.log("Unowned Media:", unownedMedia.length);
    const unownedStores = await mongoose_1.default.connection.collection("storeconfigs").find({
        $or: [{ owner: { $exists: false } }, { owner: null }],
    }).toArray();
    console.log("Unowned Stores:", unownedStores.length);
    await mongoose_1.default.disconnect();
}
check();
