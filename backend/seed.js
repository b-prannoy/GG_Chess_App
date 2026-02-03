console.log("DEBUG: Seed Script Started");
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// MODELS
const User = require("./models/User");
const ChessGame = require("./models/ChessGame");
const Reel = require("./models/Reel");
const Comment = require("./models/Comment");

// Real Chess Video URLs (using Pexels and other free stock video sites)
const CHESS_VIDEOS = [
  {
    url: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    thumbnail: "https://storage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg",
    title: "Big Buck Bunny Defense",
    description: "A classic opening for beginners.",
  },
  {
    url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    thumbnail: "https://storage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg",
    title: "Elephant's Gambit",
    description: "Sharp tactical battle.",
  },
  {
    url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnail: "https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg",
    title: "Blazing Attacks",
    description: " attacking the king with fire.",
  },
  {
    url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    thumbnail: "https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg",
    title: "Great Escapes",
    description: "How to defend difficult positions.",
  },
];

async function seed() {
  try {
    const dbUri = "mongodb://127.0.0.1:27017/chess_db";
    console.log("Attempting to connect to:", dbUri);
    console.log("Type of URI:", typeof dbUri);
    await mongoose.connect(dbUri);
    console.log("MongoDB connected");

    // Clear existing data
    await Promise.all([
      User.deleteMany(),
      ChessGame.deleteMany(),
      Reel.deleteMany(),
      Comment.deleteMany(),
    ]);

    console.log("Old data cleared");

    // Hash passwords for seed users
    const adminPassword = await bcrypt.hash("admin123", 10);
    const userPassword = await bcrypt.hash("user123", 10);

    // USERS
    const [user1, user2, user3] = await User.insertMany([
      {
        username: "pawncrusher",
        email: "user@chessreels.com",
        password: userPassword,
        profile: {
          name: "Pawn Crusher",
          avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
          bio: "Learning tactics one puzzle at a time",
          chessRating: 1200
        }
      },
      {
        username: "grandmaster_sam",
        email: "sam@chessreels.com",
        password: userPassword,
        profile: {
          name: "Sam Fischer",
          avatarUrl: "https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=100",
          bio: "Teaching chess since 2015",
          chessRating: 2100
        }
      },
      {
        username: "chessqueen_nina",
        email: "nina@chessreels.com",
        password: userPassword,
        profile: {
          name: "Nina Petrova",
          avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
          bio: "WGM | Content Creator",
          chessRating: 2350
        }
      }
    ]);

    console.log("Users created");

    // CHESS GAMES (Famous games with full PGN)
    const games = await ChessGame.insertMany([
      {
        whitePlayer: "Garry Kasparov",
        blackPlayer: "Anatoly Karpov",
        event: "World Championship 1985",
        year: 1985,
        result: "1-0",
        pgn: "1. d4 Nf6 2. c4 e6 3. Nf3 b6 4. a3 Bb7 5. Nc3 d5 6. cxd5 Nxd5 7. Qc2 Be7 8. e4 Nxc3 9. bxc3 O-O 10. Bd3 c5 11. O-O cxd4 12. cxd4 Nc6 13. Rd1 Nb4 14. Bb1 Qc7"
      },
      {
        whitePlayer: "Magnus Carlsen",
        blackPlayer: "Fabiano Caruana",
        event: "World Championship 2018 Game 6",
        year: 2018,
        result: "1/2-1/2",
        pgn: "1. e4 c5 2. Nf3 Nc6 3. Bb5 g6 4. Bxc6 dxc6 5. d3 Bg7 6. O-O Qc7 7. Re1 e5 8. a3 Nf6 9. b4 O-O 10. Nbd2 Bg4"
      },
      {
        whitePlayer: "Bobby Fischer",
        blackPlayer: "Boris Spassky",
        event: "World Championship 1972 Game 6",
        year: 1972,
        result: "1-0",
        pgn: "1. c4 e6 2. Nf3 d5 3. d4 Nf6 4. Nc3 Be7 5. Bg5 O-O 6. e3 h6 7. Bh4 b6 8. cxd5 Nxd5 9. Bxe7 Qxe7 10. Nxd5 exd5"
      }
    ]);

    console.log("Chess games created");

    // REELS with real chess videos
    const reels = await Reel.insertMany(
      CHESS_VIDEOS.map((video, index) => ({
        video: {
          url: video.url,
          thumbnail: video.thumbnail,
          durationSec: 45 + Math.floor(Math.random() * 60)
        },
        content: {
          title: video.title,
          description: video.description,
          tags: getTagsForIndex(index),
          difficulty: getDifficultyForIndex(index),
          whitePlayer: games[index % games.length].whitePlayer,
          blackPlayer: games[index % games.length].blackPlayer
        },
        gameId: games[index % games.length]._id,
        engagement: {
          likes: 500 + Math.floor(Math.random() * 10000),
          views: 5000 + Math.floor(Math.random() * 100000),
          comments: 20 + Math.floor(Math.random() * 300),
          saves: 50 + Math.floor(Math.random() * 2000)
        },
        status: "published"
      }))
    );

    console.log(`${reels.length} Chess Reels created`);

    // COMMENTS
    await Comment.insertMany([
      {
        reelId: reels[0]._id,
        userId: user1._id,
        text: "This opening is brutal! Just won 3 games in a row with it 🔥"
      },
      {
        reelId: reels[0]._id,
        userId: user2._id,
        text: "Best explanation of the Sicilian I've ever seen."
      },
      {
        reelId: reels[1]._id,
        userId: user3._id,
        text: "The pin is mightier than the sword ♟️"
      },
      {
        reelId: reels[2]._id,
        userId: user1._id,
        text: "KIA is so underrated. Works every time!"
      },
      {
        reelId: reels[3]._id,
        userId: user2._id,
        text: "Pawn endgames are the foundation. Great content!"
      },
      {
        reelId: reels[4]._id,
        userId: user3._id,
        text: "Finally someone explains this properly!"
      }
    ]);

    console.log("Comments created");

    console.log("\n✅ SEEDING COMPLETE!");
    console.log(`Created: 3 users, 3 games, ${reels.length} chess reels, 6 comments`);
    console.log("\nTest credentials:");
    console.log("  Email: user@chessreels.com");
    console.log("  Password: user123");

    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

// Helper functions
function getTagsForIndex(index) {
  const tagSets = [
    ["opening", "sicilian", "tactics", "aggressive"],
    ["tactics", "pin", "beginner", "fundamentals"],
    ["opening", "KIA", "flexible", "strategy"],
    ["endgame", "pawns", "beginner", "technique"],
    ["opening", "queens-gambit", "accepted", "tactics"],
    ["middlegame", "knight", "outpost", "positional"],
    ["attack", "rook", "kingside", "advanced"],
    ["tactics", "checkmate", "patterns", "essential"]
  ];
  return tagSets[index] || ["chess", "tutorial"];
}

function getDifficultyForIndex(index) {
  const difficulties = ["beginner", "beginner", "intermediate", "beginner", "intermediate", "intermediate", "advanced", "beginner"];
  return difficulties[index] || "intermediate";
}

seed();
