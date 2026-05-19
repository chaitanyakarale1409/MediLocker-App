import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Modal
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface ProfileSetupScreenProps {
    navigation: NativeStackNavigationProp<any, any>;
}

export default function ProfileSetupScreen({ navigation }: ProfileSetupScreenProps) {
    // Form State
    const [fullName, setFullName] = useState('');
    const [dob, setDob] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);

    // Dropdown State
    const [gender, setGender] = useState('');
    const [relationship, setRelationship] = useState('');
    const [bloodGroup, setBloodGroup] = useState('');

    // Tracks which dropdown modal is currently open ('gender', 'relationship', 'bloodGroup', or null)
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    // Reusable Dropdown Renderer
    const renderDropdownModal = () => {
        let options: string[] = [];
        let onSelect: (val: string) => void = () => { };
        let title = '';

        if (activeDropdown === 'gender') {
            options = ['Male', 'Female', 'Other'];
            onSelect = setGender;
            title = 'Select Gender';
        } else if (activeDropdown === 'relationship') {
            options = ['Single', 'Married', 'Divorced', 'Widowed', 'Other'];
            onSelect = setRelationship;
            title = 'Select Relationship';
        } else if (activeDropdown === 'bloodGroup') {
            options = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
            onSelect = setBloodGroup;
            title = 'Select Blood Group';
        } else {
            return null;
        }

        return (
            <Modal
                visible={!!activeDropdown}
                transparent
                animationType="fade"
                onRequestClose={() => setActiveDropdown(null)}
            >
                {/* Tapping the dark background closes the modal */}
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setActiveDropdown(null)}
                >
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>{title}</Text>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {options.map((opt, index) => (
                                <TouchableOpacity
                                    key={opt}
                                    style={[
                                        styles.modalOption,
                                        index === options.length - 1 && { borderBottomWidth: 0 } // remove border from last item
                                    ]}
                                    onPress={() => {
                                        onSelect(opt);
                                        setActiveDropdown(null);
                                    }}
                                >
                                    <Text style={styles.modalOptionText}>{opt}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <StatusBar style="dark" />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Header Section */}
                <View style={styles.header}>
                    <Text style={styles.title}>Patient Profile</Text>
                    <Text style={styles.subtitle}>Complete your profile to continue.</Text>
                </View>

                {/* Profile Picture Upload */}
                <View style={styles.photoSection}>
                    <TouchableOpacity style={styles.photoCircle} activeOpacity={0.7}>
                        <MaterialIcons name="add-a-photo" size={32} color="#32617D" />
                        <View style={styles.photoBadge}>
                            <MaterialIcons name="person" size={14} color="#71787E" />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.photoLabel}>PROFILE PHOTO (OPTIONAL)</Text>
                </View>

                <View style={styles.divider} />

                {/* Form Fields */}
                <View style={styles.formContainer}>

                    {/* Full Name */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Legal Full Name</Text>
                        <View style={styles.inputWrapper}>
                            <MaterialIcons name="badge" size={20} color="#71787E" style={styles.iconLeft} />
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Jane Doe"
                                placeholderTextColor="#71787E"
                                value={fullName}
                                onChangeText={setFullName}
                            />
                        </View>
                    </View>

                    {/* Grid: DOB and Gender */}
                    <View style={styles.rowGrid}>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Date of Birth</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialIcons name="calendar-today" size={20} color="#71787E" style={styles.iconLeft} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="YYYY-MM-DD"
                                    placeholderTextColor="#71787E"
                                    value={dob}
                                    onChangeText={setDob}
                                />
                            </View>
                        </View>

                        {/* Gender Dropdown Trigger */}
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Gender</Text>
                            <TouchableOpacity
                                style={styles.inputWrapper}
                                activeOpacity={0.7}
                                onPress={() => setActiveDropdown('gender')}
                            >
                                <MaterialIcons name="wc" size={20} color="#71787E" style={styles.iconLeft} />
                                <Text style={[styles.fauxSelectText, gender && styles.selectedText]}>
                                    {gender || 'Select'}
                                </Text>
                                <MaterialIcons name="expand-more" size={20} color="#71787E" style={styles.iconRight} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Relationship Dropdown Trigger */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Relationship</Text>
                        <TouchableOpacity
                            style={styles.inputWrapper}
                            activeOpacity={0.7}
                            onPress={() => setActiveDropdown('relationship')}
                        >
                            <MaterialIcons name="people" size={20} color="#71787E" style={styles.iconLeft} />
                            <Text style={[styles.fauxSelectText, relationship && styles.selectedText]}>
                                {relationship || 'Select relationship'}
                            </Text>
                            <MaterialIcons name="expand-more" size={20} color="#71787E" style={styles.iconRight} />
                        </TouchableOpacity>
                    </View>

                    {/* Blood Group Dropdown Trigger */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Blood Group</Text>
                        <TouchableOpacity
                            style={styles.inputWrapper}
                            activeOpacity={0.7}
                            onPress={() => setActiveDropdown('bloodGroup')}
                        >
                            <MaterialIcons name="bloodtype" size={20} color="#71787E" style={styles.iconLeft} />
                            <Text style={[styles.fauxSelectText, bloodGroup && styles.selectedText]}>
                                {bloodGroup || 'Select option'}
                            </Text>
                            <MaterialIcons name="expand-more" size={20} color="#71787E" style={styles.iconRight} />
                        </TouchableOpacity>
                    </View>

                    {/* Terms Checkbox */}
                    <TouchableOpacity
                        style={styles.checkboxContainer}
                        activeOpacity={0.7}
                        onPress={() => setTermsAccepted(!termsAccepted)}
                    >
                        <MaterialIcons
                            name={termsAccepted ? "check-box" : "check-box-outline-blank"}
                            size={24}
                            color={termsAccepted ? "#32617D" : "#C1C7CD"}
                        />
                        <Text style={styles.checkboxText}>
                            I agree to the privacy policy and terms of service
                        </Text>
                    </TouchableOpacity>

                </View>

                {/* Action Area */}
                <View style={styles.actionArea}>
                    <TouchableOpacity
                        style={styles.button}
                        activeOpacity={0.85}
                        // UPDATE THIS LINE
                        onPress={() => navigation.replace('Dashboard')}
                    >
                        <Text style={styles.buttonText}>Sign Up</Text>
                        <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
                    </TouchableOpacity>

                    <View style={styles.securityFooter}>
                        <MaterialIcons name="lock" size={14} color="#71787E" />
                        <Text style={styles.securityText}>Your data is encrypted and securely stored.</Text>
                    </View>
                </View>

            </ScrollView>

            {/* Render the active Modal */}
            {renderDropdownModal()}
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FF',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 40,
        flexGrow: 1,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: '#0B1C30',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '400',
        color: '#41484D',
    },
    photoSection: {
        alignItems: 'center',
        marginBottom: 24,
        gap: 8,
    },
    photoCircle: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: '#E5EEFF',
        borderWidth: 1,
        borderColor: '#71787E',
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
    },
    photoBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#C1C7CD',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    photoLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: '#41484D',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(193, 199, 205, 0.2)',
        marginBottom: 24,
    },
    formContainer: {
        gap: 16,
    },
    rowGrid: {
        flexDirection: 'row',
        gap: 16,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 12,
        fontWeight: '500',
        color: '#0B1C30',
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#C1C7CD',
        borderRadius: 8,
        height: 48,
        paddingHorizontal: 12,
    },
    iconLeft: {
        marginRight: 8,
    },
    iconRight: {
        marginLeft: 'auto',
    },
    input: {
        flex: 1,
        fontSize: 14,
        color: '#0B1C30',
        height: '100%',
    },
    fauxSelectText: {
        flex: 1,
        fontSize: 14,
        color: '#71787E', // Acts as placeholder color
    },
    selectedText: {
        color: '#0B1C30', // Changes to dark color when a selection is made
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: 8,
        gap: 12,
        paddingRight: 16,
    },
    checkboxText: {
        fontSize: 14,
        color: '#41484D',
        lineHeight: 20,
        flex: 1,
    },
    actionArea: {
        marginTop: 32,
        gap: 16,
    },
    button: {
        flexDirection: 'row',
        backgroundColor: '#32617D',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    buttonText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    securityFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    securityText: {
        fontSize: 12,
        color: '#71787E',
    },

    /* --- Modal Dropdown Styles --- */
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(11, 28, 48, 0.5)', // Dark semi-transparent background
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        width: '100%',
        maxHeight: 400,
        overflow: 'hidden',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0B1C30',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        backgroundColor: '#F8F9FF',
    },
    modalOption: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    modalOptionText: {
        fontSize: 16,
        color: '#41484D',
        fontWeight: '500',
    },
});