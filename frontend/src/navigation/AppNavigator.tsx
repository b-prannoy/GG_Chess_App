import React, { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useAuthStore } from '../stores/authStore';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { ProfileSetupScreen } from '../screens/ProfileSetupScreen';
import { FeedScreen } from '../screens/FeedScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
    ProfileSetup: undefined;
};

export type MainTabParamList = {
    Feed: undefined;
    Discover: undefined;
    Profile: undefined;
};

export type RootStackParamList = {
    Auth: undefined;
    Main: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();

const AuthNavigator = () => (
    <AuthStack.Navigator
        screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#0D1117' },
        }}
    >
        <AuthStack.Screen name="Login" component={LoginScreen} />
        <AuthStack.Screen name="Register" component={RegisterScreen} />
        <AuthStack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
    </AuthStack.Navigator>
);

const DiscoverPlaceholder = () => (
    <View style={styles.placeholderContainer}>
        <Ionicons name="compass-outline" size={64} color="#4B5563" />
    </View>
);

const MainNavigator = () => (
    <MainTab.Navigator
        screenOptions={({ route }) => ({
            headerShown: false,
            tabBarStyle: {
                backgroundColor: '#0D1117',
                borderTopColor: '#1F2937',
                borderTopWidth: 1,
                height: 80,
                paddingBottom: 20,
                paddingTop: 10,
            },
            tabBarActiveTintColor: '#6366F1',
            tabBarInactiveTintColor: '#6B7280',
            tabBarLabelStyle: {
                fontSize: 12,
                fontWeight: '500',
            },
            tabBarIcon: ({ focused, color, size }) => {
                let iconName: keyof typeof Ionicons.glyphMap;

                if (route.name === 'Feed') {
                    iconName = focused ? 'home' : 'home-outline';
                } else if (route.name === 'Discover') {
                    iconName = focused ? 'compass' : 'compass-outline';
                } else {
                    iconName = focused ? 'person' : 'person-outline';
                }

                return <Ionicons name={iconName} size={size} color={color} />;
            },
        })}
    >
        <MainTab.Screen name="Feed" component={FeedScreen} />
        <MainTab.Screen name="Discover" component={DiscoverPlaceholder} />
        <MainTab.Screen name="Profile" component={ProfileScreen} />
    </MainTab.Navigator>
);

export const AppNavigator: React.FC = () => {
    const { isAuthenticated, isLoading, loadStoredAuth } = useAuthStore();

    useEffect(() => {
        loadStoredAuth();
    }, []);

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6366F1" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <RootStack.Navigator screenOptions={{ headerShown: false }}>
                {isAuthenticated ? (
                    <RootStack.Screen name="Main" component={MainNavigator} />
                ) : (
                    <RootStack.Screen name="Auth" component={AuthNavigator} />
                )}
            </RootStack.Navigator>
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0D1117',
    },
    placeholderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0D1117',
    },
});
