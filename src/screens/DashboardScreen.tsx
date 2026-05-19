import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface DashboardScreenProps {
    navigation: NativeStackNavigationProp<any, any>;
}

// Custom Text component to enforce font scaling lock and prevent UI misalignment
const FixedText = (props: any) => (
    <Text allowFontScaling={false} maxFontSizeMultiplier={1} {...props} />
);

export default function DashboardScreen({ navigation }: DashboardScreenProps) {
    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="dark" />

            {/* Top App Bar - Only "Medi Locker" Text */}
            <View style={styles.header}>
                <FixedText style={styles.headerTitle}>Medi Locker</FixedText>
            </View>

            {/* Main Scrollable Content */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Greeting Section */}
                <View style={styles.section}>
                    <FixedText style={styles.greetingTitle}>Personal Health Locker</FixedText>
                    <FixedText style={styles.greetingSubtitle}>Your family's medical history is organized and private.</FixedText>
                </View>

                {/* Active Profile Switcher */}
                <View style={styles.section}>
                    <TouchableOpacity style={styles.profileSwitcher} activeOpacity={0.7}>
                        <View style={styles.profileInfo}>

                            <View style={styles.profileInitialsWrapper}>
                                <FixedText style={styles.profileInitialsText}>AS</FixedText>
                                {/* Online Status Dot */}
                                <View style={styles.onlineDot} />
                            </View>

                            <View style={styles.profileTextContainer}>
                                <View style={styles.profileNameRow}>
                                    <FixedText style={styles.profileName} numberOfLines={1}>Aarohi Sharma</FixedText>
                                    <FixedText style={styles.profileTag}> • Self</FixedText>
                                </View>
                                <FixedText style={styles.profileBloodGroup}>
                                    Blood Group <FixedText style={styles.bloodGroupHighlight}>O+</FixedText>
                                </FixedText>
                            </View>

                        </View>

                        {/* Switch Profile Capsule */}
                        <View style={styles.switchProfileBtn}>
                            <FixedText style={styles.switchProfileText}>Switch Profile</FixedText>
                            <MaterialIcons name="chevron-right" size={16} color="#41484D" />
                        </View>

                    </TouchableOpacity>
                </View>

                {/* Quick Actions */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <FixedText style={styles.sectionTitle}>Quick Actions</FixedText>
                    </View>
                    <View style={styles.quickActionsGrid}>

                        <TouchableOpacity style={styles.quickActionCard} activeOpacity={0.7}>
                            <View style={styles.quickActionIcon}>
                                <MaterialIcons name="upload-file" size={24} color="#32617D" />
                            </View>
                            <FixedText style={styles.quickActionTitle}>Upload Record</FixedText>
                            <FixedText style={styles.quickActionSub}>Add medical documents</FixedText>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.quickActionCard} activeOpacity={0.7}>
                            <View style={styles.quickActionIcon}>
                                <MaterialIcons name="receipt-long" size={24} color="#32617D" />
                            </View>
                            <FixedText style={styles.quickActionTitle}>Prescriptions</FixedText>
                            <FixedText style={styles.quickActionSub}>View prescriptions</FixedText>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.quickActionCard} activeOpacity={0.7}>
                            <View style={styles.quickActionIcon}>
                                <MaterialIcons name="science" size={24} color="#32617D" />
                            </View>
                            <FixedText style={styles.quickActionTitle}>Lab Reports</FixedText>
                            <FixedText style={styles.quickActionSub}>Access pathology reports</FixedText>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.quickActionCard} activeOpacity={0.7}>
                            <View style={styles.quickActionIcon}>
                                <MaterialIcons name="group" size={24} color="#32617D" />
                            </View>
                            <FixedText style={styles.quickActionTitle}>Family Profiles</FixedText>
                            <FixedText style={styles.quickActionSub}>Manage family records</FixedText>
                        </TouchableOpacity>

                    </View>
                </View>

                {/* Recommended Records */}
                <View style={styles.section}>
                    <View style={styles.sectionHeaderContainer}>
                        <FixedText style={styles.sectionTitle}>Recommended Records</FixedText>
                        <FixedText style={styles.sectionSubtitle}>Complete your health vault for better medical access.</FixedText>
                    </View>

                    <View style={styles.listContainer}>
                        <TouchableOpacity style={styles.listItem} activeOpacity={0.7}>
                            <View style={styles.listInfo}>
                                <FixedText style={styles.listTitle}>Add Vaccination Records</FixedText>
                                <FixedText style={styles.listSubtitle}>Keep your immunization history secure.</FixedText>
                            </View>
                            <View style={styles.actionPill}>
                                <FixedText style={styles.actionPillText}>Add</FixedText>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.listItem} activeOpacity={0.7}>
                            <View style={styles.listInfo}>
                                <FixedText style={styles.listTitle}>Upload Insurance Card</FixedText>
                                <FixedText style={styles.listSubtitle}>Access policy details anytime.</FixedText>
                            </View>
                            <View style={styles.actionPill}>
                                <FixedText style={styles.actionPillText}>Upload</FixedText>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.listItem} activeOpacity={0.7}>
                            <View style={styles.listInfo}>
                                <FixedText style={styles.listTitle}>Link Emergency Contacts</FixedText>
                                <FixedText style={styles.listSubtitle}>Ensure quick emergency medical access.</FixedText>
                            </View>
                            <View style={styles.actionPill}>
                                <FixedText style={styles.actionPillText}>Link</FixedText>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Recent Uploads */}
                <View style={[styles.section, { paddingBottom: 20 }]}>
                    <View style={styles.sectionHeaderFlex}>
                        <View>
                            <FixedText style={styles.sectionTitle}>Recent Uploads</FixedText>
                            <FixedText style={styles.sectionSubtitle}>Your latest uploaded health documents</FixedText>
                        </View>
                        <TouchableOpacity style={styles.viewAllBtn}>
                            <FixedText style={styles.viewAllText}>View All</FixedText>
                            <MaterialIcons name="chevron-right" size={16} color="#32617D" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.listContainer}>
                        <TouchableOpacity style={styles.uploadListItem} activeOpacity={0.7}>
                            <View style={styles.uploadListLeft}>
                                <View style={styles.uploadListIcon}>
                                    <MaterialIcons name="science" size={20} color="#32617D" />
                                </View>
                                <View style={styles.uploadTextContainer}>
                                    <FixedText style={styles.listTitle} numberOfLines={1}>CBC Blood Report</FixedText>
                                    <FixedText style={styles.listSubtitle}>Uploaded on 12 May 2026</FixedText>
                                </View>
                            </View>
                            <View style={styles.tagPill}>
                                <FixedText style={styles.tagPillText}>Lab Report</FixedText>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.uploadListItem} activeOpacity={0.7}>
                            <View style={styles.uploadListLeft}>
                                <View style={styles.uploadListIcon}>
                                    <MaterialIcons name="description" size={20} color="#32617D" />
                                </View>
                                <View style={styles.uploadTextContainer}>
                                    <FixedText style={styles.listTitle} numberOfLines={1}>Prescription - Dr. Sharma</FixedText>
                                    <FixedText style={styles.listSubtitle}>Uploaded on 04 May 2026</FixedText>
                                </View>
                            </View>
                            <View style={styles.tagPill}>
                                <FixedText style={styles.tagPillText}>Prescription</FixedText>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F8F9FF',
    },
    header: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: 24,
        backgroundColor: '#F8F9FF',
        zIndex: 10,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#32617D',
        letterSpacing: -0.5,
    },
    scrollContent: {
        paddingTop: 8,
        paddingBottom: 40,
    },
    section: {
        marginBottom: 28,
    },
    greetingTitle: {
        fontSize: 26,
        fontWeight: '800',
        color: '#0B1C30',
        paddingHorizontal: 24,
        marginBottom: 6,
    },
    greetingSubtitle: {
        fontSize: 14,
        color: '#41484D',
        paddingHorizontal: 24,
    },
    profileSwitcher: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E1E3E4',
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 24,
        marginTop: 8,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
    },
    profileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
        overflow: 'hidden', // Added constraint to prevent expansion beyond flex: 1
    },
    profileTextContainer: {
        flex: 1,
        overflow: 'hidden', // Added constraint to perfectly truncate internal rows
    },
    profileInitialsWrapper: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F8F9FF',
        borderWidth: 1,
        borderColor: '#E1E3E4',
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileInitialsText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#41484D',
    },
    onlineDot: {
        position: 'absolute',
        bottom: 2,
        left: 2,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#10B981',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    profileNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
        flexShrink: 1, // Ensures long text correctly shrinks instead of breaking the row layout
    },
    profileName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#0B1C30',
        flexShrink: 1,
    },
    profileTag: {
        fontSize: 13,
        color: '#71787E',
        flexShrink: 0,
    },
    profileBloodGroup: {
        fontSize: 13,
        color: '#5C5F60',
    },
    bloodGroupHighlight: {
        fontWeight: '700',
        color: '#BA1A1A',
    },
    switchProfileBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 6,
        paddingHorizontal: 8,
        backgroundColor: '#F8F9FF',
        borderWidth: 1,
        borderColor: '#E1E3E4',
        borderRadius: 20,
        marginLeft: 10,
        flexShrink: 0,
    },
    switchProfileText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#41484D',
        marginRight: 2,
    },
    sectionHeader: {
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    sectionHeaderContainer: {
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    sectionHeaderFlex: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0B1C30',
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 13,
        color: '#71787E',
        paddingRight: 10,
    },
    viewAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    viewAllText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#32617D',
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 24,
        gap: 12,
        justifyContent: 'space-between',
    },
    quickActionCard: {
        width: '48%',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E1E3E4',
        borderRadius: 12,
        padding: 16,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
    },
    quickActionIcon: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: '#E5EEFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    quickActionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0B1C30',
        marginBottom: 4,
    },
    quickActionSub: {
        fontSize: 12,
        color: '#71787E',
        lineHeight: 16,
    },
    listContainer: {
        paddingHorizontal: 24,
        gap: 12,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E1E3E4',
        borderStyle: 'dashed',
        borderRadius: 12,
        padding: 16,
    },
    listInfo: {
        flex: 1,
        paddingRight: 16,
    },
    listTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#0B1C30',
        marginBottom: 4,
    },
    listSubtitle: {
        fontSize: 13,
        color: '#5C5F60',
    },
    actionPill: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#F8F9FF',
        borderWidth: 1,
        borderColor: '#DCE9FF',
        borderRadius: 20,
    },
    actionPillText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#32617D',
    },
    uploadListItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E1E3E4',
        borderRadius: 12,
        padding: 16,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
    },
    uploadListLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        paddingRight: 8,
    },
    uploadListIcon: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#F8F9FF',
        borderWidth: 1,
        borderColor: '#E1E3E4',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    uploadTextContainer: {
        flex: 1,
    },
    tagPill: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        backgroundColor: '#F8F9FF',
        borderRadius: 6,
    },
    tagPillText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#4C7A97',
    },
});