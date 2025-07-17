import express from "express";
import { getIndexLogs, getDashboardMetrics, getJobsAnomalies, getAnomaliesStats, getClients, getCountries } from "../controllers/indexlogs_controller";
import { verifyAccessToken } from "../middleware/user_token_middleware";

const router = express.Router();

router.get("/", verifyAccessToken, getIndexLogs);
router.get("/dashboard-metrics", verifyAccessToken, getDashboardMetrics);
router.get("/jobs-anomalies", verifyAccessToken, getJobsAnomalies);
router.get("/anomalies-stats", verifyAccessToken, getAnomaliesStats);
router.get("/clients", verifyAccessToken, getClients);
router.get("/countries", verifyAccessToken, getCountries);

export default router;