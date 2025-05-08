import DockerStats from "../models/dockerStats.js";



const getAllDockerStats = async (opts) => {
	try {
		const { from, to, instance } = opts
		let mongoQuery = {};

		if (from && to) {
			mongoQuery.createdAt = {
				$gte: from,
				$lte: to,
			};
		} else if (from) {
			mongoQuery.createdAt = {
				$gte: from,
			};
		} else if (to) {
			mongoQuery.createdAt = {
				$lte: to,
			};
		}

		if (instance) {
			if (Array.isArray(instance)) {
				mongoQuery.pod = { $in: instance };
			} else {
				mongoQuery.pod = instance;
			}
		}
		const stats = await DockerStats.find(mongoQuery);
		return stats;
	} catch (error) {
		console.error(error);
		throw new Error("Error al obtener los contenedores");
	}
};

const getDockerInstances = async () => {
	return await DockerStats.distinct("pod")
}

const deleteAllDockerStats = async () => {
	try {
		const res = await DockerStats.deleteMany({})
		return res
	} catch (error) {
		console.error(error)
		throw new Error("Error al borrar los datos")
	}
}

export { getAllDockerStats, deleteAllDockerStats, getDockerInstances };
