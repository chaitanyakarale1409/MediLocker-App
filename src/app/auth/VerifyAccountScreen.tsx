import React, { useRef, useState } from 'react';
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

interface VerifyAccountScreenProps {
    navigation: NativeStackNavigationProp<any, any>;
}

export default function VerifyAccountScreen({ navigation }: VerifyAccountScreenProps) {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

    // Create an array of refs to control focus between the 6 inputs
    const inputRefs = useRef<Array<TextInput | null>>([]);

    const handleOtpChange = (text: string, index: number) => {
        // Only allow numbers
        const numericText = text.replace(/[^0-9]/g, '');

        const newOtp = [...otp];
        newOtp[index] = numericText;
        setOtp(newOtp);

        // Auto-advance to the next input if a number was typed
        if (numericText && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        // If user presses Backspace on an empty box, jump back to the previous box
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
            const newOtp = [...otp];
            newOtp[index - 1] = ''; // Clear the previous box
            setOtp(newOtp);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StatusBar style="dark" />

            {/* Back Arrow Header */}
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
                activeOpacity={0.7}
            >
                <MaterialIcons name="arrow-back" size={24} color="#5C5F60" />
            </TouchableOpacity>

            <View style={styles.content}>

                {/* Header Section */}
                <View style={styles.header}>
                    <Text style={styles.title}>Verify Account</Text>
                    <Text style={styles.subtitle}>
                        We have sent a 6-digit code to your registered email or phone number.
                    </Text>
                </View>

                {/* OTP Input Grid */}
                <View style={styles.formContainer}>
                    <View style={styles.otpContainer}>
                        {otp.map((digit, index) => (
                            <React.Fragment key={index}>
                                <TextInput
                                    ref={(ref) => (inputRefs.current[index] = ref)}
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
                                />
                                {/* Insert the separator line exactly in the middle (after 3rd input) */}
                                {index === 2 && <View style={styles.separator} />}
                            </React.Fragment>
                        ))}
                    </View>

                    {/* Action Area */}
                    <View style={styles.actionArea}>
                        <TouchableOpacity
                            style={styles.verifyButton}
                            activeOpacity={0.85}
                            // UPDATE THIS LINE:
                            onPress={() => navigation.replace('ProfileSetup')}
                        >
                            <Text style={styles.verifyButtonText}>Verify & Login</Text>
                        </TouchableOpacity>

                        <View style={styles.resendContainer}>
                            <Text style={styles.resendText}>Didn't receive a code?</Text>
                            <TouchableOpacity onPress={() => console.log('Resend Code')}>
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
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF', // surface-container-lowest
    },
    backButton: {
        position: 'absolute',
        top: 60, // Safe area padding
        left: 24,
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        zIndex: 10,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: '#0B1C30',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 14,
        fontWeight: '400',
        color: '#41484D',
        textAlign: 'center',
        maxWidth: 320,
        lineHeight: 20,
    },
    formContainer: {
        gap: 32,
        width: '100%',
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8, // Space between inputs
    },
    otpInput: {
        width: 40,
        height: 56,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#C1C7CD', // outline-variant
        backgroundColor: '#F8F9FF', // surface
        textAlign: 'center',
        fontSize: 24,
        fontWeight: '600',
        color: '#0B1C30',
    },
    otpInputFocused: {
        borderColor: '#32617D', // primary
        borderWidth: 2,
    },
    separator: {
        width: 6,
        height: 2,
        backgroundColor: 'rgba(193, 199, 205, 0.5)', // outline-variant with opacity
        borderRadius: 2,
        marginHorizontal: 2,
    },
    actionArea: {
        gap: 16,
        marginTop: 8,
    },
    verifyButton: {
        backgroundColor: '#32617D', // primary
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    verifyButtonText: {
        fontSize: 16,
        fontWeight: '400',
        color: '#FFFFFF',
    },
    resendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    resendText: {
        fontSize: 14,
        color: '#41484D',
    },
    resendLink: {
        fontSize: 14,
        color: '#32617D',
        fontWeight: '400',
    },
});