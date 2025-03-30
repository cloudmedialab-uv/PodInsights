// models/nodeStats.js
import mongoose from "mongoose";

const nodeStatsSchema = new mongoose.Schema(
    {
		createdAt: {
			type: Number,
			default: Date.now(),
		},
	},
	{ strict: false }
);

export default mongoose.model("NodeStats", nodeStatsSchema);
