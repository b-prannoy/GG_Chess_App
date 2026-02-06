import Comment from "../models/Comment.js";
import Reel from "../models/Reel.js";

// ============ LIKE FUNCTIONS ============

// POST/PATCH /reels/:reelId/like - Like or unlike a reel based on action (requires auth)
export const likeReel = async (req, res) => {
    try {
        const { reelId } = req.params;
        const { action } = req.body; // "like" or "unlike"

        // Determine increment based on action (default to like if not specified)
        const increment = action === "unlike" ? -1 : 1;

        const reel = await Reel.findByIdAndUpdate(
            reelId,
            { $inc: { "engagement.likes": increment } },
            { new: true }
        );

        if (!reel) {
            return res.status(404).json({ error: "Reel not found" });
        }

        // Ensure likes don't go negative
        if (reel.engagement.likes < 0) {
            reel.engagement.likes = 0;
            await reel.save();
        }

        res.json({
            success: true,
            message: action === "unlike" ? "Reel unliked" : "Reel liked",
            likes: reel.engagement.likes,
        });
        console.log(`POST /reels/${reelId}/like - Reel ${action === "unlike" ? "unliked" : "liked"}, total likes: ${reel.engagement.likes}`);
    } catch (err) {
        console.error("POST /reels/:reelId/like - Error:", err);
        res.status(500).json({ error: "Failed to like reel", message: err.message });
    }
};

// POST /reels/:reelId/unlike - Unlike a reel (requires auth)
export const unlikeReel = async (req, res) => {
    try {
        const { reelId } = req.params;

        const reel = await Reel.findByIdAndUpdate(
            reelId,
            { $inc: { "engagement.likes": -1 } },
            { new: true }
        );

        if (!reel) {
            return res.status(404).json({ error: "Reel not found" });
        }

        // Ensure likes don't go negative
        if (reel.engagement.likes < 0) {
            reel.engagement.likes = 0;
            await reel.save();
        }

        res.json({
            success: true,
            message: "Reel unliked",
            likes: reel.engagement.likes,
        });
        console.log(`POST /reels/${reelId}/unlike - Reel unliked, total likes: ${reel.engagement.likes}`);
    } catch (err) {
        console.error("POST /reels/:reelId/unlike - Error:", err);
        res.status(500).json({ error: "Failed to unlike reel", message: err.message });
    }
};

// ============ COMMENT FUNCTIONS ============

// POST /reels/:reelId/comments - Create a new comment
export const createComment = async (req, res) => {
    try {
        const { reelId } = req.params;
        const { text, parentCommentId } = req.body;
        const userId = req.user.userId;

        // Validate required fields
        if (!text) {
            return res.status(400).json({ error: "text is required" });
        }

        // Check if reel exists
        const reel = await Reel.findById(reelId);
        if (!reel) {
            return res.status(404).json({ error: "Reel not found" });
        }

        // If it's a reply, check if parent comment exists
        if (parentCommentId) {
            const parentComment = await Comment.findById(parentCommentId);
            if (!parentComment) {
                return res.status(404).json({ error: "Parent comment not found" });
            }
            // Increment reply count on parent
            await Comment.findByIdAndUpdate(parentCommentId, {
                $inc: { repliesCount: 1 },
            });
        }

        // Create comment
        const comment = new Comment({
            reelId,
            userId,
            text,
            parentCommentId: parentCommentId || null,
        });

        await comment.save();

        // Increment comment count on reel
        await Reel.findByIdAndUpdate(reelId, {
            $inc: { "engagement.comments": 1 },
        });

        // Populate user info before sending response
        await comment.populate("userId", "username profile.avatarUrl");

        res.status(201).json({
            success: true,
            message: "Comment created successfully",
            data: comment,
        });
        console.log(`POST /reels/${reelId}/comments - Comment created: ${comment._id}`);
    } catch (error) {
        console.error("POST /reels/:reelId/comments - Error:", error);
        res.status(500).json({ error: "Failed to create comment" });
    }
};

// DELETE /reels/:reelId/comments/:commentId - Delete a comment (and all replies)
export const deleteComment = async (req, res) => {
    try {
        const { reelId, commentId } = req.params;
        const userId = req.user.userId;

        // Find the comment
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ error: "Comment not found" });
        }

        // Check if user owns the comment
        if (comment.userId.toString() !== userId) {
            return res.status(403).json({ error: "You can only delete your own comments" });
        }

        // Recursive function to delete comment and all its replies
        const deleteCommentAndReplies = async (parentId) => {
            // Find all direct replies
            const replies = await Comment.find({ parentCommentId: parentId });

            // Recursively delete each reply's children first
            for (const reply of replies) {
                await deleteCommentAndReplies(reply._id);
            }

            // Delete all direct replies
            const deletedReplies = await Comment.deleteMany({ parentCommentId: parentId });

            return deletedReplies.deletedCount;
        };

        // Count total comments to be deleted (for updating reel engagement)
        const countReplies = async (parentId) => {
            const replies = await Comment.find({ parentCommentId: parentId });
            let count = replies.length;
            for (const reply of replies) {
                count += await countReplies(reply._id);
            }
            return count;
        };

        const repliesCount = await countReplies(commentId);
        const totalDeleted = repliesCount + 1; // +1 for the parent comment itself

        // Delete all replies recursively
        await deleteCommentAndReplies(commentId);

        // Delete the parent comment itself
        await Comment.findByIdAndDelete(commentId);

        // Decrement comment count on reel
        await Reel.findByIdAndUpdate(comment.reelId, {
            $inc: { "engagement.comments": -totalDeleted },
        });

        // If this was a reply, decrement parent's reply count
        if (comment.parentCommentId) {
            await Comment.findByIdAndUpdate(comment.parentCommentId, {
                $inc: { repliesCount: -1 },
            });
        }

        res.json({
            success: true,
            message: `Comment and ${repliesCount} replies deleted successfully`,
            deletedCount: totalDeleted,
        });
        console.log(`DELETE /reels/${reelId}/comments/${commentId} - Comment and ${repliesCount} replies deleted`);
    } catch (error) {
        console.error("DELETE /reels/:reelId/comments/:commentId - Error:", error);
        res.status(500).json({ error: "Failed to delete comment" });
    }
};

// GET /reels/:reelId/comments - Get all comments for a reel
export const getCommentsByReel = async (req, res) => {
    try {
        const { reelId } = req.params;

        const comments = await Comment.find({ reelId, isDeleted: false })
            .populate("userId", "username profile.avatarUrl")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: comments.length,
            comments: comments,
        });
        console.log(`GET /reels/${reelId}/comments - ${comments.length} comments fetched`);
    } catch (error) {
        console.error("GET /reels/:reelId/comments - Error:", error);
        res.status(500).json({ error: "Failed to fetch comments" });
    }
};
