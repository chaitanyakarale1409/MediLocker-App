import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface LoginScreenProps {
    navigation: NativeStackNavigationProp<any, any>;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
    const [isFocused, setIsFocused] = useState(false);
    const [inputValue, setInputValue] = useState('');

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StatusBar style="dark" />

            <View style={styles.content}>

                {/* Headings - Centered */}
                <View style={styles.headingContainer}>
                    <Text style={styles.title}>Access Your Vault</Text>
                    <Text style={styles.subtitle}>
                        Enter your email or phone number to securely access your vault records.
                    </Text>
                </View>

                {/* Form Area */}
                <View style={styles.formContainer}>

                    {/* Input Group - Left Aligned */}
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
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

                    {/* Button */}
                    <TouchableOpacity
                        style={styles.button}
                        activeOpacity={0.85}
                        onPress={() => navigation.navigate('VerifyAccount')}
                    >
                        <Text style={styles.buttonText}>Send Code</Text>
                        <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
                    </TouchableOpacity>

                </View>

                {/* Footer / Sign Up - Centered */}
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
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    headingContainer: {
        marginBottom: 40,
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: '#0B1C30',
        marginBottom: 12,
        textAlign: 'center', // Centers text without justifying
    },
    subtitle: {
        fontSize: 15,
        fontWeight: '400',
        color: '#41484D',
        lineHeight: 22,
        textAlign: 'center', // Centers text without justifying
        paddingHorizontal: 10,
    },
    formContainer: {
        gap: 24, // Space between input and button
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#32617D', // Dark blue label matching image
        marginLeft: 2,
        textAlign: 'left', // Keeps label aligned left
    },
    inputWrapper: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        overflow: 'hidden',
    },
    inputWrapperFocused: {
        borderColor: '#32617D',
    },
    input: {
        fontSize: 15,
        color: '#0B1C30',
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    button: {
        flexDirection: 'row',
        backgroundColor: '#32617D',
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    footer: {
        marginTop: 60,
        alignItems: 'center',
        gap: 12,
    },
    footerText: {
        fontSize: 14,
        color: '#41484D',
        textAlign: 'center',
    },
    linkText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#32617D',
        textDecorationLine: 'underline',
        textAlign: 'center',
    },
});