import DockerStats from "../models/dockerStats.js";


const getAllDockerStats = async (from, to) => {
	try {
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
		const stats = await DockerStats.find(mongoQuery);
		return stats;
	} catch (error) {
		console.error(error);
		throw new Error("Error al obtener los contenedores");
	}
};

const deleteAllDockerStats = async () => {
	try {
		const res = await DockerStats.deleteMany({})
		return res
	} catch (error) {
		console.error(error)
		throw new Error("Error al borrar los datos")
	}
}

export { getAllDockerStats, deleteAllDockerStats };
