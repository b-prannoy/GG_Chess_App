import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/Button';

interface MenuItem {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    onPress: () => void;
    color?: string;
}

export const ProfileScreen: React.FC = () => {
    const { user, isAuthenticated, logout, isLoading } = useAuthStore();

    const handleLogout = async () => {
        await logout();
    };

    const menuItems: MenuItem[] = [
        { icon: 'person-outline', label: 'Edit Profile', onPress: () => { } },
        { icon: 'bookmark-outline', label: 'Saved Reels', onPress: () => { } },
        { icon: 'stats-chart-outline', label: 'My Statistics', onPress: () => { } },
        { icon: 'settings-outline', label: 'Settings', onPress: () => { } },
        { icon: 'help-circle-outline', label: 'Help & Support', onPress: () => { } },
        { icon: 'information-circle-outline', label: 'About', onPress: () => { } },
    ];

    if (!isAuthenticated) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.guestContainer}>
                    <View style={styles.guestIconContainer}>
                        <Ionicons name="person-circle-outline" size={80} color="#4B5563" />
                    </View>
                    <Text style={styles.guestTitle}>Sign in to unlock more</Text>
                    <Text style={styles.guestSubtitle}>
                        Like and comment on reels, save your favorites, and track your progress
                    </Text>
                    <Button title="Sign In" onPress={() => { }} style={styles.signInButton} />
                    <TouchableOpacity>
                        <Text style={styles.createAccountText}>
                            Don't have an account? <Text style={styles.link}>Create one</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const defaultAvatar = user?.username
        ? `https://ui-avatars.com/api/?name=${user.username}&background=6366F1&color=fff&size=200`
        : 'https://ui-avatars.com/api/?name=User&background=6366F1&color=fff&size=200';

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Profile</Text>
                    <TouchableOpacity style={styles.settingsButton}>
                        <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <Image
                        source={{ uri: user?.profile?.avatarUrl || defaultAvatar }}
                        style={styles.avatar}
                    />
                    <Text style={styles.username}>@{user?.username}</Text>
                    <Text style={styles.name}>{user?.profile?.name || 'Chess Enthusiast'}</Text>
                    {user?.profile?.bio && (
                        <Text style={styles.bio}>{user.profile.bio}</Text>
                    )}

                    {/* Stats Row */}
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{user?.stats?.reelsWatched || 0}</Text>
                            <Text style={styles.statLabel}>Watched</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{user?.stats?.puzzlesSolved || 0}</Text>
                            <Text style={styles.statLabel}>Puzzles</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{user?.profile?.chessRating || 800}</Text>
                            <Text style={styles.statLabel}>Rating</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.editProfileButton}>
                        <Ionicons name="pencil" size={16} color="#6366F1" />
                        <Text style={styles.editProfileText}>Edit Profile</Text>
                    </TouchableOpacity>
                </View>

                {/* Menu Items */}
                <View style={styles.menuSection}>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.menuItem}
                            onPress={item.onPress}
                        >
                            <View style={styles.menuItemLeft}>
                                <View style={styles.menuIconContainer}>
                                    <Ionicons name={item.icon} size={22} color="#6366F1" />
                                </View>
                                <Text style={styles.menuItemLabel}>{item.label}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={22} color="#EF4444" />
                    <Text style={styles.logoutText}>
                        {isLoading ? 'Logging out...' : 'Log Out'}
                    </Text>
                </TouchableOpacity>

                <Text style={styles.version}>Version 1.0.0</Text>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D1117',
    },
    guestContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    guestIconContainer: {
        marginBottom: 24,
    },
    guestTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 12,
    },
    guestSubtitle: {
        fontSize: 15,
        color: '#9CA3AF',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
    },
    signInButton: {
        width: '100%',
        marginBottom: 16,
    },
    createAccountText: {
        fontSize: 14,
        color: '#9CA3AF',
    },
    link: {
        color: '#6366F1',
        fontWeight: '600',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 12,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    settingsButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#1F2937',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileCard: {
        backgroundColor: '#1F2937',
        marginHorizontal: 20,
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        marginBottom: 24,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 16,
        backgroundColor: '#374151',
    },
    username: {
        fontSize: 14,
        color: '#6366F1',
        fontWeight: '500',
        marginBottom: 4,
    },
    name: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    bio: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 20,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        marginBottom: 20,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 22,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: '#374151',
    },
    editProfileButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        backgroundColor: 'rgba(99, 102, 241, 0.15)',
    },
    editProfileText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6366F1',
    },
    menuSection: {
        marginHorizontal: 20,
        backgroundColor: '#1F2937',
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 24,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#374151',
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    menuIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: 'rgba(99, 102, 241, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuItemLabel: {
        fontSize: 15,
        color: '#FFFFFF',
        fontWeight: '500',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderRadius: 14,
        marginBottom: 16,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#EF4444',
    },
    version: {
        textAlign: 'center',
        fontSize: 12,
        color: '#4B5563',
        marginBottom: 40,
    },
});
