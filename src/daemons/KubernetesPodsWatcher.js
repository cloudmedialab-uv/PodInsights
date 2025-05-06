import { CoreV1Api, KubeConfig } from "@kubernetes/client-node";

class KubernetesPodsWatcher {
	static instance;

	constructor(labelSelector, nodeName) {
		if (KubernetesPodsWatcher.instance) {
			return KubernetesPodsWatcher.instance;
		}

		this.kc = new KubeConfig();
		this.kc.loadFromCluster();

		this.coreApi = this.kc.makeApiClient(CoreV1Api);
		this.pods = [];
		this.labelSelector = labelSelector;
		this.nodeName = nodeName;
		KubernetesPodsWatcher.instance = this;
	}

	async updatePods() {
		try {
			const {items} = await this.coreApi.listPodForAllNamespaces({
				fieldSelector: `spec.nodeName=${this.nodeName}`,
				labelSelector: this.labelSelector,
			  });
			  
			this.pods = items.map((pod) => {
				if (pod.status.containerStatuses.length > 1) {
					// Serverless Container
					const [runtime, id] = pod.status.containerStatuses
						.find((container) =>
							container.name.startsWith("user-container")
						).containerID.split("://")

					return {
						id, runtime
						/* gpu: pod.spec.containers.some(
							(pod) => pod?.resources?.requests["nvidia.com/gpu"]
						), */
					};
				} else {
					// Normal Container
					const [runtime, id] = pod.status.containerStatuses[0].containerID.split("://")
					return {
						id, runtime,
						/* gpu: pod.spec.containers.some(
							(pod) => pod?.resources?.requests["nvidia.com/gpu"]
						), */
					};
				}
			});
		} catch (error) {
			console.error(error);
		}
	}

	async start(intervalTime = 5000) {
		this.interval = setInterval(async () => {
			await this.updatePods();
		}, intervalTime);
	}

	stop() {
		clearInterval(this.interval);
	}
}

export default KubernetesPodsWatcher;
