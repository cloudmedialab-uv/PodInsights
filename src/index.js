import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import router from "./routers/api.js";
import grafana from "./routers/grafana.js"
import KubernetesPodsWatcher from "./daemons/KubernetesPodsWatcher.js";
import DockerStatsWatcher from "./daemons/DockerStatsWatcher.js";
import NodeStatsWatcher from "./daemons/NodeStatsWatcher.js";
import StatsWatcher from "./daemons/StatsWatcher.js";
import swaggerUi from "swagger-ui-express"
import swaggerJsdoc from "swagger-jsdoc";


//LOAD ENVs
const useNodeStats = JSON.parse(process.env.USE_NODE_STATS || "false");
const useDockerStats = JSON.parse(process.env.USE_DOCKER || "false");

const port = process.env.PORT || "8080";
const label = process.env.LABEL || "metrics";
const statsInterval = process.env.STATS_INTERVAL_TIME || 5000;
const dockerStatsInterval = process.env.DOCKER_STATS_INTERVAL_TIME || 5000;
const nodeStatsInterval = process.env.NODE_STATS_INTERVAL_TIME || 5000;
const watchInterval = process.env.WATCH_INTERVAL_TIME || 5000;
const url =
	process.env.DB_URL || "mongodb://database.metrics.svc.cluster.local";
const username = process.env.DB_USER || "admin";
const password = process.env.DB_PASSWORD || "password";
const nodeName = process.env.NODE_NAME || "node_name";

console.log("NODO: " + nodeName)

const app = express();
const swaggerOptions = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'Stats API',
			version: '1.0.0',
			description: 'Millisecond-level monitoring and can measure CPU and memory usage more precisely than traditional tools.',
		},
	},
	apis: ['./routers/*.js'],
};

const swaggerSpecs = swaggerJsdoc(swaggerOptions);


// STARTING WATCHERS
const watcher = new KubernetesPodsWatcher(label, nodeName);
watcher.start(watchInterval);

if (useNodeStats) {
	new NodeStatsWatcher(nodeName, nodeStatsInterval).start()
	console.log("USING NODE STATS")
}

if (useDockerStats) {
	new DockerStatsWatcher(watcher, nodeName, dockerStatsInterval).start();
	console.log("USING DOCKER STATS")
}

new StatsWatcher(watcher, nodeName, statsInterval).start();

//MIDDLEWARES
app.use(cors());
app.use(express.json());

app.use((req, _, next) => {
	console.log(`→ ${req.method} ${req.originalUrl}`);
	next();
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
app.use("/stats", router);
app.use("/grafana", grafana)

//CONNECT TO DB
mongoose.connect(url, {
	auth: { username, password },
});

mongoose.connection.once("open", () => {
	console.log("DB CONNECTED");
});

mongoose.connection.once("error", () => {
	console.log("conexion error");
});

// LISTEN AND SERVE

app.listen(port, () => {
	console.log(`Servidor iniciado en el puerto ${port}`);
});
