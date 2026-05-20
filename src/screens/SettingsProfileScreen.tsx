import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Platform,
    Modal,
    TextInput,
    KeyboardAvoidingView,
    TouchableWithoutFeedback,
    Keyboard
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../context/UserContext'; // Adjust path if needed

// Custom Text component to enforce font scaling lock
const FixedText = (props: any) => (
    <Text allowFontScaling={false} maxFontSizeMultiplier={1} {...props} />
);

export default function SettingsProfileScreen() {
    const navigation = useNavigation<any>();

    // Global User State
    const { userName, setUserName } = useUser();
    const initial = userName ? userName.charAt(0).toUpperCase() : '';

    // Local Edit Modal State
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editName, setEditName] = useState(userName);

    const handleSaveProfile = () => {
        if (editName.trim() === '') {
            alert("Name cannot be empty.");
            return;
        }
        setUserName(editName.trim());
        setIsEditModalVisible(false);
    };

    const handleLogout = () => {
        // Reset the navigation stack entirely and push the user to the Login screen
        navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
        });
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="dark" />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* Top Action Bar (Back + Notifications) */}
                <View style={styles.topBar}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                        <MaterialIcons name="arrow-back" size={24} color="#41484d" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtn}>
                        <MaterialIcons name="notifications-none" size={24} color="#41484d" />
                    </TouchableOpacity>
                </View>

                {/* Profile Header Card */}
                <View style={styles.profileHeader}>
                    <View style={styles.avatarLarge}>
                        <FixedText style={styles.avatarLargeText}>{initial}</FixedText>
                    </View>
                    <FixedText style={styles.profileName}>{userName}</FixedText>
                    <TouchableOpacity
                        style={styles.editProfileBtn}
                        onPress={() => {
                            setEditName(userName);
                            setIsEditModalVisible(true);
                        }}
                    >
                        <FixedText style={styles.editProfileText}>Edit Profile</FixedText>
                    </TouchableOpacity>
                </View>

                {/* Account Profile Switcher */}
                <View style={styles.section}>
                    <View style={styles.card}>
                        <View style={styles.cardHeaderRow}>
                            <MaterialIcons name="person" size={20} color="#32617d" />
                            <FixedText style={styles.cardTitle}>Account Profile</FixedText>
                        </View>

                        <TouchableOpacity style={styles.accountSwitcherItem} activeOpacity={0.7}>
                            <View style={styles.accountSwitcherLeft}>
                                <View style={styles.avatarSmall}>
                                    <FixedText style={styles.avatarSmallText}>{initial}</FixedText>
                                </View>
                                <View>
                                    <FixedText style={styles.accountName}>{userName}</FixedText>
                                    <FixedText style={styles.accountRelation}>Self</FixedText>
                                </View>
                            </View>
                            <MaterialIcons name="edit" size={20} color="#71787e" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Settings Card */}
                <View style={styles.section}>
                    <FixedText style={styles.sectionHeading}>Settings</FixedText>
                    <View style={styles.card}>

                        {/* Theme */}
                        <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
                            <View style={styles.settingItemLeft}>
                                <MaterialIcons name="dark-mode" size={24} color="#41484d" />
                                <View>
                                    <FixedText style={styles.settingTitle}>Theme</FixedText>
                                    <FixedText style={styles.settingSubtitle}>Light / Dark mode</FixedText>
                                </View>
                            </View>
                            <MaterialIcons name="chevron-right" size={24} color="#71787e" />
                        </TouchableOpacity>
                        <View style={styles.divider} />

                        {/* App Lock */}
                        <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
                            <View style={styles.settingItemLeft}>
                                <MaterialIcons name="lock-outline" size={24} color="#41484d" />
                                <View>
                                    <FixedText style={styles.settingTitle}>App Lock</FixedText>
                                    <FixedText style={styles.settingSubtitle}>Screen lock, PIN</FixedText>
                                </View>
                            </View>
                            <MaterialIcons name="chevron-right" size={24} color="#71787e" />
                        </TouchableOpacity>
                        <View style={styles.divider} />

                        {/* Language */}
                        <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
                            <View style={styles.settingItemLeft}>
                                <MaterialIcons name="language" size={24} color="#41484d" />
                                <View>
                                    <FixedText style={styles.settingTitle}>Language</FixedText>
                                    <FixedText style={styles.settingSubtitle}>English</FixedText>
                                </View>
                            </View>
                            <MaterialIcons name="chevron-right" size={24} color="#71787e" />
                        </TouchableOpacity>
                        <View style={styles.divider} />

                        {/* Logout */}
                        <TouchableOpacity style={[styles.settingItem, styles.logoutItem]} activeOpacity={0.7} onPress={handleLogout}>
                            <View style={styles.settingItemLeft}>
                                <MaterialIcons name="logout" size={24} color="#ba1a1a" />
                                <View>
                                    <FixedText style={styles.logoutTitle}>Logout</FixedText>
                                    <FixedText style={styles.settingSubtitle}>Sign out of your account</FixedText>
                                </View>
                            </View>
                            <MaterialIcons name="chevron-right" size={24} color="#71787e" />
                        </TouchableOpacity>

                    </View>
                </View>

            </ScrollView>

            {/* ======================================================== */}
            {/* 🟢 FULL-SCREEN MODAL FOR EDITING PROFILE NAME            */}
            {/* ======================================================== */}
            <Modal visible={isEditModalVisible} animationType="slide" transparent={false} onRequestClose={() => setIsEditModalVisible(false)}>
                <SafeAreaView style={styles.modalSafeArea}>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                            <View style={{ flex: 1, position: 'relative' }}>
                                <ScrollView contentContainerStyle={styles.setupFormContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                                    <View style={styles.setupHeader}>
                                        <FixedText style={styles.setupTitle}>Edit Profile</FixedText>
                                        <FixedText style={styles.setupSubtitle}>Update your personal information.</FixedText>
                                    </View>

                                    <View style={styles.inputsWrapper}>
                                        <View style={styles.inputGroup}>
                                            <FixedText style={styles.inputLabel}>Legal Full Name</FixedText>

                                            {/* Input Box with Left-Side Icon REMOVED */}
                                            <View style={styles.inputBox}>
                                                <TextInput
                                                    style={styles.inputText}
                                                    placeholder="e.g. Jane Doe"
                                                    placeholderTextColor="#71787e"
                                                    value={editName}
                                                    onChangeText={setEditName}
                                                    autoFocus={true}
                                                />
                                            </View>
                                        </View>
                                    </View>

                                    <View style={styles.actionArea}>
                                        <View style={styles.actionRow}>
                                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsEditModalVisible(false)}>
                                                <FixedText style={styles.cancelBtnText}>Cancel</FixedText>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={styles.submitBtn} onPress={handleSaveProfile}>
                                                <FixedText style={styles.submitBtnText}>Save Changes</FixedText>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                </ScrollView>
                            </View>
                        </TouchableWithoutFeedback>
                    </KeyboardAvoidingView>
                </SafeAreaView>
            </Modal>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f8f9ff' },
    scrollContent: { paddingHorizontal: 16, paddingBottom: 40, paddingTop: Platform.OS === 'android' ? 24 : 0 },

    topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    iconBtn: { padding: 8 },

    profileHeader: { alignItems: 'center', marginBottom: 32 },
    avatarLarge: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#e5eeff', borderWidth: 4, borderColor: '#ffffff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, marginBottom: 12 },
    avatarLargeText: { fontSize: 40, fontWeight: '700', color: '#32617d' },
    profileName: { fontSize: 28, fontWeight: '700', color: '#0b1c30', marginBottom: 8 },
    editProfileBtn: { backgroundColor: '#eff4ff', borderWidth: 1, borderColor: '#9fcced', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
    editProfileText: { color: '#32617d', fontSize: 12, fontWeight: '600' },

    section: { marginBottom: 24 },
    sectionHeading: { fontSize: 20, fontWeight: '600', color: '#0b1c30', marginBottom: 12 },

    card: { backgroundColor: '#ffffff', borderRadius: 8, borderWidth: 1, borderColor: '#e1e3e4', shadowColor: '#5d8aa8', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.08, shadowRadius: 25, elevation: 2, padding: 16 },
    cardHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
    cardTitle: { fontSize: 18, fontWeight: '600', color: '#0b1c30' },

    accountSwitcherItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#eff4ff', borderWidth: 1, borderColor: '#9fcced', borderRadius: 8, padding: 12 },
    accountSwitcherLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatarSmall: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#32617d', alignItems: 'center', justifyContent: 'center' },
    avatarSmallText: { color: '#ffffff', fontSize: 18, fontWeight: '700' },
    accountName: { fontSize: 14, fontWeight: '600', color: '#0b1c30' },
    accountRelation: { fontSize: 12, color: '#41484d', marginTop: 2 },

    settingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
    settingItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    settingTitle: { fontSize: 16, fontWeight: '600', color: '#0b1c30' },
    settingSubtitle: { fontSize: 12, color: '#41484d', marginTop: 2 },

    divider: { height: 1, backgroundColor: '#e1e3e4', marginVertical: 4 },

    logoutItem: { backgroundColor: 'transparent' },
    logoutTitle: { fontSize: 16, fontWeight: '600', color: '#ba1a1a' },

    // --- Modal Form Styles ---
    modalSafeArea: { flex: 1, backgroundColor: '#F8F9FF' },
    setupFormContent: { paddingHorizontal: 20, paddingTop: 32, paddingBottom: 60 },
    setupHeader: { alignItems: 'center', marginBottom: 32, width: '100%' },
    setupTitle: { fontSize: 26, fontWeight: '700', color: '#0b1c30', marginBottom: 8 },
    setupSubtitle: { fontSize: 14, color: '#41484d', textAlign: 'center' },
    inputsWrapper: { width: '100%' },
    inputGroup: { marginBottom: 24, width: '100%' },
    inputLabel: { fontSize: 12, fontWeight: '500', color: '#0b1c30', marginBottom: 8 },
    inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#c1c7cd', borderRadius: 8, height: 50, paddingHorizontal: 16 }, // Adjusted padding since icon is gone
    inputText: { flex: 1, fontSize: 16, color: '#0b1c30', height: '100%', padding: 0 }, // Increased font size slightly since icon is gone
    actionArea: { width: '100%', marginTop: 16 },
    actionRow: { flexDirection: 'row', gap: 12, width: '100%' },
    cancelBtn: { flex: 1, backgroundColor: '#dce9ff', height: 52, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    cancelBtnText: { fontSize: 15, fontWeight: '600', color: '#0b1c30' },
    submitBtn: { flex: 1.5, backgroundColor: '#32617D', height: 52, borderRadius: 8, alignItems: 'center', justifyContent: 'center', elevation: 2 },
    submitBtnText: { fontSize: 15, fontWeight: '600', color: '#ffffff' },
});