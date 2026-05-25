import React, { useState } from 'react';
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

interface LoginScreenProps {
    navigation: NativeStackNavigationProp<any, any>;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
    const [isFocused, setIsFocused] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);

    const API_URL = process.env.EXPO_PUBLIC_API_URL;

    // ---- OTP FLOW ----
    const handleSendOtp = async () => {
        if (!inputValue.trim()) {
            Alert.alert("Error", "Please enter your email or phone number");
            return;
        }

        try {
            setLoading(true);

            const trimmed = inputValue.trim();
            const requestBody = { phone: trimmed };

            const res = await fetch(`${API_URL}/auth/send-otp`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(requestBody),
            });

            let data;
            const responseText = await res.text();
            try {
                data = JSON.parse(responseText);
            } catch {
                throw new Error("Server returned an unexpected response.");
            }

            if (!res.ok) {
                let finalMessage = "Failed to send verification code";
                if (data?.message) {
                    if (typeof data.message === "object" && data.message !== null) {
                        finalMessage = data.message.message || JSON.stringify(data.message);
                    } else if (Array.isArray(data.message)) {
                        finalMessage = data.message.join('\n');
                    } else if (typeof data.message === "string") {
                        finalMessage = data.message;
                    }
                }
                throw new Error(finalMessage);
            }

            await AsyncStorage.setItem("auth_identifier", trimmed);
            Alert.alert("Success", data.message || "OTP sent successfully!");
            navigation.navigate('VerifyAccount');

        } catch (error: any) {
            console.error("OTP Error:", error);
            Alert.alert("Error", error.message || "Something went wrong.");
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

            <View style={styles.content}>
                <View style={styles.headingContainer}>
                    <Text style={styles.title}>Access Your Vault</Text>
                    <Text style={styles.subtitle}>
                        Enter your email or phone number to securely access your vault records.
                    </Text>
                </View>

                <View style={styles.formContainer}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email or Phone Number</Text>
                        <View style={[styles.inputWrapper, isFocused && styles.inputWrapperFocused]}>
                            <TextInput
                                style={styles.input}
                                placeholder="name@example.com or (555) 000-0000"
                                placeholderTextColor="#A1A8B0"
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                value={inputValue}
                                onChangeText={setInputValue}
                                keyboardType="default"
                                autoCapitalize="none"
                                autoCorrect={false}
                                editable={!loading}
                            />
                        </View>
                    </View>

                    {/* OTP Button */}
                    <TouchableOpacity
                        style={[styles.button, loading && { opacity: 0.7 }]}
                        activeOpacity={0.85}
                        onPress={handleSendOtp}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                            <>
                                <Text style={styles.buttonText}>Send Code</Text>
                                <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>New to ARMedico Vault?</Text>
                    <TouchableOpacity onPress={() => console.log('Navigate to Sign Up')}>
                        <Text style={styles.linkText}>Create an account</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    content: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
    headingContainer: { marginBottom: 40, alignItems: 'center' },
    title: { fontSize: 32, fontWeight: '700', color: '#0B1C30', marginBottom: 12, textAlign: 'center' },
    subtitle: { fontSize: 15, fontWeight: '400', color: '#41484D', lineHeight: 22, textAlign: 'center', paddingHorizontal: 10 },
    formContainer: { gap: 20 },
    inputGroup: { gap: 8 },
    label: { fontSize: 13, fontWeight: '600', color: '#32617D', marginLeft: 2, textAlign: 'left' },
    inputWrapper: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, overflow: 'hidden' },
    inputWrapperFocused: { borderColor: '#32617D' },
    input: { fontSize: 15, color: '#0B1C30', paddingVertical: 14, paddingHorizontal: 16 },

    button: { flexDirection: 'row', backgroundColor: '#32617D', borderRadius: 8, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', gap: 8 },
    buttonText: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },

    footer: { marginTop: 60, alignItems: 'center', gap: 12 },
    footerText: { fontSize: 14, color: '#41484D', textAlign: 'center' },
    linkText: { fontSize: 16, fontWeight: '700', color: '#32617D', textDecorationLine: 'underline', textAlign: 'center' },
});