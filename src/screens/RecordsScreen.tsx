import React, { useState, useMemo, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    Platform,
    Modal,
    Image,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { WebView } from 'react-native-webview';

// --- Accessibility Lock ---
const FixedText = (props: any) => (
    <Text allowFontScaling={false} maxFontSizeMultiplier={1} {...props} />
);

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

const DATE_RANGES = [
    'All Time',
    'Today',
    'Yesterday',
    'Last 7 Days',
    'Last 30 Days',
    'This Month',
    'This Year',
    'Custom Range'
];

// --- Helper Functions ---
const formatDateForDisplay = (dateObj: Date) => {
    return dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

// Smart Date formatter ported from Web
const formatUploadedDate = (dateString: string) => {
    if (!dateString) return '';
    const uploadedDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isToday = uploadedDate.toDateString() === today.toDateString();
    const isYesterday = uploadedDate.toDateString() === yesterday.toDateString();

    if (isToday) return "Uploaded today";
    if (isYesterday) return "Uploaded yesterday";

    return `Uploaded on ${uploadedDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;
};

const getInitialStartDate = () => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d;
};

const getInitials = (name?: string) => {
    if (!name) return "NA";
    return name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
};

// --- UTILITY: copy any picker URI into app's cache ---
const stableUri = async (uri: string, filename: string): Promise<string> => {
    if (uri.startsWith(FileSystem.cacheDirectory!)) return uri;
    const dest = FileSystem.cacheDirectory + filename;
    const info = await FileSystem.getInfoAsync(dest);
    if (info.exists) await FileSystem.deleteAsync(dest, { idempotent: true });
    await FileSystem.copyAsync({ from: uri, to: dest });
    return dest;
};

export default function RecordsScreen({ navigation }: any) {
    // API State
    const [records, setRecords] = useState<any[]>([]);
    const [profiles, setProfiles] = useState<any[]>([]);
    const [selectedProfile, setSelectedProfile] = useState<any>(null);
    const [filters, setFilters] = useState<string[]>(["All Types"]);
    const [loading, setLoading] = useState(true);
    const [recordsLoading, setRecordsLoading] = useState(false);

    // Profile Dropdown
    const [showProfileSwitcher, setShowProfileSwitcher] = useState(false);

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All Types');
    const [selectedDateRange, setSelectedDateRange] = useState('All Time');

    // Dropdown State
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [dropdownType, setDropdownType] = useState<'category' | 'date'>('category');

    // Custom Date Range State (CALENDAR LOGIC INTACT)
    const [startDate, setStartDate] = useState(getInitialStartDate());
    const [endDate, setEndDate] = useState(new Date());
    const [appliedCustomDates, setAppliedCustomDates] = useState<{ start: Date, end: Date } | null>(null);
    const [showPicker, setShowPicker] = useState(false);
    const [pickerTarget, setPickerTarget] = useState<'start' | 'end'>('start');
    const [tempDate, setTempDate] = useState(new Date());

    // Action Menu State
    const [actionMenuVisible, setActionMenuVisible] = useState(false);
    const [activeItem, setActiveItem] = useState<any | null>(null);

    // Edit Modal State
    const [editOpen, setEditOpen] = useState(false);
    const [editTitle, setEditTitle] = useState('');

    // Viewer State
    const [viewerVisible, setViewerVisible] = useState(false);
    const [viewerUri, setViewerUri] = useState('');
    const [viewerName, setViewerName] = useState('');
    const [viewerMime, setViewerMime] = useState('');

    useEffect(() => {
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
                        "All Types",
                        ...(fetchedCategories && fetchedCategories.length > 0 ? fetchedCategories : FALLBACK_CATEGORIES).map((cat: any) => cat.name),
                    ]);
                } else {
                    setFilters(["All Types", ...FALLBACK_CATEGORIES.map((cat: any) => cat.name)]);
                }
            } catch (error) {
                console.error(error);
                setFilters(["All Types", ...FALLBACK_CATEGORIES.map((cat: any) => cat.name)]);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

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

    useEffect(() => {
        fetchRecords();
    }, [selectedProfile]);

    const handleProfileSelect = async (profile: any) => {
        setSelectedProfile(profile);
        await AsyncStorage.setItem("active_profile", JSON.stringify(profile));
        setSelectedCategory("All Types");
        setShowProfileSwitcher(false);
    };

    // Calendar & Dropdown Handlers
    const openDropdown = (type: 'category' | 'date') => {
        setDropdownType(type);
        setDropdownVisible(true);
    };

    const handleDropdownSelect = (item: string) => {
        if (dropdownType === 'category') {
            setSelectedCategory(item);
        } else {
            setSelectedDateRange(item);
            if (item !== 'Custom Range') {
                setAppliedCustomDates(null);
            }
        }
        setDropdownVisible(false);
    };

    const openDatePicker = (target: 'start' | 'end') => {
        setPickerTarget(target);
        setTempDate(target === 'start' ? startDate : endDate);
        setShowPicker(true);
    };

    const handleAndroidDateChange = (event: any, selectedDate?: Date) => {
        setShowPicker(false);
        if (event.type === 'set' && selectedDate) {
            if (pickerTarget === 'start') setStartDate(selectedDate);
            else setEndDate(selectedDate);
        }
    };

    const handleIOSDateChange = (_event: any, selectedDate?: Date) => {
        if (selectedDate) setTempDate(selectedDate);
    };

    const handleIOSDone = () => {
        if (pickerTarget === 'start') setStartDate(tempDate);
        else setEndDate(tempDate);
        setShowPicker(false);
    };

    const handleIOSCancel = () => {
        setShowPicker(false);
    };

    const applyCustomDateRange = () => {
        if (startDate > endDate) {
            Alert.alert('Error', 'Start Date cannot be after End Date');
            return;
        }
        setAppliedCustomDates({ start: startDate, end: endDate });
    };

    // Action Menu
    const openActionMenu = (item: any) => {
        setActiveItem(item);
        setActionMenuVisible(true);
    };

    // Record Operations
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
            Alert.alert('Error', 'Could not open file.');
        }
    };

    const handleDownload = async (item: any) => {
        const fileUrl = item.fileUrl ? `${process.env.EXPO_PUBLIC_API_URL}${item.fileUrl}` : item.uri;
        if (!fileUrl) return;
        try {
            const safeUri = await stableUri(fileUrl, `download_${item.title || item.name || 'document'}`);
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(safeUri, { dialogTitle: 'Save Document' });
            } else {
                Alert.alert('Notice', 'Saving is not available on this device.');
            }
        } catch (error) {
            Alert.alert('Error', 'Could not download file.');
        }
    };

    const handleShare = async (item: any) => {
        const fileUrl = item.fileUrl ? `${process.env.EXPO_PUBLIC_API_URL}${item.fileUrl}` : item.uri;
        if (!fileUrl) return;
        try {
            const safeUri = await stableUri(fileUrl, `share_${item.title || item.name}`);
            await Sharing.shareAsync(safeUri);
        } catch (error) {
            Alert.alert('Error', 'Could not share this file.');
        }
    };

    const handleUpdateRecord = async () => {
        if (!activeItem) return;
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/records/${activeItem.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ title: editTitle }),
            });

            if (!response.ok) throw new Error("Failed to update record");

            Alert.alert("Success", "Record updated successfully.");
            setEditOpen(false);
            setActiveItem(null);
            fetchRecords();
        } catch (error) {
            Alert.alert("Error", "Unable to update record");
        }
    };

    const handleDeleteRecord = (id: string) => {
        Alert.alert('Delete File', 'Are you sure you want to remove this record?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    try {
                        const token = await AsyncStorage.getItem('token');
                        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/records/${id}`, {
                            method: 'DELETE',
                            headers: { "Authorization": `Bearer ${token}` }
                        });
                        if (!response.ok) throw new Error('Failed to delete');
                        fetchRecords();
                    } catch (e) {
                        Alert.alert('Error', 'Failed to delete record');
                    }
                }
            },
        ]);
    };

    // Filter Logic
    const filteredResults = useMemo(() => {
        return records.filter(item => {
            const matchesText = item.title?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'All Types' || item.category?.name === selectedCategory;

            let matchesDate = true;

            const itemDate = new Date(item.uploadedAt || new Date());
            itemDate.setHours(0, 0, 0, 0);

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (selectedDateRange === 'Today') {
                matchesDate = itemDate.getTime() === today.getTime();
            } else if (selectedDateRange === 'Yesterday') {
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                matchesDate = itemDate.getTime() === yesterday.getTime();
            } else if (selectedDateRange === 'Last 7 Days') {
                const last7Days = new Date(today);
                last7Days.setDate(last7Days.getDate() - 7);
                matchesDate = itemDate >= last7Days && itemDate <= today;
            } else if (selectedDateRange === 'Last 30 Days') {
                const last30Days = new Date(today);
                last30Days.setDate(last30Days.getDate() - 30);
                matchesDate = itemDate >= last30Days && itemDate <= today;
            } else if (selectedDateRange === 'This Month') {
                matchesDate = itemDate.getMonth() === today.getMonth() && itemDate.getFullYear() === today.getFullYear();
            } else if (selectedDateRange === 'This Year') {
                matchesDate = itemDate.getFullYear() === today.getFullYear();
            } else if (selectedDateRange === 'Custom Range' && appliedCustomDates) {
                const start = new Date(appliedCustomDates.start).setHours(0, 0, 0, 0);
                const end = new Date(appliedCustomDates.end).setHours(23, 59, 59, 999);
                const itemTime = itemDate.getTime();
                matchesDate = itemTime >= start && itemTime <= end;
            }

            return matchesText && matchesCategory && matchesDate;
        });
    }, [records, searchQuery, selectedCategory, selectedDateRange, appliedCustomDates]);

    if (loading) {
        return (
            <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#32617d" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>

                {/* --- HEADER / SEARCH CONTAINER --- */}
                <View style={styles.searchContainer}>

                    {/* Header Row */}
                    <View style={styles.headerRow}>
                        <View style={styles.headerTextWrap}>
                            <FixedText style={styles.superTitle}>Records Vault</FixedText>
                            <FixedText style={styles.headerTitle}>Medical Records</FixedText>
                            <FixedText style={styles.subtitle}>Securely access and organize your uploaded health documents.</FixedText>
                        </View>

                        <TouchableOpacity
                            style={styles.profileAvatarBtn}
                            activeOpacity={0.8}
                            onPress={() => setShowProfileSwitcher(true)}
                        >
                            <View style={styles.avatarInner}>
                                <FixedText style={styles.avatarInitials}>{getInitials(selectedProfile?.fullName)}</FixedText>
                            </View>
                            <MaterialIcons name="expand-more" size={16} color="#71787E" style={{ marginLeft: 2 }} />
                        </TouchableOpacity>
                    </View>

                    {/* Search Input */}
                    <View style={styles.searchInputWrapper}>
                        <MaterialIcons name="search" size={24} color="#41484D" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search records, hospitals, doctors..."
                            placeholderTextColor="#71787E"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            allowFontScaling={false}
                        />
                    </View>

                    {/* Filters Row: Category & Date Dropdowns on one line */}
                    <View style={styles.filterHeaderRow}>
                        <TouchableOpacity style={styles.dropdownBtn} activeOpacity={0.7} onPress={() => openDropdown('category')}>
                            <FixedText style={styles.dropdownBtnText} numberOfLines={1}>
                                {selectedCategory === 'All Types' ? 'Report Type' : selectedCategory}
                            </FixedText>
                            <MaterialIcons name="keyboard-arrow-down" size={20} color="#0B1C30" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.dropdownBtn} activeOpacity={0.7} onPress={() => openDropdown('date')}>
                            <FixedText style={styles.dropdownBtnText} numberOfLines={1}>
                                {selectedDateRange === 'All Time' ? 'Date Range' : selectedDateRange}
                            </FixedText>
                            <MaterialIcons name="keyboard-arrow-down" size={20} color="#0B1C30" />
                        </TouchableOpacity>
                    </View>

                    {/* Custom Date Pickers (Only visible if Custom is selected) */}
                    {selectedDateRange === 'Custom Range' && (
                        <View style={styles.dateInputRow}>
                            <View style={styles.dateCol}>
                                <FixedText style={styles.dateLabel}>START DATE</FixedText>
                                <TouchableOpacity style={styles.dateBtn} activeOpacity={0.7} onPress={() => openDatePicker('start')}>
                                    <FixedText style={styles.dateText}>{formatDateForDisplay(startDate)}</FixedText>
                                    <MaterialIcons name="calendar-today" size={16} color="#41484D" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.dateCol}>
                                <FixedText style={styles.dateLabel}>END DATE</FixedText>
                                <TouchableOpacity style={styles.dateBtn} activeOpacity={0.7} onPress={() => openDatePicker('end')}>
                                    <FixedText style={styles.dateText}>{formatDateForDisplay(endDate)}</FixedText>
                                    <MaterialIcons name="calendar-today" size={16} color="#41484D" />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity style={styles.applyBtn} activeOpacity={0.8} onPress={applyCustomDateRange}>
                                <FixedText style={styles.applyBtnText}>Apply</FixedText>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Upload Record Nav Button */}
                    <TouchableOpacity
                        style={styles.uploadBtn}
                        activeOpacity={0.8}
                        onPress={() => navigation?.navigate('Upload')}
                    >
                        <MaterialIcons name="file-upload" size={20} color="#FFFFFF" />
                        <FixedText style={styles.uploadBtnText}>Upload Record</FixedText>
                    </TouchableOpacity>
                </View>

                {/* --- RESULTS LIST --- */}
                <ScrollView contentContainerStyle={styles.resultsScroll} showsVerticalScrollIndicator={false}>
                    {recordsLoading ? (
                        <ActivityIndicator size="large" color="#32617D" style={{ marginTop: 40 }} />
                    ) : filteredResults.length === 0 ? (
                        <View style={styles.emptyState}>
                            <MaterialIcons name="search-off" size={48} color="#C1C7CD" />
                            <FixedText style={styles.emptyStateText}>No records found.</FixedText>
                        </View>
                    ) : (
                        <View style={styles.resultsList}>
                            {filteredResults.map((item) => {
                                const isPdf = item.fileType?.includes('pdf') || item.format === 'pdf';
                                return (
                                    <View key={item.id} style={styles.resultCard}>
                                        <TouchableOpacity
                                            style={styles.recentLeft}
                                            activeOpacity={0.7}
                                            onPress={() => handleViewFile(item)}
                                        >
                                            <View style={[styles.iconBox, isPdf ? styles.pdfBg : styles.imgBg]}>
                                                <MaterialIcons
                                                    name={isPdf ? "picture-as-pdf" : "image"}
                                                    size={24}
                                                    color={isPdf ? "#EF4444" : "#32617D"}
                                                />
                                            </View>
                                            <View style={styles.resultInfo}>
                                                <FixedText style={styles.resultTitle} numberOfLines={1}>{item.title}</FixedText>
                                                <View style={styles.resultMeta}>
                                                    <FixedText style={styles.resultType}>{item.category?.name || "Uncategorized"}</FixedText>
                                                    <FixedText style={styles.resultDate}>{formatUploadedDate(item.uploadedAt)}</FixedText>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.actionBtn} onPress={() => openActionMenu(item)}>
                                            <MaterialIcons name="more-vert" size={24} color="#64748B" />
                                        </TouchableOpacity>
                                    </View>
                                );
                            })}
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
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => setShowProfileSwitcher(false)}
                    >
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeaderRow}>
                                <FixedText style={styles.modalHeader}>Select Profile</FixedText>
                                <TouchableOpacity onPress={() => setShowProfileSwitcher(false)}>
                                    <MaterialIcons name="close" size={24} color="#0F172A" />
                                </TouchableOpacity>
                            </View>
                            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                                {profiles.map((profile) => (
                                    <TouchableOpacity
                                        key={profile.id}
                                        style={[
                                            styles.profileOption,
                                            selectedProfile?.id === profile.id && styles.activeProfileOption
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
                                            <FixedText style={styles.profileOptionRelation}>{profile.relationship} • {profile.bloodGroup}</FixedText>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </TouchableOpacity>
                </Modal>

                {/* --- ITEM ACTION MENU OVERLAY --- */}
                {actionMenuVisible && activeItem && (
                    <View style={styles.overlay}>
                        <TouchableOpacity style={StyleSheet.absoluteFillObject} activeOpacity={1} onPress={() => setActionMenuVisible(false)} />
                        <View style={styles.sheet}>
                            <View style={styles.sheetHeader}>
                                <FixedText style={[styles.sheetTitle, { flex: 1, marginRight: 16 }]} numberOfLines={1}>
                                    {activeItem.title}
                                </FixedText>
                                <TouchableOpacity onPress={() => setActionMenuVisible(false)}>
                                    <MaterialIcons name="close" size={24} color="#1E293B" />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={styles.sheetActionItem}
                                onPress={() => {
                                    setActionMenuVisible(false);
                                    handleViewFile(activeItem);
                                }}
                            >
                                <MaterialIcons name="visibility" size={24} color="#32617D" />
                                <FixedText style={styles.sheetActionText}>View Document</FixedText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.sheetActionItem}
                                onPress={() => { setActionMenuVisible(false); handleDownload(activeItem); }}
                            >
                                <MaterialIcons name="file-download" size={24} color="#32617D" />
                                <FixedText style={styles.sheetActionText}>Download / Save</FixedText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.sheetActionItem}
                                onPress={() => { setActionMenuVisible(false); handleShare(activeItem); }}
                            >
                                <MaterialIcons name="share" size={24} color="#32617D" />
                                <FixedText style={styles.sheetActionText}>Share File</FixedText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.sheetActionItem}
                                onPress={() => {
                                    setActionMenuVisible(false);
                                    setEditTitle(activeItem.title);
                                    setEditOpen(true);
                                }}
                            >
                                <MaterialIcons name="edit" size={24} color="#32617D" />
                                <FixedText style={styles.sheetActionText}>Edit Record</FixedText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.sheetActionItem, { borderBottomWidth: 0 }]}
                                onPress={() => { setActionMenuVisible(false); handleDeleteRecord(activeItem.id); }}
                            >
                                <MaterialIcons name="delete-outline" size={24} color="#EF4444" />
                                <FixedText style={[styles.sheetActionText, { color: '#EF4444' }]}>Delete Record</FixedText>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* --- EDIT RECORD TITLE MODAL --- */}
                <Modal visible={editOpen} transparent animationType="fade" onRequestClose={() => setEditOpen(false)}>
                    <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setEditOpen(false)}>
                        <View style={styles.editSheet}>
                            <View style={styles.editSheetHeader}>
                                <FixedText style={styles.sheetTitle}>Edit Record Details</FixedText>
                                <TouchableOpacity onPress={() => setEditOpen(false)}>
                                    <MaterialIcons name="close" size={24} color="#1E293B" />
                                </TouchableOpacity>
                            </View>
                            <FixedText style={styles.editLabel}>Record Title</FixedText>
                            <TextInput
                                style={styles.editInput}
                                value={editTitle}
                                onChangeText={setEditTitle}
                                placeholder="Enter record title"
                                allowFontScaling={false}
                            />
                            <View style={styles.editActions}>
                                <TouchableOpacity onPress={() => setEditOpen(false)} style={styles.cancelBtn}>
                                    <FixedText style={styles.cancelBtnText}>Cancel</FixedText>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleUpdateRecord} style={styles.saveBtn}>
                                    <FixedText style={styles.saveBtnText}>Save Changes</FixedText>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableOpacity>
                </Modal>

                {/* --- ABSOLUTE DROPDOWN OVERLAY (CATEGORIES / DATES) --- */}
                {dropdownVisible && (
                    <View style={styles.overlay}>
                        <TouchableOpacity style={StyleSheet.absoluteFillObject} activeOpacity={1} onPress={() => setDropdownVisible(false)} />
                        <View style={styles.sheet}>
                            <View style={styles.sheetHeader}>
                                <FixedText style={styles.sheetTitle}>
                                    {dropdownType === 'category' ? 'Select Report Type' : 'Select Date Range'}
                                </FixedText>
                                <TouchableOpacity onPress={() => setDropdownVisible(false)}>
                                    <MaterialIcons name="close" size={24} color="#1E293B" />
                                </TouchableOpacity>
                            </View>
                            <ScrollView showsVerticalScrollIndicator={false}>
                                {(dropdownType === 'category' ? filters : DATE_RANGES).map((item, i) => (
                                    <TouchableOpacity
                                        key={i}
                                        style={styles.sheetItem}
                                        onPress={() => handleDropdownSelect(item)}
                                    >
                                        <FixedText style={[
                                            styles.sheetItemText,
                                            (dropdownType === 'category' ? selectedCategory : selectedDateRange) === item && styles.sheetItemTextActive
                                        ]}>
                                            {item}
                                        </FixedText>
                                        {(dropdownType === 'category' ? selectedCategory : selectedDateRange) === item && (
                                            <MaterialIcons name="check" size={20} color="#32617D" />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>
                )}

                {/* --- iOS DATE PICKER MODAL --- */}
                {Platform.OS === 'ios' && (
                    <Modal
                        visible={showPicker}
                        transparent
                        animationType="fade"
                        statusBarTranslucent
                        onRequestClose={handleIOSCancel}
                    >
                        <TouchableOpacity
                            style={styles.iosPickerOverlay}
                            activeOpacity={1}
                            onPress={handleIOSCancel}
                        >
                            <TouchableOpacity
                                activeOpacity={1}
                                onPress={() => { }}
                                style={styles.iosPickerContainer}
                            >
                                <View style={styles.iosPickerHeader}>
                                    <TouchableOpacity onPress={handleIOSCancel} style={styles.iosPickerHeaderBtn}>
                                        <FixedText style={styles.iosPickerCancel}>Cancel</FixedText>
                                    </TouchableOpacity>
                                    <FixedText style={styles.iosPickerTitle}>
                                        {pickerTarget === 'start' ? 'Start Date' : 'End Date'}
                                    </FixedText>
                                    <TouchableOpacity onPress={handleIOSDone} style={styles.iosPickerHeaderBtn}>
                                        <FixedText style={styles.iosPickerDone}>Done</FixedText>
                                    </TouchableOpacity>
                                </View>
                                <DateTimePicker
                                    value={tempDate}
                                    mode="date"
                                    display="spinner"
                                    themeVariant="light"
                                    textColor="#0B1C30"
                                    onChange={handleIOSDateChange}
                                    style={styles.iosDatePicker}
                                />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    </Modal>
                )}

                {/* --- ANDROID DATE PICKER --- */}
                {Platform.OS === 'android' && showPicker && (
                    <DateTimePicker
                        value={pickerTarget === 'start' ? startDate : endDate}
                        mode="date"
                        display="default"
                        onChange={handleAndroidDateChange}
                    />
                )}

                {/* --- IN-APP VIEWER MODAL --- */}
                <Modal
                    visible={viewerVisible}
                    animationType="slide"
                    presentationStyle="fullScreen"
                    onRequestClose={() => setViewerVisible(false)}
                >
                    <SafeAreaView style={[styles.viewerSafe, viewerMime.startsWith('image') && { backgroundColor: '#000' }]}>
                        <View style={[styles.viewerHeader, viewerMime.startsWith('image') && styles.viewerHeaderDark]}>
                            <TouchableOpacity
                                style={[styles.backBtn, viewerMime.startsWith('image') && { backgroundColor: '#333' }]}
                                onPress={() => setViewerVisible(false)}
                            >
                                <MaterialIcons name="arrow-back" size={24} color={viewerMime.startsWith('image') ? "#FFF" : "#1E293B"} />
                            </TouchableOpacity>
                            <FixedText style={[styles.viewerTitleText, viewerMime.startsWith('image') && { color: '#FFF' }]} numberOfLines={1}>
                                {viewerName}
                            </FixedText>
                            <View style={{ width: 40 }} />
                        </View>

                        {viewerUri ? (
                            viewerMime.startsWith('image') ? (
                                <View style={styles.imageViewerContainer}>
                                    <Image
                                        source={{ uri: viewerUri }}
                                        style={styles.fullImage}
                                        resizeMode="contain"
                                    />
                                </View>
                            ) : (
                                <WebView
                                    style={{ flex: 1, backgroundColor: '#fff' }}
                                    source={{ uri: viewerUri }}
                                    allowFileAccess={true}
                                    allowFileAccessFromFileURLs={true}
                                    allowUniversalAccessFromFileURLs={true}
                                    originWhitelist={['*']}
                                    scalesPageToFit={true}
                                    bounces={false}
                                    showsHorizontalScrollIndicator={false}
                                    showsVerticalScrollIndicator={true}
                                />
                            )
                        ) : (
                            <View style={styles.viewerLoader}>
                                <ActivityIndicator size="large" color="#32617D" />
                            </View>
                        )}
                    </SafeAreaView>
                </Modal>

            </View>
        </SafeAreaView>
    );
}

// --- Styles ---
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
    container: { flex: 1 },

    // Header & Search
    searchContainer: {
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'android' ? 24 : 16,
        paddingBottom: 12,
        backgroundColor: '#F8FAFC',
        zIndex: 10,
    },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
    headerTextWrap: { flex: 1, paddingRight: 16 },
    superTitle: { fontSize: 11, fontWeight: '700', color: '#2E5B7B', textTransform: 'uppercase', letterSpacing: 1 },
    headerTitle: { fontSize: 28, fontWeight: '800', color: '#0F172A', marginTop: 4 },
    subtitle: { fontSize: 13, fontWeight: '500', color: '#64748B', marginTop: 6, lineHeight: 18 },

    profileAvatarBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 6, paddingRight: 8, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    avatarInner: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#2E5B7B', alignItems: 'center', justifyContent: 'center' },
    avatarInitials: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },

    searchInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#C1C7CD',
        borderRadius: 12,
        height: 52,
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    searchIcon: { marginRight: 12 },
    searchInput: { flex: 1, fontSize: 15, color: '#0B1C30', height: '100%' },

    // Horizontal Row Dropdowns
    filterHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    dropdownBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: 'rgba(193, 199, 205, 0.4)',
        paddingHorizontal: 12,
        height: 44,
        borderRadius: 12,
    },
    dropdownBtnText: { fontSize: 13, fontWeight: '500', color: '#0B1C30', flex: 1, marginRight: 4 },

    // Custom Date Range Inputs
    dateInputRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 8,
        paddingTop: 4,
        paddingBottom: 8,
    },
    dateCol: { flex: 1 },
    dateLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: '#41484D',
        letterSpacing: 0.5,
        marginBottom: 4,
        marginLeft: 2,
    },
    dateBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: 'rgba(193, 199, 205, 0.6)',
        borderRadius: 12,
        paddingHorizontal: 10,
        height: 44,
    },
    dateText: { fontSize: 13, fontWeight: '500', color: '#0B1C30' },
    applyBtn: {
        backgroundColor: '#32617D',
        height: 44,
        paddingHorizontal: 16,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    applyBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },

    // Upload Button
    uploadBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2E5B7B',
        height: 48,
        borderRadius: 12,
        marginTop: 4,
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    uploadBtnText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },

    // Results List
    resultsScroll: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 100 },
    resultsList: { gap: 12 },
    resultCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 16,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    recentLeft: { flex: 1, flexDirection: 'row', alignItems: 'center' },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    pdfBg: { backgroundColor: '#FEE2E2' },
    imgBg: { backgroundColor: '#EEF4FA' },
    resultInfo: { flex: 1, paddingRight: 8 },
    resultTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
    resultMeta: { flexDirection: 'column', alignItems: 'flex-start', marginTop: 2 },
    resultType: { fontSize: 12, color: '#475569', marginBottom: 2, fontWeight: '500' },
    resultDate: { fontSize: 12, color: '#94A3B8', fontWeight: '500' },
    actionBtn: { padding: 8 },

    // Empty State
    emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 60 },
    emptyStateText: { marginTop: 12, fontSize: 15, color: '#71787E' },

    // Profile Switcher Modal
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

    // Overlay Menus
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end', zIndex: 1000, elevation: 1000 },
    sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '60%' },
    sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sheetTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
    sheetItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    sheetItemText: { fontSize: 16, color: '#1E293B' },
    sheetItemTextActive: { fontWeight: '700', color: '#32617D' },
    sheetActionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', gap: 12 },
    sheetActionText: { fontSize: 16, fontWeight: '500', color: '#1E293B' },

    // Edit Modal
    editSheet: { backgroundColor: '#fff', borderRadius: 24, padding: 24, width: '85%' },
    editSheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    editLabel: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 8 },
    editInput: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#0F172A', marginBottom: 24 },
    editActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
    cancelBtn: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
    cancelBtnText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
    saveBtn: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, backgroundColor: '#2E5B7B' },
    saveBtnText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },

    // iOS Picker styles
    iosPickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
    iosPickerContainer: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 34, overflow: 'hidden' },
    iosPickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E2E8F0', backgroundColor: '#F8F9FF' },
    iosPickerHeaderBtn: { minWidth: 60 },
    iosPickerTitle: { fontSize: 16, fontWeight: '600', color: '#0B1C30' },
    iosPickerCancel: { color: '#71787E', fontSize: 16, fontWeight: '500' },
    iosPickerDone: { color: '#32617D', fontSize: 16, fontWeight: '700', textAlign: 'right' },
    iosDatePicker: { height: 216, backgroundColor: '#FFFFFF', width: '100%' },

    // Viewer Modal
    viewerSafe: { flex: 1, backgroundColor: '#F8FAFC' },
    viewerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', backgroundColor: '#FFFFFF' },
    viewerHeaderDark: { backgroundColor: '#000', borderBottomWidth: 0 },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
    viewerTitleText: { flex: 1, fontSize: 15, fontWeight: '700', color: '#1E293B', textAlign: 'center', marginHorizontal: 8 },
    viewerLoader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    imageViewerContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
    fullImage: { width: '100%', height: '100%' }
});