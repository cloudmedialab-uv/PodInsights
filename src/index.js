import mongoose from "mongoose";
import express from "express";
import cors from "cors";

const app = express();

import router from "./routers/api.js";
import KubernetesPodsWatcher from "./daemons/KubernetesPodsWatcher.js";
import DockerStatsWatcher from "./daemons/DockerStatsWatcher.js";
import StatsWatcher from "./daemons/StatsWatcher.js";

//LOAD ENVs
const useDocker = Boolean(process.env.USE_DOCKER) || false
const port = process.env.PORT || "8080";
const label = process.env.LABEL || "metrics";
const statsInterval = process.env.STATS_INTERVAL_TIME || 5000;
const dockerStatsInterval = process.env.DOCKER_STATS_INTERVAL_TIME || 5000;
const watchInterval = process.env.WATCH_INTERVAL_TIME || 5000;
const url =
	process.env.DB_URL || "mongodb://database.metrics.svc.cluster.local";
const username = process.env.DB_USER || "admin";
const password = process.env.DB_PASSWORD || "password";
const nodeName = process.env.NODE_NAME || "node_name";


console.log("NODO: " + nodeName)

// STARTING WATCHERS

const watcher = new KubernetesPodsWatcher(label, nodeName);
watcher.start(watchInterval);

if(useDocker){
	new DockerStatsWatcher(watcher, nodeName, dockerStatsInterval).start();
}

new StatsWatcher(watcher,nodeName,statsInterval).start();

//MIDDLEWARES
app.use(cors());
app.use(express.json());

//app.use("/api/v1")

app.use("/stats", router);

//CONNECT TO DB
mongoose.connect(url, {
	auth: { username, password },
	useNewUrlParser: true,
	useUnifiedTopology: true,
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
