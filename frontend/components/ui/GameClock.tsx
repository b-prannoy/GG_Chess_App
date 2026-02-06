import React, { useEffect, useRef } from "react";
import { View, Text, Animated } from "react-native";
import { colors } from "@/constants/themes";

interface GameClockProps {
    timeRemaining: number; // in seconds
    isActive: boolean;
    isPlayerTurn: boolean;
}

export function GameClock({ timeRemaining, isActive, isPlayerTurn }: GameClockProps) {
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const isLowTime = timeRemaining < 30;

    useEffect(() => {
        if (isLowTime && isActive && isPlayerTurn) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.05,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            pulseAnim.setValue(1);
        }
    }, [isLowTime, isActive, isPlayerTurn]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <Animated.View
            style={{
                transform: [{ scale: pulseAnim }],
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8,
                backgroundColor: isPlayerTurn
                    ? isLowTime
                        ? colors.danger + "40"
                        : colors.accent.purple + "40"
                    : colors.glass.light,
            }}
        >
            <Text
                style={{
                    color: isLowTime ? colors.danger : colors.text.primary,
                    fontSize: 24,
                    fontWeight: "700",
                    fontVariant: ["tabular-nums"],
                }}
            >
                {formatTime(timeRemaining)}
            </Text>
        </Animated.View>
    );
}
