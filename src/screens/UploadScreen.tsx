import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Platform,
    Image,
    Alert,
    Modal,
    ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as Print from 'expo-print';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- Accessibility Lock ---
const FixedText = (props: any) => (
    <Text allowFontScaling={false} maxFontSizeMultiplier={1} {...props} />
);

// --- Constants / Fallbacks ---
const FALLBACK_CATEGORIES = [
    { id: 'cat_1', name: 'Prescription' },
    { id: 'cat_2', name: 'Lab Report' },
    { id: 'cat_3', name: 'Radiology (Report & Film)', children: [{ id: 'sub_1', name: 'X-ray' }, { id: 'sub_2', name: 'CT scans' }, { id: 'sub_3', name: 'MRIs' }, { id: 'sub_4', name: 'Ultrasonography' }] },
    { id: 'cat_4', name: 'Referral Letter' },
    { id: 'cat_5', name: 'Discharge Summary' },
    { id: 'cat_6', name: 'Insurance' },
    { id: 'cat_7', name: 'Medical Bills' },
    { id: 'cat_8', name: 'Others' }
];

// --- Types ---
type FileEntry = { id: string; name: string; timestamp: string; uri: string; mimeType?: string };

// --- UTILITY: copy any picker URI into app's cache ---
const stableUri = async (uri: string, filename: string): Promise<string> => {
    if (uri.startsWith(FileSystem.cacheDirectory!)) return uri;

    const dest = FileSystem.cacheDirectory + filename;
    const info = await FileSystem.getInfoAsync(dest);
    if (info.exists) await FileSystem.deleteAsync(dest, { idempotent: true });
    await FileSystem.copyAsync({ from: uri, to: dest });
    return dest;
};

const getImageDimensions = (uri: string): Promise<{ width: number, height: number }> => {
    return new Promise((resolve) => {
        Image.getSize(
            uri,
            (width, height) => resolve({ width, height }),
            (error) => resolve({ width: 800, height: 1131 })
        );
    });
};

