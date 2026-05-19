import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Platform,
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

            {/* Top App Bar */}
            <View style={styles.header}>
                <View style={styles.headerTitleContainer}>
                    <FixedText style={styles.headerTitle}>ARMedico Vault</FixedText>
                </View>
                <TouchableOpacity style={styles.avatarContainer} activeOpacity={0.8}>
                    <Image
                        source={{ uri: 'https://api.builder.io/api/v1/image/assets/TEMP/b07c0810b9008dce567a38879b44d06cca178a1e' }}
                        style={styles.avatar}
                    />
                </TouchableOpacity>
            </View>

            {/* Main Scrollable Content */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Greeting Section */}
                <View style={styles.section}>
                    <FixedText style={styles.greetingTitle}>Good Evening, Advait 👋</FixedText>
                    <FixedText style={styles.greetingSubtitle}>Your family's health records are secure.</FixedText>
                </View>

                {/* Active Profile Switcher */}
                <View style={styles.section}>
                    <TouchableOpacity style={styles.profileSwitcher} activeOpacity={0.7}>
                        <View style={styles.profileInfo}>
                            <View style={styles.profileIconWrapper}>
                                <MaterialIcons name="elderly" size={24} color="#32617D" />
                            </View>
                            <View>
                                <FixedText style={styles.profileLabel}>VIEWING PROFILE</FixedText>
                                <FixedText style={styles.profileName}>Father Profile</FixedText>
                            </View>
                        </View>
                        <MaterialIcons name="expand-more" size={24} color="#41484D" />
                    </TouchableOpacity>
                </View>

                {/* Recent Uploads Carousel */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <FixedText style={styles.sectionTitle}>Recent Uploads</FixedText>
                        <TouchableOpacity>
                            <FixedText style={styles.viewAllText}>View All</FixedText>
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.carouselContainer}
                    >
                        {/* Card 1 */}
                        <TouchableOpacity style={styles.uploadCard} activeOpacity={0.7}>
                            <View style={styles.uploadIconWrapper}>
                                <MaterialIcons name="description" size={24} color="#32617D" />
                            </View>
                            <FixedText style={styles.uploadTitle} numberOfLines={2}>Annual Blood Test</FixedText>
                        </TouchableOpacity>

                        {/* Card 2 */}
                        <TouchableOpacity style={styles.uploadCard} activeOpacity={0.7}>
                            <View style={styles.uploadIconWrapper}>
                                <MaterialIcons name="medication" size={24} color="#32617D" />
                            </View>
                            <FixedText style={styles.uploadTitle} numberOfLines={2}>Cardiology Prescription</FixedText>
                        </TouchableOpacity>

                        {/* Card 3 */}
                        <TouchableOpacity style={styles.uploadCard} activeOpacity={0.7}>
                            <View style={styles.uploadIconWrapper}>
                                <MaterialIcons name="medical-services" size={24} color="#32617D" />
                            </View>
                            <FixedText style={styles.uploadTitle} numberOfLines={2}>Chest X-Ray</FixedText>
                        </TouchableOpacity>

                        {/* Card 4 */}
                        <TouchableOpacity style={styles.uploadCard} activeOpacity={0.7}>
                            <View style={styles.uploadIconWrapper}>
                                <MaterialIcons name="science" size={24} color="#32617D" />
                            </View>
                            <FixedText style={styles.uploadTitle} numberOfLines={2}>Thyroid Panel</FixedText>
                        </TouchableOpacity>
                    </ScrollView>
                </View>

                {/* Recommended Records */}
                <View style={[styles.section, { paddingBottom: 20 }]}>
                    <View style={styles.sectionHeader}>
                        <FixedText style={styles.sectionTitle}>Recommended Records</FixedText>
                        <TouchableOpacity>
                            <FixedText style={styles.viewAllText}>View All</FixedText>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.recommendedList}>
                        {/* Record Item 1 */}
                        <TouchableOpacity style={styles.recordItem} activeOpacity={0.7}>
                            <View style={styles.recordInfo}>
                                <View style={styles.recordIconWrapper}>
                                    <MaterialIcons name="vaccines" size={20} color="#32617D" />
                                </View>
                                <View>
                                    <FixedText style={styles.recordTitle}>Add Vaccination Record</FixedText>
                                    <FixedText style={styles.recordSubtitle}>Keep your records up to date</FixedText>
                                </View>
                            </View>
                            <MaterialIcons name="add-circle" size={24} color="#32617D" />
                        </TouchableOpacity>

                        {/* Record Item 2 */}
                        <TouchableOpacity style={styles.recordItem} activeOpacity={0.7}>
                            <View style={styles.recordInfo}>
                                <View style={styles.recordIconWrapper}>
                                    <MaterialIcons name="badge" size={20} color="#32617D" />
                                </View>
                                <View>
                                    <FixedText style={styles.recordTitle}>Upload Insurance Card</FixedText>
                                    <FixedText style={styles.recordSubtitle}>Always have your card handy</FixedText>
                                </View>
                            </View>
                            <MaterialIcons name="add-circle" size={24} color="#32617D" />
                        </TouchableOpacity>

                        {/* Record Item 3 */}
                        <TouchableOpacity style={styles.recordItem} activeOpacity={0.7}>
                            <View style={styles.recordInfo}>
                                <View style={styles.recordIconWrapper}>
                                    <MaterialIcons name="contact-emergency" size={20} color="#32617D" />
                                </View>
                                <View>
                                    <FixedText style={styles.recordTitle}>Link Emergency Contacts</FixedText>
                                    <FixedText style={styles.recordSubtitle}>Crucial for emergency situations</FixedText>
                                </View>
                            </View>
                            <MaterialIcons name="add-circle" size={24} color="#32617D" />
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* Custom Bottom Navigation Bar */}
            <View style={styles.bottomNav}>
                {/* Nav Item: Dashboard (Active) */}
                <TouchableOpacity style={styles.navItem}>
                    <MaterialIcons name="dashboard" size={24} color="#32617D" />
                    <FixedText style={styles.navTextActive}>Dashboard</FixedText>
                </TouchableOpacity>

                {/* Nav Item: Vault */}
                <TouchableOpacity style={styles.navItem}>
                    <MaterialIcons name="folder" size={24} color="#5C5F60" />
                    <FixedText style={styles.navText}>Vault</FixedText>
                </TouchableOpacity>

                {/* Floating Action Button (Upload) */}
                <View style={styles.fabContainer}>
                    <TouchableOpacity style={styles.fab} activeOpacity={0.85}>
                        <MaterialIcons name="add" size={32} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                {/* Nav Item: Search */}
                <TouchableOpacity style={styles.navItem}>
                    <MaterialIcons name="search" size={24} color="#5C5F60" />
                    <FixedText style={styles.navText}>Search</FixedText>
                </TouchableOpacity>

                {/* Nav Item: Profile */}
                <TouchableOpacity style={styles.navItem}>
                    <MaterialIcons name="person" size={24} color="#5C5F60" />
                    <FixedText style={styles.navText}>Profile</FixedText>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F8F9FF',
    },
    header: {
        height: 64,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        backgroundColor: '#F8F9FF',
        zIndex: 10,
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
        paddingLeft: 40, // Offsets the avatar width to keep title perfectly centered
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#32617D',
    },
    avatarContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#4C7A97',
    },
    avatar: {
        width: '100%',
        height: '100%',
        backgroundColor: '#C1C7CD',
    },
    scrollContent: {
        paddingTop: 16,
        paddingBottom: 40,
    },
    section: {
        marginBottom: 24,
    },
    greetingTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#0B1C30',
        paddingHorizontal: 24,
        marginBottom: 4,
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
        borderColor: '#C1C7CD',
        borderRadius: 8,
        padding: 16,
        marginHorizontal: 24,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
    },
    profileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    profileIconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#E5EEFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#5C5F60',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    profileName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0B1C30',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0B1C30',
    },
    viewAllText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#32617D',
    },
    carouselContainer: {
        paddingHorizontal: 24,
        gap: 16,
    },
    uploadCard: {
        width: 140,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#C1C7CD',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        elevation: 2,
        shadowColor: '#5D8AA8',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
    },
    uploadIconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#E5EEFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    uploadTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0B1C30',
        textAlign: 'center',
    },
    recommendedList: {
        paddingHorizontal: 24,
        gap: 12,
    },
    recordItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(248, 249, 255, 0.5)',
        borderWidth: 2,
        borderColor: '#C1C7CD',
        borderStyle: 'dashed',
        borderRadius: 8,
        padding: 16,
    },
    recordInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    recordIconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#E5EEFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    recordTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0B1C30',
    },
    recordSubtitle: {
        fontSize: 12,
        color: '#41484D',
    },
    bottomNav: {
        flexDirection: 'row',
        height: 72,
        backgroundColor: '#F8F9FF',
        borderTopWidth: 1,
        borderTopColor: '#C1C7CD',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: 8,
        paddingBottom: Platform.OS === 'ios' ? 16 : 0, // Safe area adjustment
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
    },
    navItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
    navTextActive: {
        fontSize: 12,
        fontWeight: '600',
        color: '#32617D',
        marginTop: 4,
    },
    navText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#5C5F60',
        marginTop: 4,
    },
    fabContainer: {
        width: 64,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fab: {
        position: 'absolute',
        top: -45, // Protrudes upwards
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#32617D',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 4,
        borderColor: '#F8F9FF', // Matches background to create cutout effect
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
});