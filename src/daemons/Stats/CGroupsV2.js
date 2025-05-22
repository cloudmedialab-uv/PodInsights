import Stats from "../../models/stats.js";
import { promises as fs } from "fs";
import path from "path";

const CPU_INFO_DIR = "/monitor/cpuinfo";

const BASE_CPU_DIR = "/monitor/cgroup/";
const BASE_MEM_DIR = "/monitor/cgroup/";
const BASE_PROC_DIR = "/monitor/proc"

const NET_INFO_FILE = "cgroup.procs";

const NET_FILE = "/net/dev"

const CPU_FILE = "cpu.stat";
const MEM_FILE = "memory.current";
const MAX_MEM_FILE = "memory.max_usage_in_bytes";

class CGroupsV2 {
    static instance;

    constructor(watcher, nodeName, interval = 5000) {
        if (CGroupsV2.instance) {
            return CGroupsV2.instance;
        }

        this.cpuMap = new Map();
        this.memMap = new Map();
        this.watcher = watcher;
        this.nodeName = nodeName;
        this.interval = interval;
        CGroupsV2.instance = this;
    }

    async getCpuCores() {
        try {
            const text = await fs.readFile(CPU_INFO_DIR, "utf8");
            return text
                .split("\n")
                .filter(line => line.trim().startsWith("processor"))
                .length;
        } catch (err) {
            console.error("No pude leer CPU_INFO_DIR:", err);
            throw err;
        }
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

    async getProcId(dir) {
        try {
            const text = await fs.readFile(
                path.join(dir, NET_INFO_FILE),
                "utf8"
            );
            const firstLine = text.split('\n')[0].trim();
            return firstLine;
        } catch (err) {
            console.error("No pude leer PROC ID:", err);
            throw err;
        }
    }


    async readNetStats(dir, iface = 'eth0') {
        const procId = await this.getProcId(dir)
        const data = await fs.readFile(
            path.join(BASE_PROC_DIR, procId, NET_FILE),
            'utf8'
        );
        const lines = data.trim().split('\n');
        for (const line of lines.slice(2)) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            if (trimmed.startsWith(iface + ':')) {
                const parts = trimmed.split(/[:\s]+/);
                const rxBytes = parseInt(parts[1], 10);
                const txBytes = parseInt(parts[9], 10);
                return { rxBytes, txBytes };
            }
        }
        throw new Error(`Interfaz ${iface} no encontrada en ${path}`);
    }


    async readCpuUsage(dir) {
        try {
            const content = await fs.readFile(
                path.join(dir, CPU_FILE),
                "utf8"
            );
            const match = content.match(/usage_usec (\d+)/);
            return parseInt(match[1]);
        } catch (err) {
            console.error("Error readCpuUsage " + err);
        }
    }

    async readMemUsage(dir) {
        try {
            const content = await fs.readFile(
                path.join(dir, MEM_FILE),
                "utf8"
            );
            //const match = content.match(/usage_usec (\d+)/);
            //return parseInt(match[1]);
            return parseInt(content);
        } catch (err) {
            console.error("Error readMemUsage ", err);
        }
    }

    async getNetStats(container) {
        try {
            const dir = await this.getFiles(BASE_MEM_DIR, container);
            const stats = await this.readNetStats(dir)

            return stats

        }catch(err) {
            return {err}
        }

    }

    async getMemUsage(container) {
        try {
            const dir = await this.getFiles(BASE_MEM_DIR, container);
            const mem_usec = await this.readMemUsage(dir);

            const lastData = this.memMap.get(dir);

            this.memMap.set(dir, { mem_usec: mem_usec });

            if (!lastData) {
                return 0;
            }

            return { usage: mem_usec - lastData.mem_usec, current: mem_usec }
        } catch (err) {
            return {err}
        }
    }

    async getCpuPercentage(container) {
        try {

            const dir = await this.getFiles(BASE_CPU_DIR, container);
            const now = Date.now();
            const usage_usec_1 = await this.readCpuUsage(dir);

            const lastData = this.cpuMap.get(dir);

            this.cpuMap.set(dir, { time: now, usage_usec: usage_usec_1 });

            if (!lastData) {
                return 0;
            }

            const delta_usec = usage_usec_1 - lastData.usage_usec;
            const delta_time = now - lastData.time;

            return (delta_usec / (delta_time * 1000 * this.cores)) / 10;
        } catch (err) {
            console.error("Error getCPU", err);
            return {err}
        }
    }



    async getContainerStats(container, runtime) {

        const cpu_percentaje = await this.getCpuPercentage(container);
        const mem_usage = await this.getMemUsage(container, runtime)
        const net_stats = await this.getNetStats(container)

        return { cpuPercent: cpu_percentaje, memUsage: mem_usage, netStats: net_stats }
    }

    async updateStats() {
        this.watcher.pods.forEach(async ({ id, runtime }) => {
            try {
                let stats = await this.getContainerStats(id, runtime);

                if (!stats.err) {
                    stats = {
                        ...stats,
                        nodeName: this.nodeName,
                        pod: id,
                        createdAt: Date.now(),
                    };

                    await new Stats(stats).save();
                } else {
                    console.log(stats.err)
                }
            } catch (err) {
                console.error(err);
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

export default CGroupsV2;
