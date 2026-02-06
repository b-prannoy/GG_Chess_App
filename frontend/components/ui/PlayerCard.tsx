import React, { useMemo } from "react";
import { View, Text, Image } from "react-native";
import { GlassCard } from "./GlassCard";
import { GameClock } from "./GameClock";
import { colors } from "@/constants/themes";
import { Crown } from "lucide-react-native";

interface PlayerCardProps {
    name: string;
    rating: number;
    timeRemaining: number; // in milliseconds
    isActive: boolean;
    capturedPieces?: string[];
    isTop?: boolean;
    avatarUrl?: string; // Optional avatar URL
    color?: "w" | "b"; // Optional color context
}

export function PlayerCard({
    name,
    rating,
    timeRemaining = 0,
    isActive,
    capturedPieces = [],
    isTop,
    avatarUrl,
    color,
}: PlayerCardProps) {
    const isLowTime = timeRemaining < 30000;
    const timeInSeconds = Math.max(0, Math.floor(timeRemaining / 1000));

    // Get piece display values
    const getPieceEmoji = (piece: string) => {
        const pieceMap: Record<string, string> = {
            p: "♟",
            n: "♞",
            b: "♝",
            r: "♜",
            q: "♛",
        };
        return pieceMap[piece] || "";
    };

    // Calculate material advantage
    const pieceValues: Record<string, number> = {
        p: 1,
        n: 3,
        b: 3,
        r: 5,
        q: 9,
    };

    const materialValue = useMemo(() => {
        return capturedPieces.reduce(
            (sum, piece) => sum + (pieceValues[piece] || 0),
            0
        );
    }, [capturedPieces]);

    return (
        <GlassCard
            variant={isActive ? "medium" : "light"}
            gradient={isActive}
            gradientColors={
                isActive
                    ? ["rgba(0, 217, 255, 0.15)", "rgba(123, 47, 247, 0.1)"]
                    : undefined
            }
            style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginVertical: 4,
            }}
        >
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                {/* Avatar */}
                <View
                    style={{
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        backgroundColor: color === "w" ? "#F0D9B5" : "#B58863",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 12,
                        borderWidth: isActive ? 2 : 0,
                        borderColor: colors.accent.cyan,
                    }}
                >
                    {avatarUrl ? (
                        <Image
                            source={{ uri: avatarUrl }}
                            style={{ width: 40, height: 40, borderRadius: 20 }}
                        />
                    ) : (
                        <Text style={{ fontSize: 20, fontWeight: "bold" }}>
                            {name ? name.charAt(0).toUpperCase() : "?"}
                        </Text>
                    )}
                </View>

                {/* Player Info */}
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Text
                            style={{
                                color: colors.text.primary,
                                fontSize: 16,
                                fontWeight: "600",
                            }}
                            numberOfLines={1}
                        >
                            {name || "Unknown"}
                        </Text>
                        {isActive && (
                            <Crown
                                size={14}
                                color={colors.accent.cyan}
                                style={{ marginLeft: 6 }}
                            />
                        )}
                    </View>
                    <Text
                        style={{
                            color: colors.text.secondary,
                            fontSize: 12,
                            marginTop: 2,
                        }}
                    >
                        Rating: {rating}
                    </Text>
                </View>
            </View>

            {/* Captured Pieces */}
            {capturedPieces.length > 0 && (
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginRight: 12,
                        flexWrap: "wrap",
                        maxWidth: 80,
                    }}
                >
                    <Text style={{ color: colors.text.secondary, fontSize: 12 }}>
                        {capturedPieces.map(getPieceEmoji).join("")}
                        {materialValue > 0 && (
                            <Text style={{ color: colors.success }}> +{materialValue}</Text>
                        )}
                    </Text>
                </View>
            )}

            {/* Clock */}
            <GameClock
                timeRemaining={timeInSeconds}
                isActive={isActive}
                isPlayerTurn={isActive}
            />
        </GlassCard>
    );
}
