import { Stack } from "expo-router";
import { colors } from "@/constants/themes";

export default function AdminLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.background.primary },
                animation: "fade",
                // Ensure edge-to-edge
                navigationBarColor: colors.background.primary,
                statusBarStyle: "light",
            }}
        >
            <Stack.Screen name="dashboard" />
        </Stack>
    );
}
