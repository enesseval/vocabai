// src/screens/SettingsScreen.tsx

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useOnboarding } from '../context/OnboardingContext';
import { useSubscription } from '../context/SubscriptionContext';
import { FONTS } from '../constants/theme';

export default function SettingsScreen() {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { userProfile } = useOnboarding();
    const { isPremium, subscription } = useSubscription();

    const [soundEnabled, setSoundEnabled] = React.useState(true);
    const [hapticsEnabled, setHapticsEnabled] = React.useState(true);
    const [darkMode, setDarkMode] = React.useState(true);

    const handleBack = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        navigation.goBack();
    };

    const handleToggle = (setter: (value: boolean) => void, value: boolean) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setter(!value);
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <LinearGradient
                colors={['#1e1b4b', '#0f172a', '#000000']}
                style={StyleSheet.absoluteFill}
            />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingBottom: insets.bottom + 40 }
                ]}
            >
                {/* Account Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>
                    <BlurView intensity={15} tint="dark" style={styles.card}>
                        <TouchableOpacity style={styles.menuItem}>
                            <View style={styles.menuItemLeft}>
                                <Ionicons name="person-outline" size={22} color="#fff" />
                                <Text style={styles.menuItemText}>Edit Profile</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.4)" />
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        {isPremium ? (
                            <TouchableOpacity style={styles.menuItem}>
                                <View style={styles.menuItemLeft}>
                                    <Ionicons name="star" size={22} color="#fbbf24" />
                                    <Text style={styles.menuItemText}>Manage Subscription</Text>
                                </View>
                                <View style={styles.premiumBadge}>
                                    <Text style={styles.premiumBadgeText}>Premium</Text>
                                </View>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity style={styles.menuItem}>
                                <View style={styles.menuItemLeft}>
                                    <Ionicons name="star-outline" size={22} color="#fbbf24" />
                                    <Text style={styles.menuItemText}>Upgrade to Premium</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.4)" />
                            </TouchableOpacity>
                        )}
                    </BlurView>
                </View>

                {/* Learning Preferences */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Learning Preferences</Text>
                    <BlurView intensity={15} tint="dark" style={styles.card}>
                        <TouchableOpacity style={styles.menuItem}>
                            <View style={styles.menuItemLeft}>
                                <Ionicons name="language-outline" size={22} color="#fff" />
                                <Text style={styles.menuItemText}>Target Language</Text>
                            </View>
                            <View style={styles.valueContainer}>
                                <Text style={styles.valueText}>{userProfile.targetLang || 'English'}</Text>
                                <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.4)" />
                            </View>
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        <TouchableOpacity style={styles.menuItem}>
                            <View style={styles.menuItemLeft}>
                                <Ionicons name="bar-chart-outline" size={22} color="#fff" />
                                <Text style={styles.menuItemText}>Difficulty Level</Text>
                            </View>
                            <View style={styles.valueContainer}>
                                <Text style={styles.valueText}>{userProfile.level || 'B1'}</Text>
                                <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.4)" />
                            </View>
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        <TouchableOpacity style={styles.menuItem}>
                            <View style={styles.menuItemLeft}>
                                <Ionicons name="trophy-outline" size={22} color="#fff" />
                                <Text style={styles.menuItemText}>Daily Goal</Text>
                            </View>
                            <View style={styles.valueContainer}>
                                <Text style={styles.valueText}>5 words</Text>
                                <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.4)" />
                            </View>
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        <TouchableOpacity style={styles.menuItem}>
                            <View style={styles.menuItemLeft}>
                                <Ionicons name="alarm-outline" size={22} color="#fff" />
                                <Text style={styles.menuItemText}>Daily Reminder</Text>
                            </View>
                            <View style={styles.valueContainer}>
                                <Text style={styles.valueText}>09:00 AM</Text>
                                <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.4)" />
                            </View>
                        </TouchableOpacity>
                    </BlurView>
                </View>

                {/* App Settings */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>App Settings</Text>
                    <BlurView intensity={15} tint="dark" style={styles.card}>
                        <View style={styles.menuItem}>
                            <View style={styles.menuItemLeft}>
                                <Ionicons name="volume-medium-outline" size={22} color="#fff" />
                                <Text style={styles.menuItemText}>Sound Effects</Text>
                            </View>
                            <Switch
                                value={soundEnabled}
                                onValueChange={() => handleToggle(setSoundEnabled, soundEnabled)}
                                trackColor={{ false: '#3e3e3e', true: '#fbbf24' }}
                                thumbColor={soundEnabled ? '#fff' : '#f4f3f4'}
                            />
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.menuItem}>
                            <View style={styles.menuItemLeft}>
                                <Ionicons name="phone-portrait-outline" size={22} color="#fff" />
                                <Text style={styles.menuItemText}>Haptic Feedback</Text>
                            </View>
                            <Switch
                                value={hapticsEnabled}
                                onValueChange={() => handleToggle(setHapticsEnabled, hapticsEnabled)}
                                trackColor={{ false: '#3e3e3e', true: '#fbbf24' }}
                                thumbColor={hapticsEnabled ? '#fff' : '#f4f3f4'}
                            />
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.menuItem}>
                            <View style={styles.menuItemLeft}>
                                <Ionicons name="moon-outline" size={22} color="#fff" />
                                <Text style={styles.menuItemText}>Dark Mode</Text>
                            </View>
                            <Switch
                                value={darkMode}
                                onValueChange={() => handleToggle(setDarkMode, darkMode)}
                                trackColor={{ false: '#3e3e3e', true: '#fbbf24' }}
                                thumbColor={darkMode ? '#fff' : '#f4f3f4'}
                            />
                        </View>
                    </BlurView>
                </View>

                {/* About */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About</Text>
                    <BlurView intensity={15} tint="dark" style={styles.card}>
                        <TouchableOpacity style={styles.menuItem}>
                            <View style={styles.menuItemLeft}>
                                <Ionicons name="information-circle-outline" size={22} color="#fff" />
                                <Text style={styles.menuItemText}>App Version</Text>
                            </View>
                            <Text style={styles.versionText}>1.0.0</Text>
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        <TouchableOpacity style={styles.menuItem}>
                            <View style={styles.menuItemLeft}>
                                <Ionicons name="document-text-outline" size={22} color="#fff" />
                                <Text style={styles.menuItemText}>Terms of Service</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.4)" />
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        <TouchableOpacity style={styles.menuItem}>
                            <View style={styles.menuItemLeft}>
                                <Ionicons name="shield-checkmark-outline" size={22} color="#fff" />
                                <Text style={styles.menuItemText}>Privacy Policy</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.4)" />
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        <TouchableOpacity style={styles.menuItem}>
                            <View style={styles.menuItemLeft}>
                                <Ionicons name="star-outline" size={22} color="#fff" />
                                <Text style={styles.menuItemText}>Rate Us</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.4)" />
                        </TouchableOpacity>
                    </BlurView>
                </View>

                {/* Danger Zone */}
                <View style={styles.section}>
                    <TouchableOpacity style={styles.dangerButton}>
                        <Ionicons name="log-out-outline" size={20} color="#ef4444" />
                        <Text style={styles.dangerButtonText}>Sign Out</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontFamily: FONTS.bold,
    },
    scrollContent: {
        paddingHorizontal: 24,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 20,
        fontFamily: FONTS.bold,
        marginBottom: 16,
    },
    card: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        flex: 1,
    },
    menuItemText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: FONTS.regular,
    },
    valueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    valueText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
        fontFamily: FONTS.regular,
    },
    versionText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 14,
        fontFamily: FONTS.regular,
    },
    premiumBadge: {
        backgroundColor: 'rgba(124, 58, 237, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#7c3aed',
    },
    premiumBadgeText: {
        color: '#7c3aed',
        fontSize: 12,
        fontFamily: FONTS.bold,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginVertical: 12,
    },
    dangerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        paddingVertical: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.3)',
    },
    dangerButtonText: {
        color: '#ef4444',
        fontSize: 16,
        fontFamily: FONTS.semiBold,
    },
});
