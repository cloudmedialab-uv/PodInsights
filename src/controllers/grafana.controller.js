// controllers/grafana.js
import { getAllDockerStats, getDockerInstances } from "../helpers/dockerStats.js";
import { getAllNodeStats, getNodes } from "../helpers/nodeStats.js";
import { getAllStats, getInstances } from "../helpers/stats.js";

/**
 * /search → lista de todas las métricas disponibles
 */
export const GrafanaMetrics = (_req, res) => {
    res.json([
      {
        label: 'Docker',
        value: 'docker',
        payloads: [
          {
            name: 'metricName',
            label: 'Métrica',
            type: 'select',
            placeholder: 'Elige métrica',
            reloadMetric: true,
            options: []
          },
          {
            name: 'instanceId',
            label: 'Contenedor',
            type: 'multi-select',
            placeholder: 'Elige contenedores',
            reloadMetric: false,
            options: []
          }
        ]
      },
      {
        label: 'Node',
        value: 'node',
        payloads: [
          {
            name: 'metricName',
            label: 'Métrica',
            type: 'select',
            placeholder: 'Elige métrica',
            reloadMetric: true,
            options: []
          },
          {
            name: 'instanceId',
            label: 'Nodo',
            type: 'multi-select',
            placeholder: 'Elige nodos',
            reloadMetric: false,
            options: []
          }
        ]
      },
      {
        label: 'Stats',
        value: 'stats',
        payloads: [
          {
            name: 'metricName',
            label: 'Métrica',
            type: 'select',
            placeholder: 'Elige métrica',
            reloadMetric: true,
            options: []
          },
          {
            name: 'instanceId',
            label: 'Fuente',
            type: 'multi-select',
            placeholder: 'Elige fuente de stats',
            reloadMetric: false,
            options: []
          }
        ]
      }
    ]);
  };

export const GrafanaMetricPayloadOptions = async (req, res) => {
    const { payload, name } = req.body;
    let options = [];

    if (name === 'metricName') {
        options = [
            { label: 'CPU %', value: 'cpuPercent' },
            { label: 'Mem. usada', value: 'memUsage_current' },
            { label: 'RX Bytes', value: 'netStats_rxBytes' },
            { label: 'TX Bytes', value: 'netStats_txBytes' }
        ];
    }

    if (name === 'instanceId') {
        const { sourceType } = payload;
        let ids = [];
        if (sourceType === 'docker') ids = await getDockerInstances();
        if (sourceType === 'node') ids = await getNodes();
        if (sourceType === 'stats') ids = await getInstances();
        options = ids.map(id => ({ label: id, value: id }));
    }

    res.json(options);
};


export const GrafanaQuery = async (req, res) => {
    const { range, targets } = req.body;
    const fromMs = Date.parse(range.from);
    const toMs = Date.parse(range.to);

    const series = await Promise.all(targets.map(async ({ target,payload }) => {
        console.log(payload)
        const { sourceType, metricName, instanceId } = payload;
        let raw = [];

        // obtén todos los puntos según fuente
        if (sourceType === "docker") { 
            raw = await getAllDockerStats({ from: fromMs, to: toMs, instance: instanceId }); 
        }
        if (sourceType === "node") { 
            raw = await getAllNodeStats({ from: fromMs, to: toMs, instance: instanceId }); 
        }
        if (sourceType === "stats") { 
            raw = await getAllStats({ from: fromMs, to: toMs, instance: instanceId }); 
        }

        const datapoints = raw.map(pt => {
            return Query(pt,metricName)
        })
       
        const label = `${sourceType.toUpperCase()} ${metricName} (${instanceId.join(",")})`;
        return { target: label, datapoints };
    }));

    res.json(series);
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
