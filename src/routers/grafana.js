import { Router } from "express";
import {
  GrafanaMetrics,
  GrafanaQuery,
  GrafanaAnnotations,
  GrafanaTagKeys,
  GrafanaTagValues,
} from "../controllers/grafana.controller.js";

const router = Router();

// health check
router.get("/", (_req, res) => res.json({}));

router.post("/metrics", GrafanaMetrics);
router.post("/query", GrafanaQuery);

router.post("/annotations", GrafanaAnnotations);   
router.get("/tag-keys", GrafanaTagKeys);         
router.get("/tag-values", GrafanaTagValues);     

export default router;

