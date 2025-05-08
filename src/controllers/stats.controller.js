import { getAllStats, deleteAllStats } from "../helpers/stats.js";

const GetStats = async(req, res) => {
	try {
		const { from, to } = req.query;

		const fromTime = from ? Number(from) : undefined;
		const toTime = to ? Number(to) : undefined;

		const opts = {
			from: fromTime,
			to: toTime
		}
		const stats = await getAllStats(opts);
		return res.json(stats);
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: "Error al obtener los stats" });
	}
}

const DeleteStats = async (req,res) => {
	try {
		const stats = await deleteAllStats()
		return res.json(stats);
	} catch (error) {
		console.error(error)
		return res.status(500).json({ message: "Error al borrar los stats", error });
	}
}

export { GetStats, DeleteStats}