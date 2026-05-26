import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../src/context/AuthContext';

interface VerifyAccountScreenProps {
    navigation: NativeStackNavigationProp<any, any>;
}

export default function VerifyAccountScreen({ navigation }: VerifyAccountScreenProps) {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    const { setToken, setHasProfile } = useAuth();
    const inputRefs = useRef<Array<TextInput | null>>([]);

    const handleOtpChange = (text: string, index: number) => {
        const numericText = text.replace(/[^0-9]/g, '');
        const newOtp = [...otp];
        newOtp[index] = numericText;
        setOtp(newOtp);

        if (numericText && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
            const newOtp = [...otp];
            newOtp[index - 1] = '';
            setOtp(newOtp);
        }
    };

    const handleVerifyOtp = async () => {
        const enteredOtp = otp.join('');

        if (enteredOtp.length !== 6) {
            Alert.alert("Error", "Please enter the complete 6-digit code.");
            return;
        }

        try {
            setLoading(true);

            const identifier = await AsyncStorage.getItem("auth_identifier");

            if (!identifier) {
                Alert.alert("Error", "Account info not found. Please log in again.");
                navigation.goBack();
                return;
            }

            // Determine if the saved identifier is an email or phone number
            const isEmail = identifier.includes('@');

            // Send the correct key based on what the user originally typed
            const requestBody = isEmail
                ? { email: identifier, otp: enteredOtp }
                : { phone: identifier, otp: enteredOtp };

            // Using the explicit URL for verifying OTP
            const verifyResponse = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/verify-otp`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(requestBody),
            });

            let verifyData;
            const responseText = await verifyResponse.text();
            try {
                verifyData = JSON.parse(responseText);
            } catch (e) {
                throw new Error("Server returned an unexpected response.");
            }

            if (!verifyResponse.ok) {
                let backendMessage = verifyData?.message || verifyData?.error || "Invalid OTP";

                if (typeof backendMessage === "string") {
                    try {
                        const parsed = JSON.parse(backendMessage);
                        backendMessage = parsed?.message || parsed?.error || "Invalid OTP";
                    } catch { /* normal string */ }
                }

                const finalMessage = typeof backendMessage === "string"
                    ? backendMessage
                    : Array.isArray(backendMessage)
                        ? backendMessage.join("\n")
                        : JSON.stringify(backendMessage);

                throw new Error(finalMessage);
            }

            const token = verifyData.accessToken;
            await setToken(token);

            // Check if we already locally know this user has a profile
            const locallyKnown = await AsyncStorage.getItem(`has_profile_${identifier}`);
            if (locallyKnown === 'true') {
                await setHasProfile(true);
                Alert.alert("Success", "Login successful");
                navigation.replace('Main');
                return;
            }

            // Fetching profile with the same base URL
            const profileResponse = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/profiles`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
            });

            if (profileResponse.ok) {
                const profiles = await profileResponse.json();

                if (profiles && profiles.length > 0) {
                    // User already has a profile — remember this
                    await setHasProfile(true);
                    Alert.alert("Success", "Login successful");
                    navigation.replace('Main');
                } else {
                    Alert.alert("Success", "Account verified. Let's set up your profile.");
                    navigation.replace('ProfileSetup');
                }
            } else {
                navigation.replace('ProfileSetup');
            }

        } catch (error: any) {
            console.error("Verify OTP error:", error);
            Alert.alert("Verification Failed", error.message || "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StatusBar style="dark" />

            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
                activeOpacity={0.7}
                disabled={loading}
            >
                <MaterialIcons name="arrow-back" size={24} color="#5C5F60" />
            </TouchableOpacity>

            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>Verify Account</Text>
                    <Text style={styles.subtitle}>
                        We have sent a 6-digit code to your registered email or phone number.
                    </Text>
                </View>

                <View style={styles.formContainer}>
                    <View style={styles.otpContainer}>
                        {otp.map((digit, index) => (
                            <React.Fragment key={index}>
                                <TextInput
                                    ref={(ref) => { inputRefs.current[index] = ref; }}
                                    style={[
                                        styles.otpInput,
                                        focusedIndex === index && styles.otpInputFocused
                                    ]}
                                    value={digit}
                                    onChangeText={(text) => handleOtpChange(text, index)}
                                    onKeyPress={(e) => handleKeyPress(e, index)}
                                    onFocus={() => setFocusedIndex(index)}
                                    onBlur={() => setFocusedIndex(null)}
                                    keyboardType="numeric"
                                    maxLength={1}
                                    selectTextOnFocus
                                    editable={!loading}
                                />
                                {index === 2 && <View style={styles.separator} />}
                            </React.Fragment>
                        ))}
                    </View>

                    <View style={styles.actionArea}>
                        <TouchableOpacity
                            style={[styles.verifyButton, loading && { opacity: 0.7 }]}
                            activeOpacity={0.85}
                            onPress={handleVerifyOtp}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFFFFF" size="small" />
                            ) : (
                                <Text style={styles.verifyButtonText}>Verify & Login</Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.resendContainer}>
                            <Text style={styles.resendText}>Didn't receive a code?</Text>
                            <TouchableOpacity disabled={loading} onPress={() => console.log('Resend Code')}>
                                <Text style={styles.resendLink}>Resend Code</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    backButton: { position: 'absolute', top: 60, left: 24, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', zIndex: 10 },
    content: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
    header: { alignItems: 'center', marginBottom: 40 },
    title: { fontSize: 32, fontWeight: '700', color: '#0B1C30', marginBottom: 12 },
    subtitle: { fontSize: 14, fontWeight: '400', color: '#41484D', textAlign: 'center', maxWidth: 320, lineHeight: 20 },
    formContainer: { gap: 32, width: '100%' },
    otpContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
    otpInput: { width: 40, height: 56, borderRadius: 8, borderWidth: 1, borderColor: '#C1C7CD', backgroundColor: '#F8F9FF', textAlign: 'center', fontSize: 24, fontWeight: '600', color: '#0B1C30' },
    otpInputFocused: { borderColor: '#32617D', borderWidth: 2 },
    separator: { width: 6, height: 2, backgroundColor: 'rgba(193, 199, 205, 0.5)', borderRadius: 2, marginHorizontal: 2 },
    actionArea: { gap: 16, marginTop: 8 },
    verifyButton: { backgroundColor: '#32617D', borderRadius: 8, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
    verifyButtonText: { fontSize: 16, fontWeight: '400', color: '#FFFFFF' },
    resendContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
    resendText: { fontSize: 14, color: '#41484D' },
    resendLink: { fontSize: 14, color: '#32617D', fontWeight: '400' },
});