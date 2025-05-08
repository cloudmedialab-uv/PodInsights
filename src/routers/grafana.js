import { Router } from "express";
import {
  GrafanaSearch,
  GrafanaQuery,
  GrafanaAnnotations,
  GrafanaTagKeys,
  GrafanaTagValues,
} from "../controllers/grafana.controller.js";

const router = Router();

// health check
router.get("/", (_req, res) => res.json({}));

router.post("/metrics", GrafanaSearch);
router.post("/query", GrafanaQuery);

router.post("/annotations", GrafanaAnnotations);   
router.get("/tag-keys", GrafanaTagKeys);         
router.get("/tag-values", GrafanaTagValues);     

export default router;

