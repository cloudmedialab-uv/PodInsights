import NodeStats from "../models/nodeStats.js";

const getAllNodeStats = async (opts) => {
  try {
    const { from, to, instance } = opts
    let mongoQuery = {};
    if (from && to) {
      mongoQuery.createdAt = { $gte: from, $lte: to };
    } else if (from) {
      mongoQuery.createdAt = { $gte: from };
    } else if (to) {
      mongoQuery.createdAt = { $lte: to };
    }

    if (instance) {
      if (Array.isArray(instance)) {
        mongoQuery.nodeName = { $in: instance };
      } else {
        mongoQuery.nodeName = instance;
      }
    }
    return await NodeStats.find(mongoQuery);
  } catch (err) {
    console.error(err)
    throw new Error("Error al obtener las estadisticas de los nodos")
  }
};

const getNodes = async () => {
  return await NodeStats.distinct("nodeName")
}

const deleteAllNodeStats = async () => {
  return await NodeStats.deleteMany({});
};


export { getAllNodeStats, deleteAllNodeStats, getNodes };
