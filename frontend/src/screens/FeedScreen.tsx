import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    Dimensions,
    ActivityIndicator,
    Text,
    RefreshControl,
    Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { reelsApi } from '../api/client';
import { useAuthStore } from '../stores/authStore';
import { ReelCard } from '../components/ReelCard';
import { CommentsList } from '../components/CommentsList';
import type { Reel } from '../types';

const { height } = Dimensions.get('window');
const ITEM_HEIGHT = height - 80;

export const FeedScreen: React.FC = () => {
    const [reels, setReels] = useState<Reel[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const [likedReels, setLikedReels] = useState<Set<string>>(new Set());
    const [showComments, setShowComments] = useState(false);
    const [selectedReelId, setSelectedReelId] = useState<string | null>(null);

    const { isAuthenticated } = useAuthStore();
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        loadReels();
    }, []);

    const loadReels = async (pageNum = 1, refresh = false) => {
        try {
            if (refresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const response = await reelsApi.getFeed(pageNum, 10);

            if (refresh || pageNum === 1) {
                setReels(response.data);
            } else {
                setReels((prev) => [...prev, ...response.data]);
            }

            setHasMore(response.pagination.hasMore);
            setPage(pageNum);
        } catch (error) {
            console.error('Failed to load reels:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        loadReels(1, true);
    };

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            loadReels(page + 1);
        }
    };

    const handleViewableItemsChanged = useCallback(
        ({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
            if (viewableItems.length > 0 && viewableItems[0].index !== null) {
                setActiveIndex(viewableItems[0].index);
            }
        },
        []
    );

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50,
    }).current;

    const handleLike = async (reelId: string) => {
        if (!isAuthenticated) return;

        try {
            if (likedReels.has(reelId)) {
                await reelsApi.unlikeReel(reelId);
                setLikedReels((prev) => {
                    const newSet = new Set(prev);
                    newSet.delete(reelId);
                    return newSet;
                });
                setReels((prev) =>
                    prev.map((reel) =>
                        reel._id === reelId
                            ? { ...reel, engagement: { ...reel.engagement, likes: reel.engagement.likes - 1 } }
                            : reel
                    )
                );
            } else {
                await reelsApi.likeReel(reelId);
                setLikedReels((prev) => new Set(prev).add(reelId));
                setReels((prev) =>
                    prev.map((reel) =>
                        reel._id === reelId
                            ? { ...reel, engagement: { ...reel.engagement, likes: reel.engagement.likes + 1 } }
                            : reel
                    )
                );
            }
        } catch (error) {
            console.error('Failed to like/unlike reel:', error);
        }
    };

    const handleView = async (reelId: string) => {
        try {
            await reelsApi.viewReel(reelId);
        } catch (error) {
            console.error('Failed to record view:', error);
        }
    };

    const handleComment = (reelId: string) => {
        setSelectedReelId(reelId);
        setShowComments(true);
    };

    const renderReel = ({ item, index }: { item: Reel; index: number }) => (
        <ReelCard
            reel={item}
            isActive={index === activeIndex}
            onLike={() => handleLike(item._id)}
            onComment={() => handleComment(item._id)}
            onView={() => handleView(item._id)}
            isLiked={likedReels.has(item._id)}
        />
    );

    const renderFooter = () => {
        if (!hasMore) return null;
        return (
            <View style={styles.footer}>
                <ActivityIndicator size="small" color="#6366F1" />
            </View>
        );
    };

    if (loading && reels.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6366F1" />
                <Text style={styles.loadingText}>Loading chess reels...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            <FlatList
                ref={flatListRef}
                data={reels}
                renderItem={renderReel}
                keyExtractor={(item) => item._id}
                pagingEnabled
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                snapToAlignment="start"
                decelerationRate="fast"
                onViewableItemsChanged={handleViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={renderFooter}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor="#6366F1"
                    />
                }
                getItemLayout={(_, index) => ({
                    length: ITEM_HEIGHT,
                    offset: ITEM_HEIGHT * index,
                    index,
                })}
            />

            {/* Comments Modal */}
            <Modal
                visible={showComments}
                animationType="slide"
                transparent
                onRequestClose={() => setShowComments(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.commentsModal}>
                        {selectedReelId && (
                            <CommentsList
                                reelId={selectedReelId}
                                onClose={() => setShowComments(false)}
                            />
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0D1117',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#9CA3AF',
    },
    footer: {
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    commentsModal: {
        height: '70%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: 'hidden',
    },
});
