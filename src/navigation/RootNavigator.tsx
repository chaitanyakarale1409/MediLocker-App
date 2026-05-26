import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Context
import { UserProvider } from '../context/UserContext'; // Adjust path if needed
import { AuthProvider } from '../context/AuthContext';

// Screens
import SplashScreen from '../../screens/SplashScreen';
import OnboardingOneScreen from '../../screens/OnboardingOneScreen';
import OnboardingTwoScreen from '../../screens/OnboardingTwoScreen';
import OnboardingThreeScreen from '../../screens/OnboardingThreeScreen';
import VerifyAccountScreen from '../auth/VerifyAccountScreen';
import ProfileSetupScreen from '../auth/ProfileSetupScreen';
import DashboardScreen from '../screens/DashboardScreen';
import SettingsProfileScreen from '../screens/SettingsProfileScreen';
import MainTabNavigator from './MainTabNavigator';

// Auth & Additional Screens
import LoginScreen from '../auth/LoginScreen';
import UploadScreen from '../screens/UploadScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
    return (
        <AuthProvider>
            <UserProvider>
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                    {/* Onboarding Flow */}
                    <Stack.Screen name="Splash" component={SplashScreen} />
                    <Stack.Screen name="Onboarding1" component={OnboardingOneScreen} />
                    <Stack.Screen name="Onboarding2" component={OnboardingTwoScreen} />
                    <Stack.Screen name="Onboarding3" component={OnboardingThreeScreen} />

                    {/* Auth Flow */}
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="VerifyAccount" component={VerifyAccountScreen} />
                    <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />

                    {/* Main Authenticated App */}
                    <Stack.Screen name="Main" component={MainTabNavigator} />
                    <Stack.Screen name="Dashboard" component={DashboardScreen} />

                    {/* Settings Profile Screen */}
                    <Stack.Screen name="SettingsProfile" component={SettingsProfileScreen} />

                    {/* NORMAL SCREEN NAVIGATION */}
                    <Stack.Screen
                        name="UploadModal"
                        component={UploadScreen}
                    />
                </Stack.Navigator>
            </UserProvider>
        </AuthProvider>
    );
}