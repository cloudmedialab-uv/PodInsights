import mongoose from "mongoose";

const statsSchema = new mongoose.Schema(
	{
		createdAt: {
			type: Number,
			default: Date.now(),
		},
	},
	{ strict: false }
);

export default mongoose.model("Stats", statsSchema);
