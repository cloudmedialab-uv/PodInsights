// controllers/grafana.js
import { getAllDockerStats } from "../helpers/dockerStats.js";
import { getAllNodeStats } from "../helpers/nodeStats.js";
import { getAllStats } from "../helpers/stats.js";

/**
 * /search → lista de todas las métricas disponibles
 */
export const GrafanaSearch = (_req, res) => {
    return res.json([
        "cpuPercent",
        "memUsage_usage",
        "memUsage_current",
        "netStats_rxBytes",
        "netStats_txBytes"
    ]);
};

/**
 * /query → para cada métrica solicitada, mapea los datos raw
 * a [valor, timestamp] que Grafana entiende
 */
export const GrafanaQuery = async (req, res) => {
    const { range, targets } = req.body;
    const fromMs = Date.parse(range.from);
    const toMs = Date.parse(range.to);

    // Traemos todos los puntos en el rango
    const raw = await getAllStats(fromMs, toMs);

    const series = targets.map(({ target }) => {
        // Para cada punto, extraemos el campo correcto
        const datapoints = raw.map(pt => {
            let value = 0;
            const parts = target.split("_");

            switch (parts[0]) {
                case "cpuPercent":
                    value = pt.cpuPercent;
                    break;
                case "memUsage":
                    // pt.memUsage: { usage, current }
                    value = pt.memUsage?.[parts[1]] ?? 0;
                    break;
                case "netStats":
                    // pt.netStats: { rxBytes, txBytes }
                    value = pt.netStats?.[parts[1]] ?? 0;
                    break;
                default:
                    value = 0;
            }

            // timestamp en ms
            const ts = typeof pt.createdAt === "number"
                ? pt.createdAt
                : new Date(pt.createdAt).getTime();

            return [value, ts];
        });

        return { target, datapoints };
    });

    return res.json(series);
};


export const GrafanaAnnotations = (_req, res) => res.json([]);
export const GrafanaTagKeys = (_req, res) => res.json([]);
export const GrafanaTagValues = (_req, res) => res.json([]);
