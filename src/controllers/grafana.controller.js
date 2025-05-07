// controllers/grafana.js
import { getAllDockerStats } from "../helpers/dockerStats.js";
import { getAllNodeStats } from "../helpers/nodeStats.js";
import { getAllStats } from "../helpers/stats.js";

/**
 * /search → lista de todas las métricas disponibles
 */
export const GrafanaSearch = (_req, res) => {
    return res.json([
        "docker:cpuPercent",
        "docker:memUsage_current",
        "docker:netStats_rxBytes",
        "docker:netStats_txBytes",

        "node:cpuPercent",
        "node:memUsage_current",
        "node:netStats_rxBytes",
        "node:netStats_txBytes",

        "stats:cpuPercent",
        "stats:memUsage_current",
        "stats:netStats_rxBytes",
        "stats:netStats_txBytes",

    ]);
};

export const GrafanaQuery = async (req, res) => {
    const { range, targets } = req.body;

    const fromMs = Date.parse(range.from);
    const toMs = Date.parse(range.to);

    const series = await Promise.all(targets.map(async ({ target: tt }) => {
        const [datasource, target] = tt.split(":")
        const datasources = {
            "docker": getAllDockerStats,
            "node": getAllNodeStats,
            "stats": getAllStats,
        }

        const raw = await datasources[datasource](fromMs, toMs)

        
        const datapoints = raw.map(pt => {
            return Query(pt, target)
        });

        return { tt, datapoints };
    }));

    console.log(series)
    return res.json(series);
};

const Query = (pt, target) => {
    const keys = target.split('_');
    const value = keys.reduce((current, key) => {
        if (current == null || !(key in current)) {
            return undefined;
        }
        return current[key];
    }, pt);

    return [value, pt.createdAt];
}


export const GrafanaAnnotations = (_req, res) => res.json([]);
export const GrafanaTagKeys = (_req, res) => res.json([]);
export const GrafanaTagValues = (_req, res) => res.json([]);
