import Stats from "../models/stats.js";
import { promises as fs } from "fs";
import { exec } from "child_process";

import path from "path";

// ASSUMING cgroups2
// Need to mount dis

const CPU_INFO_DIR = "/monitor/cpuinfo";

const BASE_CPU_DIR = "/monitor/cgroup/cpu/kubepods.slice";
const BASE_MEM_DIR = "/monitor/cgroup/mem/kubepods.slice";

const CPU_FILE = "cpuacct.usage";
const MEM_FILE = "memory.usage_in_bytes";


//const BASE_MEM_DIR = "/cgroup/system.slice";

const CGROUPS_TYPE = true;

class StatsWatcher {
	static instance;

	constructor(watcher, nodeName, interval = 5000) {
		if (StatsWatcher.instance) {
			return StatsWatcher.instance;
		}

		this.cpuMap = new Map();
		this.memMap = new Map();
		this.watcher = watcher;
		this.nodeName = nodeName;
		this.interval = interval;
		StatsWatcher.instance = this;
	}

	getCpuCores() {
		return new Promise((resolve, reject) => {
			exec(
				`cat ${CPU_INFO_DIR} | grep processor | wc -l`,
				(error, stdout, stderr) => {
					if (error) {
						console.error(`Error al ejecutar el comando: ${error}`);
						return reject(error);
					}
					if (stderr) {
						console.error(`Error en el comando: ${stderr}`);
						return reject(stderr);
					}
					resolve(parseInt(stdout.trim(), 10));
				}
			);
		});
	}

	async getFiles(dir, file) {
		let files = await fs.readdir(dir, { withFileTypes: true });
		let promises = [];

		for (const f of files) {
			if (f.isDirectory()) {
				let fullPath = path.join(dir, f.name);
				if (f.name.includes(file)) {
					return fullPath;
				}
				promises.push(this.getFiles(fullPath, file));
			}
		}

		let res = await Promise.all(promises);
		return res.find((p) => p);
	}

	async readCpuUsage(dockerDir) {
		try {
			const content = await fs.readFile(
				path.join(dockerDir, CPU_FILE),
				"utf8"
			);

			if (CGROUPS_TYPE) {
				//cgroup v1
				return parseInt(content, 10);
			}
			//cgroup v2
			const match = content.match(/usage_usec (\d+)/);
			return parseInt(match[1], 10);
		} catch (err) {
			console.error("Error readCpuUsage " + err);
		}
	}

	async readMemUsage(dockerDir) {
		try {
			const content = await fs.readFile(
				path.join(dockerDir, MEM_FILE),
				"utf8"
			);

			if (CGROUPS_TYPE) {
				//cgroup v1
				return parseInt(content, 10);
			}
			//cgroup v2
			const match = content.match(/usage_usec (\d+)/);
			return parseInt(match[1], 10);
		} catch (err) {
			console.error("Error readCpuUsage " + err);
		}
	}

	async getMemUsage(container) {
		try {
			const dockerDir = await this.getFiles(BASE_MEM_DIR, container);
			const mem_usec = await this.readMemUsage(dockerDir);

			const lastData = this.memMap.get(dockerDir);

			this.memMap.set(dockerDir, { mem_usec: mem_usec });

			if (!lastData) {
				return 0;
			}

			return mem_usec - lastData.mem_usec
		} catch (error) {
			console.error("Error getCPU", error);
		}
	}


	async getCpuPercentage(container) {
		try {
			const dockerDir = await this.getFiles(BASE_CPU_DIR, container);
			const now = Date.now();
			const usage_usec_1 = await this.readCpuUsage(dockerDir);

			const lastData = this.cpuMap.get(dockerDir);

			this.cpuMap.set(dockerDir, { time: now, usage_usec: usage_usec_1 });

			if (!lastData) {
				return 0;
			}

			const delta_usec = usage_usec_1 - lastData.usage_usec;
			const delta_time = now - lastData.time;

			return (delta_usec / (delta_time * 1000 * this.cores))/10;
		} catch (error) {
			console.error("Error getCPU", error);
		}
	}


	async getContainerStats(container) {

		const cpu_percentaje = await this.getCpuPercentage(container);
		const mem_usage = await this.getMemUsage(container)

		if(!cpu_percentaje) {
			return {err: "No cpu usage"}
		}
		return { cpuPercent: cpu_percentaje, memUsage: mem_usage }
	}

	async updateStats() {
		this.watcher.pods.forEach(async ({ id }) => {
			try {
				let stats = await this.getContainerStats(id);

				if(!stats.err){	
					stats = {
						...stats,
						nodeName: this.nodeName,
						pod: id,
						createdAt: Date.now(),
					};
				
					await new Stats(stats).save();
				}
			} catch (err) {
				console.log(err);
			}
		});
	}

	async start() {
		this.cores = await this.getCpuCores();

		this.loop = setInterval(async () => {
			await this.updateStats();
		}, this.interval);
	}

	stop() {
		clearInterval(this.loop);
	}
}

export default StatsWatcher;
