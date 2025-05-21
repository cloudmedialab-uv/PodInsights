import CGroupsV1 from "./Stats/CGroupsV1.js";
import CGroupsV2 from "./Stats/CGroupsV2.js";

import { execSync } from "child_process";



class StatsWatcher {
	static instance;

	constructor(watcher, nodeName, interval = 5000) {
		if (StatsWatcher.instance) {
			return StatsWatcher.instance;
		}
		
		const cgrouptype = this.getCGroupType()

		console.log(cgrouptype)

		let instance
		if (!cgrouptype.includes("2")) {
			instance = new CGroupsV1(watcher,nodeName,interval)
			console.log("USING CGROUPS v1")
		}else {
			instance = new CGroupsV2(watcher,nodeName,interval)
			console.log("USING CGROUPS v2")
		}

		StatsWatcher.instance = this;
		return instance
	}

	getCGroupType() {
		try {
			return execSync('cat /monitor/proc/mounts | grep " /monitor/cgroup "').toString().trim().split(" ")[0];
		  } catch (err) {
			console.error('Error al ejecutar stat:', err);
			return '';
		  }
	}
}

export default StatsWatcher;
