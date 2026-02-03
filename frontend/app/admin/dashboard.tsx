import React, { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, Animated, TouchableOpacity, RefreshControl, TextInput, Alert, Platform, Modal } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Users, Film, Trash2, LogOut, Plus, Play, Edit2, X, Hash, Activity } from "lucide-react-native";
import * as Haptics from "expo-haptics";

import { colors } from "@/constants/themes";
import { GlassCard } from "@/components/ui/GlassCard";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { useAuthStore } from "@/stores/authStore";
import { apiClient } from "@/services/api";

// Types
interface Reel {
    _id: string;
    video: {
        url: string;
    };
    content: {
        title: string;
        description?: string;
        tags?: string[];
        difficulty?: "beginner" | "intermediate" | "advanced";
    };
    chessData?: {
        fen?: string;
        pgn?: string;
    };
    status: string;
}

const DIFFICULTY_LEVELS = ["beginner", "intermediate", "advanced"];
const BADGE_COLORS = {
    beginner: colors.success,
    intermediate: colors.warning,
    advanced: colors.danger
};

export default function AdminDashboard() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    // Auth Store Selectors (Performance Optimization)
    const logout = useAuthStore(state => state.logout);
    const isAdmin = useAuthStore(state => state.isAdmin);

    // State
    const [reels, setReels] = useState<Reel[]>([]);
    const [stats, setStats] = useState({ totalReels: 0, totalUsers: 0 });
    const [isLoading, setIsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<"create" | "manage">("manage");

    // Form State
    const [formData, setFormData] = useState({
        videoUrl: "",
        title: "",
        description: "",
        tags: "",
        difficulty: "beginner",
        fen: "",
        pgn: ""
    });

    // Edit Modal State
    const [editingReel, setEditingReel] = useState<Reel | null>(null);

    // Animations
    const fadeAnim = React.useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();

        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        if (activeTab === "create") return; // Don't fetch if creating

        try {
            const [statsRes, reelsRes] = await Promise.all([
                apiClient.get<any>("/admin/stats"),
                apiClient.get<any>("/admin/videos")
            ]);

            if (statsRes.data.success) {
                setStats(statsRes.data.stats);
            }
            if (reelsRes.data.success) {
                setReels(reelsRes.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        } finally {
            setRefreshing(false);
        }
    };

    const handleLogout = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace("/(auth)/login");
        // Delay clearing state slightly to ensure smooth transition
        // entirely purely for UX perception
        setTimeout(() => {
            logout();
        }, 50);
    };

    const handlePostReel = async () => {
        if (!formData.videoUrl || !formData.title) {
            Alert.alert("Missing Fields", "Please provide Video URL and Title.");
            return;
        }

        try {
            setIsLoading(true);
            const tagsArray = formData.tags.split(",").map(t => t.trim()).filter(Boolean);

            const payload = {
                adminId: "admin", // Middleware handles auth, this is just for log
                videoData: {
                    video: { url: formData.videoUrl },
                    content: {
                        title: formData.title,
                        description: formData.description,
                        tags: tagsArray,
                        difficulty: formData.difficulty
                    },
                    chessData: {
                        fen: formData.fen,
                        pgn: formData.pgn
                    },
                    status: "published"
                }
            };

            await apiClient.post("/admin/video", payload);

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert("Success", "Reel deployed successfully!");

            // Reset form
            setFormData({
                videoUrl: "",
                title: "",
                description: "",
                tags: "",
                difficulty: "beginner",
                fen: "",
                pgn: ""
            });

            setActiveTab("manage");
            fetchDashboardData();

        } catch (error) {
            Alert.alert("Error", "Failed to deploy reel.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteReel = (id: string) => {
        Alert.alert(
            "Delete Protocol",
            "Confirm deletion of neural data?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        // Optimistic Update
                        setReels(prev => prev.filter(r => r._id !== id));
                        setStats(prev => ({ ...prev, totalReels: prev.totalReels - 1 }));
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

                        try {
                            await apiClient.delete(`/admin/video/${id}`);
                        } catch (error) {
                            fetchDashboardData(); // Revert
                            Alert.alert("Error", "Deletion failed.");
                        }
                    }
                }
            ]
        );
    };

    const openEditModal = (reel: Reel) => {
        setEditingReel(reel);
        setFormData({
            videoUrl: reel.video.url,
            title: reel.content.title,
            description: reel.content.description || "",
            tags: reel.content.tags?.join(", ") || "",
            difficulty: reel.content.difficulty || "beginner",
            fen: reel.chessData?.fen || "",
            pgn: reel.chessData?.pgn || ""
        });
    };

    const handleUpdateReel = async () => {
        if (!editingReel) return;

        try {
            setIsLoading(true);
            const tagsArray = formData.tags.split(",").map(t => t.trim()).filter(Boolean);

            const payload = {
                updatedData: {
                    video: { url: formData.videoUrl },
                    content: {
                        title: formData.title,
                        description: formData.description,
                        tags: tagsArray,
                        difficulty: formData.difficulty
                    },
                    chessData: {
                        fen: formData.fen,
                        pgn: formData.pgn
                    },
                    status: editingReel.status
                }
            };

            await apiClient.put(`/admin/video/${editingReel._id}`, payload);

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setEditingReel(null);
            fetchDashboardData();

        } catch (error) {
            Alert.alert("Error", "Update failed.");
        } finally {
            setIsLoading(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchDashboardData();
    }, [activeTab]);

    return (
        <LinearGradient
            colors={[colors.background.primary, "#0f172a"]}
            style={{ flex: 1 }}
        >
            <View style={{ flex: 1, paddingTop: insets.top }}>
                {/* Custom Header */}
                <View style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingHorizontal: 20,
                    paddingBottom: 20,
                    paddingTop: 10
                }}>
                    <View>
                        <Text style={{ fontSize: 32, fontWeight: "900", color: colors.text.primary, letterSpacing: 1 }}>
                            ADMIN
                        </Text>
                        <Text style={{ fontSize: 12, color: colors.accent.cyan, letterSpacing: 2 }}>
                            DASHBOARD
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={handleLogout}
                        style={{
                            padding: 10,
                            backgroundColor: "rgba(239, 68, 68, 0.15)",
                            borderRadius: 12,
                            borderWidth: 1,
                            borderColor: "rgba(239, 68, 68, 0.3)"
                        }}
                    >
                        <LogOut size={20} color={colors.danger} />
                    </TouchableOpacity>
                </View>

                {/* Main Content */}
                <ScrollView
                    contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent.cyan} />
                    }
                >
                    <Animated.View style={{ opacity: fadeAnim }}>

                        {/* KPI Cards */}
                        <View style={{ flexDirection: "row", gap: 15, marginBottom: 30 }}>
                            <GlassCard variant="dark" style={{ flex: 1, alignItems: "center", padding: 20 }}>
                                <View style={{ padding: 10, backgroundColor: "rgba(6, 182, 212, 0.2)", borderRadius: 50, marginBottom: 10 }}>
                                    <Film size={24} color={colors.accent.cyan} />
                                </View>
                                <Text style={{ fontSize: 32, fontWeight: "800", color: colors.text.primary }}>
                                    {stats.totalReels}
                                </Text>
                                <Text style={{ fontSize: 12, color: colors.text.secondary }}>Total Reels</Text>
                            </GlassCard>

                            <GlassCard variant="dark" style={{ flex: 1, alignItems: "center", padding: 20 }}>
                                <View style={{ padding: 10, backgroundColor: "rgba(168, 85, 247, 0.2)", borderRadius: 50, marginBottom: 10 }}>
                                    <Users size={24} color={colors.accent.purple} />
                                </View>
                                <Text style={{ fontSize: 32, fontWeight: "800", color: colors.text.primary }}>
                                    {stats.totalUsers}
                                </Text>
                                <Text style={{ fontSize: 12, color: colors.text.secondary }}>Total Users</Text>
                            </GlassCard>
                        </View>

                        {/* Tabs */}
                        <View style={{ flexDirection: "row", marginBottom: 20, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 12, padding: 4 }}>
                            <TouchableOpacity
                                onPress={() => setActiveTab("manage")}
                                style={{
                                    flex: 1,
                                    padding: 12,
                                    alignItems: "center",
                                    backgroundColor: activeTab === "manage" ? "rgba(255,255,255,0.1)" : "transparent",
                                    borderRadius: 10
                                }}
                            >
                                <Text style={{ color: activeTab === "manage" ? "white" : colors.text.muted, fontWeight: "600" }}>Manage Content</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setActiveTab("create")}
                                style={{
                                    flex: 1,
                                    padding: 12,
                                    alignItems: "center",
                                    backgroundColor: activeTab === "create" ? colors.accent.purple : "transparent",
                                    borderRadius: 10
                                }}
                            >
                                <Text style={{ color: activeTab === "create" ? "white" : colors.text.muted, fontWeight: "600" }}>+ Create Reel</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Create / Edit Form */}
                        {activeTab === "create" && (
                            <GlassCard variant="light" style={{ padding: 20 }}>
                                <Text style={{ fontSize: 18, fontWeight: "700", color: colors.text.primary, marginBottom: 20 }}>
                                    New Reel Metadata
                                </Text>

                                <TextInput
                                    placeholder="Video Source URL"
                                    placeholderTextColor={colors.text.muted}
                                    value={formData.videoUrl}
                                    onChangeText={(t) => setFormData({ ...formData, videoUrl: t })}
                                    style={styles.input}
                                />

                                <TextInput
                                    placeholder="Title (e.g. Italian Game)"
                                    placeholderTextColor={colors.text.muted}
                                    value={formData.title}
                                    onChangeText={(t) => setFormData({ ...formData, title: t })}
                                    style={styles.input}
                                />

                                <TextInput
                                    placeholder="Description"
                                    placeholderTextColor={colors.text.muted}
                                    value={formData.description}
                                    onChangeText={(t) => setFormData({ ...formData, description: t })}
                                    multiline
                                    style={[styles.input, { height: 80 }]}
                                />

                                {/* Difficulty Selector */}
                                <Text style={{ color: colors.text.secondary, marginBottom: 10, fontSize: 12 }}>Difficulty Level</Text>
                                <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
                                    {DIFFICULTY_LEVELS.map((level) => (
                                        <TouchableOpacity
                                            key={level}
                                            onPress={() => setFormData({ ...formData, difficulty: level as any })}
                                            style={{
                                                paddingVertical: 8,
                                                paddingHorizontal: 16,
                                                borderRadius: 20,
                                                backgroundColor: formData.difficulty === level ? BADGE_COLORS[level as keyof typeof BADGE_COLORS] : "rgba(255,255,255,0.1)",
                                                borderWidth: 1,
                                                borderColor: formData.difficulty === level ? BADGE_COLORS[level as keyof typeof BADGE_COLORS] : "rgba(255,255,255,0.1)"
                                            }}
                                        >
                                            <Text style={{
                                                color: formData.difficulty === level ? "white" : colors.text.muted,
                                                textTransform: "capitalize",
                                                fontWeight: "600",
                                                fontSize: 12
                                            }}>
                                                {level}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 15 }}>
                                    <Hash size={16} color={colors.text.muted} style={{ marginRight: 10 }} />
                                    <TextInput
                                        placeholder="Tags (comma separated)"
                                        placeholderTextColor={colors.text.muted}
                                        value={formData.tags}
                                        onChangeText={(t) => setFormData({ ...formData, tags: t })}
                                        style={[styles.input, { flex: 1, marginBottom: 0 }]}
                                    />
                                </View>

                                <Text style={{ color: colors.accent.cyan, fontSize: 12, fontWeight: "bold", marginTop: 10, marginBottom: 10 }}>CHESS DATA</Text>

                                <TextInput
                                    placeholder="FEN String"
                                    placeholderTextColor={colors.text.muted}
                                    value={formData.fen}
                                    onChangeText={(t) => setFormData({ ...formData, fen: t })}
                                    style={styles.input}
                                />

                                <TextInput
                                    placeholder="PGN (Move Notation)"
                                    placeholderTextColor={colors.text.muted}
                                    value={formData.pgn}
                                    onChangeText={(t) => setFormData({ ...formData, pgn: t })}
                                    style={styles.input}
                                />

                                <AnimatedButton
                                    title="Deploy to Network"
                                    onPress={handlePostReel}
                                    loading={isLoading}
                                    icon={<Plus size={20} color="white" />}
                                />
                            </GlassCard>
                        )}

                        {/* List View */}
                        {activeTab === "manage" && (
                            <View style={{ gap: 15 }}>
                                {reels.map((reel) => (
                                    <GlassCard key={reel._id} variant="dark" style={{ flexDirection: "row", alignItems: "center", padding: 15 }}>
                                        <View style={{
                                            width: 60,
                                            height: 60,
                                            borderRadius: 8,
                                            backgroundColor: "rgba(255,255,255,0.05)",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            marginRight: 15,
                                            overflow: "hidden"
                                        }}>
                                            <Film size={24} color={colors.text.muted} />
                                        </View>

                                        <View style={{ flex: 1 }}>
                                            <Text style={{ color: colors.text.primary, fontWeight: "700", fontSize: 16 }} numberOfLines={1}>
                                                {reel.content.title}
                                            </Text>
                                            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4, gap: 8 }}>
                                                <View style={{
                                                    backgroundColor: BADGE_COLORS[reel.content.difficulty as keyof typeof BADGE_COLORS] || colors.text.muted,
                                                    paddingHorizontal: 6,
                                                    paddingVertical: 2,
                                                    borderRadius: 4
                                                }}>
                                                    <Text style={{ fontSize: 10, fontWeight: "bold", color: "white", textTransform: "uppercase" }}>
                                                        {reel.content.difficulty || "UNK"}
                                                    </Text>
                                                </View>
                                                <Text style={{ color: colors.text.muted, fontSize: 12 }}>
                                                    {reel.content.tags?.slice(0, 2).join(", ")}
                                                </Text>
                                            </View>
                                        </View>

                                        <View style={{ flexDirection: "row", gap: 10 }}>
                                            <TouchableOpacity
                                                onPress={() => openEditModal(reel)}
                                                style={{
                                                    padding: 8,
                                                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                                                    borderRadius: 8
                                                }}
                                            >
                                                <Edit2 size={18} color={colors.text.primary} />
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                onPress={() => handleDeleteReel(reel._id)}
                                                style={{
                                                    padding: 8,
                                                    backgroundColor: "rgba(239, 68, 68, 0.15)",
                                                    borderRadius: 8
                                                }}
                                            >
                                                <Trash2 size={18} color={colors.danger} />
                                            </TouchableOpacity>
                                        </View>
                                    </GlassCard>
                                ))}
                            </View>
                        )}

                    </Animated.View>
                </ScrollView>
            </View>

            {/* Edit Modal */}
            <Modal
                visible={!!editingReel}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setEditingReel(null)}
            >
                <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "flex-end" }}>
                    <View style={{ backgroundColor: colors.background.secondary, borderTopLeftRadius: 20, borderTopRightRadius: 20, height: "80%", padding: 20 }}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                            <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.text.primary }}>Edit Protocol</Text>
                            <TouchableOpacity onPress={() => setEditingReel(null)}>
                                <X size={24} color={colors.text.secondary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
                            {/* Reusing Form logic here for simplicity, typically separate component */}
                            <TextInput
                                placeholder="Title"
                                placeholderTextColor={colors.text.muted}
                                value={formData.title}
                                onChangeText={(t) => setFormData({ ...formData, title: t })}
                                style={styles.input}
                            />

                            <TextInput
                                placeholder="Description"
                                placeholderTextColor={colors.text.muted}
                                value={formData.description}
                                onChangeText={(t) => setFormData({ ...formData, description: t })}
                                multiline
                                style={[styles.input, { height: 80 }]}
                            />

                            <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
                                {DIFFICULTY_LEVELS.map((level) => (
                                    <TouchableOpacity
                                        key={level}
                                        onPress={() => setFormData({ ...formData, difficulty: level as any })}
                                        style={{
                                            paddingVertical: 8,
                                            paddingHorizontal: 16,
                                            borderRadius: 20,
                                            backgroundColor: formData.difficulty === level ? BADGE_COLORS[level as keyof typeof BADGE_COLORS] : "rgba(255,255,255,0.1)",
                                            borderWidth: 1,
                                            borderColor: formData.difficulty === level ? BADGE_COLORS[level as keyof typeof BADGE_COLORS] : "rgba(255,255,255,0.1)"
                                        }}
                                    >
                                        <Text style={{
                                            color: formData.difficulty === level ? "white" : colors.text.muted,
                                            textTransform: "capitalize",
                                            fontWeight: "600",
                                            fontSize: 12
                                        }}>
                                            {level}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <TextInput
                                placeholder="Tags"
                                placeholderTextColor={colors.text.muted}
                                value={formData.tags}
                                onChangeText={(t) => setFormData({ ...formData, tags: t })}
                                style={styles.input}
                            />

                            <TextInput
                                placeholder="FEN"
                                placeholderTextColor={colors.text.muted}
                                value={formData.fen}
                                onChangeText={(t) => setFormData({ ...formData, fen: t })}
                                style={styles.input}
                            />

                            <AnimatedButton
                                title="Save Changes"
                                onPress={handleUpdateReel}
                                loading={isLoading}
                            />
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </LinearGradient>
    );
}

const styles = {
    input: {
        backgroundColor: "rgba(0,0,0,0.3)",
        color: colors.text.primary,
        padding: 15,
        borderRadius: 12,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: colors.glass.medium,
        fontSize: 16
    }
};
