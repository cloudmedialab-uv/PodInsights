import { Router } from "express";
const router = Router();
import { getAllStats, getAllDockerStats, deleteAllDockerStats, deleteAllStats } from "../helpers/stats.js";

router.get("/", async (req, res) => {
	try {
		const { from, to } = req.query;

		const fromTime = from ? Number(from) : undefined;
		const toTime = to ? Number(to) : undefined;

		const stats = await getAllStats(fromTime, toTime);
		return res.json(stats);
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: "Error al obtener los stats" });
	}
});

router.get("/docker", async (req, res) => {
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
});

router.delete("/", async (req,res) => {
	try {
		const stats = await deleteAllStats()
		return res.json(stats);
	} catch (error) {
		console.error(error)
		return res.status(500).json({ message: "Error al borrar los stats", error });
	}
})

router.delete("/docker", async (req,res) => {
	try {
		const stats = await deleteAllDockerStats()

		return res.json(stats);
	} catch (error) {
		console.error(error)

		return res.status(500).json({ message: "Error al borrar los stats", error });
	}
})

export default router;