const nowStamp = (): string => {
    const d = new Date();
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
        + ', '
        + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

// --- COMPONENT ---
export default function UploadScreen({ navigation }: any) {

    // API State
    const [profiles, setProfiles] = useState<any[]>([]);
    const [selectedProfile, setSelectedProfile] = useState<any>(null);

    const [categories, setCategories] = useState<any[]>(FALLBACK_CATEGORIES);
    const [selectedCategory, setSelectedCategory] = useState<any>(null);
    const [radiologySubcategories, setRadiologySubcategories] = useState<any[]>([]);
    const [selectedRadiologySubcategory, setSelectedRadiologySubcategory] = useState<any>(null);

    const [recentRecords, setRecentRecords] = useState<any[]>([]);
    const [uploading, setUploading] = useState(false);

    // Form State
    const [uploadSource, setUploadSource] = useState<'camera' | 'gallery' | 'files' | null>(null);
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [dropdownType, setDropdownType] = useState<'main' | 'sub' | 'profile'>('main');

    // Action Menu & Viewer State
    const [actionMenuVisible, setActionMenuVisible] = useState(false);
    const [activeItem, setActiveItem] = useState<any>(null);
    const [selectedFiles, setSelectedFiles] = useState<FileEntry[]>([]);
    const [viewerVisible, setViewerVisible] = useState(false);
    const [viewerUri, setViewerUri] = useState('');
    const [viewerName, setViewerName] = useState('');
    const [viewerMime, setViewerMime] = useState('');

    // Fetch Initial Data
    const fetchApiData = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) return;
            const headers = { 'Authorization': `Bearer ${token}` };

            const [profRes, catRes, recRes] = await Promise.all([
                fetch(`${process.env.EXPO_PUBLIC_API_URL}/profiles`, { headers }).catch(() => null),
                fetch(`${process.env.EXPO_PUBLIC_API_URL}/record-categories`, { headers }).catch(() => null),
                fetch(`${process.env.EXPO_PUBLIC_API_URL}/records`, { headers }).catch(() => null)
            ]);

            if (profRes && profRes.ok) {
                const data = await profRes.json();
                setProfiles(data || []);
                const savedProfile = await AsyncStorage.getItem("active_profile");
                if (savedProfile) {
                    try { setSelectedProfile(JSON.parse(savedProfile)); } catch { }
                } else if (data?.length > 0) {
                    setSelectedProfile(data[0]);
                }
            }

            if (catRes && catRes.ok) {
                const data = await catRes.json();
                if (data?.length > 0) {
                    setCategories(data);
                    setSelectedCategory(data[0]);
                }
            }

            if (recRes && recRes.ok) {
                const data = await recRes.json();
                setRecentRecords(data || []);
            }
        } catch (err) {
            console.error("Fetch Data Error:", err);
        }
    };

    useEffect(() => {
        fetchApiData();
    }, []);

    // file picking
    const handleFilePick = async (source: 'camera' | 'gallery' | 'files') => {
        setUploadSource(source);
        try {
            if (source === 'camera') {
                const perm = await ImagePicker.requestCameraPermissionsAsync();
                if (!perm.granted) { Alert.alert('Permission Denied', 'Camera permission is required.'); return; }
                const res = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
                if (!res.canceled && res.assets) {
                    const ms = Date.now();
                    setSelectedFiles(p => [...p, { id: String(ms), name: res.assets[0].fileName || `camera_${ms}.jpg`, timestamp: nowStamp(), uri: res.assets[0].uri, mimeType: 'image/jpeg' }]);
                }
            } else if (source === 'gallery') {
                const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (!perm.granted) { Alert.alert('Permission Denied', 'Gallery permission is required.'); return; }
                const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8, allowsMultipleSelection: true });
                if (!res.canceled && res.assets) {
                    const files = res.assets.map((a, i) => ({ id: String(Date.now() + i), name: a.fileName || `image_${Date.now() + i}.jpg`, timestamp: nowStamp(), uri: a.uri, mimeType: 'image/jpeg' }));
                    setSelectedFiles(p => [...p, ...files]);
                }
            } else {
                const res = await DocumentPicker.getDocumentAsync({ type: ['image/*', 'application/pdf'], copyToCacheDirectory: true, multiple: true });
                if (!res.canceled && res.assets) {
                    const files = res.assets.map((a, i) => ({ id: String(Date.now() + i), name: a.name, timestamp: nowStamp(), uri: a.uri, mimeType: a.mimeType }));
                    setSelectedFiles(p => [...p, ...files]);
                }
            }
        } catch (e) {
            Alert.alert('Error', 'Something went wrong while selecting the file.');
        }
        setTimeout(() => setUploadSource(null), 500);
    };

    // upload handler
    const handleUpload = () => {
        if (!selectedFiles.length) { Alert.alert('Missing File', 'Please select a file to upload.'); return; }
        if (!selectedProfile?.id) { Alert.alert('Missing Profile', 'Please select a profile first.'); return; }
        if (!selectedCategory) { Alert.alert('Missing Category', 'Please select a category first.'); return; }
        if (selectedCategory?.name === 'Radiology (Report & Film)' && !selectedRadiologySubcategory) { Alert.alert('Missing Type', 'Please select a Radiology type.'); return; }

        const areAllImages = selectedFiles.length > 1 && selectedFiles.every(f => !f.name.toLowerCase().endsWith('.pdf'));

        if (areAllImages) {
            Alert.alert('Multiple Images Selected', 'Do you want to combine these into a single PDF or upload them separately?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Upload Separately', onPress: () => processUpload('separate') },
                { text: 'Combine as PDF', onPress: () => processUpload('pdf') },
            ]);
        } else {
            processUpload('separate');
        }
    };

    const processUpload = async (mode: 'separate' | 'pdf') => {
        setUploading(true);
        try {
            const token = await AsyncStorage.getItem('token');
            const filesToUpload = [];

            if (mode === 'pdf') {
                const imagesToConvert = selectedFiles.filter(f => !f.name.toLowerCase().endsWith('.pdf'));

                if (imagesToConvert.length === 0) {
                    Alert.alert('Notice', 'Only image files can be combined into a PDF.');
                    setUploading(false);
                    return;
                }

                const firstImageSafeUri = await stableUri(imagesToConvert[0].uri, `temp_${imagesToConvert[0].id}`);
                const { width: PAGE_W, height: PAGE_H } = await getImageDimensions(firstImageSafeUri);

                const pageDivs = await Promise.all(
                    imagesToConvert.map(async (file) => {
                        let currentUri = file.uri;

                        // Resizing image step matching the web logic before base64 compilation
                        try {
                            const dims = await getImageDimensions(file.uri);
                            const maxWidth = 1600;
                            const maxHeight = 1600;
                            const actions = [];

                            if (dims.width > maxWidth || dims.height > maxHeight) {
                                const ratio = Math.min(maxWidth / dims.width, maxHeight / dims.height);
                                actions.push({
                                    resize: {
                                        width: Math.round(dims.width * ratio),
                                        height: Math.round(dims.height * ratio)
                                    }
                                });
                            }
                            const manip = await ImageManipulator.manipulateAsync(
                                file.uri,
                                actions,
                                { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG }
                            );
                            currentUri = manip.uri;
                        } catch (e) {
                            console.error("PDF image sizing downscaled fallback", e);
                        }

                        const safeUri = await stableUri(currentUri, `upload_${file.id}_${file.name}`);
                        const b64 = await FileSystem.readAsStringAsync(safeUri, { encoding: FileSystem.EncodingType.Base64 });
                        const ext = file.name.split('.').pop()?.toLowerCase();
                        const mime = ext === 'png' ? 'image/png' : 'image/jpeg';

                        return `
                            <div class="page">
                                <img src="data:${mime};base64,${b64}" />
                            </div>
                        `;
                    })
                );

                const html = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8"/>
                        <style>
                            @page { margin: 0; size: ${PAGE_W}px ${PAGE_H}px; } 
                            * { margin: 0; padding: 0; box-sizing: border-box; }
                            html, body { width: ${PAGE_W}px; height: ${PAGE_H}px; background: #000000; }
                            .page { width: ${PAGE_W}px; height: ${PAGE_H}px; display: flex; align-items: center; justify-content: center; page-break-after: always; page-break-inside: avoid; background: #000000; }
                            .page img { max-width: 100%; max-height: 100%; width: auto; height: auto; object-fit: contain; display: block; }
                        </style>
                    </head>
                    <body>
                        ${pageDivs.join('\n')}
                    </body>
                    </html>
                `;

                const { uri: pdfUri } = await Print.printToFileAsync({ html, width: PAGE_W, height: PAGE_H, base64: false });
                const pdfName = `combined-medical-record-${Date.now()}.pdf`;

                filesToUpload.push({ uri: pdfUri, name: pdfName, type: 'application/pdf' });
            } else {
                for (const f of selectedFiles) {
                    let currentUri = f.uri;
                    let targetName = f.name;

                    // Web App Canvas Resolution Matching for individual file mode
                    if (!f.name.toLowerCase().endsWith('.pdf')) {
                        try {
                            const dims = await getImageDimensions(f.uri);
                            const maxWidth = 1600;
                            const maxHeight = 1600;
                            const actions = [];

                            if (dims.width > maxWidth || dims.height > maxHeight) {
                                const ratio = Math.min(maxWidth / dims.width, maxHeight / dims.height);
                                actions.push({
                                    resize: {
                                        width: Math.round(dims.width * ratio),
                                        height: Math.round(dims.height * ratio)
                                    }
                                });
                            }
                            const manip = await ImageManipulator.manipulateAsync(
                                f.uri,
                                actions,
                                { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG }
                            );
                            currentUri = manip.uri;
                            targetName = f.name.replace(/\.(png|jpg|jpeg)$/i, '.jpg');
                        } catch (err) {
                            console.error("Downsizing exception fallback", err);
                        }
                    }

                    const ext = targetName.includes('.') ? targetName.split('.').pop() : 'tmp';
                    const safeUri = await stableUri(currentUri, `upload_cache_${f.id}.${ext}`);

                    let strictType = 'application/octet-stream';
                    const lowerName = targetName.toLowerCase();
                    if (lowerName.endsWith('.pdf')) strictType = 'application/pdf';
                    else if (lowerName.endsWith('.png')) strictType = 'image/png';
                    else if (lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) strictType = 'image/jpeg';

                    filesToUpload.push({
                        uri: safeUri,
                        name: targetName,
                        type: strictType
                    });
                }
            }

            for (const file of filesToUpload) {
                const formData = new FormData();

                // Form field sequences aligned to backend multi-stream reader configuration
                formData.append("title", String(file.name));
                formData.append("profileId", String(selectedProfile?.id));

                const catId = selectedRadiologySubcategory?.id || selectedCategory?.id;
                formData.append("categoryId", String(catId));
                formData.append("notes", "");

                formData.append("file", {
                    uri: file.uri,
                    name: file.name,
                    type: file.type
                } as any);

                const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/records/upload`, {
                    method: "POST",
                    headers: { "Authorization": `Bearer ${token}` },
                    body: formData
                });

                if (!response.ok) {
                    const err = await response.json().catch(() => ({}));
                    throw new Error(err.message || "Upload failed");
                }
            }

            Alert.alert("Success", "Files uploaded successfully");
            setSelectedFiles([]);
            fetchApiData();

        } catch (err: any) {
            Alert.alert("Error", err.message || "Something went wrong during upload");
        } finally {
            setUploading(false);
        }
    };

    // VIEWER LOGIC 
    const handleViewFile = async (item: any) => {
        const fileUrl = item.fileUrl ? `${process.env.EXPO_PUBLIC_API_URL}${item.fileUrl}` : item.uri;
        const format = item.fileType?.includes('pdf') || item.format === 'pdf' ? 'pdf' : 'image';

        if (!fileUrl) {
            Alert.alert('Error', 'Invalid file URL.');
            return;
        }

        try {
            if (fileUrl.startsWith('http')) {
                setViewerName(item.title || item.name);
                setViewerUri(fileUrl);
                setViewerMime(format === 'image' ? 'image/jpeg' : 'application/pdf');
                setViewerVisible(true);
            } else {
                const safeUri = await stableUri(fileUrl, `view_${item.name}`);
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

    const handleDownloadFile = async (item: any) => {
        const fileUrl = item.fileUrl ? `${process.env.EXPO_PUBLIC_API_URL}${item.fileUrl}` : item.uri;
        if (!fileUrl) {
            Alert.alert('Error', 'Invalid file URL.');
            return;
        }

        try {
            const safeUri = await stableUri(fileUrl, `download_${item.title || item.name || 'document'}`);
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(safeUri, { dialogTitle: 'Save Document' });
            } else {
                Alert.alert('Notice', 'Sharing/Saving is not available on this device.');
            }
        } catch (error) {
            Alert.alert('Error', 'Could not download file.');
        }
    };

    const handleDeleteRecent = async (id: string) => {
        Alert.alert('Delete File', 'Are you sure you want to remove this record?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    try {
                        const token = await AsyncStorage.getItem('token');
                        await fetch(`${process.env.EXPO_PUBLIC_API_URL}/records/${id}`, {
                            method: 'DELETE',
                            headers: { "Authorization": `Bearer ${token}` }
                        });
                        fetchApiData();
                    } catch (e) {
                        Alert.alert('Error', 'Failed to delete record');
                    }
                }
            },
        ]);
    };

    const openDropdown = (type: 'main' | 'sub' | 'profile') => {
        setDropdownType(type);
        setDropdownVisible(true);
    };

    const handleDropdownSelect = (item: any) => {
        if (dropdownType === 'main') {
            setSelectedCategory(item);
            if (item.name === 'Radiology (Report & Film)' && item.children) {
                setRadiologySubcategories(item.children);
                setSelectedRadiologySubcategory(null);
            } else {
                setRadiologySubcategories([]);
            }
        } else if (dropdownType === 'sub') {
            setSelectedRadiologySubcategory(item);
        } else if (dropdownType === 'profile') {
            setSelectedProfile(item);
            AsyncStorage.setItem("active_profile", JSON.stringify(item));
        }
        setDropdownVisible(false);
    };

    const getInitials = (name?: string) => {
        if (!name) return "NA";
        return name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
    };

    return (
        <SafeAreaView style={s.safeArea}>
            <View style={s.container}>
                <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

                    {/* HEADER */}
                    <View style={s.header}>
                        <FixedText style={s.title}>Upload Medical Record</FixedText>
                        <FixedText style={s.subtitle}>Securely store your health documents in our encrypted vault.</FixedText>
                    </View>

                    {/* FORM CARD */}
                    <View style={s.card}>

                        {/* Category Selection */}
                        <View style={s.inputGroup}>
                            <FixedText style={s.inputLabel}>Select Category</FixedText>
                            <TouchableOpacity style={s.selectBox} activeOpacity={0.7} onPress={() => openDropdown('main')}>
                                <FixedText style={[s.selectText, !selectedCategory && { color: '#41484D' }]}>
                                    {selectedCategory?.name || 'Select'}
                                </FixedText>
                                <MaterialIcons name="expand-more" size={20} color="#71787E" />
                            </TouchableOpacity>
                        </View>

                        {/* Radiology sub-category */}
                        {radiologySubcategories.length > 0 && (
                            <View style={[s.inputGroup, { marginTop: 12 }]}>
                                <FixedText style={s.inputLabel}>Radiology Type</FixedText>
                                <TouchableOpacity style={s.selectBox} activeOpacity={0.7} onPress={() => openDropdown('sub')}>
                                    <FixedText style={[s.selectText, !selectedRadiologySubcategory && { color: '#41484D' }]}>
                                        {selectedRadiologySubcategory?.name || 'Select Type'}
                                    </FixedText>
                                    <MaterialIcons name="expand-more" size={20} color="#71787E" />
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Uploading For Profile Selection */}
                        <View style={s.familySection}>
                            <FixedText style={s.familyHeaderTitle}>UPLOADING FOR</FixedText>
                            <FixedText style={s.familySubTitle}>Choose family member for this record</FixedText>

                            <TouchableOpacity style={s.familyCard} activeOpacity={0.8} onPress={() => openDropdown('profile')}>
                                <View style={s.familyAvatar}>
                                    <FixedText style={s.familyInitials}>{getInitials(selectedProfile?.fullName)}</FixedText>
                                </View>
                                <View style={s.familyInfo}>
                                    <FixedText style={s.familyName}>{selectedProfile?.fullName || 'Select Profile'}</FixedText>
                                    <FixedText style={s.familyRelation}>{selectedProfile?.relationship || '-'} • {selectedProfile?.bloodGroup || '-'}</FixedText>
                                </View>
                                <MaterialIcons name="expand-more" size={24} color="#71787E" />
                            </TouchableOpacity>
                        </View>

                        {/* Source cards */}
                        <View style={s.sourceGrid}>
                            {(['camera', 'gallery', 'files'] as const).map((src) => {
                                const isActive = uploadSource === src;
                                return (
                                    <TouchableOpacity
                                        key={src}
                                        style={[s.sourceCard, isActive && s.sourceCardActive]}
                                        onPress={() => handleFilePick(src)}
                                        activeOpacity={0.7}
                                    >
                                        <MaterialIcons
                                            name={src === 'camera' ? 'photo-camera' : src === 'gallery' ? 'collections' : 'folder'}
                                            size={28}
                                            color="#32617D"
                                        />
                                        <FixedText style={[s.sourceText, isActive && s.sourceTextActive]}>
                                            {src.charAt(0).toUpperCase() + src.slice(1)}
                                        </FixedText>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* Staged files */}
                        {selectedFiles.length > 0 && (
                            <View style={s.stagedList}>
                                {selectedFiles.map(f => (
                                    <View key={f.id} style={s.stagedItem}>
                                        <View style={s.stagedIcon}>
                                            {f.uri && !f.name.toLowerCase().endsWith('.pdf')
                                                ? <Image source={{ uri: f.uri }} style={s.thumb} />
                                                : <MaterialIcons
                                                    name={f.name.toLowerCase().endsWith('.pdf') ? 'picture-as-pdf' : 'image'}
                                                    size={24}
                                                    color={'#32617D'}
                                                />
                                            }
                                        </View>
                                        <View style={s.stagedInfo}>
                                            <FixedText style={s.stagedName} numberOfLines={1}>{f.name}</FixedText>
                                            <FixedText style={s.stagedTs}>{f.timestamp}</FixedText>
                                        </View>
                                        <TouchableOpacity onPress={() => setSelectedFiles(p => p.filter(x => x.id !== f.id))} style={s.removeBtn}>
                                            <MaterialIcons name="close" size={20} color="#71787E" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Save Button */}
                        <TouchableOpacity
                            style={[s.saveBtn, uploading && { opacity: 0.8 }]}
                            activeOpacity={0.9}
                            onPress={handleUpload}
                            disabled={uploading}
                        >
                            {uploading
                                ? <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                    <ActivityIndicator color="#ffffff" size="small" />
                                    <FixedText style={s.saveBtnText}>Uploading...</FixedText>
                                </View>
                                : <FixedText style={s.saveBtnText}>Upload to Vault</FixedText>
                            }
                        </TouchableOpacity>
                    </View>

                    {/* RECENT LIST */}
                    <View style={s.recentSection}>
                        <FixedText style={s.sectionTitle}>Recently Uploaded</FixedText>
                        <View style={s.recentList}>
                            {recentRecords.map((item: any) => {
                                const isPdf = item.fileType?.includes('pdf');
                                return (
                                    <View key={item.id} style={s.recentItem}>
                                        <TouchableOpacity
                                            style={s.recentLeft}
                                            activeOpacity={0.7}
                                            onPress={() => handleViewFile(item)}
                                        >
                                            <View style={[s.recentIcon, isPdf ? s.pdfBg : s.imgBg]}>
                                                <MaterialIcons
                                                    name={isPdf ? 'description' : 'science'}
                                                    size={24}
                                                    color={isPdf ? '#fcfcff' : '#2D8A6F'}
                                                />
                                            </View>
                                            <View style={s.recentInfo}>
                                                <FixedText style={s.recentName} numberOfLines={1}>{item.title}</FixedText>
                                                <FixedText style={s.recentTs}>{item.profile?.fullName || '-'} • {isPdf ? 'PDF' : 'IMAGE'}</FixedText>
                                                <View style={s.recentTagWrap}>
                                                    <FixedText style={s.recentTag}>{item.category?.name || 'Document'}</FixedText>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={s.actionBtn} onPress={() => { setActiveItem(item); setActionMenuVisible(true); }}>
                                            <MaterialIcons name="more-vert" size={24} color="#71787E" />
                                        </TouchableOpacity>
                                    </View>
                                );
                            })}
                            {recentRecords.length === 0 && (
                                <FixedText style={{ color: '#71787E', textAlign: 'center', marginTop: 12 }}>No recent uploads.</FixedText>
                            )}
                        </View>
                    </View>

                </ScrollView>

                {/* --- ITEM ACTION MENU OVERLAY --- */}
                {actionMenuVisible && activeItem && (
                    <View style={s.overlay}>
                        <TouchableOpacity style={StyleSheet.absoluteFillObject} activeOpacity={1} onPress={() => setActionMenuVisible(false)} />
                        <View style={s.sheet}>
                            <View style={s.sheetHeader}>
                                <FixedText style={[s.sheetTitle, { flex: 1, marginRight: 16 }]} numberOfLines={1}>
                                    {activeItem.title || activeItem.name}
                                </FixedText>
                                <TouchableOpacity onPress={() => setActionMenuVisible(false)}>
                                    <MaterialIcons name="close" size={24} color="#0b1c30" />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={s.sheetActionItem}
                                onPress={() => { setActionMenuVisible(false); handleViewFile(activeItem); }}
                            >
                                <MaterialIcons name="visibility" size={24} color="#32617D" />
                                <FixedText style={s.sheetActionText}>View Document</FixedText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={s.sheetActionItem}
                                onPress={() => { setActionMenuVisible(false); handleDownloadFile(activeItem); }}
                            >
                                <MaterialIcons name="file-download" size={24} color="#32617D" />
                                <FixedText style={s.sheetActionText}>Download / Save</FixedText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[s.sheetActionItem, { borderBottomWidth: 0 }]}
                                onPress={() => { setActionMenuVisible(false); handleDeleteRecent(activeItem.id); }}
                            >
                                <MaterialIcons name="delete-outline" size={24} color="#ba1a1a" />
                                <FixedText style={[s.sheetActionText, { color: '#ba1a1a' }]}>Delete Record</FixedText>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* --- CATEGORY/PROFILE DROPDOWN OVERLAY --- */}
                {dropdownVisible && (
                    <View style={s.overlay}>
                        <TouchableOpacity style={StyleSheet.absoluteFillObject} activeOpacity={1} onPress={() => setDropdownVisible(false)} />
                        <View style={s.sheet}>
                            <View style={s.sheetHeader}>
                                <FixedText style={s.sheetTitle}>
                                    {dropdownType === 'main' ? 'Select Category' : dropdownType === 'profile' ? 'Select Profile' : 'Select Radiology Type'}
                                </FixedText>
                                <TouchableOpacity onPress={() => setDropdownVisible(false)}>
                                    <MaterialIcons name="close" size={24} color="#0b1c30" />
                                </TouchableOpacity>
                            </View>
                            <ScrollView showsVerticalScrollIndicator={false}>
                                {(dropdownType === 'main' ? categories : dropdownType === 'profile' ? profiles : radiologySubcategories).map((item: any, i) => (
                                    <TouchableOpacity key={item.id || i} style={s.sheetItem} onPress={() => handleDropdownSelect(item)}>
                                        <FixedText style={s.sheetItemText}>{item.fullName || item.name}</FixedText>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>
                )}

                {/* --- IN-APP VIEWER MODAL --- */}
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
                            <FixedText style={[s.viewerTitle, viewerMime.startsWith('image') && { color: '#ffffff' }]} numberOfLines={1}>
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

// --- Styles ---
const s = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f8f9ff' },
    container: { flex: 1 },
    scroll: { paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 24 : 16, paddingBottom: 40, gap: 32 },

    // Header
    header: { paddingTop: 24, paddingBottom: 8, gap: 8 },
    title: { fontSize: 28, fontWeight: '600', color: '#32617d' },
    subtitle: { fontSize: 14, color: '#41484d' },

    // Card Form
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 8,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(193, 199, 205, 0.3)',
        shadowColor: '#5d8aa8',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    inputGroup: {},
    inputLabel: { fontSize: 12, fontWeight: '500', color: '#0b1c30', marginBottom: 8 },
    selectBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f8f9ff',
        borderWidth: 1,
        borderColor: '#c1c7cd',
        borderRadius: 8,
        height: 48,
        paddingHorizontal: 12,
        shadowColor: '#5d8aa8',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    selectText: { fontSize: 14, color: '#0b1c30' },

    // Family Section
    familySection: { marginTop: 16 },
    familyHeaderTitle: { fontSize: 12, fontWeight: '500', color: '#0b1c30', letterSpacing: 0.5 },
    familySubTitle: { fontSize: 14, color: '#41484d', marginTop: 4 },
    familyCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9ff',
        borderWidth: 1,
        borderColor: '#c1c7cd',
        borderRadius: 8,
        padding: 12,
        marginTop: 8,
        shadowColor: '#5d8aa8',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    familyAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#4c7a97',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    familyInitials: { fontSize: 14, fontWeight: '600', color: '#fcfcff' },
    familyInfo: { flex: 1 },
    familyName: { fontSize: 14, fontWeight: '600', color: '#0b1c30' },
    familyRelation: { fontSize: 12, color: '#41484d', marginTop: 2 },

    // Source Grid
    sourceGrid: { flexDirection: 'row', gap: 8, marginTop: 16 },
    sourceCard: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 8,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: 'rgba(193, 199, 205, 0.5)',
    },
    sourceCardActive: {
        backgroundColor: '#e5eeff',
        borderColor: 'rgba(50, 97, 125, 0.5)',
        shadowColor: '#5d8aa8',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 2,
    },
    sourceText: { fontSize: 12, color: '#41484d', marginTop: 8, fontWeight: '500' },
    sourceTextActive: { color: '#32617d', fontWeight: '700' },

    // Save Button
    saveBtn: {
        backgroundColor: '#32617d',
        height: 48,
        borderRadius: 9999,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
    },
    saveBtnText: { fontSize: 20, fontWeight: '600', color: '#ffffff' },

    // Staged list
    stagedList: { gap: 8, marginTop: 16, marginBottom: -8 },
    stagedItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8f9ff', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: 'rgba(193, 199, 205, 0.3)' },
    stagedIcon: { width: 44, height: 44, borderRadius: 8, backgroundColor: '#e5eeff', alignItems: 'center', justifyContent: 'center', marginRight: 12, overflow: 'hidden' },
    thumb: { width: '100%', height: '100%', resizeMode: 'cover' },
    stagedInfo: { flex: 1 },
    stagedName: { fontSize: 14, fontWeight: '600', color: '#0b1c30', marginBottom: 2 },
    stagedTs: { fontSize: 11, color: '#41484d' },
    removeBtn: { padding: 4, borderRadius: 20 },

    // Recent Uploads
    recentSection: { flex: 1, marginTop: 8 },
    sectionTitle: { fontSize: 20, fontWeight: '600', color: '#0b1c30', marginBottom: 12 },
    recentList: { gap: 8 },
    recentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: 'rgba(193, 199, 205, 0.3)',
        shadowColor: '#5d8aa8',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 1,
    },
    recentLeft: { flex: 1, flexDirection: 'row', alignItems: 'center' },
    recentIcon: { width: 48, height: 48, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    pdfBg: { backgroundColor: '#4c7a97' },
    imgBg: { backgroundColor: '#E7F3EF' },
    recentInfo: { flex: 1, paddingRight: 8 },
    recentName: { fontSize: 14, fontWeight: '600', color: '#0b1c30', marginBottom: 2 },
    recentTs: { fontSize: 12, color: '#41484d' },
    recentTagWrap: { marginTop: 6, alignSelf: 'flex-start', backgroundColor: '#e5eeff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 9999 },
    recentTag: { fontSize: 10, fontWeight: '500', color: '#41484d' },
    actionBtn: { padding: 8 },

    // Overlay Menus
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end', zIndex: 1000, elevation: 1000 },
    sheet: { backgroundColor: '#ffffff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '60%' },
    sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sheetTitle: { fontSize: 18, fontWeight: '700', color: '#0b1c30' },
    sheetItem: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f8f9ff' },
    sheetItemText: { fontSize: 16, color: '#0b1c30' },
    sheetActionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f8f9ff', gap: 12 },
    sheetActionText: { fontSize: 16, fontWeight: '500', color: '#0b1c30' },

    // Viewer Modal
    viewerSafe: { flex: 1, backgroundColor: '#f8f9ff' },
    viewerHeader: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 12,
        borderBottomWidth: 1, borderBottomColor: 'rgba(193, 199, 205, 0.3)', backgroundColor: '#ffffff',
    },
    viewerHeaderDark: { backgroundColor: '#000', borderBottomWidth: 0 },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f8f9ff', alignItems: 'center', justifyContent: 'center' },
    viewerTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: '#0b1c30', textAlign: 'center', marginHorizontal: 8 },
    viewerLoader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    imageViewerContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
    fullImage: { width: '100%', height: '100%' }
});