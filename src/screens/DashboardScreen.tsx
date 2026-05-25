import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Platform,
    Modal,
    ActivityIndicator
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Custom Text component to enforce font scaling lock and prevent UI misalignment
const FixedText = (props: any) => (
    <Text allowFontScaling={false} maxFontSizeMultiplier={1} {...props} />
);

export default function DashboardScreen() {
    const navigation = useNavigation<any>();

    const [profiles, setProfiles] = useState<any[]>([]);
    const [activeProfile, setActiveProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showProfileSwitcher, setShowProfileSwitcher] = useState(false);

    useEffect(() => {
        const fetchProfiles = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                if (!token) return;

                const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/profiles`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setProfiles(data || []);

                    const savedProfile = await AsyncStorage.getItem("active_profile");
                    let parsedSavedProfile: any = null;

                    if (savedProfile) {
                        try {
                            parsedSavedProfile = JSON.parse(savedProfile);
                        } catch {
                            parsedSavedProfile = null;
                        }
                    }

                    const matchedProfile = parsedSavedProfile
                        ? data?.find((p: any) => p.id === parsedSavedProfile.id)
                        : null;

                    if (matchedProfile) {
                        setActiveProfile(matchedProfile);
                        await AsyncStorage.setItem("active_profile", JSON.stringify(matchedProfile));
                    } else if (data?.length > 0) {
                        setActiveProfile(data[0]);
                        await AsyncStorage.setItem("active_profile", JSON.stringify(data[0]));
                    } else {
                        await AsyncStorage.removeItem("active_profile");
                    }
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfiles();
    }, []);

    const handleProfileSelect = async (profile: any) => {
        setActiveProfile(profile);
        await AsyncStorage.setItem("active_profile", JSON.stringify(profile));
        setShowProfileSwitcher(false);
    };

    const getInitials = (name?: string) => {
        if (!name) return "NA";
        return name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
    };

    const initial = getInitials(activeProfile?.fullName);

    if (loading) {
        return (
            <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#32617d" />
                <FixedText style={{ marginTop: 16, color: '#5c5f60' }}>Loading Dashboard...</FixedText>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="dark" />

            {/* Top App Bar */}
            <View style={styles.header}>
                <FixedText style={styles.headerTitle}>Personal Health Lock</FixedText>

                <TouchableOpacity
                    style={styles.headerAvatar}
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate('SettingsProfile')}
                >
                    <FixedText style={styles.headerAvatarText}>{initial}</FixedText>
                </TouchableOpacity>
            </View>

            {/* Main Scrollable Content */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.mainContent}>

                {/* Active Profile Section */}
                <View style={styles.activeProfileSection}>
                    <TouchableOpacity
                        style={styles.activeProfileCard}
                        activeOpacity={0.7}
                        onPress={() => setShowProfileSwitcher(true)}
                    >
                        <View style={styles.activeProfileLeft}>
                            <View style={styles.avatarCircle}>
                                <FixedText style={styles.avatarText}>{initial}</FixedText>
                            </View>
                            <View style={styles.activeProfileInfo}>
                                <View style={styles.nameRow}>
                                    <FixedText style={styles.profileName}>{activeProfile?.fullName || 'Profile'}</FixedText>
                                    <View style={styles.selfPill}>
                                        <FixedText style={styles.selfPillText}>{activeProfile?.relationship || 'Self'}</FixedText>
                                    </View>
                                </View>
                                <View style={styles.bloodGroupRow}>
                                    <MaterialIcons name="bloodtype" size={16} color="#41484d" />
                                    <FixedText style={styles.bloodGroupText}>Blood Group: {activeProfile?.bloodGroup || '-'}</FixedText>
                                </View>
                            </View>
                        </View>
                        <View style={styles.switchProfileBtn}>
                            <FixedText style={styles.switchProfileText}>Switch Profile</FixedText>
                            <MaterialIcons name="expand-more" size={16} color="#32617d" />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Quick Actions */}
                <View style={styles.sectionContainer}>
                    <FixedText style={styles.sectionTitle}>Quick Actions</FixedText>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScrollContent}>
                        <TouchableOpacity style={styles.quickActionCard} activeOpacity={0.7}>
                            <View style={styles.quickActionIconCircle}>
                                <MaterialIcons name="upload-file" size={24} color="#32617d" />
                            </View>
                            <FixedText style={styles.quickActionText}>Upload Record</FixedText>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.quickActionCard} activeOpacity={0.7}>
                            <View style={styles.quickActionIconCircle}>
                                <MaterialIcons name="receipt-long" size={24} color="#32617d" />
                            </View>
                            <FixedText style={styles.quickActionText}>Prescription</FixedText>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.quickActionCard} activeOpacity={0.7}>
                            <View style={styles.quickActionIconCircle}>
                                <MaterialIcons name="biotech" size={24} color="#32617d" />
                            </View>
                            <FixedText style={styles.quickActionText}>Lab Reports</FixedText>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.quickActionCard} activeOpacity={0.7}>
                            <View style={styles.quickActionIconCircle}>
                                <MaterialIcons name="group" size={24} color="#32617d" />
                            </View>
                            <FixedText style={styles.quickActionText}>Family Profiles</FixedText>
                        </TouchableOpacity>
                    </ScrollView>
                </View>

                {/* Recommended Records */}
                <View style={styles.sectionContainer}>
                    <FixedText style={styles.sectionTitleWithSub}>Recommended Records</FixedText>
                    <FixedText style={styles.sectionSubtitle}>Complete your health vault for better medical access.</FixedText>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScrollContent}>
                        <TouchableOpacity style={styles.recCard} activeOpacity={0.7}>
                            <FixedText style={styles.recText}>Add Vaccination Records</FixedText>
                            <View style={styles.recBtn}>
                                <FixedText style={styles.recBtnText}>Add</FixedText>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.recCard} activeOpacity={0.7}>
                            <FixedText style={styles.recText}>Upload Insurance Card</FixedText>
                            <View style={styles.recBtn}>
                                <FixedText style={styles.recBtnText}>Upload</FixedText>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.recCard} activeOpacity={0.7}>
                            <FixedText style={styles.recText}>Link Emergency Contacts</FixedText>
                            <View style={styles.recBtn}>
                                <FixedText style={styles.recBtnText}>Link</FixedText>
                            </View>
                        </TouchableOpacity>
                    </ScrollView>
                </View>

                {/* Recent Uploads */}
                <View style={styles.sectionContainer}>
                    <View style={styles.recentHeaderRow}>
                        <View style={styles.recentTitles}>
                            <FixedText style={styles.recentTitleText}>Recent Uploads</FixedText>
                            <FixedText style={styles.recentSubText}>Your latest uploaded health documents</FixedText>
                        </View>
                        <TouchableOpacity style={styles.viewAllBtn}>
                            <FixedText style={styles.viewAllText}>View All</FixedText>
                            <MaterialIcons name="chevron-right" size={16} color="#32617d" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.recentGrid}>
                        <TouchableOpacity style={styles.recentCard} activeOpacity={0.7}>
                            <View style={styles.recentIconCircle}>
                                <MaterialIcons name="biotech" size={20} color="#32617d" />
                            </View>
                            <FixedText style={styles.recentCardTitle} numberOfLines={1}>CBC Blood Report</FixedText>
                            <FixedText style={styles.recentCardDate}>12 May 2026</FixedText>
                            <View style={styles.recentTagPill}>
                                <FixedText style={styles.recentTagText}>Lab Report</FixedText>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.recentCard} activeOpacity={0.7}>
                            <View style={styles.recentIconCircle}>
                                <MaterialIcons name="description" size={20} color="#32617d" />
                            </View>
                            <FixedText style={styles.recentCardTitle} numberOfLines={1}>Prescription</FixedText>
                            <FixedText style={styles.recentCardDate}>04 May 2026</FixedText>
                            <View style={styles.recentTagPill}>
                                <FixedText style={styles.recentTagText}>Prescription</FixedText>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

            </ScrollView>

            {/* Profile Switcher Modal */}
            <Modal
                visible={showProfileSwitcher}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowProfileSwitcher(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowProfileSwitcher(false)}
                >
                    <View style={styles.modalContent}>
                        <FixedText style={styles.modalHeader}>Select Profile</FixedText>
                        <ScrollView style={styles.modalScroll}>
                            {profiles.map((profile) => (
                                <TouchableOpacity
                                    key={profile.id}
                                    style={[
                                        styles.profileOption,
                                        activeProfile?.id === profile.id && styles.activeProfileOption
                                    ]}
                                    onPress={() => handleProfileSelect(profile)}
                                >
                                    <View style={styles.avatarCircleSmall}>
                                        <FixedText style={styles.avatarTextSmall}>
                                            {getInitials(profile.fullName)}
                                        </FixedText>
                                    </View>
                                    <View style={styles.profileOptionInfo}>
                                        <FixedText style={styles.profileOptionName}>{profile.fullName}</FixedText>
                                        <FixedText style={styles.profileOptionRelation}>{profile.relationship}</FixedText>
                                    </View>
                                    {activeProfile?.id === profile.id && (
                                        <View style={styles.activeBadge}>
                                            <FixedText style={styles.activeBadgeText}>Active</FixedText>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f8f9ff' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 64, backgroundColor: '#f8f9ff', zIndex: 40, marginTop: Platform.OS === 'android' ? 24 : 0 },
    headerTitle: { fontSize: 24, fontWeight: '600', color: '#0b1c30' },
    headerAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#4c7a97', alignItems: 'center', justifyContent: 'center' },
    headerAvatarText: { color: '#ffffff', fontSize: 18, fontWeight: '700' },
    mainContent: { paddingTop: 16, paddingBottom: 40 },
    activeProfileSection: { paddingHorizontal: 16, marginBottom: 32 },
    activeProfileCard: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#c1c7cd', borderRadius: 8, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#5d8aa8', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.08, shadowRadius: 25, elevation: 3 },
    activeProfileLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatarCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#e5eeff', alignItems: 'center', justifyContent: 'center' },
    avatarText: { fontSize: 20, fontWeight: '700', color: '#32617d' },
    activeProfileInfo: { flexDirection: 'column' },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
    profileName: { fontSize: 20, fontWeight: '600', color: '#0b1c30' },
    selfPill: { backgroundColor: '#4c7a97', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 9999 },
    selfPillText: { color: '#fcfcff', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
    bloodGroupRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    bloodGroupText: { fontSize: 12, fontWeight: '500', color: '#41484d' },
    switchProfileBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
    switchProfileText: { fontSize: 12, fontWeight: '600', color: '#32617d' },
    sectionContainer: { marginBottom: 32 },
    sectionTitle: { fontSize: 20, fontWeight: '600', color: '#0b1c30', paddingHorizontal: 16, marginBottom: 16 },
    sectionTitleWithSub: { fontSize: 20, fontWeight: '600', color: '#0b1c30', paddingHorizontal: 16 },
    sectionSubtitle: { fontSize: 12, fontWeight: '500', color: '#41484d', paddingHorizontal: 16, marginTop: 4, marginBottom: 16 },
    horizontalScrollContent: { paddingHorizontal: 16, gap: 16, paddingBottom: 8 },
    quickActionCard: { minWidth: 100, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#c1c7cd', borderRadius: 12, padding: 12, alignItems: 'center', shadowColor: '#5d8aa8', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.08, shadowRadius: 25, elevation: 2 },
    quickActionIconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e5eeff', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    quickActionText: { fontSize: 12, fontWeight: '600', color: '#0b1c30', textAlign: 'center' },
    recCard: { width: 140, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#c1c7cd', borderRadius: 12, padding: 16, alignItems: 'center', justifyContent: 'center', shadowColor: '#5d8aa8', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.08, shadowRadius: 25, elevation: 2 },
    recText: { fontSize: 12, fontWeight: '600', color: '#0b1c30', textAlign: 'center', height: 32, marginBottom: 12 },
    recBtn: { width: '100%', backgroundColor: '#e5eeff', paddingVertical: 8, borderRadius: 9999, alignItems: 'center' },
    recBtnText: { color: '#32617d', fontSize: 12, fontWeight: '600' },
    recentHeaderRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 16 },
    recentTitles: { flex: 1 },
    recentTitleText: { fontSize: 20, fontWeight: '600', color: '#0b1c30' },
    recentSubText: { fontSize: 12, fontWeight: '500', color: '#41484d', marginTop: 4 },
    viewAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
    viewAllText: { fontSize: 12, fontWeight: '600', color: '#32617d' },
    recentGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 16, gap: 12 },
    recentCard: { width: '48%', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#c1c7cd', borderRadius: 12, padding: 12, alignItems: 'center', shadowColor: '#5d8aa8', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.08, shadowRadius: 25, elevation: 2 },
    recentIconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e5eeff', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    recentCardTitle: { fontSize: 12, fontWeight: '600', color: '#0b1c30', textAlign: 'center', marginBottom: 2 },
    recentCardDate: { fontSize: 10, color: '#41484d', marginBottom: 8 },
    recentTagPill: { width: '100%', backgroundColor: '#dce9ff', paddingVertical: 4, borderRadius: 6, alignItems: 'center' },
    recentTagText: { fontSize: 10, fontWeight: '600', color: '#32617d' },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: '85%', maxHeight: '60%', backgroundColor: '#ffffff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 },
    modalHeader: { fontSize: 16, fontWeight: '700', color: '#0b1c30', textTransform: 'uppercase', marginBottom: 16, letterSpacing: 1 },
    modalScroll: { width: '100%' },
    profileOption: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, marginBottom: 8 },
    activeProfileOption: { backgroundColor: '#eef4fa' },
    avatarCircleSmall: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#32617d', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    avatarTextSmall: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
    profileOptionInfo: { flex: 1 },
    profileOptionName: { fontSize: 16, fontWeight: '600', color: '#0b1c30' },
    profileOptionRelation: { fontSize: 12, color: '#5c5f60', marginTop: 2 },
    activeBadge: { backgroundColor: '#32617d', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 9999 },
    activeBadgeText: { color: '#ffffff', fontSize: 10, fontWeight: '600' }
});