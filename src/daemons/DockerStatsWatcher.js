import Docker from "dockerode";
import DockerStats from "../models/dockerStats.js";

class DockerStatsWatcher {
	static instance;

	constructor(watcher, nodeName, interval = 5000) {
		if (DockerStatsWatcher.instance) {
			return DockerStatsWatcher.instance;
		}

		this.docker = new Docker();
		this.watcher = watcher;
		this.nodeName = nodeName;
		this.interval = interval;
		DockerStatsWatcher.instance = this;
	}

	async getContainerStats(container) {
		try {
			const stats = await container.stats({
				stream: false,
				"one-shot": false,
			});

			let cpuDelta =
				stats.cpu_stats.cpu_usage.total_usage -
				stats.precpu_stats.cpu_usage.total_usage;

			let systemDelta =
				stats.cpu_stats.system_cpu_usage -
				stats.precpu_stats.system_cpu_usage;

			let RESULT_CPU_USAGE = (cpuDelta / systemDelta) * 100;

			return {
				cpuPercent: RESULT_CPU_USAGE,
				memUsage: {
					current: parseFloat(stats.memory_stats.usage),
					limit: parseFloat(stats.memory_stats.limit),
				}
			};
		} catch (err) {
			return { err };
		}
	}

	async updateStats() {
		this.watcher.pods.forEach(async ({ id }) => {
			try {
				const container = this.docker.getContainer(id);
				let stats = await this.getContainerStats(container);

				stats = {
					...stats,
					nodeName: this.nodeName,
					pod: id,
					createdAt: Date.now(),
				};

				if (stats.err) {
					console.log(stats.err);
					return;
				}

				await new DockerStats(stats).save();
			} catch (err) {
				console.log(err);
			}
		});
	}

	async start() {
		this.loop = setInterval(async () => {
			await this.updateStats();
		}, this.interval);
	}

	stop() {
		clearInterval(this.loop);
	}
}

export default DockerStatsWatcher;
