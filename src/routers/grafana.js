import { Router } from "express";
import {
  GrafanaQuery,
  GrafanaAnnotations,
  GrafanaTagKeys,
  GrafanaTagValues,
  GrafanaMetrics,
  GrafanaMetricPayloadOptions,
} from "../controllers/grafana.controller.js";

const router = Router();

// health check
router.get("/", (_req, res) => res.json({}));

// los dos principales
router.post("/metrics", GrafanaMetrics);
router.post("/metric-payload-options", GrafanaMetricPayloadOptions)
router.post("/query", GrafanaQuery);

router.post("/annotations", GrafanaAnnotations);  
router.get("/tag-keys", GrafanaTagKeys);      
router.get("/tag-values", GrafanaTagValues); 

export default router;

