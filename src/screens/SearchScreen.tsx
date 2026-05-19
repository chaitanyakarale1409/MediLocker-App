import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

// Accessibility Lock
const FixedText = (props: any) => (
    <Text allowFontScaling={false} maxFontSizeMultiplier={1} {...props} />
);

// Mock Data Types
interface SearchResult {
    id: string;
    title: string;
    type: 'prescription' | 'report' | 'patient' | 'clinic';
    date: string;
}

const RECENT_SEARCHES = [
    "Blood test report",
    "John Doe prescription",
    "Cardiology clinic",
    "Vaccination records"
];

const MOCK_RESULTS: SearchResult[] = [
    { id: '1', title: 'AR Medico Clinic Dashboard', type: 'clinic', date: 'Active' },
    { id: '2', title: 'Patient Record - Jane Smith', type: 'patient', date: 'Updated Today' },
    { id: '3', title: 'General Checkup Prescription', type: 'prescription', date: '12 May 2026' },
    { id: '4', title: 'Complete Blood Count (CBC)', type: 'report', date: '10 May 2026' },
];

export default function SearchScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');

    const filters = ['All', 'Patients', 'Prescriptions', 'Reports', 'Clinics'];

    const clearSearch = () => setSearchQuery('');

    const getIconForType = (type: string) => {
        switch (type) {
            case 'prescription': return 'receipt-long';
            case 'report': return 'description';
            case 'patient': return 'person';
            case 'clinic': return 'local-hospital';
            default: return 'folder';
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>

                {/* HEADER */}
                <View style={styles.header}>
                    <FixedText style={styles.title}>Search</FixedText>
                    <FixedText style={styles.subtitle}>
                        Find patient records, prescriptions, and clinic files.
                    </FixedText>
                </View>

                {/* SEARCH BAR */}
                <View style={styles.searchContainer}>
                    <MaterialIcons name="search" size={24} color="#94A3B8" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search records..."
                        placeholderTextColor="#94A3B8"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoCapitalize="none"
                        returnKeyType="search"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={clearSearch} style={styles.clearIcon}>
                            <MaterialIcons name="cancel" size={20} color="#94A3B8" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* FILTERS */}
                <View style={styles.filterWrapper}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filterScroll}
                    >
                        {filters.map((filter) => (
                            <TouchableOpacity
                                key={filter}
                                style={[
                                    styles.filterChip,
                                    activeFilter === filter && styles.filterChipActive
                                ]}
                                onPress={() => setActiveFilter(filter)}
                            >
                                <FixedText
                                    style={[
                                        styles.filterText,
                                        activeFilter === filter && styles.filterTextActive
                                    ]}
                                >
                                    {filter}
                                </FixedText>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                    {/* RECENT SEARCHES (Only show if query is empty) */}
                    {searchQuery.length === 0 ? (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <FixedText style={styles.sectionTitle}>Recent Searches</FixedText>
                                <TouchableOpacity>
                                    <FixedText style={styles.clearAllText}>Clear All</FixedText>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.recentList}>
                                {RECENT_SEARCHES.map((item, index) => (
                                    <TouchableOpacity key={index} style={styles.recentItem}>
                                        <MaterialIcons name="history" size={20} color="#94A3B8" />
                                        <FixedText style={styles.recentItemText}>{item}</FixedText>
                                        <MaterialIcons name="north-west" size={16} color="#CBD5E1" style={styles.arrowIcon} />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    ) : (
                        /* SEARCH RESULTS (Show when typing) */
                        <View style={styles.section}>
                            <FixedText style={styles.sectionTitle}>Results for "{searchQuery}"</FixedText>

                            <View style={styles.resultsList}>
                                {MOCK_RESULTS.map((result) => (
                                    <TouchableOpacity key={result.id} style={styles.resultCard}>
                                        <View style={styles.resultIconWrapper}>
                                            <MaterialIcons name={getIconForType(result.type)} size={24} color="#32617D" />
                                        </View>
                                        <View style={styles.resultInfo}>
                                            <FixedText style={styles.resultTitle} numberOfLines={1}>
                                                {result.title}
                                            </FixedText>
                                            <View style={styles.resultMeta}>
                                                <FixedText style={styles.resultType}>{result.type}</FixedText>
                                                <View style={styles.dot} />
                                                <FixedText style={styles.resultDate}>{result.date}</FixedText>
                                            </View>
                                        </View>
                                        <MaterialIcons name="chevron-right" size={24} color="#CBD5E1" />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* QUICK SUGGESTIONS (Can act as a filler when empty) */}
                    {searchQuery.length === 0 && (
                        <View style={styles.section}>
                            <FixedText style={styles.sectionTitle}>Quick Access</FixedText>
                            <View style={styles.quickAccessGrid}>

                                <TouchableOpacity style={styles.quickCard}>
                                    <View style={[styles.quickIconBg, { backgroundColor: '#EEF4FA' }]}>
                                        <MaterialIcons name="receipt-long" size={24} color="#32617D" />
                                    </View>
                                    <FixedText style={styles.quickCardTitle}>Recent Prescriptions</FixedText>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.quickCard}>
                                    <View style={[styles.quickIconBg, { backgroundColor: '#FEF2F2' }]}>
                                        <MaterialIcons name="favorite" size={24} color="#EF4444" />
                                    </View>
                                    <FixedText style={styles.quickCardTitle}>Emergency Contacts</FixedText>
                                </TouchableOpacity>

                            </View>
                        </View>
                    )}

                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F8F9FF',
    },
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 20 : 10,
        paddingBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#1E293B',
    },
    subtitle: {
        fontSize: 14,
        color: '#64748B',
        marginTop: 4,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 56,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        marginBottom: 16,
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#1E293B',
        height: '100%',
    },
    clearIcon: {
        padding: 4,
    },
    filterWrapper: {
        marginBottom: 16,
    },
    filterScroll: {
        paddingHorizontal: 20,
        gap: 10,
    },
    filterChip: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginRight: 8,
    },
    filterChipActive: {
        backgroundColor: '#32617D',
        borderColor: '#32617D',
    },
    filterText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748B',
    },
    filterTextActive: {
        color: '#FFFFFF',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 16,
    },
    clearAllText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#32617D',
    },
    recentList: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        overflow: 'hidden',
    },
    recentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    recentItemText: {
        flex: 1,
        marginLeft: 12,
        fontSize: 15,
        color: '#475569',
    },
    arrowIcon: {
        marginLeft: 8,
    },
    resultsList: {
        gap: 12,
    },
    resultCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    resultIconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: '#EEF4FA',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    resultInfo: {
        flex: 1,
    },
    resultTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
    },
    resultMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    resultType: {
        fontSize: 12,
        color: '#32617D',
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#CBD5E1',
        marginHorizontal: 8,
    },
    resultDate: {
        fontSize: 12,
        color: '#64748B',
    },
    quickAccessGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    quickCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    quickIconBg: {
        width: 48,
        height: 48,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    quickCardTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1E293B',
        textAlign: 'center',
    },
});