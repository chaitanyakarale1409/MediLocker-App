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

// NEW PATH: Import from the app/auth folder
import LoginScreen from '../../src/app/auth/LoginScreen'

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Onboarding1" component={OnboardingOneScreen} />
            <Stack.Screen name="Onboarding2" component={OnboardingTwoScreen} />
            <Stack.Screen name="Onboarding3" component={OnboardingThreeScreen} />
            <Stack.Screen name="VerifyAccount" component={VerifyAccountScreen} />
            <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
            <Stack.Screen name="Dashboard" component={DashboardScreen} />

            {/* Login Screen */}
            <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
    );
}