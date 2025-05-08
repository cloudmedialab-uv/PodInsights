import Stats from "../models/stats.js";

const getAllStats = async (opts) => {
	try {
		const {from,to,instance} = opts
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
		const stats = await Stats.find(mongoQuery);
		return stats;
	} catch (error) {
		console.error(error);
		throw new Error("Error al obtener los contenedores");
	}
};

const getInstances = async () => {
	return await Stats.distinct("pod")
}

const deleteAllStats = async () => {
	try {
		const res = await Stats.deleteMany({})
		return res
	} catch (error) {
		console.error(error)
		throw new Error("Error al borrar los datos")
	}
}


export { getAllStats, deleteAllStats, getInstances };
