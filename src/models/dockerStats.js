import mongoose from "mongoose";

const dockerStatsSchema = new mongoose.Schema(
	{
		createdAt: {
			type: Number,
			default: Date.now(),
		},
	},
	{ strict: false }
);

export default mongoose.model("DockerStats", dockerStatsSchema);
