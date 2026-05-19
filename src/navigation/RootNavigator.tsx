import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import SplashScreen from '../../screens/SplashScreen';
import OnboardingOneScreen from '../../screens/OnboardingOneScreen';
import OnboardingTwoScreen from '../../screens/OnboardingTwoScreen';
import OnboardingThreeScreen from '../../screens/OnboardingThreeScreen';
import VerifyAccountScreen from '../app/auth/VerifyAccountScreen';
import ProfileSetupScreen from '../app/auth/ProfileSetupScreen';
import DashboardScreen from '../screens/DashboardScreen';
import MainTabNavigator from './MainTabNavigator';

// Auth & Additional Screens
import LoginScreen from '../../src/app/auth/LoginScreen';
import UploadScreen from '../screens/UploadScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
    return (
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

            {/* NORMAL SCREEN NAVIGATION (No longer a slide-up modal) */}
            <Stack.Screen
                name="UploadModal"
                component={UploadScreen}
            />
        </Stack.Navigator>
    );
}