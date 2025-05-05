import {  getAllDockerStats, deleteAllDockerStats } from "../helpers/dockerStats.js";

const GetDockerStats = async (req, res) => {
	try {
		const { from, to } = req.query;

		const fromTime = from ? Number(from) : undefined;
		const toTime = to ? Number(to) : undefined;

		const stats = await getAllDockerStats(fromTime, toTime);
		return res.json(stats);
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: "Error al obtener los stats" });
	}
}

const DeleteDockerStats = async (req,res) => {
	try {
		const stats = await deleteAllDockerStats()

		return res.json(stats);
	} catch (error) {
		console.error(error)

		return res.status(500).json({ message: "Error al borrar los stats", error });
	}
}

export { GetDockerStats, DeleteDockerStats }