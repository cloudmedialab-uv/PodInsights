import { Router } from "express";
import { DeleteStats, GetStats } from "../controllers/stats.controller.js";
import { DeleteDockerStats, GetDockerStats } from "../controllers/dockerStats.controller.js";
const router = Router();

/**
 * @swagger
 * /stats:
 *  get:
 *    summary: Retrieve all statistics within an optional time range
 *    description: Fetches general statistics, optionally filtered by a time range defined by 'from' and 'to' query parameters.
 *    parameters:
 *      - in: query
 *        name: from
 *        schema:
 *          type: number
 *        required: false
 *        description: Start of the time range (timestamp) for stats retrieval.
 *      - in: query
 *        name: to
 *        schema:
 *          type: number
 *        required: false
 *        description: End of the time range (timestamp) for stats retrieval.
 *    responses:
 *      200:
 *        description: A JSON array of stats.
 *      500:
 *        description: Error message in case of failure.
 *  delete:
 *    summary: Delete all general statistics
 *    description: Deletes all stored general statistics.
 *    responses:
 *      200:
 *        description: Success message upon deleting all stats.
 *      500:
 *        description: Error message in case of failure.
 */

router.get("/", GetStats);
router.delete("/", DeleteStats)

/**
 * @swagger
 * /stats/docker:
 *  get:
 *    summary: Retrieve all Docker statistics within an optional time range
 *    description: Fetches Docker statistics, optionally filtered by a time range defined by 'from' and 'to' query parameters.
 *    parameters:
 *      - in: query
 *        name: from
 *        schema:
 *          type: number
 *        required: false
 *        description: Start of the time range (timestamp) for Docker stats retrieval.
 *      - in: query
 *        name: to
 *        schema:
 *          type: number
 *        required: false
 *        description: End of the time range (timestamp) for Docker stats retrieval.
 *    responses:
 *      200:
 *        description: A JSON array of Docker stats.
 *      500:
 *        description: Error message in case of failure.
 *  delete:
 *    summary: Delete all Docker statistics
 *    description: Deletes all stored Docker statistics.
 *    responses:
 *      200:
 *        description: Success message upon deleting all Docker stats.
 *      500:
 *        description: Error message in case of failure.
 */
router.get("/docker", GetDockerStats);
router.delete("/docker", DeleteDockerStats)

export default router;
