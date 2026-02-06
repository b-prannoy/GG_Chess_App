import React, { useRef, useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import { Video, ResizeMode, AVPlaybackStatus } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { Play, Pause, Clock, Volume2, VolumeX, Circle } from "lucide-react-native";
import { Reel } from "@/types/reel";
import { ReelActions } from "./ReelActions";
import { colors } from "@/constants/themes";
import { getDifficultyColor } from "@/services/reelApi";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";

// Difficulty mapping
const difficultyLabels: Record<string, string> = {
    beginner: "EASY",
    intermediate: "MEDIUM",
    advanced: "HARD",
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const VIEW_TRIGGER_DELAY = 2000; // 2 seconds before counting as a view

interface ReelCardProps {
    reel: Reel;
    isVisible: boolean;
    isLiked: boolean;
    isSaved: boolean;
    onLike: () => void;
    onSave: () => void;
    onComment: () => void;
    onShare: () => void;
    onView?: () => void; // Callback to record view
}

export function ReelCard({
    reel,
    isVisible,
    isLiked,
    isSaved,
    onLike,
    onSave,
    onComment,
    onShare,
    onView,
}: ReelCardProps) {
    const insets = useSafeAreaInsets();
    const bottomTabHeight = 60; // Approximate height of bottom tab bar
    const bottomPadding = insets.bottom + bottomTabHeight + 20; // Dynamic padding

    const videoRef = useRef<Video>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showControls, setShowControls] = useState(false);
    const [hasRecordedView, setHasRecordedView] = useState(false);
    const [hasVideoError, setHasVideoError] = useState(false);
    const viewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Check if video URL is valid (not empty or whitespace)
    const hasValidUrl = Boolean(reel.video?.url?.trim());

    // 2-second view trigger
    useEffect(() => {
        if (isVisible && !hasRecordedView && onView) {
            // Start timer when reel becomes visible
            viewTimerRef.current = setTimeout(() => {
                onView();
                setHasRecordedView(true);
            }, VIEW_TRIGGER_DELAY);
        } else {
            // Clear timer if reel becomes invisible before 2 seconds
            if (viewTimerRef.current) {
                clearTimeout(viewTimerRef.current);
                viewTimerRef.current = null;
            }
        }

        return () => {
            if (viewTimerRef.current) {
                clearTimeout(viewTimerRef.current);
            }
        };
    }, [isVisible, hasRecordedView, onView]);

    // Play/pause based on visibility
    useEffect(() => {
        const handleVisibility = async () => {
            if (!hasValidUrl || hasVideoError) return;

            try {
                if (isVisible) {
                    await videoRef.current?.playAsync();
                    setIsPlaying(true);
                } else {
                    await videoRef.current?.pauseAsync();
                    setIsPlaying(false);
                }
            } catch (error) {
                console.warn("Video playback error:", error);
            }
        };
        handleVisibility();
    }, [isVisible, hasValidUrl, hasVideoError]);

    // Stop video when navigating away from Reels tab
    useFocusEffect(
        useCallback(() => {
            const resumeVideo = async () => {
                if (isVisible && hasValidUrl && !hasVideoError) {
                    try {
                        await videoRef.current?.playAsync();
                        setIsPlaying(true);
                    } catch (error) {
                        console.warn("Video resume error:", error);
                    }
                }
            };
            resumeVideo();

            return () => {
                const stopVideo = async () => {
                    try {
                        await videoRef.current?.pauseAsync();
                        await videoRef.current?.stopAsync();
                        setIsPlaying(false);
                    } catch (error) {
                        // Ignore errors when stopping
                    }
                };
                stopVideo();
            };
        }, [isVisible, hasValidUrl, hasVideoError])
    );

    const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
        if (status.isLoaded) {
            setIsLoading(false);
            setIsPlaying(status.isPlaying);

            // Loop video when finished
            if (status.didJustFinish) {
                videoRef.current?.replayAsync();
            }
        }
    };

    const togglePlayPause = async () => {
        if (isPlaying) {
            await videoRef.current?.pauseAsync();
        } else {
            await videoRef.current?.playAsync();
        }
        setIsPlaying(!isPlaying);
    };

    const toggleMute = async () => {
        await videoRef.current?.setIsMutedAsync(!isMuted);
        setIsMuted(!isMuted);
    };

    const handleVideoPress = () => {
        setShowControls(true);
        setTimeout(() => setShowControls(false), 3000);
    };

    const formatDuration = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <View style={styles.container}>
            {/* Video Player */}
            <TouchableOpacity
                activeOpacity={1}
                onPress={handleVideoPress}
                style={StyleSheet.absoluteFill}
            >
                {hasValidUrl && !hasVideoError ? (
                    <Video
                        ref={videoRef}
                        source={{ uri: reel.video.url }}
                        posterSource={reel.video.thumbnail?.trim() ? { uri: reel.video.thumbnail } : undefined}
                        usePoster={!!reel.video.thumbnail?.trim()}
                        posterStyle={styles.poster}
                        style={styles.video}
                        resizeMode={ResizeMode.COVER}
                        isLooping
                        isMuted={isMuted}
                        shouldPlay={isVisible}
                        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                        onError={(error) => {
                            console.warn("Video failed to load:", reel.video?.url);
                            setHasVideoError(true);
                            setIsLoading(false);
                        }}
                    />
                ) : (
                    <View style={[styles.video, styles.errorContainer]}>
                        <Text style={styles.errorText}>
                            {hasVideoError ? "Video failed to load" : "Video unavailable"}
                        </Text>
                    </View>
                )}
            </TouchableOpacity>

            {/* Loading Indicator */}
            {isLoading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.accent.cyan} />
                </View>
            )}

            {/* Play/Pause Overlay (shown on tap) */}
            {showControls && (
                <TouchableOpacity
                    style={styles.playButton}
                    onPress={togglePlayPause}
                >
                    <View style={styles.playIconContainer}>
                        {isPlaying ? (
                            <Pause size={48} color={colors.text.primary} fill={colors.text.primary} />
                        ) : (
                            <Play size={48} color={colors.text.primary} fill={colors.text.primary} />
                        )}
                    </View>
                </TouchableOpacity>
            )}

            {/* Mute Button */}
            <TouchableOpacity style={styles.muteButton} onPress={toggleMute}>
                {isMuted ? (
                    <VolumeX size={20} color={colors.text.primary} />
                ) : (
                    <Volume2 size={20} color={colors.text.primary} />
                )}
            </TouchableOpacity>

            {/* Duration Badge */}
            <View style={styles.durationBadge}>
                <Clock size={12} color={colors.text.primary} />
                <Text style={styles.durationText}>
                    {formatDuration(reel.video.durationSec)}
                </Text>
            </View>

            {/* Top Gradient */}
            <LinearGradient
                colors={["rgba(0,0,0,0.6)", "transparent"]}
                style={styles.topGradient}
                pointerEvents="none"
            />

            {/* Bottom Gradient & Content */}
            <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.4)", "rgba(0,0,0,0.9)"]}
                style={[
                    styles.bottomGradient,
                    { paddingBottom: bottomPadding }
                ]}
                pointerEvents="box-none"
            >
                <View style={styles.contentContainer}>
                    {/* Difficulty Badge */}
                    <View
                        style={[
                            styles.difficultyBadge,
                            { backgroundColor: getDifficultyColor(reel.content.difficulty) + "CC" },
                        ]}
                    >
                        <Text style={styles.difficultyText}>
                            {difficultyLabels[reel.content.difficulty] || reel.content.difficulty.toUpperCase()}
                        </Text>
                    </View>

                    {/* Title */}
                    <Text style={styles.title} numberOfLines={2}>
                        {reel.content.title}
                    </Text>

                    {/* Description */}
                    {reel.content.description ? (
                        <Text style={styles.description} numberOfLines={3}>
                            {reel.content.description}
                        </Text>
                    ) : null}

                    {/* Hashtags */}
                    {reel.content.tags && reel.content.tags.length > 0 && (
                        <View style={styles.tagsContainer}>
                            {reel.content.tags.map((tag, index) => (
                                <Text key={index} style={styles.hashtag}>
                                    #{tag}
                                </Text>
                            ))}
                        </View>
                    )}

                    {/* Player Matchup */}
                    {(reel.content.whitePlayer || reel.content.blackPlayer) && (
                        <View style={styles.playerMatchup}>
                            <View style={styles.playerInfo}>
                                <Circle size={12} color="white" fill="white" />
                                <Text style={styles.playerName} numberOfLines={1}>
                                    {reel.content.whitePlayer || "White"}
                                </Text>
                            </View>
                            <Text style={styles.vsText}>vs</Text>
                            <View style={styles.playerInfo}>
                                <Circle size={12} color="black" fill="black" style={styles.blackPlayerIcon} />
                                <Text style={styles.playerName} numberOfLines={1}>
                                    {reel.content.blackPlayer || "Black"}
                                </Text>
                            </View>
                        </View>
                    )}
                </View>
            </LinearGradient>

            {/* Actions */}
            <ReelActions
                likes={reel.engagement?.likes || 0}
                comments={reel.engagement?.comments || 0}
                saves={reel.engagement?.saves || 0}
                isLiked={isLiked}
                isSaved={isSaved}
                onLike={onLike}
                onComment={onComment}
                onShare={onShare}
                onSave={onSave}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        backgroundColor: colors.background.primary,
    },
    video: {
        ...StyleSheet.absoluteFillObject,
        width: "100%",
        height: "100%",
    },
    poster: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    loadingContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.3)",
    },
    playButton: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: [{ translateX: -40 }, { translateY: -40 }],
    },
    playIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        paddingLeft: 4,
    },
    muteButton: {
        position: "absolute",
        top: 60,
        left: 16,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    durationBadge: {
        position: "absolute",
        top: 60,
        right: 16,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    durationText: {
        color: colors.text.primary,
        fontSize: 12,
        fontWeight: "600",
    },
    topGradient: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 120,
    },
    bottomGradient: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        paddingTop: 100,
        paddingBottom: 90, // Adjusted to sit above tab bar and actions
        paddingHorizontal: 16,
        justifyContent: "flex-end",
    },
    contentContainer: {
        width: "85%", // Leave room for right-side actions
    },
    difficultyBadge: {
        alignSelf: "flex-start",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        marginBottom: 8,
    },
    difficultyText: {
        color: colors.text.primary,
        fontSize: 11,
        fontWeight: "800",
        letterSpacing: 0.5,
        textShadowColor: "rgba(0,0,0,0.5)",
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    title: {
        color: colors.text.primary,
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 6,
        textShadowColor: "rgba(0,0,0,0.5)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    description: {
        color: colors.text.primary,
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 8,
        textShadowColor: "rgba(0,0,0,0.5)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
        opacity: 0.9,
    },
    tagsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 12,
    },
    hashtag: {
        color: colors.accent.cyan,
        fontSize: 14,
        fontWeight: "600",
        textShadowColor: "rgba(0,0,0,0.5)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    // Old tag styles removed in favor of simple text tags
    playerMatchup: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: "rgba(255,255,255,0.2)",
    },
    playerInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    playerName: {
        color: colors.text.primary,
        fontSize: 14,
        fontWeight: "600",
        maxWidth: 100,
        textShadowColor: "rgba(0,0,0,0.5)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    vsText: {
        color: colors.text.secondary,
        fontSize: 12,
        fontWeight: "700",
        marginHorizontal: 8,
        fontStyle: "italic",
    },
    blackPlayerIcon: {
        borderColor: "rgba(255,255,255,0.5)",
        borderWidth: 1,
        borderRadius: 6, // Make it look like a circle with border if size is 12
    },
    errorContainer: {
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background.secondary,
    },
    errorText: {
        color: colors.text.muted,
        fontSize: 14,
        textAlign: "center",
    },
});
