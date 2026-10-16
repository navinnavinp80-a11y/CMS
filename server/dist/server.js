"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dns_1 = __importDefault(require("dns"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./config/db"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const testRoutes_1 = __importDefault(require("./routes/testRoutes"));
const contentRoutes_1 = __importDefault(require("./routes/contentRoutes"));
const mediaRoutes_1 = __importDefault(require("./routes/mediaRoutes"));
const dashboardRoutes_1 = __importDefault(require("./routes/dashboardRoutes"));
const visitRoutes_1 = __importDefault(require("./routes/visitRoutes"));
const publicRoutes_1 = __importDefault(require("./routes/publicRoutes"));
const storeRoutes_1 = __importDefault(require("./routes/storeRoutes"));
const publicStoreRoutes_1 = __importDefault(require("./routes/publicStoreRoutes"));
const websiteRoutes_1 = __importDefault(require("./routes/websiteRoutes"));
const planRoutes_1 = __importDefault(require("./routes/planRoutes"));
const paymentRoutes_1 = __importDefault(require("./routes/paymentRoutes"));
dns_1.default.setServers(["8.8.8.8", "1.1.1.1"]);
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/uploads", express_1.default.static("uploads"));
app.use("/api/auth", authRoutes_1.default);
app.use("/api/test", testRoutes_1.default);
app.use("/api/content", contentRoutes_1.default);
app.use("/api/public/content", publicRoutes_1.default);
app.use("/api/media", mediaRoutes_1.default);
app.use("/api/dashboard", dashboardRoutes_1.default);
app.use("/api/visits", visitRoutes_1.default);
app.use("/api/store", storeRoutes_1.default);
app.use("/api/public/store", publicStoreRoutes_1.default);
app.use("/api/websites", websiteRoutes_1.default);
app.use("/api/plan", planRoutes_1.default);
app.use("/api/payments", paymentRoutes_1.default);
const PORT = process.env.PORT || 5000;
app.get("/", (req, res) => {
    res.json({
        message: "Headless CMS API is running",
    });
});
const startServer = async () => {
    await (0, db_1.default)();
    app.listen(PORT, () => {
        console.log(`CMS Server running on http://localhost:${PORT}`);
    });
};
startServer();
