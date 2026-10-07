import dns from "dns";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";
import authRoutes from "./routes/authRoutes";
import testRoutes from "./routes/testRoutes";
import contentRoutes from "./routes/contentRoutes";
import mediaRoutes from "./routes/mediaRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import visitRoutes from "./routes/visitRoutes";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/visits", visitRoutes);

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.json({
    message: "Headless CMS API is running",
  });
});

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`CMS Server running on http://localhost:${PORT}`);
  });
};

startServer();