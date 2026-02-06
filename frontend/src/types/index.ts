// User types
export interface UserProfile {
  name: string | null;
  avatarUrl: string | null;
  bio: string | null;
  chessRating: number;
}

export interface UserStats {
  reelsWatched: number;
  puzzlesSolved: number;
  followers: number;
  following: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  profile?: UserProfile;
  stats?: UserStats;
}

// Reel types
export interface ReelVideo {
  url: string;
  thumbnail?: string;
  durationSec?: number;
}

export interface ReelContent {
  title?: string;
  description?: string;
  tags?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export interface ReelEngagement {
  likes: number;
  comments: number;
  views: number;
  saves: number;
}

export interface ChessGame {
  _id: string;
  whitePlayer: string;
  blackPlayer: string;
  displayName?: string;
  event?: string;
  year?: number;
  result?: string;
}

export interface Reel {
  _id: string;
  video: ReelVideo;
  content: ReelContent;
  gameId?: ChessGame;
  engagement: ReelEngagement;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
}

// Comment types
export interface CommentUser {
  _id: string;
  username: string;
  profile: {
    avatarUrl?: string;
  };
}

export interface Comment {
  _id: string;
  reelId: string;
  userId: CommentUser;
  parentCommentId?: string;
  text: string;
  likes: number;
  repliesCount: number;
  isDeleted: boolean;
  createdAt: string;
}

// API Response types
export interface AuthResponse {
  message: string;
  token: string;
  isAdmin?: boolean;
  user: User;
}

export interface FeedResponse {
  success: boolean;
  data: Reel[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalReels: number;
    hasMore: boolean;
  };
}

export interface CommentsResponse {
  success: boolean;
  count: number;
  data: Comment[];
}
