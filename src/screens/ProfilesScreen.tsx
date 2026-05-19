import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
    TextInput,
    ActivityIndicator,
    Platform,
    SafeAreaView,
    KeyboardAvoidingView,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

// --- Types ---
interface Profile {
    id: string;
    fullName: string;
    dob: string;
    gender: string;
    relationship: string;
    bloodGroup: string;
    age?: string;
}

// --- Accessibility Lock ---
const FixedText = (props: any) => (
    <Text allowFontScaling={false} maxFontSizeMultiplier={1} {...props} />
);

export default function ProfilesScreen() {
    const [loading, setLoading] = useState(true);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [activeProfile, setActiveProfile] = useState<Profile | null>(null);

    // Core Modals & Menu Toggles
    const [showAddModal, setShowAddModal] = useState(false);
    const [showProfileSwitcher, setShowProfileSwitcher] = useState(false);

    // Pro-level inline Dropdown State (Absolute Overlay)
    const [dropdownState, setDropdownState] = useState<{
        visible: boolean;
        title: string;
        options: { label: string; value: string }[];
        onSelect: (val: string) => void;
    }>({ visible: false, title: '', options: [], onSelect: () => { } });

    // Form State
    const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
    const [fullName, setFullName] = useState("");
    const [dob, setDob] = useState("");
    const [gender, setGender] = useState("");
    const [relationship, setRelationship] = useState("");
    const [bloodGroup, setBloodGroup] = useState("");
    const [termsAccepted, setTermsAccepted] = useState(false);

    // Simulated Fetch
    useEffect(() => {
        const fetchProfiles = async () => {
            try {
                setTimeout(() => {
                    const mockData: Profile[] = [
                        { id: '1', fullName: 'John Doe', dob: '15/05/1985', gender: 'Male', relationship: 'Self', bloodGroup: 'O+', age: '40 years' },
                    ];
                    setProfiles(mockData);
                    setActiveProfile(mockData[0]);
                    setLoading(false);
                }, 1000);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };
        fetchProfiles();
    }, []);

    // Calculate Age from DD/MM/YYYY
    const calculateAge = (dobString: string) => {
        if (dobString.length !== 10) return '-';
        const [day, month, year] = dobString.split('/');
        const dobDate = new Date(`${year}-${month}-${day}`);
        const today = new Date();
        let years = today.getFullYear() - dobDate.getFullYear();
        const monthDiff = today.getMonth() - dobDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
            years--;
        }
        return isNaN(years) ? '-' : `${years} years`;
    };

    // Auto-Format Date to DD/MM/YYYY
    const handleDateChange = (text: string) => {
        let cleaned = text.replace(/\D/g, '');
        if (cleaned.length > 8) cleaned = cleaned.slice(0, 8);

        let formatted = cleaned;
        if (cleaned.length > 2 && cleaned.length <= 4) {
            formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
        } else if (cleaned.length > 4) {
            formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4)}`;
        }
        setDob(formatted);
    };

    const handleSaveProfile = () => {
        Keyboard.dismiss();

        if (!fullName.trim() || !dob.trim() || !gender || !relationship || !bloodGroup) {
            alert("Please fill in all the profile details fields first.");
            return;
        }
        if (dob.length < 10) {
            alert("Please enter a valid complete Date of Birth (DD/MM/YYYY).");
            return;
        }
        if (!termsAccepted) {
            alert("Please agree to the privacy policy and terms of service.");
            return;
        }

        const newProfileData = {
            fullName,
            dob,
            gender,
            relationship,
            bloodGroup,
            age: dob ? calculateAge(dob) : '-',
        };

        if (editingProfileId) {
            setProfiles((prev) =>
                prev.map((p) => (p.id === editingProfileId ? { ...p, ...newProfileData } : p))
            );
            if (activeProfile?.id === editingProfileId) {
                setActiveProfile({ id: editingProfileId, ...newProfileData });
            }
        } else {
            const newProfile = { id: Math.random().toString(), ...newProfileData };
            setProfiles((prev) => [...prev, newProfile]);
        }
        closeModal();
    };

    const handleDeleteProfile = (id: string) => {
        setProfiles((prev) => prev.filter((p) => p.id !== id));
        if (activeProfile?.id === id) {
            setActiveProfile(profiles.find((p) => p.id !== id) || null);
        }
    };

    const openEditModal = (profile: Profile) => {
        setEditingProfileId(profile.id);
        setFullName(profile.fullName);
        setDob(profile.dob);
        setGender(profile.gender);
        setRelationship(profile.relationship);
        setBloodGroup(profile.bloodGroup);
        setTermsAccepted(true);
        setShowAddModal(true);
    };

    const closeModal = () => {
        Keyboard.dismiss();
        setShowAddModal(false);
        setEditingProfileId(null);
        setFullName("");
        setDob("");
        setGender("");
        setRelationship("");
        setBloodGroup("");
        setTermsAccepted(false);
        setDropdownState({ visible: false, title: '', options: [], onSelect: () => { } });
    };

    const getInitials = (name: string) => {
        if (!name) return "NA";
        return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
    };

    const openSelect = (title: string, options: any[], onSelect: (val: string) => void) => {
        Keyboard.dismiss();
        setDropdownState({ visible: true, title, options, onSelect });
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#32617D" />
                <FixedText style={styles.loadingText}>Loading Profiles...</FixedText>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* HEADER */}
                <View style={styles.header}>
                    <View>
                        <FixedText style={styles.eyebrow}>Family Health</FixedText>
                        <FixedText style={styles.title}>Family Profiles</FixedText>
                        <FixedText style={styles.subtitle}>Manage health records for yourself and your loved ones.</FixedText>
                    </View>
                    <View style={styles.headerIconWrapper}>
                        <MaterialIcons name="person" size={28} color="#32617D" />
                    </View>
                </View>

                {/* STATS OVERVIEW - Updated to fit on one screen */}
                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <FixedText style={styles.statLabel} numberOfLines={1}>Members</FixedText>
                        <FixedText style={styles.statValue}>{profiles.length}</FixedText>
                    </View>
                    <View style={styles.statCard}>
                        <FixedText style={styles.statLabel} numberOfLines={1}>Records</FixedText>
                        <FixedText style={styles.statValue}>0</FixedText>
                    </View>
                    <View style={[styles.statCard, { marginRight: 0 }]}>
                        <FixedText style={styles.statLabel} numberOfLines={1}>Active</FixedText>
                        <FixedText style={styles.statValue} numberOfLines={1}>
                            {activeProfile?.relationship || "-"}
                        </FixedText>
                    </View>
                </View>

                {/* ACTIVE PROFILE CARD */}
                <View style={styles.activeProfileCard}>
                    <View style={styles.activeProfileHeader}>
                        <View style={styles.avatarLarge}>
                            <FixedText style={styles.avatarLargeText}>{getInitials(activeProfile?.fullName || "")}</FixedText>
                        </View>
                        <View style={styles.activeProfileInfo}>
                            <FixedText style={styles.activeProfileEyebrow}>Active Profile</FixedText>
                            <FixedText style={styles.activeProfileName}>{activeProfile?.fullName || "Profile"}</FixedText>
                            <FixedText style={styles.activeProfileDetails}>
                                {activeProfile?.relationship || "-"} • {activeProfile?.bloodGroup || "-"} • {activeProfile?.age || "-"}
                            </FixedText>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.switchButton} onPress={() => setShowProfileSwitcher(true)}>
                        <FixedText style={styles.switchButtonText}>Switch Profile</FixedText>
                        <MaterialIcons name="chevron-right" size={20} color="#32617D" />
                    </TouchableOpacity>
                </View>

                {/* PROFILES GRID */}
                <View style={styles.sectionHeader}>
                    <View style={styles.sectionTitleWrapper}>
                        <FixedText style={styles.sectionTitle}>Managed Profiles</FixedText>
                        <FixedText style={styles.sectionSubtitle}>Switch between family members and manage their health.</FixedText>
                    </View>
                </View>

                {profiles.map((profile) => (
                    <View key={profile.id} style={styles.profileCard}>
                        <View style={styles.profileCardHeader}>
                            <View style={styles.profileCardLeft}>
                                <View style={styles.avatarSmall}>
                                    <FixedText style={styles.avatarSmallText}>{getInitials(profile.fullName)}</FixedText>
                                </View>
                                <View style={styles.profileCardNameWrapper}>
                                    <FixedText style={styles.profileCardName}>{profile.fullName}</FixedText>
                                    <View style={styles.profileCardRoleRow}>
                                        <FixedText style={styles.profileCardRole}>{profile.relationship}</FixedText>
                                        {activeProfile?.id === profile.id && (
                                            <View style={styles.activeBadge}>
                                                <FixedText style={styles.activeBadgeText}>Active</FixedText>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </View>
                            <View style={styles.actionButtons}>
                                <TouchableOpacity onPress={() => openEditModal(profile)} style={styles.iconButton}>
                                    <MaterialIcons name="edit" size={20} color="#5C5F60" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleDeleteProfile(profile.id)} style={styles.iconButton}>
                                    <MaterialIcons name="delete-outline" size={20} color="#EF4444" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.profileCardStats}>
                            <View style={styles.statBox}>
                                <FixedText style={styles.statBoxLabel}>Age</FixedText>
                                <FixedText style={styles.statBoxValue}>{profile.age}</FixedText>
                            </View>
                            <View style={styles.statBox}>
                                <FixedText style={styles.statBoxLabel}>Blood Group</FixedText>
                                <FixedText style={styles.statBoxValue}>{profile.bloodGroup}</FixedText>
                            </View>
                        </View>
                    </View>
                ))}

                {/* ADD PROFILE BUTTON */}
                <TouchableOpacity
                    style={styles.addCard}
                    onPress={() => {
                        closeModal();
                        setShowAddModal(true);
                    }}
                >
                    <View style={styles.addIconWrapper}>
                        <MaterialIcons name="add" size={28} color="#32617D" />
                    </View>
                    <FixedText style={styles.addCardTitle}>Add Family Member</FixedText>
                    <FixedText style={styles.addCardDesc}>
                        Create a profile for parents, spouse, children, or other family members.
                    </FixedText>
                </TouchableOpacity>

            </ScrollView>

            {/* ======================================================== */}
            {/* 🟢 FULL-SCREEN MODAL FOR ADD / EDIT FORM                 */}
            {/* ======================================================== */}
            <Modal visible={showAddModal} animationType="slide" transparent={false} onRequestClose={closeModal}>
                <SafeAreaView style={styles.modalSafeArea}>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>

                        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                            <View style={{ flex: 1, position: 'relative' }}>

                                {/* Form Content */}
                                <ScrollView contentContainerStyle={styles.setupFormContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                                    {/* Contextual Header */}
                                    <View style={styles.setupHeader}>
                                        <FixedText style={styles.setupTitle}>
                                            {editingProfileId ? "Edit Profile" : "Add Family Member"}
                                        </FixedText>
                                        <FixedText style={styles.setupSubtitle}>
                                            {editingProfileId
                                                ? "Update profile details to keep information current."
                                                : "Create a new health profile for your loved one."}
                                        </FixedText>
                                    </View>

                                    {/* Profile Picture Upload */}
                                    <View style={styles.photoUploadContainer}>
                                        <TouchableOpacity style={styles.photoCircle}>
                                            <MaterialIcons name="add-a-photo" size={32} color="#32617D" />
                                            <View style={styles.photoBadge}>
                                                <MaterialIcons name="person" size={16} color="#71787e" />
                                            </View>
                                        </TouchableOpacity>
                                        <FixedText style={styles.photoLabel}>Profile Photo (Optional)</FixedText>
                                    </View>

                                    <View style={styles.divider} />

                                    {/* --- INPUT FIELDS --- */}
                                    <View style={styles.inputsWrapper}>

                                        {/* Full Name */}
                                        <View style={styles.inputGroup}>
                                            <FixedText style={styles.inputLabel}>Legal Full Name</FixedText>
                                            <View style={styles.inputBox}>
                                                <MaterialIcons name="badge" size={20} color="#71787e" style={styles.inputIcon} />
                                                <TextInput
                                                    style={styles.inputText}
                                                    placeholder="e.g. Jane Doe"
                                                    placeholderTextColor="#71787e"
                                                    value={fullName}
                                                    onChangeText={setFullName}
                                                />
                                            </View>
                                        </View>

                                        {/* Grid: DOB & Gender */}
                                        <View style={styles.inputRow}>
                                            <View style={styles.inputColLeft}>
                                                <FixedText style={styles.inputLabel}>Date of Birth</FixedText>
                                                <View style={styles.inputBox}>
                                                    <MaterialIcons name="calendar-today" size={16} color="#71787e" style={styles.inputIcon} />
                                                    <TextInput
                                                        style={styles.inputText}
                                                        placeholder="DD/MM/YYYY"
                                                        placeholderTextColor="#71787e"
                                                        value={dob}
                                                        onChangeText={handleDateChange}
                                                        keyboardType="number-pad"
                                                        maxLength={10}
                                                    />
                                                </View>
                                            </View>

                                            <View style={styles.inputColRight}>
                                                <FixedText style={styles.inputLabel}>Gender</FixedText>
                                                <TouchableOpacity
                                                    style={styles.inputBox}
                                                    activeOpacity={0.7}
                                                    onPress={() => openSelect("Select Gender", [
                                                        { label: 'Male', value: 'Male' },
                                                        { label: 'Female', value: 'Female' },
                                                        { label: 'Other', value: 'Other' }
                                                    ], setGender)}
                                                >
                                                    <MaterialIcons name="wc" size={18} color="#71787e" style={styles.inputIcon} />
                                                    <FixedText numberOfLines={1} style={[styles.dropdownText, !gender && { color: '#71787e' }]}>
                                                        {gender || "Select"}
                                                    </FixedText>
                                                    <MaterialIcons name="expand-more" size={18} color="#71787e" style={styles.rightIcon} />
                                                </TouchableOpacity>
                                            </View>
                                        </View>

                                        {/* Relationship */}
                                        <View style={styles.inputGroup}>
                                            <FixedText style={styles.inputLabel}>Relationship</FixedText>
                                            <TouchableOpacity
                                                style={styles.inputBox}
                                                activeOpacity={0.7}
                                                onPress={() => openSelect("Select Relationship", [
                                                    { label: 'Self', value: 'Self' },
                                                    { label: 'Spouse', value: 'Spouse' },
                                                    { label: 'Mother', value: 'Mother' },
                                                    { label: 'Father', value: 'Father' },
                                                    { label: 'Child', value: 'Child' },
                                                    { label: 'Other', value: 'Other' },
                                                ], setRelationship)}
                                            >
                                                <MaterialIcons name="group" size={20} color="#71787e" style={styles.inputIcon} />
                                                <FixedText numberOfLines={1} style={[styles.dropdownText, !relationship && { color: '#71787e' }]}>
                                                    {relationship || "Select relationship"}
                                                </FixedText>
                                                <MaterialIcons name="expand-more" size={18} color="#71787e" style={styles.rightIcon} />
                                            </TouchableOpacity>
                                        </View>

                                        {/* Blood Group */}
                                        <View style={styles.inputGroup}>
                                            <FixedText style={styles.inputLabel}>Blood Group</FixedText>
                                            <TouchableOpacity
                                                style={styles.inputBox}
                                                activeOpacity={0.7}
                                                onPress={() => openSelect("Select Blood Group", [
                                                    { label: 'A+', value: 'A+' }, { label: 'A-', value: 'A-' },
                                                    { label: 'B+', value: 'B+' }, { label: 'B-', value: 'B-' },
                                                    { label: 'AB+', value: 'AB+' }, { label: 'AB-', value: 'AB-' },
                                                    { label: 'O+', value: 'O+' }, { label: 'O-', value: 'O-' },
                                                ], setBloodGroup)}
                                            >
                                                <MaterialIcons name="bloodtype" size={20} color="#71787e" style={styles.inputIcon} />
                                                <FixedText numberOfLines={1} style={[styles.dropdownText, !bloodGroup && { color: '#71787e' }]}>
                                                    {bloodGroup || "Select option"}
                                                </FixedText>
                                                <MaterialIcons name="expand-more" size={18} color="#71787e" style={styles.rightIcon} />
                                            </TouchableOpacity>
                                        </View>

                                        {/* Terms Checkbox */}
                                        <TouchableOpacity
                                            style={styles.checkboxRow}
                                            activeOpacity={0.7}
                                            onPress={() => {
                                                Keyboard.dismiss();
                                                setTermsAccepted(!termsAccepted);
                                            }}
                                        >
                                            <View style={[styles.checkbox, termsAccepted && styles.checkboxActive]}>
                                                {termsAccepted && <MaterialIcons name="check" size={14} color="#FFFFFF" />}
                                            </View>
                                            <FixedText style={styles.checkboxText}>
                                                I agree to the privacy policy and terms of service
                                            </FixedText>
                                        </TouchableOpacity>

                                    </View>

                                    {/* Action Area */}
                                    <View style={styles.actionArea}>
                                        <View style={styles.actionRow}>
                                            <TouchableOpacity style={styles.cancelBtn} onPress={closeModal}>
                                                <FixedText style={styles.cancelBtnText}>Cancel</FixedText>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={styles.submitBtn} onPress={handleSaveProfile}>
                                                <FixedText style={styles.submitBtnText}>
                                                    {editingProfileId ? "Update Profile" : "Create Profile"}
                                                </FixedText>
                                            </TouchableOpacity>
                                        </View>

                                        <View style={styles.secureTextRow}>
                                            <MaterialIcons name="lock" size={14} color="#71787e" />
                                            <FixedText style={styles.secureText}>Your data is encrypted and securely stored.</FixedText>
                                        </View>
                                    </View>

                                </ScrollView>

                                {/* 🔴 SECURE INLINE DROPDOWN OVERLAY (Top Z-Index, Independent Layer) */}
                                {dropdownState.visible && (
                                    <View style={styles.dropdownOverlay}>
                                        {/* Background Tap to Close */}
                                        <TouchableOpacity
                                            style={styles.dropdownOutsideTap}
                                            activeOpacity={1}
                                            onPress={() => setDropdownState({ ...dropdownState, visible: false })}
                                        />

                                        {/* Menu Panel */}
                                        <View style={styles.dropdownContainer}>
                                            <View style={styles.dropdownHeader}>
                                                <FixedText style={styles.dropdownTitle}>{dropdownState.title}</FixedText>
                                                <TouchableOpacity onPress={() => setDropdownState({ ...dropdownState, visible: false })}>
                                                    <MaterialIcons name="close" size={24} color="#0b1c30" />
                                                </TouchableOpacity>
                                            </View>

                                            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                                                {dropdownState.options.map((opt, idx) => (
                                                    <TouchableOpacity
                                                        key={idx}
                                                        style={styles.dropdownItem}
                                                        onPress={() => {
                                                            dropdownState.onSelect(opt.value);
                                                            setDropdownState({ ...dropdownState, visible: false });
                                                        }}
                                                    >
                                                        <FixedText style={styles.dropdownItemText}>{opt.label}</FixedText>
                                                    </TouchableOpacity>
                                                ))}
                                            </ScrollView>
                                        </View>
                                    </View>
                                )}

                            </View>
                        </TouchableWithoutFeedback>

                    </KeyboardAvoidingView>
                </SafeAreaView>
            </Modal>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F8F9FF' },
    container: { flex: 1 },
    scrollContent: { padding: 20, paddingBottom: 40 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FF' },
    loadingText: { marginTop: 12, color: '#5C5F60', fontSize: 14, fontWeight: '500' },

    // Header & Overview Stats
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, marginTop: Platform.OS === 'android' ? 20 : 0 },
    eyebrow: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, color: '#32617D' },
    title: { fontSize: 28, fontWeight: '800', color: '#1E293B', marginTop: 4 },
    subtitle: { fontSize: 13, color: '#64748B', marginTop: 4, maxWidth: '85%' },
    headerIconWrapper: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },

    // UPDATED: Stats section changed to a row layout that shares width equally
    statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
    statCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 12, marginRight: 8, borderWidth: 1, borderColor: '#E2E8F0' },
    statLabel: { fontSize: 11, color: '#64748B', fontWeight: '500' },
    statValue: { fontSize: 20, fontWeight: '700', color: '#1E293B', marginTop: 6 },

    // Cards
    activeProfileCard: { backgroundColor: '#E6EFF5', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#D6E6F2', marginBottom: 32 },
    activeProfileHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    avatarLarge: { width: 64, height: 64, borderRadius: 18, backgroundColor: '#32617D', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    avatarLargeText: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
    activeProfileInfo: { flex: 1 },
    activeProfileEyebrow: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', color: '#32617D', letterSpacing: 0.5 },
    activeProfileName: { fontSize: 22, fontWeight: '700', color: '#1E293B', marginTop: 2 },
    activeProfileDetails: { fontSize: 13, color: '#475569', marginTop: 4 },
    switchButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D6E6F2', borderRadius: 16, paddingVertical: 12 },
    switchButtonText: { fontSize: 14, fontWeight: '600', color: '#32617D', marginRight: 4 },

    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitleWrapper: { flex: 1 },
    sectionTitle: { fontSize: 20, fontWeight: '700', color: '#1E293B' },
    sectionSubtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },

    profileCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16 },
    profileCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    profileCardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    avatarSmall: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#E6EFF5', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    avatarSmallText: { color: '#32617D', fontSize: 14, fontWeight: '700' },
    profileCardNameWrapper: { flex: 1 },
    profileCardName: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
    profileCardRoleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
    profileCardRole: { fontSize: 13, color: '#64748B', textTransform: 'capitalize' },
    activeBadge: { backgroundColor: '#32617D', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, marginLeft: 8 },
    activeBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
    actionButtons: { flexDirection: 'row' },
    iconButton: { padding: 6, marginLeft: 4 },
    profileCardStats: { flexDirection: 'row', marginTop: 16 },
    statBox: { flex: 1, backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12, marginRight: 12 },
    statBoxLabel: { fontSize: 11, color: '#64748B' },
    statBoxValue: { fontSize: 14, fontWeight: '600', color: '#1E293B', marginTop: 4 },

    addCard: { backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#CBD5E1', borderStyle: 'dashed', borderRadius: 24, padding: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
    addIconWrapper: { width: 56, height: 56, borderRadius: 16, backgroundColor: '#E6EFF5', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    addCardTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
    addCardDesc: { fontSize: 13, color: '#64748B', textAlign: 'center', marginTop: 8, lineHeight: 18 },

    // --- FULL SCREEN MODAL FORM STYLES ---
    modalSafeArea: { flex: 1, backgroundColor: '#F8F9FF' },
    setupFormContent: { paddingHorizontal: 20, paddingTop: 32, paddingBottom: 60 },

    setupHeader: { alignItems: 'center', marginBottom: 24, width: '100%' },
    setupTitle: { fontSize: 26, fontWeight: '700', color: '#0b1c30', marginBottom: 8 },
    setupSubtitle: { fontSize: 14, color: '#41484d', textAlign: 'center' },

    photoUploadContainer: { alignItems: 'center', marginBottom: 24 },
    photoCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#e5eeff', borderWidth: 1, borderColor: '#c1c7cd', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    photoBadge: { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, backgroundColor: '#ffffff', borderRadius: 14, borderWidth: 1, borderColor: '#c1c7cd', alignItems: 'center', justifyContent: 'center', elevation: 2 },
    photoLabel: { fontSize: 12, fontWeight: '500', color: '#41484d', textTransform: 'uppercase', letterSpacing: 0.5 },

    divider: { height: 1, backgroundColor: 'rgba(193, 199, 205, 0.2)', width: '100%', marginBottom: 20 },

    inputsWrapper: { width: '100%' },

    inputGroup: { marginBottom: 16, width: '100%' },
    inputLabel: { fontSize: 12, fontWeight: '500', color: '#0b1c30', marginBottom: 8 },

    // Tightly controlled layout for Inputs/Dropdowns
    inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#c1c7cd', borderRadius: 8, height: 50, paddingHorizontal: 12 },
    inputIcon: { marginRight: 10 },
    inputText: { flex: 1, fontSize: 14, color: '#0b1c30', height: '100%', padding: 0 },
    dropdownText: { flex: 1, fontSize: 14, color: '#0b1c30', paddingRight: 4 },
    rightIcon: { marginLeft: 'auto' },

    // Precise 50/50 Columns
    inputRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginBottom: 16 },
    inputColLeft: { flex: 1, marginRight: 8 },
    inputColRight: { flex: 1, marginLeft: 8 },

    // Checkbox explicitly sized
    checkboxRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, paddingRight: 10, paddingVertical: 8 },
    checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: '#c1c7cd', backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    checkboxActive: { backgroundColor: '#32617D', borderColor: '#32617D' },
    checkboxText: { fontSize: 14, color: '#41484d', flex: 1 },

    // Footer Actions
    actionArea: { width: '100%', marginTop: 32 },
    actionRow: { flexDirection: 'row', gap: 12, width: '100%' },
    cancelBtn: { flex: 1, backgroundColor: '#dce9ff', height: 52, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    cancelBtnText: { fontSize: 15, fontWeight: '600', color: '#0b1c30' },
    submitBtn: { flex: 1.5, backgroundColor: '#32617D', height: 52, borderRadius: 8, alignItems: 'center', justifyContent: 'center', elevation: 2 },
    submitBtnText: { fontSize: 15, fontWeight: '600', color: '#ffffff' },
    secureTextRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 16, gap: 6 },
    secureText: { fontSize: 12, color: '#71787e' },

    // --- SAFE ABSOLUTE DROPDOWN LAYER (Top Z-Index) ---
    dropdownOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end', zIndex: 1000, elevation: 1000 },
    dropdownOutsideTap: { ...StyleSheet.absoluteFillObject },
    dropdownContainer: { backgroundColor: '#ffffff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 24, paddingTop: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24, maxHeight: '55%' },
    dropdownHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    dropdownTitle: { fontSize: 18, fontWeight: '700', color: '#0b1c30' },
    dropdownItem: { paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    dropdownItemText: { fontSize: 16, color: '#0b1c30' },
});