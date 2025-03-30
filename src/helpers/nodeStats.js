// helpers/nodeStats.js
import NodeStats from "../models/nodeStats.js";

const getAllNodeStats = async (from, to) => {
  const query = {};
  if (from && to) {
    query.createdAt = { $gte: from, $lte: to };
  } else if (from) {
    query.createdAt = { $gte: from };
  } else if (to) {
    query.createdAt = { $lte: to };
  }
  return await NodeStats.find(query);
};

const deleteAllNodeStats = async () => {
  return await NodeStats.deleteMany({});
};


export { getAllNodeStats, deleteAllNodeStats };
