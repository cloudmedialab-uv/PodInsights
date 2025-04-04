// daemons/NodeStatsWatcher.js
import { promises as fs } from "fs";
import NodeStats from "../models/nodeStats.js";

const MEMINFO_PATH = "/monitor/meminfo";      
const PROC_STAT_PATH = "/monitor/stats";   
const NET_STATS_PATH = "/monitor/netstats";   

class NodeStatsWatcher {
  constructor(nodeName, interval = 5000) {
    this.nodeName = nodeName;
    this.interval = interval;
    this.lastCpuStats = null;
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
 
        return { 'rx' : rx, 'tx': tx };

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
      return { memTotal, memUsed };
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


  async computeCpuUsage() {
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

  async collectStats() {
    const { memTotal, memUsed } = await this.readMemStats();
    const cpuUsage = await this.computeCpuUsage();
    const networkStats =  await this.readNetworkStats()  
 
    return {
      nodeName: this.nodeName,
      memTotal,      
      memUsed,       
      cpuUsage,  
      networkStats,
      createdAt: Date.now(),
    };
  }

  async updateStats() {
    const stats = await this.collectStats();
    try {
      await new NodeStats(stats).save();
    } catch (err) {
      console.error("Error saving node stats:", err);
    }
  }

  start() {

    this.updateStats();
    this.loop = setInterval(() => {
      this.updateStats();
    }, this.interval);
  }

  stop() {
    clearInterval(this.loop);
  }
}

export default NodeStatsWatcher;
