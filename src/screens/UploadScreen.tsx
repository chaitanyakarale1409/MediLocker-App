import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Platform,
    Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

// --- Accessibility Lock ---
const FixedText = (props: any) => (
    <Text allowFontScaling={false} maxFontSizeMultiplier={1} {...props} />
);

const CATEGORIES = [
    { label: 'Lab Reports', value: 'Lab Reports' },
    { label: 'Prescriptions', value: 'Prescriptions' },
    { label: 'Imaging', value: 'Imaging' },
];

export default function UploadScreen({ navigation }: any) {
    const [selectedCategory, setSelectedCategory] = useState('');
    const [uploadSource, setUploadSource] = useState<'camera' | 'gallery' | 'files'>('gallery');
    const [activeTab, setActiveTab] = useState<'recent' | 'recommended'>('recent');
    const [dropdownVisible, setDropdownVisible] = useState(false);

    // Dynamic State for Files
    const [selectedFiles, setSelectedFiles] = useState<{ id: string; name: string; timestamp: string; uri?: string }[]>([]);
    const [recentUploads, setRecentUploads] = useState([
        { id: '1', name: 'Blood_Test_Results_Aug.pdf', timestamp: '18 May 2026, 10:30 AM', format: 'pdf' },
        { id: '2', name: 'Dermatology_Prescription_v1.jpg', timestamp: '17 May 2026, 02:15 PM', format: 'image' },
    ]);

    // Format Current Time (e.g., "19 May 2026, 05:16 PM")
    const getCurrentTimestamp = () => {
        const now = new Date();
        return now.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        }) + ', ' + now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Launch Camera or Gallery
    const handleFilePick = async (source: 'camera' | 'gallery' | 'files') => {
        setUploadSource(source);
        let result;

        if (source === 'camera') {
            const permission = await ImagePicker.requestCameraPermissionsAsync();
            if (!permission.granted) {
                alert('Camera permission is required to take photos.');
                return;
            }
            result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.8,
            });
        } else {
            // For both Gallery and Files we open the media library
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) {
                alert('Gallery permission is required to select photos.');
                return;
            }
            result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.8,
            });
        }

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const timestampMs = new Date().getTime();
            const newFile = {
                id: timestampMs.toString(),
                name: `image1_${timestampMs}.jpg`, // Fixed naming format requested
                timestamp: getCurrentTimestamp(),
                uri: result.assets[0].uri,
            };
            setSelectedFiles((prev) => [...prev, newFile]);
        }
    };

    const removeSelectedFile = (id: string) => {
        setSelectedFiles((prev) => prev.filter((file) => file.id !== id));
    };

    const handleUpload = () => {
        if (selectedFiles.length === 0) {
            alert('Please select a file to upload.');
            return;
        }
        if (!selectedCategory) {
            alert('Please select a category first.');
            return;
        }

        // Move selected files into the recent uploads list
        const newUploads = selectedFiles.map((file) => ({
            id: file.id,
            name: file.name,
            timestamp: file.timestamp, // Moving timestamp over instead of category
            format: 'image',
        }));

        setRecentUploads((prev) => [...newUploads, ...prev]);
        setSelectedFiles([]); // Clear staging area
        setActiveTab('recent'); // Switch to recent tab to view uploads
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* HEADER */}
                    <View style={styles.header}>
                        <View style={styles.headerTopRow}>
                            <View style={styles.titleRow}>
                                {/* Back button omitted if using as Bottom Tab, but kept for structural integrity */}
                                <FixedText style={styles.title}>Upload Medical Record</FixedText>
                            </View>
                        </View>
                        <FixedText style={styles.subtitle}>
                            Securely store your health documents in our encrypted vault.
                        </FixedText>
                    </View>

                    {/* UPLOAD FORM CARD */}
                    <View style={styles.uploadCard}>

                        {/* Category Select */}
                        <View style={styles.inputGroup}>
                            <FixedText style={styles.inputLabel}>Select Category</FixedText>
                            <TouchableOpacity
                                style={styles.selectBox}
                                activeOpacity={0.7}
                                onPress={() => setDropdownVisible(true)}
                            >
                                <FixedText style={[styles.selectText, !selectedCategory && { color: '#64748B' }]}>
                                    {selectedCategory || "Select Category"}
                                </FixedText>
                                <MaterialIcons name="expand-more" size={24} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        {/* Source Selection Cards */}
                        <View style={styles.sourceGrid}>
                            <TouchableOpacity
                                style={[styles.sourceCard, uploadSource === 'camera' && styles.sourceCardActive]}
                                onPress={() => handleFilePick('camera')}
                                activeOpacity={0.7}
                            >
                                <MaterialIcons name="photo-camera" size={28} color="#32617D" />
                                <FixedText style={[styles.sourceText, uploadSource === 'camera' && styles.sourceTextActive]}>
                                    Camera
                                </FixedText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.sourceCard, uploadSource === 'gallery' && styles.sourceCardActive]}
                                onPress={() => handleFilePick('gallery')}
                                activeOpacity={0.7}
                            >
                                <MaterialIcons name="collections" size={28} color="#32617D" />
                                <FixedText style={[styles.sourceText, uploadSource === 'gallery' && styles.sourceTextActive]}>
                                    Gallery
                                </FixedText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.sourceCard, uploadSource === 'files' && styles.sourceCardActive]}
                                onPress={() => handleFilePick('files')}
                                activeOpacity={0.7}
                            >
                                <MaterialIcons name="folder" size={28} color="#32617D" />
                                <FixedText style={[styles.sourceText, uploadSource === 'files' && styles.sourceTextActive]}>
                                    Files
                                </FixedText>
                            </TouchableOpacity>
                        </View>

                        {/* Selected Files List (Staging Area) */}
                        {selectedFiles.length > 0 && (
                            <View style={styles.selectedFilesContainer}>
                                {selectedFiles.map((file) => (
                                    <View key={file.id} style={styles.selectedFileItem}>
                                        <View style={styles.selectedFileIconBg}>
                                            {file.uri ? (
                                                <Image source={{ uri: file.uri }} style={styles.thumbnailImg} />
                                            ) : (
                                                <MaterialIcons name="image" size={24} color="#32617D" />
                                            )}
                                        </View>
                                        <View style={styles.selectedFileInfo}>
                                            <FixedText style={styles.selectedFileName} numberOfLines={1}>{file.name}</FixedText>
                                            <FixedText style={styles.timestampText}>{file.timestamp}</FixedText>
                                        </View>
                                        <TouchableOpacity
                                            style={styles.removeFileBtn}
                                            onPress={() => removeSelectedFile(file.id)}
                                        >
                                            <MaterialIcons name="close" size={20} color="#64748B" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Submit Button */}
                        <TouchableOpacity style={styles.submitBtn} activeOpacity={0.8} onPress={handleUpload}>
                            <FixedText style={styles.submitBtnText}>Upload</FixedText>
                        </TouchableOpacity>

                    </View>

                    {/* TABS (Recent / Recommended) */}
                    <View style={styles.tabsContainer}>
                        <TouchableOpacity
                            style={styles.tabButton}
                            onPress={() => setActiveTab('recent')}
                        >
                            <FixedText style={[styles.tabText, activeTab === 'recent' && styles.tabTextActive]}>
                                Recent
                            </FixedText>
                            {activeTab === 'recent' && <View style={styles.activeTabIndicator} />}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.tabButton}
                            onPress={() => setActiveTab('recommended')}
                        >
                            <FixedText style={[styles.tabText, activeTab === 'recommended' && styles.tabTextActive]}>
                                Recommended
                            </FixedText>
                            {activeTab === 'recommended' && <View style={styles.activeTabIndicator} />}
                        </TouchableOpacity>
                    </View>

                    {/* RECENTLY UPLOADED LIST */}
                    <View style={styles.recentSection}>
                        <FixedText style={styles.sectionTitle}>Recently Uploaded</FixedText>

                        <View style={styles.recentList}>
                            {recentUploads.map((item) => (
                                <TouchableOpacity key={item.id} style={styles.recentItem} activeOpacity={0.7}>
                                    <View style={[styles.recentIconBg, item.format === 'pdf' ? styles.pdfBg : styles.imgBg]}>
                                        <MaterialIcons
                                            name={item.format === 'pdf' ? 'picture-as-pdf' : 'image'}
                                            size={24}
                                            color={item.format === 'pdf' ? '#EF4444' : '#32617D'}
                                        />
                                    </View>
                                    <View style={styles.recentInfo}>
                                        <FixedText style={styles.recentName} numberOfLines={1}>{item.name}</FixedText>
                                        {/* Render Timestamp instead of category type */}
                                        <FixedText style={styles.recentType}>{item.timestamp}</FixedText>
                                    </View>
                                    <TouchableOpacity style={styles.moreBtn}>
                                        <MaterialIcons name="more-vert" size={24} color="#64748B" />
                                    </TouchableOpacity>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                </ScrollView>

                {/* --- ABSOLUTE DROPDOWN OVERLAY --- */}
                {dropdownVisible && (
                    <View style={styles.dropdownOverlay}>
                        <TouchableOpacity
                            style={styles.dropdownOutsideTap}
                            activeOpacity={1}
                            onPress={() => setDropdownVisible(false)}
                        />
                        <View style={styles.dropdownContainer}>
                            <View style={styles.dropdownHeader}>
                                <FixedText style={styles.dropdownTitle}>Select Category</FixedText>
                                <TouchableOpacity onPress={() => setDropdownVisible(false)}>
                                    <MaterialIcons name="close" size={24} color="#1E293B" />
                                </TouchableOpacity>
                            </View>
                            <ScrollView showsVerticalScrollIndicator={false}>
                                {CATEGORIES.map((cat, idx) => (
                                    <TouchableOpacity
                                        key={idx}
                                        style={styles.dropdownItem}
                                        onPress={() => {
                                            setSelectedCategory(cat.value);
                                            setDropdownVisible(false);
                                        }}
                                    >
                                        <FixedText style={styles.dropdownItemText}>{cat.label}</FixedText>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>
                )}

            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F8F9FF' },
    container: { flex: 1 },
    scrollContent: { paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 24 : 16, paddingBottom: 40 },

    // Header
    header: { marginBottom: 24 },
    headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    titleRow: { flexDirection: 'row', alignItems: 'center' },
    title: { fontSize: 28, fontWeight: '800', color: '#1E293B' },
    subtitle: { fontSize: 14, color: '#64748B', marginTop: 8 },

    // Upload Card
    uploadCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, marginBottom: 24 },
    inputGroup: { marginBottom: 16 },
    inputLabel: { fontSize: 13, fontWeight: '500', color: '#1E293B', marginBottom: 8 },
    selectBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F8F9FF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, height: 50, paddingHorizontal: 16 },
    selectText: { fontSize: 15, color: '#1E293B' },

    // Source Grid
    sourceGrid: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    sourceCard: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0' },
    sourceCardActive: { backgroundColor: '#EEF4FA', borderColor: '#32617D', borderWidth: 1.5, shadowColor: '#32617D', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
    sourceText: { fontSize: 13, color: '#64748B', marginTop: 8, fontWeight: '500' },
    sourceTextActive: { color: '#32617D', fontWeight: '700' },

    // Selected Files
    selectedFilesContainer: { gap: 8, marginTop: 8 },
    selectedFileItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: 'rgba(50, 97, 125, 0.2)' },
    selectedFileIconBg: { width: 44, height: 44, borderRadius: 8, backgroundColor: '#EEF4FA', alignItems: 'center', justifyContent: 'center', marginRight: 12, overflow: 'hidden' },
    thumbnailImg: { width: '100%', height: '100%', resizeMode: 'cover' },
    selectedFileInfo: { flex: 1, justifyContent: 'center' },
    selectedFileName: { fontSize: 14, fontWeight: '600', color: '#1E293B', marginBottom: 2 },
    timestampText: { fontSize: 11, color: '#64748B' },
    removeFileBtn: { padding: 4, borderRadius: 20 },

    // Submit Button
    submitBtn: { backgroundColor: '#32617D', height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginTop: 24, shadowColor: '#32617D', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
    submitBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },

    // Tabs
    tabsContainer: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', marginBottom: 20 },
    tabButton: { flex: 1, paddingVertical: 12, alignItems: 'center', position: 'relative' },
    tabText: { fontSize: 14, fontWeight: '500', color: '#64748B' },
    tabTextActive: { color: '#32617D', fontWeight: '700' },
    activeTabIndicator: { position: 'absolute', bottom: -1, width: '100%', height: 3, backgroundColor: '#32617D', borderTopLeftRadius: 4, borderTopRightRadius: 4 },

    // Recent Section
    recentSection: { flex: 1 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 12 },
    recentList: { gap: 12 },
    recentItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
    recentIconBg: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    pdfBg: { backgroundColor: '#FEE2E2' },
    imgBg: { backgroundColor: '#EEF4FA' },
    recentInfo: { flex: 1 },
    recentName: { fontSize: 14, fontWeight: '600', color: '#1E293B', marginBottom: 4 },
    recentType: { fontSize: 12, color: '#64748B' },
    moreBtn: { padding: 4 },

    // Dropdown Overlay
    dropdownOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end', zIndex: 1000, elevation: 1000 },
    dropdownOutsideTap: { ...StyleSheet.absoluteFillObject },
    dropdownContainer: { backgroundColor: '#ffffff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '50%' },
    dropdownHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    dropdownTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
    dropdownItem: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    dropdownItemText: { fontSize: 16, color: '#1E293B' },
});