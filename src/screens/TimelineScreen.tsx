import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator,
    Modal,
    Platform,
    Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';
import { useFocusEffect } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';

const FixedText = (props: any) => (
    <Text allowFontScaling={false} maxFontSizeMultiplier={1} {...props} />
);

// Helper for caching viewable file
const stableUri = async (uri: string, filename: string): Promise<string> => {
    if (uri.startsWith(FileSystem.cacheDirectory!)) return uri;
    const dest = FileSystem.cacheDirectory + filename;
    const info = await FileSystem.getInfoAsync(dest);
    if (info.exists) await FileSystem.deleteAsync(dest, { idempotent: true });
    await FileSystem.copyAsync({ from: uri, to: dest });
    return dest;
};

// Date Formatters
const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const formatMonth = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
    });
};

// Icon Mapping
const getTimelineIcon = (categoryName?: string) => {
    const name = categoryName?.toLowerCase() || "";
    if (name.includes("prescription")) return { icon: "medication", color: "#3B82F6", bg: "#EFF6FF" }; // blue
    if (name.includes("lab") || name.includes("report")) return { icon: "science", color: "#10B981", bg: "#ECFDF5" }; // emerald
    if (name.includes("radiology") || name.includes("scan") || name.includes("x-ray") || name.includes("mri") || name.includes("ct")) return { icon: "image-search", color: "#8B5CF6", bg: "#F5F3FF" }; // violet
    if (name.includes("insurance")) return { icon: "shield", color: "#F97316", bg: "#FFF7ED" }; // orange
    if (name.includes("bill")) return { icon: "receipt-long", color: "#F59E0B", bg: "#FFFBEB" }; // amber
    if (name.includes("certificate") || name.includes("birth") || name.includes("fitness")) return { icon: "verified", color: "#0EA5E9", bg: "#F0F9FF" }; // sky
    if (name.includes("vaccination")) return { icon: "vaccines", color: "#14B8A6", bg: "#F0FDFA" }; // teal
    if (name.includes("discharge") || name.includes("referral")) return { icon: "medical-services", color: "#6366F1", bg: "#EEF2FF" }; // indigo
    return { icon: "description", color: "#2E5B7B", bg: "#EEF4FA" }; // default theme
};

// --- Constants / Fallbacks ---
const FALLBACK_CATEGORIES = [
    { id: 'cat_1', name: 'Prescription' },
    { id: 'cat_2', name: 'Lab Report' },
    { id: 'cat_3', name: 'Radiology (Report & Film)' },
    { id: 'cat_4', name: 'Referral Letter' },
    { id: 'cat_5', name: 'Discharge Summary' },
    { id: 'cat_6', name: 'Insurance' },
    { id: 'cat_7', name: 'Medical Bills' },
    { id: 'cat_8', name: 'Others' }
];

