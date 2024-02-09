import Stats from "../models/stats.js";
import DockerStats from "../models/dockerStats.js";


const getAllStats = async (from, to) => {
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
		const stats = await Stats.find(mongoQuery);
		return stats;
	} catch (error) {
		console.error(error);
		throw new Error("Error al obtener los contenedores");
	}
};

const deleteAllStats = async () => {
	try {
		const res = await Stats.deleteMany({})
		return res
	} catch (error) {
		console.error(error)
		throw new Error("Error al borrar los datos")
	}
}

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

export { getAllStats, getAllDockerStats, deleteAllStats, deleteAllDockerStats };
