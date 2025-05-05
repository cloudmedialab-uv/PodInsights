import { getAllNodeStats, deleteAllNodeStats } from "../helpers/nodeStats.js";

const GetNodeStats = async (req, res) => {
  try {
    const { from, to } = req.query;
    const fromTime = from ? Number(from) : undefined;
    const toTime = to ? Number(to) : undefined;
    const stats = await getAllNodeStats(fromTime, toTime);
    return res.json(stats);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error getting node stats" });
  }
};

const DeleteNodeStats = async (req, res) => {
  try {
    const result = await deleteAllNodeStats();
    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error deleting node stats" });
  }
};

export { GetNodeStats, DeleteNodeStats };
