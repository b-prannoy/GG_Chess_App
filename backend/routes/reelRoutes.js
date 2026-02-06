import { Router } from "express";
import { verifyToken } from "../middleware/auth.js";
import {
    getFeed,
    getRandomReels,
    getAvailableGames,
    getReelsByGame,
    viewReel,
    getReelStats,
    getPublicFolderStats,
    getPublicGrandmasters,
    getReelsByFolder,
} from "../controllers/reelController.js";
import {
    likeReel,
    unlikeReel,
    createComment,
    deleteComment,
    getCommentsByReel,
} from "../controllers/engagementController.js";

const router = Router();

// ============ PUBLIC ROUTES (No Auth) ============

// GET /reels - Get paginated feed of published reels
router.get("/", getFeed);

// GET /reels/random - Get random reels (for "Discover" section)
router.get("/random", getRandomReels);

// GET /reels/folders - Get folder stats (random vs grandmaster counts)
router.get("/folders", getPublicFolderStats);

// GET /reels/grandmasters - Get list of grandmasters with reel counts
router.get("/grandmasters", getPublicGrandmasters);

// GET /reels/by-folder - Get reels by folder and optionally grandmaster
router.get("/by-folder", getReelsByFolder);

// GET /reels/games - Get list of available games (for game selection UI)
router.get("/games", getAvailableGames);

// GET /reels/game/:gameId - Get reels for a specific game
router.get("/game/:gameId", getReelsByGame);

// GET /reels/:reelId/stats - Get engagement stats for a reel
router.get("/:reelId/stats", getReelStats);

// GET /reels/:reelId/comments - Get all comments for a reel
router.get("/:reelId/comments", getCommentsByReel);

// POST /reels/:reelId/view - Record a view
router.post("/:reelId/view", viewReel);

// ============ AUTHENTICATED ROUTES ============

// POST /reels/:reelId/like - Like a reel
router.post("/:reelId/like", verifyToken, likeReel);

// PATCH /reels/:reelId/like - Like/Unlike a reel (frontend uses PATCH)
router.patch("/:reelId/like", verifyToken, likeReel);

// POST /reels/:reelId/unlike - Unlike a reel
router.post("/:reelId/unlike", verifyToken, unlikeReel);

// POST /reels/:reelId/comments - Create a new comment
router.post("/:reelId/comments", verifyToken, createComment);

// DELETE /reels/:reelId/comments/:commentId - Delete a comment
router.delete("/:reelId/comments/:commentId", verifyToken, deleteComment);

export default router;

