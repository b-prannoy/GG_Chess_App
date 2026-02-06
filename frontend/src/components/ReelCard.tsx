import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    Animated,
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import type { Reel } from '../types';

const { width, height } = Dimensions.get('window');

interface ReelCardProps {
    reel: Reel;
    isActive: boolean;
    onLike: () => void;
    onComment: () => void;
    onView: () => void;
    isLiked?: boolean;
}

export const ReelCard: React.FC<ReelCardProps> = ({
    reel,
    isActive,
    onLike,
    onComment,
    onView,
    isLiked = false,
}) => {
    const videoRef = useRef<Video>(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const [hasRecordedView, setHasRecordedView] = useState(false);
    const likeScale = useRef(new Animated.Value(1)).current;

    const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
        if (status.isLoaded && status.positionMillis > 1000 && !hasRecordedView) {
            onView();
            setHasRecordedView(true);
        }
    };

    const handleVideoPress = () => {
        setIsPlaying(!isPlaying);
        if (isPlaying) {
            videoRef.current?.pauseAsync();
        } else {
            videoRef.current?.playAsync();
        }
    };

    const handleDoubleTap = () => {
        // Animate like button
        Animated.sequence([
            Animated.spring(likeScale, {
                toValue: 1.4,
                useNativeDriver: true,
            }),
            Animated.spring(likeScale, {
                toValue: 1,
                useNativeDriver: true,
            }),
        ]).start();
        onLike();
    };

    const formatCount = (count: number): string => {
        if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
        if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
        return count.toString();
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                activeOpacity={1}
                onPress={handleVideoPress}
                onLongPress={handleDoubleTap}
                delayLongPress={200}
                style={styles.videoContainer}
            >
                <Video
                    ref={videoRef}
                    source={{ uri: reel.video.url }}
                    style={styles.video}
                    resizeMode={ResizeMode.COVER}
                    shouldPlay={isActive && isPlaying}
                    isLooping
                    onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                />

                {/* Play/Pause Overlay */}
                {!isPlaying && (
                    <View style={styles.playOverlay}>
                        <Ionicons name="play" size={60} color="rgba(255,255,255,0.8)" />
                    </View>
                )}

                {/* Content Info */}
                <View style={styles.contentInfo}>
                    <Text style={styles.title} numberOfLines={2}>
                        {reel.content.title || 'Chess Highlight'}
                    </Text>
                    <Text style={styles.description} numberOfLines={2}>
                        {reel.content.description}
                    </Text>
                    {reel.content.tags && reel.content.tags.length > 0 && (
                        <View style={styles.tagsContainer}>
                            {reel.content.tags.slice(0, 3).map((tag, index) => (
                                <View key={index} style={styles.tag}>
                                    <Text style={styles.tagText}>#{tag}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                    {reel.gameId && (
                        <Text style={styles.gameName}>
                            ♟ {reel.gameId.displayName || `${reel.gameId.whitePlayer} vs ${reel.gameId.blackPlayer}`}
                        </Text>
                    )}
                </View>

                {/* Action Buttons */}
                <View style={styles.actionsContainer}>
                    <TouchableOpacity style={styles.actionButton} onPress={onLike}>
                        <Animated.View style={{ transform: [{ scale: likeScale }] }}>
                            <Ionicons
                                name={isLiked ? 'heart' : 'heart-outline'}
                                size={32}
                                color={isLiked ? '#EF4444' : '#FFFFFF'}
                            />
                        </Animated.View>
                        <Text style={styles.actionText}>{formatCount(reel.engagement.likes)}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton} onPress={onComment}>
                        <Ionicons name="chatbubble-outline" size={30} color="#FFFFFF" />
                        <Text style={styles.actionText}>{formatCount(reel.engagement.comments)}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="share-outline" size={30} color="#FFFFFF" />
                        <Text style={styles.actionText}>Share</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="bookmark-outline" size={30} color="#FFFFFF" />
                        <Text style={styles.actionText}>{formatCount(reel.engagement.saves)}</Text>
                    </TouchableOpacity>
                </View>

                {/* Difficulty Badge */}
                {reel.content.difficulty && (
                    <View style={[
                        styles.difficultyBadge,
                        reel.content.difficulty === 'beginner' && styles.beginnerBadge,
                        reel.content.difficulty === 'intermediate' && styles.intermediateBadge,
                        reel.content.difficulty === 'advanced' && styles.advancedBadge,
                    ]}>
                        <Text style={styles.difficultyText}>
                            {reel.content.difficulty.charAt(0).toUpperCase() + reel.content.difficulty.slice(1)}
                        </Text>
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width,
        height: height - 80, // Account for tab bar
        backgroundColor: '#000000',
    },
    videoContainer: {
        flex: 1,
    },
    video: {
        flex: 1,
    },
    playOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    contentInfo: {
        position: 'absolute',
        bottom: 20,
        left: 16,
        right: 80,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 6,
        textShadowColor: 'rgba(0,0,0,0.7)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    description: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 8,
        textShadowColor: 'rgba(0,0,0,0.7)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 8,
    },
    tag: {
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    tagText: {
        fontSize: 12,
        color: '#FFFFFF',
        fontWeight: '500',
    },
    gameName: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '500',
    },
    actionsContainer: {
        position: 'absolute',
        right: 12,
        bottom: 20,
        alignItems: 'center',
        gap: 20,
    },
    actionButton: {
        alignItems: 'center',
    },
    actionText: {
        fontSize: 12,
        color: '#FFFFFF',
        marginTop: 4,
        fontWeight: '500',
    },
    difficultyBadge: {
        position: 'absolute',
        top: 60,
        right: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    beginnerBadge: {
        backgroundColor: '#10B981',
    },
    intermediateBadge: {
        backgroundColor: '#F59E0B',
    },
    advancedBadge: {
        backgroundColor: '#EF4444',
    },
    difficultyText: {
        fontSize: 12,
        color: '#FFFFFF',
        fontWeight: '600',
    },
});
