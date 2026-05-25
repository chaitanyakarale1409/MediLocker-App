import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';

// Screens
import DashboardScreen from '../screens/DashboardScreen';
import ProfilesScreen from '../screens/ProfilesScreen';
import RecordsScreen from '../screens/RecordsScreen';
import TimelineScreen from '../screens/TimelineScreen';
import UploadScreen from '../screens/UploadScreen'; 

// Temporary Dummy Screen
const DummyScreen = () => <View style={{ flex: 1, backgroundColor: '#F8F9FF' }} />;

const Tab = createBottomTabNavigator();

// Accessibility Font Scaling Lock
const FixedText = (props: any) => (
    <Text allowFontScaling={false} maxFontSizeMultiplier={1} {...props} />
);

function CustomTabBar({ state, descriptors, navigation }: any) {
    return (
        <View style={styles.bottomNav}>
            {state.routes.map((route: any, index: number) => {
                const { options } = descriptors[route.key];
                const isFocused = state.index === index;

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name);
                    }
                };

                // Floating Action Button exactly in the middle
                if (route.name === 'Upload') {
                    return (
                        <View key={route.key} style={styles.fabContainer}>
                            <TouchableOpacity
                                style={styles.fab}
                                activeOpacity={0.85}
                                onPress={onPress} // Now behaves like a normal tab switch!
                            >
                                <MaterialIcons name="add" size={32} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                    );
                }

                // Determine Icons based on route name
                let iconName: any = 'dashboard';
                if (route.name === 'Dashboard') iconName = 'dashboard';
                if (route.name === 'Records') iconName = 'description';
                if (route.name === 'Timeline') iconName = 'schedule';
                if (route.name === 'Profile') iconName = 'person';

                return (
                    <TouchableOpacity key={route.key} style={styles.navItem} onPress={onPress}>
                        <MaterialIcons
                            name={iconName}
                            size={24}
                            color={isFocused ? "#32617D" : "#5C5F60"}
                        />
                        <FixedText style={isFocused ? styles.navTextActive : styles.navText}>
                            {route.name}
                        </FixedText>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

export default function MainTabNavigator() {
    return (
        <Tab.Navigator
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{ headerShown: false }}
        >
            <Tab.Screen name="Dashboard" component={DashboardScreen} />
            <Tab.Screen name="Records" component={RecordsScreen} />

            {/* UPDATED: We put the actual Upload screen here instead of a Placeholder */}
            <Tab.Screen name="Upload" component={UploadScreen} />

            <Tab.Screen name="Timeline" component={TimelineScreen} />
            <Tab.Screen name="Profile" component={ProfilesScreen} />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    bottomNav: {
        flexDirection: 'row',
        height: 72,
        backgroundColor: '#F8F9FF',
        borderTopWidth: 1,
        borderTopColor: '#C1C7CD',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: 8,
        paddingBottom: Platform.OS === 'ios' ? 16 : 0,
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
        top: -45,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#32617D',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 4,
        borderColor: '#F8F9FF',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
});