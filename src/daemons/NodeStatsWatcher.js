import { promises as fs } from "fs";
import NodeStats from "../models/nodeStats.js";

const MEMINFO_PATH = "/monitor/memstats";
const PROC_STAT_PATH = "/monitor/cpustats";
const NET_STATS_PATH = "/monitor/netstats";

class NodeStatsWatcher {
  static instance;
  
  constructor(nodeName, interval = 5000) {

    if (NodeStatsWatcher.instance) {
			return NodeStatsWatcher.instance;
		}
    this.nodeName = nodeName;
    this.interval = interval;
    this.lastCpuStats = null;
    NodeStatsWatcher.instance = this;
  }


  async readNetworkStats() {
    try {  
       const dataRx = await fs.readFile(NET_STATS_PATH+"/rx_bytes", "utf8");
       const dataTx = await fs.readFile(NET_STATS_PATH+"/tx_bytes", "utf8");
  
   
        if (!dataRx || !dataTx) {
          throw new Error("Unable to parse network stats"); 
        }

        const rx =  parseInt(dataRx)
        const tx =  parseInt(dataTx)
 
        return { 'rxBytes' : rx, 'txBytes': tx };

    } catch (err) {
      console.log("Error reading networking stats:", err);
      return { 'rx': -1, 'tx': -1 };
    }

  }

  async readMemStats() {
    try {
      const data = await fs.readFile(MEMINFO_PATH, "utf8");
      const lines = data.split("\n");
      const memTotalLine = lines.find(line => line.startsWith("MemTotal:"));
      const memAvailableLine = lines.find(line => line.startsWith("MemAvailable:"));
      if (!memTotalLine || !memAvailableLine) {
        throw new Error("Unable to parse meminfo");
      }
      const memTotal = parseInt(memTotalLine.split(":")[1].trim().split(" ")[0], 10) * 1024;
      const memAvailable = parseInt(memAvailableLine.split(":")[1].trim().split(" ")[0], 10) * 1024;
      const memUsed = memTotal - memAvailable;
      return { limit: memTotal, current: memUsed };
    } catch (err) {
      console.error("Error reading meminfo:", err);
      return { memTotal: 0, memUsed: 0 };
    }
  }

  async readCpuStats() {
    try {
      const data = await fs.readFile(PROC_STAT_PATH, "utf8");
      const lines = data.split("\n");
      const cpuLine = lines.find(line => line.startsWith("cpu "));
      if (!cpuLine) {
        throw new Error("Unable to parse cpu stats");
      }
      const parts = cpuLine.split(" ").filter(Boolean).slice(1);
      const values = parts.map(Number);
      const total = values.reduce((a, b) => a + b, 0);
      const idle = values[3] || 0;
      return { total, idle };
    } catch (err) {
      console.error("Error reading cpu stats:", err);
      return { total: 0, idle: 0 };
    }
  }

  async getCpuPercentage() {
    const currentCpuStats = await this.readCpuStats();
    let usagePercent = 0;
    if (this.lastCpuStats) {
      const deltaTotal = currentCpuStats.total - this.lastCpuStats.total;
      const deltaIdle = currentCpuStats.idle - this.lastCpuStats.idle;
      if (deltaTotal > 0) {
        usagePercent = ((deltaTotal - deltaIdle) / deltaTotal) * 100;
      }
    }
    this.lastCpuStats = currentCpuStats;
    return usagePercent;
  }

  async getContainerStats() {
    const memUsage = await this.readMemStats();
    const cpuPercent = await this.getCpuPercentage();
    const netStats = await this.readNetworkStats()

    return {
      memUsage,
      cpuPercent,
      netStats,
    };
  }

  async updateStats() {
    try {
      let stats = await this.getContainerStats();
      stats = {
        ...stats,
        nodeName: this.nodeName,
        createdAt: Date.now(),
      };

      if (stats.err) {
        console.log(stats.err);
        return;
      }

      await new NodeStats(stats).save();
    } catch (err) {
      console.error("Error saving node stats:", err);
    }
  }

  async start() {
    this.loop = setInterval(async() => {
      await this.updateStats();
    }, this.interval);
  }

  stop() {
    clearInterval(this.loop);
  }
}

export default NodeStatsWatcher;