export default function TimelineScreen() {
    const [records, setRecords] = useState<any[]>([]);
    const [profiles, setProfiles] = useState<any[]>([]);
    const [selectedProfile, setSelectedProfile] = useState<any>(null);
    const [showProfileSwitcher, setShowProfileSwitcher] = useState(false);

    // Category Dropdown State
    const [showCategorySwitcher, setShowCategorySwitcher] = useState(false);
    const [filters, setFilters] = useState<string[]>(["All"]);
    const [selectedFilter, setSelectedFilter] = useState("All");

    const [loading, setLoading] = useState(true);
    const [recordsLoading, setRecordsLoading] = useState(false);

    // Viewer Modal
    const [viewerVisible, setViewerVisible] = useState(false);
    const [viewerUri, setViewerUri] = useState('');
    const [viewerName, setViewerName] = useState('');
    const [viewerMime, setViewerMime] = useState('');

    useFocusEffect(
        useCallback(() => {
            const fetchInitialData = async () => {
                try {
                    const token = await AsyncStorage.getItem('token');
                    if (!token) return;

                    const headers = { 'Authorization': `Bearer ${token}` };

                    const [profRes, catRes] = await Promise.all([
                        fetch(`${process.env.EXPO_PUBLIC_API_URL}/profiles`, { headers }).catch(() => null),
                        fetch(`${process.env.EXPO_PUBLIC_API_URL}/record-categories`, { headers }).catch(() => null)
                    ]);

                    let fetchedProfiles = [];
                    if (profRes && profRes.ok) {
                        fetchedProfiles = await profRes.json();
                        setProfiles(fetchedProfiles || []);

                        const savedProfile = await AsyncStorage.getItem("active_profile");
                        let parsedSavedProfile: any = null;
                        if (savedProfile) {
                            try { parsedSavedProfile = JSON.parse(savedProfile); } catch { }
                        }

                        const matchedProfile = parsedSavedProfile
                            ? fetchedProfiles?.find((p: any) => p.id === parsedSavedProfile.id)
                            : null;

                        if (matchedProfile) {
                            setSelectedProfile(matchedProfile);
                        } else if (fetchedProfiles?.length > 0) {
                            setSelectedProfile(fetchedProfiles[0]);
                        }
                    }

                    if (catRes && catRes.ok) {
                        const fetchedCategories = await catRes.json();
                        setFilters([
                            "All",
                            ...(fetchedCategories && fetchedCategories.length > 0 ? fetchedCategories : FALLBACK_CATEGORIES).map((cat: any) => cat.name),
                        ]);
                    } else {
                        setFilters([
                            "All",
                            ...FALLBACK_CATEGORIES.map((cat: any) => cat.name),
                        ]);
                    }
                } catch (error) {
                    console.error(error);
                    setFilters(["All", ...FALLBACK_CATEGORIES.map((cat: any) => cat.name)]);
                } finally {
                    setLoading(false);
                }
            };

            fetchInitialData();
        }, [])
    );

    useEffect(() => {
        const fetchRecords = async () => {
            if (!selectedProfile?.id) {
                setRecords([]);
                return;
            }

            setRecordsLoading(true);
            try {
                const token = await AsyncStorage.getItem('token');
                const headers = { 'Authorization': `Bearer ${token}` };

                const response = await fetch(
                    `${process.env.EXPO_PUBLIC_API_URL}/records?profileId=${selectedProfile.id}`,
                    { headers }
                );

                if (response.ok) {
                    const data = await response.json();
                    setRecords(data || []);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setRecordsLoading(false);
            }
        };

        fetchRecords();
    }, [selectedProfile]);

    const handleProfileSelect = async (profile: any) => {
        setSelectedProfile(profile);
        await AsyncStorage.setItem("active_profile", JSON.stringify(profile));
        setSelectedFilter("All");
        setShowProfileSwitcher(false);
    };

    const handleViewFile = async (item: any) => {
        const fileUrl = item.fileUrl ? `${process.env.EXPO_PUBLIC_API_URL}${item.fileUrl}` : item.uri;
        const format = item.fileType?.includes('pdf') || item.format === 'pdf' ? 'pdf' : 'image';

        if (!fileUrl) return;

        try {
            if (fileUrl.startsWith('http')) {
                setViewerName(item.title || item.name);
                setViewerUri(fileUrl);
                setViewerMime(format === 'image' ? 'image/jpeg' : 'application/pdf');
                setViewerVisible(true);
            } else {
                const safeUri = await stableUri(fileUrl, `view_${item.name || item.title}`);
                if (Platform.OS === 'android' && format === 'pdf') {
                    const contentUri = await FileSystem.getContentUriAsync(safeUri);
                    await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
                        data: contentUri, flags: 1, type: 'application/pdf',
                    });
                    return;
                }
                setViewerName(item.title || item.name);
                setViewerUri(safeUri);
                setViewerMime(format === 'image' ? 'image/jpeg' : 'application/pdf');
                setViewerVisible(true);
            }
        } catch (err: any) {
            console.error(err);
        }
    };

    const getInitials = (name?: string) => {
        if (!name) return "NA";
        return name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
    };

    const filteredRecords = records.filter((record) => {
        if (selectedFilter === "All") return true;
        return record.category?.name === selectedFilter;
    });

    const groupedRecords = filteredRecords.reduce((groups: any, record: any) => {
        const month = formatMonth(record.uploadedAt);
        if (!groups[month]) {
            groups[month] = [];
        }
        groups[month].push(record);
        return groups;
    }, {});

    if (loading) {
        return (
            <SafeAreaView style={[s.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#32617d" />
                <FixedText style={{ marginTop: 16, color: '#5c5f60' }}>Loading Timeline...</FixedText>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={s.safeArea}>
            <View style={s.container}>
                <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

                    {/* TOPBAR */}
                    <View style={s.headerRow}>
                        <View style={s.headerTextWrap}>
                            <FixedText style={s.superTitle}>Health Journey</FixedText>
                            <FixedText style={s.title}>Medical Timeline</FixedText>
                            <FixedText style={s.subtitle}>Chronological view of your family's medical history.</FixedText>
                        </View>

                        <TouchableOpacity
                            style={s.profileAvatarBtn}
                            activeOpacity={0.8}
                            onPress={() => setShowProfileSwitcher(true)}
                        >
                            <View style={s.avatarInner}>
                                <FixedText style={s.avatarInitials}>{getInitials(selectedProfile?.fullName)}</FixedText>
                            </View>
                            <MaterialIcons name="expand-more" size={16} color="#71787E" style={{ marginLeft: 2 }} />
                        </TouchableOpacity>
                    </View>

                    {/* HEALTH INSIGHT CARD */}
                    <View style={s.insightCard}>
                        <View style={s.insightIconWrap}>
                            <MaterialIcons name="monitor-heart" size={24} color="#ffffff" />
                        </View>
                        <View style={s.insightTextWrap}>
                            <FixedText style={s.insightSuper}>Health Insight</FixedText>
                            <FixedText style={s.insightTitle}>Your records are well organized</FixedText>
                            <FixedText style={s.insightDesc}>Keep uploading prescriptions, reports, and scans regularly to maintain a complete health history timeline.</FixedText>
                        </View>
                    </View>

                    {/* CATEGORY FILTER DROPDOWN */}
                    <View style={s.categoryFilterWrapper}>
                        <TouchableOpacity
                            style={s.categoryDropdownBtn}
                            activeOpacity={0.8}
                            onPress={() => setShowCategorySwitcher(true)}
                        >
                            <View style={s.categoryDropdownLeft}>
                                <View style={s.filterIconBg}>
                                    <MaterialIcons name="filter-list" size={18} color="#2E5B7B" />
                                </View>
                                <View>
                                    <FixedText style={s.categoryDropdownLabel}>Filter by Category</FixedText>
                                    <FixedText style={s.categoryDropdownText} numberOfLines={1}>
                                        {selectedFilter === "All" ? "All Categories" : selectedFilter}
                                    </FixedText>
                                </View>
                            </View>
                            <MaterialIcons name="expand-more" size={24} color="#71787E" />
                        </TouchableOpacity>
                    </View>

                    {/* EMPTY STATE */}
                    {recordsLoading ? (
                        <View style={{ marginTop: 40, alignItems: 'center' }}>
                            <ActivityIndicator size="small" color="#32617D" />
                        </View>
                    ) : filteredRecords.length === 0 ? (
                        <View style={s.emptyState}>
                            <MaterialIcons name="history" size={48} color="#D5E3EF" style={{ marginBottom: 16 }} />
                            <FixedText style={s.emptyTitle}>No timeline records found</FixedText>
                            <FixedText style={s.emptyDesc}>Upload medical records for this profile to build the timeline.</FixedText>
                        </View>
                    ) : (
                        <View style={s.timelineContainer}>
                            {Object.entries(groupedRecords).map(([month, monthRecords]: any) => (
                                <View key={month} style={s.monthBlock}>
                                    {/* Month Header */}
                                    <View style={s.monthHeaderRow}>
                                        <View style={s.monthLine} />
                                        <FixedText style={s.monthText}>{month}</FixedText>
                                        <View style={s.monthLine} />
                                    </View>

                                    {/* Timeline Items */}
                                    <View style={s.timelineItemsWrapper}>
                                        <View style={s.verticalTrack} />

                                        {monthRecords.map((record: any, idx: number) => {
                                            const { icon, color, bg } = getTimelineIcon(record.category?.name);
                                            return (
                                                <View key={record.id || idx} style={s.timelineItem}>
                                                    {/* Node */}
                                                    <View style={[s.nodeCircle, { backgroundColor: color, shadowColor: color }]}>
                                                        <MaterialIcons name={icon as any} size={16} color="#ffffff" />
                                                    </View>

                                                    {/* Card */}
                                                    <View style={s.recordCard}>
                                                        <View style={s.recordCardContent}>
                                                            <View style={s.recordTagsRow}>
                                                                <View style={[s.categoryPill, { backgroundColor: bg }]}>
                                                                    <FixedText style={[s.categoryPillText, { color: color }]}>{record.category?.name || "Uncategorized"}</FixedText>
                                                                </View>
                                                                <FixedText style={s.dateText}>{formatDate(record.uploadedAt)}</FixedText>
                                                            </View>

                                                            <FixedText style={s.recordTitle} numberOfLines={2}>{record.title}</FixedText>
                                                            <FixedText style={s.recordMeta}>
                                                                {record.profile?.fullName || selectedProfile?.fullName} • {record.fileType?.includes("pdf") ? "PDF" : "File"}
                                                            </FixedText>
                                                        </View>

                                                        <TouchableOpacity
                                                            style={s.viewBtn}
                                                            activeOpacity={0.7}
                                                            onPress={() => handleViewFile(record)}
                                                        >
                                                            <MaterialIcons name="visibility" size={20} color="#71787E" />
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                            )
                                        })}
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}

                </ScrollView>

                {/* Profile Switcher Modal */}
                <Modal
                    visible={showProfileSwitcher}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setShowProfileSwitcher(false)}
                >
                    <TouchableOpacity
                        style={s.modalOverlay}
                        activeOpacity={1}
                        onPress={() => setShowProfileSwitcher(false)}
                    >
                        <View style={s.modalContent}>
                            <View style={s.modalHeaderRow}>
                                <FixedText style={s.modalHeader}>Select Profile</FixedText>
                                <TouchableOpacity onPress={() => setShowProfileSwitcher(false)}>
                                    <MaterialIcons name="close" size={24} color="#0F172A" />
                                </TouchableOpacity>
                            </View>
                            <ScrollView style={s.modalScroll} showsVerticalScrollIndicator={false}>
                                {profiles.map((profile) => (
                                    <TouchableOpacity
                                        key={profile.id}
                                        style={[
                                            s.profileOption,
                                            selectedProfile?.id === profile.id && s.activeProfileOption
                                        ]}
                                        onPress={() => handleProfileSelect(profile)}
                                    >
                                        <View style={s.avatarCircleSmall}>
                                            <FixedText style={s.avatarTextSmall}>
                                                {getInitials(profile.fullName)}
                                            </FixedText>
                                        </View>
                                        <View style={s.profileOptionInfo}>
                                            <FixedText style={s.profileOptionName}>{profile.fullName}</FixedText>
                                            <FixedText style={s.profileOptionRelation}>{profile.relationship} • {profile.bloodGroup}</FixedText>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </TouchableOpacity>
                </Modal>

                {/* Category Switcher Modal */}
                <Modal
                    visible={showCategorySwitcher}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setShowCategorySwitcher(false)}
                >
                    <TouchableOpacity
                        style={s.modalOverlay}
                        activeOpacity={1}
                        onPress={() => setShowCategorySwitcher(false)}
                    >
                        <View style={s.modalContent}>
                            <View style={s.modalHeaderRow}>
                                <FixedText style={s.modalHeader}>Filter by Category</FixedText>
                                <TouchableOpacity onPress={() => setShowCategorySwitcher(false)}>
                                    <MaterialIcons name="close" size={24} color="#0F172A" />
                                </TouchableOpacity>
                            </View>
                            <ScrollView style={s.modalScroll} showsVerticalScrollIndicator={false}>
                                {filters.map((filter) => (
                                    <TouchableOpacity
                                        key={filter}
                                        style={[
                                            s.categoryOption,
                                            selectedFilter === filter && s.activeCategoryOption
                                        ]}
                                        onPress={() => {
                                            setSelectedFilter(filter);
                                            setShowCategorySwitcher(false);
                                        }}
                                    >
                                        <FixedText style={[
                                            s.categoryOptionText,
                                            selectedFilter === filter && s.activeCategoryOptionText
                                        ]}>
                                            {filter === "All" ? "All Categories" : filter}
                                        </FixedText>
                                        {selectedFilter === filter && (
                                            <MaterialIcons name="check-circle" size={20} color="#2E5B7B" />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </TouchableOpacity>
                </Modal>

                {/* Viewer Modal */}
                <Modal
                    visible={viewerVisible}
                    animationType="slide"
                    presentationStyle="fullScreen"
                    onRequestClose={() => setViewerVisible(false)}
                >
                    <SafeAreaView style={[s.viewerSafe, viewerMime.startsWith('image') && { backgroundColor: '#000' }]}>
                        <View style={[s.viewerHeader, viewerMime.startsWith('image') && s.viewerHeaderDark]}>
                            <TouchableOpacity
                                style={[s.backBtn, viewerMime.startsWith('image') && { backgroundColor: '#333' }]}
                                onPress={() => setViewerVisible(false)}
                            >
                                <MaterialIcons name="arrow-back" size={24} color={viewerMime.startsWith('image') ? "#ffffff" : "#0b1c30"} />
                            </TouchableOpacity>
                            <FixedText style={[s.viewerTitleText, viewerMime.startsWith('image') && { color: '#ffffff' }]} numberOfLines={1}>
                                {viewerName}
                            </FixedText>
                            <View style={{ width: 40 }} />
                        </View>

                        {viewerUri ? (
                            viewerMime.startsWith('image') ? (
                                <View style={s.imageViewerContainer}>
                                    <Image
                                        source={{ uri: viewerUri }}
                                        style={s.fullImage}
                                        resizeMode="contain"
                                    />
                                </View>
                            ) : (
                                <WebView
                                    style={{ flex: 1, backgroundColor: '#ffffff' }}
                                    source={{ uri: viewerUri }}
                                    allowFileAccess={true}
                                    allowFileAccessFromFileURLs={true}
                                    allowUniversalAccessFromFileURLs={true}
                                    originWhitelist={['*']}
                                    scalesPageToFit={true}
                                    bounces={false}
                                />
                            )
                        ) : (
                            <View style={s.viewerLoader}>
                                <ActivityIndicator size="large" color="#32617D" />
                            </View>
                        )}
                    </SafeAreaView>
                </Modal>

            </View>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
    container: { flex: 1 },
    scroll: { paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 24 : 16, paddingBottom: 100 },

    // Header
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
    headerTextWrap: { flex: 1, paddingRight: 16 },
    superTitle: { fontSize: 11, fontWeight: '700', color: '#2E5B7B', textTransform: 'uppercase', letterSpacing: 1 },
    title: { fontSize: 28, fontWeight: '800', color: '#0F172A', marginTop: 4 },
    subtitle: { fontSize: 13, fontWeight: '500', color: '#64748B', marginTop: 6, lineHeight: 18 },

    profileAvatarBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 6, paddingRight: 8, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    avatarInner: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#2E5B7B', alignItems: 'center', justifyContent: 'center' },
    avatarInitials: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },

    // Insight
    insightCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#D9E7F2', marginBottom: 24, shadowColor: '#2E5B7B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
    insightIconWrap: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#2E5B7B', alignItems: 'center', justifyContent: 'center', marginRight: 16, shadowColor: '#2E5B7B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
    insightTextWrap: { flex: 1 },
    insightSuper: { fontSize: 11, fontWeight: '600', color: '#2E5B7B', textTransform: 'uppercase', letterSpacing: 0.5 },
    insightTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginTop: 4 },
    insightDesc: { fontSize: 13, color: '#475569', marginTop: 6, lineHeight: 20 },

    // Category Filter Dropdown
    categoryFilterWrapper: { marginBottom: 24 },
    categoryDropdownBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderRadius: 20, padding: 12, paddingRight: 16, borderWidth: 1, borderColor: '#D9E7F2', shadowColor: '#2E5B7B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
    categoryDropdownLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    filterIconBg: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#EEF4FA', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    categoryDropdownLabel: { fontSize: 11, fontWeight: '600', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
    categoryDropdownText: { fontSize: 15, fontWeight: '700', color: '#0F172A' },

    // Empty State
    emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, paddingHorizontal: 20, backgroundColor: '#FFFFFF', borderRadius: 24, borderWidth: 1, borderColor: '#E2E8F0', borderStyle: 'dashed' },
    emptyTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginTop: 12 },
    emptyDesc: { fontSize: 13, color: '#64748B', textAlign: 'center', marginTop: 8 },

    // Timeline
    timelineContainer: { marginTop: 8 },
    monthBlock: { marginBottom: 32 },
    monthHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
    monthLine: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
    monthText: { paddingHorizontal: 12, fontSize: 12, fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: 1 },

    timelineItemsWrapper: { marginLeft: 16, position: 'relative', paddingLeft: 24, paddingBottom: 16 },
    verticalTrack: { position: 'absolute', left: 0, top: 12, bottom: 0, width: 2, backgroundColor: '#E2E8F0', borderRadius: 1 },
    timelineItem: { marginBottom: 24, position: 'relative' },

    nodeCircle: { position: 'absolute', left: -40, top: 4, width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 },

    recordCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 },
    recordCardContent: { flex: 1, paddingRight: 12 },
    recordTagsRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
    categoryPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 9999 },
    categoryPillText: { fontSize: 10, fontWeight: '700' },
    dateText: { fontSize: 11, color: '#94A3B8', fontWeight: '500' },
    recordTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', lineHeight: 22 },
    recordMeta: { fontSize: 12, fontWeight: '500', color: '#64748B', marginTop: 6 },

    viewBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start' },

    // Modals
    modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: '85%', maxHeight: '60%', backgroundColor: '#ffffff', borderRadius: 24, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
    modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    modalHeader: { fontSize: 16, fontWeight: '700', color: '#0F172A', textTransform: 'uppercase', letterSpacing: 0.5 },
    modalScroll: { width: '100%' },

    profileOption: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16, marginBottom: 8 },
    activeProfileOption: { backgroundColor: '#EEF4FA' },
    avatarCircleSmall: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#2E5B7B', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    avatarTextSmall: { color: '#ffffff', fontSize: 13, fontWeight: '700' },
    profileOptionInfo: { flex: 1 },
    profileOptionName: { fontSize: 15, fontWeight: '600', color: '#0F172A' },
    profileOptionRelation: { fontSize: 12, color: '#64748B', marginTop: 2 },

    // Category Options
    categoryOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, marginBottom: 4 },
    activeCategoryOption: { backgroundColor: '#EEF4FA' },
    categoryOptionText: { fontSize: 15, fontWeight: '500', color: '#475569' },
    activeCategoryOptionText: { color: '#2E5B7B', fontWeight: '700' },

    // Viewer
    viewerSafe: { flex: 1, backgroundColor: '#F8FAFC' },
    viewerHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', backgroundColor: '#ffffff' },
    viewerHeaderDark: { backgroundColor: '#000', borderBottomWidth: 0 },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
    viewerTitleText: { flex: 1, fontSize: 15, fontWeight: '700', color: '#0F172A', textAlign: 'center', marginHorizontal: 8 },
    viewerLoader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    imageViewerContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
    fullImage: { width: '100%', height: '100%' }
});