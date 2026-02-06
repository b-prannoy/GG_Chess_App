import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useAuthStore } from '../stores/authStore';

type RootStackParamList = {
    Login: undefined;
    Register: undefined;
    ProfileSetup: undefined;
    Main: undefined;
};

interface Props {
    navigation: NativeStackNavigationProp<RootStackParamList, 'ProfileSetup'>;
}

export const ProfileSetupScreen: React.FC<Props> = ({ navigation }) => {
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [chessRating, setChessRating] = useState('');

    const { setupProfile, isLoading, user } = useAuthStore();

    const handleSetup = async () => {
        const profileData: {
            name?: string;
            bio?: string;
            avatarUrl?: string;
            chessRating?: number;
        } = {};

        if (name.trim()) profileData.name = name.trim();
        if (bio.trim()) profileData.bio = bio.trim();
        if (avatarUrl.trim()) profileData.avatarUrl = avatarUrl.trim();
        if (chessRating && !isNaN(parseInt(chessRating))) {
            profileData.chessRating = parseInt(chessRating);
        }

        if (Object.keys(profileData).length > 0) {
            try {
                await setupProfile(profileData);
            } catch (err) {
                // Error handled in store
            }
        }
    };

    const handleSkip = () => {
        // Navigate to main app
    };

    const defaultAvatar = user?.username
        ? `https://ui-avatars.com/api/?name=${user.username}&background=6366F1&color=fff&size=200`
        : 'https://ui-avatars.com/api/?name=User&background=6366F1&color=fff&size=200';

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                            <Text style={styles.skipText}>Skip</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Avatar Section */}
                    <View style={styles.avatarSection}>
                        <View style={styles.avatarContainer}>
                            <Image
                                source={{ uri: avatarUrl || defaultAvatar }}
                                style={styles.avatar}
                            />
                            <TouchableOpacity style={styles.editAvatarButton}>
                                <Ionicons name="camera" size={18} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.title}>Set Up Your Profile</Text>
                        <Text style={styles.subtitle}>
                            Tell us about yourself so other chess enthusiasts can find you
                        </Text>
                    </View>

                    {/* Form Section */}
                    <View style={styles.formSection}>
                        <Input
                            label="Display Name"
                            placeholder="What should we call you?"
                            value={name}
                            onChangeText={setName}
                        />

                        <Input
                            label="Bio"
                            placeholder="Tell us about your chess journey..."
                            value={bio}
                            onChangeText={setBio}
                            multiline
                            numberOfLines={3}
                        />

                        <Input
                            label="Avatar URL (optional)"
                            placeholder="https://example.com/avatar.jpg"
                            value={avatarUrl}
                            onChangeText={setAvatarUrl}
                            autoCapitalize="none"
                        />

                        <View style={styles.ratingSection}>
                            <Text style={styles.ratingLabel}>Chess Rating</Text>
                            <View style={styles.ratingPresets}>
                                {['Beginner', '1000', '1500', '2000+'].map((preset, index) => (
                                    <TouchableOpacity
                                        key={preset}
                                        style={[
                                            styles.ratingPreset,
                                            chessRating === (index === 0 ? '800' : preset === '2000+' ? '2000' : preset) &&
                                            styles.ratingPresetActive,
                                        ]}
                                        onPress={() =>
                                            setChessRating(index === 0 ? '800' : preset === '2000+' ? '2000' : preset)
                                        }
                                    >
                                        <Text
                                            style={[
                                                styles.ratingPresetText,
                                                chessRating === (index === 0 ? '800' : preset === '2000+' ? '2000' : preset) &&
                                                styles.ratingPresetTextActive,
                                            ]}
                                        >
                                            {preset}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <Input
                                placeholder="Or enter your exact rating"
                                value={chessRating}
                                onChangeText={setChessRating}
                                keyboardType="numeric"
                            />
                        </View>

                        <Button
                            title="Complete Setup"
                            onPress={handleSetup}
                            loading={isLoading}
                            style={styles.completeButton}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D1117',
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'flex-end',
        paddingTop: 16,
    },
    skipButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    skipText: {
        fontSize: 16,
        color: '#6B7280',
        fontWeight: '500',
    },
    avatarSection: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 20,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#1F2937',
    },
    editAvatarButton: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#6366F1',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#0D1117',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: '#9CA3AF',
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 20,
    },
    formSection: {
        flex: 1,
        paddingTop: 16,
    },
    ratingSection: {
        marginBottom: 16,
    },
    ratingLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#E5E7EB',
        marginBottom: 12,
    },
    ratingPresets: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 12,
    },
    ratingPreset: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: '#1F2937',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#374151',
    },
    ratingPresetActive: {
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: '#6366F1',
    },
    ratingPresetText: {
        fontSize: 13,
        color: '#9CA3AF',
        fontWeight: '500',
    },
    ratingPresetTextActive: {
        color: '#6366F1',
    },
    completeButton: {
        marginTop: 16,
    },
});
