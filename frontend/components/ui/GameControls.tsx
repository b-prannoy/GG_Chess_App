import React from "react";
import { View, TouchableOpacity, Alert } from "react-native";
import { GlassCard } from "./GlassCard";
import { AnimatedButton } from "./AnimatedButton";
import { useGameStore } from "@/stores/gameStore";
import { useHaptics } from "@/hooks/useHaptics";
import {
    Flag,
    Handshake,
    RotateCcw,
    Settings,
    ChevronLeft,
    ChevronRight,
} from "lucide-react-native";
import { colors } from "@/constants/themes";

interface GameControlsProps {
    onResign?: () => void;
    onOfferDraw?: () => void;
    onSettings?: () => void;
    onBack?: () => void;
    showNavigationControls?: boolean;
}

export function GameControls({
    onResign,
    onOfferDraw,
    onSettings,
    onBack,
    showNavigationControls = false,
}: GameControlsProps) {
    const { status, moves, flipBoard, resetGame } = useGameStore();
    const haptics = useHaptics();

    const handleResign = () => {
        haptics.onButtonPress();
        Alert.alert("Resign", "Are you sure you want to resign?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Resign",
                style: "destructive",
                onPress: onResign,
            },
        ]);
    };

    const handleOfferDraw = () => {
        haptics.onButtonPress();
        Alert.alert("Offer Draw", "Are you sure you want to offer a draw?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Offer",
                onPress: onOfferDraw,
            },
        ]);
    };

    const handleFlipBoard = () => {
        haptics.onButtonPress();
        flipBoard();
    };

    const handleNewGame = () => {
        haptics.onButtonPress();
        Alert.alert("New Game", "Start a new game?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "New Game",
                onPress: resetGame,
            },
        ]);
    };

    const isGameOver =
        status === "checkmate" ||
        status === "stalemate" ||
        status === "draw" ||
        status === "resigned" ||
        status === "timeout";

    return (
        <GlassCard
            variant="light"
            style={{
                flexDirection: "row",
                justifyContent: "space-around",
                alignItems: "center",
                marginTop: 12,
            }}
        >
            {/* Back Button */}
            {onBack && (
                <TouchableOpacity
                    onPress={() => {
                        haptics.onButtonPress();
                        onBack();
                    }}
                    style={{
                        padding: 10,
                        borderRadius: 8,
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                    }}
                >
                    <ChevronLeft size={24} color={colors.text.secondary} />
                </TouchableOpacity>
            )}

            {/* Resign */}
            {!isGameOver && (
                <TouchableOpacity
                    onPress={handleResign}
                    style={{
                        padding: 10,
                        borderRadius: 8,
                        backgroundColor: "rgba(239, 68, 68, 0.1)",
                    }}
                >
                    <Flag size={24} color={colors.danger} />
                </TouchableOpacity>
            )}

            {/* Draw */}
            {!isGameOver && (
                <TouchableOpacity
                    onPress={handleOfferDraw}
                    style={{
                        padding: 10,
                        borderRadius: 8,
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                    }}
                >
                    <Handshake size={24} color={colors.text.secondary} />
                </TouchableOpacity>
            )}

            {/* Flip Board */}
            <TouchableOpacity
                onPress={handleFlipBoard}
                style={{
                    padding: 10,
                    borderRadius: 8,
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                }}
            >
                <RotateCcw size={24} color={colors.text.secondary} />
            </TouchableOpacity>

            {/* Move Navigation (for review mode) */}
            {showNavigationControls && (
                <>
                    <TouchableOpacity
                        onPress={() => {
                            haptics.onButtonPress();
                            // Go to previous move
                        }}
                        style={{
                            padding: 10,
                            borderRadius: 8,
                            backgroundColor: "rgba(255, 255, 255, 0.05)",
                        }}
                    >
                        <ChevronLeft size={24} color={colors.text.secondary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            haptics.onButtonPress();
                            // Go to next move
                        }}
                        style={{
                            padding: 10,
                            borderRadius: 8,
                            backgroundColor: "rgba(255, 255, 255, 0.05)",
                        }}
                    >
                        <ChevronRight size={24} color={colors.text.secondary} />
                    </TouchableOpacity>
                </>
            )}

            {/* Settings */}
            {onSettings && (
                <TouchableOpacity
                    onPress={() => {
                        haptics.onButtonPress();
                        onSettings();
                    }}
                    style={{
                        padding: 10,
                        borderRadius: 8,
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                    }}
                >
                    <Settings size={24} color={colors.text.secondary} />
                </TouchableOpacity>
            )}

            {/* New Game (when game is over) */}
            {isGameOver && (
                <AnimatedButton title="New Game" size="sm" onPress={handleNewGame} />
            )}
        </GlassCard>
    );
}
