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
    Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

// --- Accessibility Lock (Overrides system text scaling to prevent layout breaks) ---
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
    const [saving, setSaving] = useState(false);

    // Calculate Age from DD/MM/YYYY
    const calculateAge = (dobString: string) => {
        if (!dobString || dobString.length !== 10) return '-';
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

    // Format ISO Date from API to DD/MM/YYYY
    const formatApiDateToLocal = (apiDateString: string) => {
        if (!apiDateString) return "";
        const dateObj = new Date(apiDateString);
        if (isNaN(dateObj.getTime())) return "";
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const fetchProfiles = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('token');
            if (!token) return;

            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/profiles`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                
                const formattedProfiles = data.map((p: any) => {
                    const localDob = formatApiDateToLocal(p.dob);
                    return {
                        ...p,
                        dob: localDob,
                        age: localDob ? calculateAge(localDob) : '-'
                    };
                });

                setProfiles(formattedProfiles);

                const savedProfileStr = await AsyncStorage.getItem("active_profile");
                if (savedProfileStr) {
                    try { 
                        const savedProfile = JSON.parse(savedProfileStr);
                        // Make sure the saved profile is still in the fetched list
                        const matched = formattedProfiles.find((p: any) => p.id === savedProfile.id);
                        if (matched) {
                            setActiveProfile(matched);
                        } else if (formattedProfiles.length > 0) {
                            setActiveProfile(formattedProfiles[0]);
                        }
                    } catch {}
                } else if (formattedProfiles.length > 0) {
                    setActiveProfile(formattedProfiles[0]);
                }
            }
        } catch (error) {
            console.error("Error fetching profiles:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfiles();
    }, []);

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

    const handleSaveProfile = async () => {
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

        setSaving(true);
        try {
            const token = await AsyncStorage.getItem('token');
            const [day, month, year] = dob.split('/');
            const apiDate = `${year}-${month}-${day}`;

            const payload = {
                fullName,
                dob: apiDate,
                gender: gender.toLowerCase(),
                relationship: relationship.toLowerCase(),
                bloodGroup,
            };

            const url = editingProfileId 
                ? `${process.env.EXPO_PUBLIC_API_URL}/profiles/${editingProfileId}`
                : `${process.env.EXPO_PUBLIC_API_URL}/profiles`;
                
            const method = editingProfileId ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                await fetchProfiles();
                closeModal();
            } else {
                const err = await response.json();
                Alert.alert("Error", err.message || "Failed to save profile");
            }
        } catch (error: any) {
            Alert.alert("Error", "Something went wrong while saving profile.");
        } finally {
            setSaving(false);
        }
    };

    const confirmDeleteProfile = (id: string, name: string) => {
        Alert.alert(
            "Delete Profile",
            `Are you sure you want to delete ${name}'s profile?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => handleDeleteProfile(id)
                }
            ]
        );
    };

    const handleDeleteProfile = async (id: string) => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/profiles/${id}`, {
                method: "DELETE",
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setProfiles((prev) => prev.filter((p) => p.id !== id));
                if (activeProfile?.id === id) {
                    const remaining = profiles.filter((p) => p.id !== id);
                    const newActive = remaining.length > 0 ? remaining[0] : null;
                    setActiveProfile(newActive);
                    if (newActive) {
                        AsyncStorage.setItem("active_profile", JSON.stringify(newActive));
                    } else {
                        AsyncStorage.removeItem("active_profile");
                    }
                }
            } else {
                Alert.alert("Error", "Failed to delete profile.");
            }
        } catch (error) {
            Alert.alert("Error", "Something went wrong.");
        }
    };

    const handleSwitchProfile = (profile: Profile) => {
        setActiveProfile(profile);
        AsyncStorage.setItem("active_profile", JSON.stringify(profile));
        setShowProfileSwitcher(false);
    };

    const openEditModal = (profile: Profile) => {
        setEditingProfileId(profile.id);
        setFullName(profile.fullName);
        setDob(profile.dob);
        
        // Capitalize for dropdown matching
        setGender(profile.gender ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) : "");
        setRelationship(profile.relationship ? profile.relationship.charAt(0).toUpperCase() + profile.relationship.slice(1) : "");
        setBloodGroup(profile.bloodGroup || "");
        
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
                    <View style={{ flex: 1 }}>
                        <FixedText style={styles.eyebrow}>FAMILY HEALTH</FixedText>
                        <FixedText style={styles.title}>Family Profiles</FixedText>
                    </View>
                    <TouchableOpacity style={styles.headerIconWrapper}>
                        <MaterialIcons name="person" size={24} color="#0b1c30" />
                    </TouchableOpacity>
                </View>
                <FixedText style={styles.subtitle}>Manage health records for yourself and your loved ones.</FixedText>

                {/* STATS OVERVIEW */}
                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <FixedText style={styles.statLabel} numberOfLines={1}>Family Members</FixedText>
                        <FixedText style={styles.statValue}>{profiles.length}</FixedText>
                    </View>
                    <View style={styles.statCard}>
                        <FixedText style={styles.statLabel} numberOfLines={1}>Total Records</FixedText>
                        <FixedText style={styles.statValue}>0</FixedText>
                    </View>
                    <View style={[styles.statCard, { marginRight: 0 }]}>
                        <FixedText style={styles.statLabel} numberOfLines={1}>Active Profile</FixedText>
                        <FixedText style={styles.statValue} numberOfLines={1}>
                            {activeProfile?.relationship || "-"}
                        </FixedText>
                    </View>
                </View>

                {/* ACTIVE PROFILE CARD */}
                <View style={styles.activeProfileCard}>
                    <View style={styles.activeProfileLeft}>
                        <View style={styles.avatarBox}>
                            <FixedText style={styles.avatarBoxText}>{getInitials(activeProfile?.fullName || "")}</FixedText>
                        </View>
                        <View style={styles.activeProfileInfo}>
                            <FixedText style={styles.activeProfileEyebrow}>ACTIVE PROFILE</FixedText>
                            <FixedText style={styles.activeProfileName}>{activeProfile?.fullName || "Profile"}</FixedText>
                            <FixedText style={styles.activeProfileDetails}>
                                {activeProfile?.relationship || "-"} • {activeProfile?.bloodGroup || "-"} • {activeProfile?.age || "-"}
                            </FixedText>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.switchButton} onPress={() => setShowProfileSwitcher(true)}>
                        <FixedText style={styles.switchButtonText}>Switch Profile</FixedText>
                        <MaterialIcons name="chevron-right" size={18} color="#0b1c30" />
                    </TouchableOpacity>
                </View>

                {/* MANAGED PROFILES SECTION */}
                <View style={styles.sectionHeader}>
                    <View style={styles.sectionTitleWrapper}>
                        <FixedText style={styles.sectionTitle}>Managed Profiles</FixedText>
                        <FixedText style={styles.sectionSubtitle}>Switch between family members and manage their health records.</FixedText>
                    </View>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => {
                            closeModal();
                            setShowAddModal(true);
                        }}
                    >
                        <MaterialIcons name="add" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
                        <FixedText style={styles.addButtonText}>Add</FixedText>
                    </TouchableOpacity>
                </View>

                <View style={styles.profilesList}>
                    {profiles.map((profile) => (
                        <View key={profile.id} style={styles.profileCard}>
                            {/* Card Header */}
                            <View style={styles.profileCardHeader}>
                                <View style={styles.profileCardLeft}>
                                    <View style={styles.avatarCircle}>
                                        <FixedText style={styles.avatarCircleText}>{getInitials(profile.fullName)}</FixedText>
                                    </View>
                                    <View style={styles.profileCardNameWrapper}>
                                        <FixedText style={styles.profileCardName}>{profile.fullName}</FixedText>
                                        <View style={styles.profileCardRoleRow}>
                                            <FixedText style={styles.profileCardRole}>{profile.relationship}</FixedText>
                                            {activeProfile?.id === profile.id && (
                                                <View style={styles.activeBadge}>
                                                    <FixedText style={styles.activeBadgeText}>ACTIVE</FixedText>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                </View>
                                <View style={styles.actionButtons}>
                                    <TouchableOpacity onPress={() => openEditModal(profile)} style={styles.iconButton}>
                                        <MaterialIcons name="edit" size={18} color="#41484d" />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => confirmDeleteProfile(profile.id, profile.fullName)} style={[styles.iconButton, { backgroundColor: '#ffdad6' }]}>
                                        <MaterialIcons name="delete" size={18} color="#ba1a1a" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Card Stats Grid */}
                            <View style={styles.profileCardStatsGrid}>
                                <View style={styles.statBoxLight}>
                                    <FixedText style={styles.statBoxLabel}>Age</FixedText>
                                    <FixedText style={styles.statBoxValue}>{profile.age}</FixedText>
                                </View>
                                <View style={styles.statBoxLight}>
                                    <FixedText style={styles.statBoxLabel}>Blood Group</FixedText>
                                    <FixedText style={styles.statBoxValue}>{profile.bloodGroup}</FixedText>
                                </View>
                            </View>

                            {/* Card Footer */}
                            <View style={styles.recordsBox}>
                                <MaterialIcons name="description" size={16} color="#41484d" />
                                <FixedText style={styles.recordsText}>0 Records</FixedText>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* --- PROFILE SWITCHER DROPDOWN OVERLAY --- */}
            {showProfileSwitcher && (
                <View style={styles.dropdownOverlay}>
                    <TouchableOpacity
                        style={styles.dropdownOutsideTap}
                        activeOpacity={1}
                        onPress={() => setShowProfileSwitcher(false)}
                    />
                    <View style={styles.dropdownContainer}>
                        <View style={styles.dropdownHeader}>
                            <FixedText style={styles.dropdownTitle}>Select Profile</FixedText>
                            <TouchableOpacity onPress={() => setShowProfileSwitcher(false)}>
                                <MaterialIcons name="close" size={24} color="#0b1c30" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                            {profiles.map((profile) => (
                                <TouchableOpacity
                                    key={profile.id}
                                    style={[styles.dropdownItem, activeProfile?.id === profile.id && { backgroundColor: '#f1f5f9' }]}
                                    onPress={() => handleSwitchProfile(profile)}
                                >
                                    <FixedText style={[styles.dropdownItemText, activeProfile?.id === profile.id && { fontWeight: '700' }]}>
                                        {profile.fullName} • {profile.relationship}
                                    </FixedText>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            )}

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
                                            <TouchableOpacity style={styles.cancelBtn} onPress={closeModal} disabled={saving}>
                                                <FixedText style={styles.cancelBtnText}>Cancel</FixedText>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={[styles.submitBtn, saving && { opacity: 0.7 }]} onPress={handleSaveProfile} disabled={saving}>
                                                {saving ? (
                                                    <ActivityIndicator size="small" color="#ffffff" />
                                                ) : (
                                                    <FixedText style={styles.submitBtnText}>
                                                        {editingProfileId ? "Update Profile" : "Create Profile"}
                                                    </FixedText>
                                                )}
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
    safeArea: { flex: 1, backgroundColor: '#f8f9ff' },
    container: { flex: 1 },
    scrollContent: { padding: 16, paddingBottom: 40 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9ff' },
    loadingText: { marginTop: 12, color: '#41484d', fontSize: 14, fontWeight: '500' },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: Platform.OS === 'android' ? 20 : 8 },
    eyebrow: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, color: '#32617d', marginBottom: 4 },
    title: { fontSize: 28, fontWeight: '700', color: '#0b1c30', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
    subtitle: { fontSize: 14, color: '#41484d', marginTop: 8, marginBottom: 24, lineHeight: 20 },
    headerIconWrapper: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(193, 199, 205, 0.3)', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' },

    statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
    statCard: { flex: 1, backgroundColor: '#ffffff', borderRadius: 8, padding: 16, marginRight: 12, borderWidth: 1, borderColor: 'rgba(193, 199, 205, 0.3)', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2, justifyContent: 'center' },
    statLabel: { fontSize: 11, color: '#41484d', fontWeight: '500', marginBottom: 8 },
    statValue: { fontSize: 24, fontWeight: '700', color: '#0b1c30' },

    activeProfileCard: { backgroundColor: '#ffffff', borderRadius: 8, padding: 16, paddingVertical: 24, borderWidth: 1, borderColor: 'rgba(193, 199, 205, 0.3)', marginBottom: 32, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    activeProfileLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    avatarBox: { width: 48, height: 48, borderRadius: 4, backgroundColor: '#32617d', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    avatarBoxText: { color: '#ffffff', fontSize: 24, fontWeight: '700' },
    activeProfileInfo: { flex: 1 },
    activeProfileEyebrow: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', color: '#32617d', letterSpacing: 0.5, marginBottom: 4 },
    activeProfileName: { fontSize: 20, fontWeight: '600', color: '#0b1c30', marginBottom: 4 },
    activeProfileDetails: { fontSize: 12, fontWeight: '500', color: '#41484d' },
    switchButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff', borderWidth: 1, borderColor: 'rgba(193, 199, 205, 0.5)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
    switchButtonText: { fontSize: 11, fontWeight: '600', color: '#0b1c30', marginRight: 2 },

    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
    sectionTitleWrapper: { flex: 1, paddingRight: 16 },
    sectionTitle: { fontSize: 20, fontWeight: '700', color: '#0b1c30', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', marginBottom: 4 },
    sectionSubtitle: { fontSize: 14, color: '#41484d', lineHeight: 20 },
    addButton: { backgroundColor: '#32617d', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8, flexDirection: 'row', alignItems: 'center' },
    addButtonText: { color: '#ffffff', fontSize: 12, fontWeight: '600' },

    profilesList: { flexDirection: 'column', gap: 16 },
    profileCard: { backgroundColor: '#ffffff', borderRadius: 8, padding: 16, borderWidth: 1, borderColor: 'rgba(193, 199, 205, 0.3)', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2 },
    profileCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
    profileCardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    avatarCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e5eeff', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    avatarCircleText: { color: '#32617d', fontSize: 14, fontWeight: '700' },
    profileCardNameWrapper: { flex: 1 },
    profileCardName: { fontSize: 14, fontWeight: '700', color: '#0b1c30' },
    profileCardRoleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
    profileCardRole: { fontSize: 12, color: '#41484d', fontWeight: '500' },
    activeBadge: { backgroundColor: '#32617d', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, marginLeft: 8 },
    activeBadgeText: { color: '#ffffff', fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
    actionButtons: { flexDirection: 'row', gap: 8 },
    iconButton: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9ff' },

    profileCardStatsGrid: { flexDirection: 'row', gap: 12, marginBottom: 12 },
    statBoxLight: { flex: 1, backgroundColor: '#eff4ff', borderRadius: 6, padding: 12 },
    statBoxLabel: { fontSize: 11, color: '#41484d', fontWeight: '500', marginBottom: 4 },
    statBoxValue: { fontSize: 14, fontWeight: '700', color: '#0b1c30' },

    recordsBox: { backgroundColor: '#eff4ff', borderRadius: 6, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
    recordsText: { fontSize: 14, color: '#41484d', fontWeight: '500' },

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

    inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#c1c7cd', borderRadius: 8, height: 50, paddingHorizontal: 12 },
    inputIcon: { marginRight: 10 },
    inputText: { flex: 1, fontSize: 14, color: '#0b1c30', height: '100%', padding: 0 },
    dropdownText: { flex: 1, fontSize: 14, color: '#0b1c30', paddingRight: 4 },
    rightIcon: { marginLeft: 'auto' },

    inputRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginBottom: 16 },
    inputColLeft: { flex: 1, marginRight: 8 },
    inputColRight: { flex: 1, marginLeft: 8 },

    checkboxRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, paddingRight: 10, paddingVertical: 8 },
    checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: '#c1c7cd', backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    checkboxActive: { backgroundColor: '#32617D', borderColor: '#32617D' },
    checkboxText: { fontSize: 14, color: '#41484d', flex: 1 },

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