import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Upload, X, Check } from "lucide-react-native";
import { colors } from "@/constants/themes";
import { useRouter } from "expo-router";
import { apiClient } from "@/services/api"; // Assuming you have an api client instance

export default function UploadReelScreen() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [whitePlayer, setWhitePlayer] = useState("");
    const [blackPlayer, setBlackPlayer] = useState("");
    const [difficulty, setDifficulty] = useState("intermediate");
    const [videoUri, setVideoUri] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const pickVideo = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Videos,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setVideoUri(result.assets[0].uri);
        }
    };

    const handleUpload = async () => {
        if (!videoUri || !title) {
            Alert.alert("Error", "Please select a video and enter a title.");
            return;
        }

        setIsUploading(true);

        try {
            // 1. Upload Video
            const formData = new FormData();
            formData.append("video", {
                uri: videoUri,
                name: "upload.mp4",
                type: "video/mp4",
            } as any);

            const uploadRes = await apiClient.post("/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (!uploadRes.data.success) throw new Error("Video upload failed");

            const videoUrl = uploadRes.data.url;

            // 2. Create Reel Record
            const reelData = {
                video: {
                    url: videoUrl,
                    thumbnail: "", // Backend could generate, or use a default
                    durationSec: 0, // Backend could calculate
                },
                content: {
                    title,
                    description,
                    tags: ["chess", "upload"],
                    difficulty,
                    whitePlayer,
                    blackPlayer,
                },
                status: "published",
            };

            // Assuming a create reel endpoint exists or using generic data endpoint
            // You might need to add a specific create endpoint in reelRoutes.js first
            // For now, let's assume POST /reels works or we use a data endpoint
            // Let's create a TODO to ensure backend supports this.
            // I'll assume POST /reels is the standard REST way.
            await apiClient.post("/reels", reelData);

            Alert.alert("Success", "Reel uploaded successfully!");
            router.back();
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to upload reel.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.header}>Upload New Reel</Text>

            <TouchableOpacity style={styles.videoPicker} onPress={pickVideo}>
                {videoUri ? (
                    <View style={styles.videoPlaceholder}>
                        <Check size={40} color={colors.accent.green} />
                        <Text style={styles.videoText}>Video Selected</Text>
                    </View>
                ) : (
                    <View style={styles.videoPlaceholder}>
                        <Upload size={40} color={colors.text.secondary} />
                        <Text style={styles.videoText}>Select Video</Text>
                    </View>
                )}
            </TouchableOpacity>

            <Text style={styles.label}>Title</Text>
            <TextInput
                style={styles.input}
                placeholder="Ex: Amazing Sicilian Defense"
                placeholderTextColor={colors.text.secondary}
                value={title}
                onChangeText={setTitle}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe the clip..."
                placeholderTextColor={colors.text.secondary}
                value={description}
                onChangeText={setDescription}
                multiline
            />

            <View style={styles.row}>
                <View style={styles.halfInput}>
                    <Text style={styles.label}>White Player</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Name"
                        placeholderTextColor={colors.text.secondary}
                        value={whitePlayer}
                        onChangeText={setWhitePlayer}
                    />
                </View>
                <View style={styles.halfInput}>
                    <Text style={styles.label}>Black Player</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Name"
                        placeholderTextColor={colors.text.secondary}
                        value={blackPlayer}
                        onChangeText={setBlackPlayer}
                    />
                </View>
            </View>

            <Text style={styles.label}>Difficulty</Text>
            <View style={styles.difficultyContainer}>
                {["beginner", "intermediate", "advanced"].map((level) => (
                    <TouchableOpacity
                        key={level}
                        style={[
                            styles.difficultyOption,
                            difficulty === level && styles.selectedDifficulty,
                        ]}
                        onPress={() => setDifficulty(level)}
                    >
                        <Text
                            style={[
                                styles.difficultyText,
                                difficulty === level && styles.selectedDifficultyText,
                            ]}
                        >
                            {level.toUpperCase()}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity
                style={[styles.uploadButton, isUploading && styles.disabledButton]}
                onPress={handleUpload}
                disabled={isUploading}
            >
                {isUploading ? (
                    <ActivityIndicator color={colors.text.primary} />
                ) : (
                    <Text style={styles.uploadButtonText}>Upload Reel</Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    content: {
        padding: 20,
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        color: colors.text.primary,
        marginBottom: 20,
        marginTop: 40,
    },
    label: {
        color: colors.text.secondary,
        marginBottom: 8,
        fontSize: 14,
    },
    input: {
        backgroundColor: colors.background.secondary,
        borderRadius: 12,
        padding: 16,
        color: colors.text.primary,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
    },
    textArea: {
        height: 100,
        textAlignVertical: "top",
    },
    row: {
        flexDirection: "row",
        gap: 12,
    },
    halfInput: {
        flex: 1,
    },
    videoPicker: {
        height: 150,
        backgroundColor: "rgba(255,255,255,0.05)",
        borderRadius: 16,
        borderWidth: 2,
        borderColor: "rgba(255,255,255,0.1)",
        borderStyle: "dashed",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 24,
    },
    videoPlaceholder: {
        alignItems: "center",
        gap: 8,
    },
    videoText: {
        color: colors.text.secondary,
        fontSize: 14,
    },
    difficultyContainer: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 30,
    },
    difficultyOption: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        backgroundColor: colors.background.secondary,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
    },
    selectedDifficulty: {
        backgroundColor: colors.accent.cyan,
        borderColor: colors.accent.cyan,
    },
    difficultyText: {
        color: colors.text.secondary,
        fontSize: 12,
        fontWeight: "600",
    },
    selectedDifficultyText: {
        color: colors.text.primary, // or black depending on theme
    },
    uploadButton: {
        backgroundColor: colors.accent.green,
        padding: 18,
        borderRadius: 12,
        alignItems: "center",
    },
    disabledButton: {
        opacity: 0.7,
    },
    uploadButtonText: {
        color: colors.text.primary,
        fontSize: 16,
        fontWeight: "bold",
    },
});
