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

// los dos principales
router.post("/metrics", GrafanaSearch);
router.post("/query", GrafanaQuery);

// endpoints opcionales (pueden devolver [] si no usas tags ni anotaciones)
router.post("/annotations", GrafanaAnnotations);   // Grafana envía anotaciones
router.get("/tag-keys", GrafanaTagKeys);          // para autocompletar claves de tag
router.get("/tag-values", GrafanaTagValues);      // para autocompletar valores de tag

export default router;

