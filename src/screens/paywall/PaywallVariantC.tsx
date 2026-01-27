// src/screens/paywall/PaywallVariantC.tsx
// Gamified Achievement Paywall

import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Animated,
    TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { PaywallVariantProps } from '../../types/paywall';
import { PRICING, ACHIEVEMENT_BADGES } from '../../constants/paywallConfig';
import { FONTS } from '../../constants/theme';
import Svg, { Circle } from 'react-native-svg';

export const PaywallVariantC: React.FC<PaywallVariantProps> = ({
    onSubscribe,
    onDismiss,
    onRestore,
    isLoading,
    currentStreak = 15,
    daysSinceSignup,
}) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;

    // Calculate progress (assuming 20 days goal)
    const progress = Math.min(currentStreak / 20, 1);
    const progressPercent = Math.round(progress * 100);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
            Animated.timing(progressAnim, {
                toValue: progress,
                duration: 1200,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleSubscribe = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await onSubscribe(selectedPlan);
    };

    const handlePlanSelect = (plan: 'monthly' | 'yearly') => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedPlan(plan);
    };

    // Circle progress values
    const circumference = 2 * Math.PI * 58; // radius = 58
    const strokeDashoffset = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [circumference, 0],
    });

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#0f172a', '#1e1b4b', '#000000']}
                style={StyleSheet.absoluteFill}
            />

            {/* Close Button */}
            <TouchableOpacity
                style={[styles.closeButton, { top: insets.top + 10 }]}
                onPress={onDismiss}
            >
                <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>

            <Animated.ScrollView
                showsVerticalScrollIndicator={false}
                style={{ opacity: fadeAnim }}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 40 }
                ]}
            >
                {/* Streak Header with Urgency */}
                <View style={styles.heroSection}>
                    <View style={styles.urgencyBadge}>
                        <Ionicons name="alert-circle" size={16} color="#ef4444" />
                        <Text style={styles.urgencyText}>Don't break your streak!</Text>
                    </View>

                    {/* Circular Progress */}
                    <View style={styles.progressContainer}>
                        <Svg width={140} height={140} style={styles.progressSvg}>
                            {/* Background circle */}
                            <Circle
                                cx={70}
                                cy={70}
                                r={58}
                                stroke="rgba(255,255,255,0.1)"
                                strokeWidth={12}
                                fill="none"
                            />
                            {/* Progress circle */}
                            <AnimatedCircle
                                cx={70}
                                cy={70}
                                r={58}
                                stroke="url(#gradient)"
                                strokeWidth={12}
                                fill="none"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                transform="rotate(-90 70 70)"
                            />
                        </Svg>

                        <View style={styles.progressCenter}>
                            <Ionicons name="flame" size={32} color="#FCD34D" />
                            <Text style={styles.streakNumber}>{currentStreak}</Text>
                            <Text style={styles.streakLabel}>day streak</Text>
                        </View>
                    </View>

                    <Text style={styles.headline}>You're {progressPercent}% to 20 days!</Text>
                    <Text style={styles.subheadline}>
                        Keep your momentum with Premium features
                    </Text>
                </View>

                {/* Achievement Badges Grid */}
                <View style={styles.achievementsSection}>
                    <Text style={styles.sectionTitle}>Unlock Premium Badges</Text>

                    <View style={styles.badgesGrid}>
                        {ACHIEVEMENT_BADGES.map((badge, index) => (
                            <View key={badge.id} style={styles.badgeCard}>
                                <BlurView intensity={15} tint="dark" style={styles.badgeBlur}>
                                    <LinearGradient
                                        colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']}
                                        style={styles.badgeGradient}
                                    />

                                    {badge.locked && (
                                        <View style={styles.lockIcon}>
                                            <Ionicons name="lock-closed" size={16} color="rgba(255,255,255,0.4)" />
                                        </View>
                                    )}

                                    <Text style={styles.badgeEmoji}>{badge.icon}</Text>
                                    <Text style={styles.badgeTitle}>{badge.title}</Text>
                                    <Text style={styles.badgeDescription}>{badge.description}</Text>
                                </BlurView>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Recommended Plan */}
                <View style={styles.recommendedSection}>
                    <View style={styles.recommendedHeader}>
                        <Ionicons name="star" size={20} color="#FCD34D" />
                        <Text style={styles.recommendedTitle}>Recommended for You</Text>
                    </View>

                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => handlePlanSelect('yearly')}
                        style={styles.planCard}
                    >
                        <BlurView intensity={20} tint="dark" style={styles.planBlur}>
                            <LinearGradient
                                colors={['rgba(252, 211, 77, 0.15)', 'rgba(245, 158, 11, 0.05)']}
                                style={styles.planGradient}
                            />

                            <View style={styles.planHeader}>
                                <View>
                                    <Text style={styles.planName}>Annual Plan</Text>
                                    <Text style={styles.planPrice}>₺{PRICING.yearly.price}/year</Text>
                                </View>

                                <View style={styles.savingsBadge}>
                                    <Text style={styles.savingsText}>Save 50%</Text>
                                </View>
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.featuresContainer}>
                                {[
                                    { icon: 'flame', text: 'Protect your streak forever', color: '#FCD34D' },
                                    { icon: 'chatbubbles', text: 'Unlimited AI conversations', color: '#3b82f6' },
                                    { icon: 'cloud-download', text: 'Offline learning mode', color: '#10b981' },
                                    { icon: 'trophy', text: 'Advanced achievements', color: '#8b5cf6' },
                                ].map((feature, index) => (
                                    <View key={index} style={styles.featureRow}>
                                        <View style={[styles.featureIconContainer, { backgroundColor: `${feature.color}20` }]}>
                                            <Ionicons name={feature.icon as any} size={16} color={feature.color} />
                                        </View>
                                        <Text style={styles.featureText}>{feature.text}</Text>
                                    </View>
                                ))}
                            </View>

                            <Text style={styles.trialNote}>7-day free trial included</Text>
                        </BlurView>
                    </TouchableOpacity>
                </View>

                {/* CTA Button */}
                <TouchableOpacity
                    onPress={handleSubscribe}
                    disabled={isLoading}
                    activeOpacity={0.8}
                    style={styles.ctaButton}
                >
                    <LinearGradient
                        colors={['#FCD34D', '#F59E0B']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.ctaGradient}
                    >
                        {isLoading ? (
                            <Text style={styles.ctaText}>Processing...</Text>
                        ) : (
                            <>
                                <Ionicons name="shield-checkmark" size={20} color="#000" />
                                <Text style={styles.ctaText}>Protect My Streak</Text>
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>

                {/* Trust Indicators */}
                <View style={styles.trustSection}>
                    <View style={styles.trustRow}>
                        <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                        <Text style={styles.trustText}>Cancel anytime</Text>
                    </View>
                    <View style={styles.trustRow}>
                        <Ionicons name="lock-closed" size={16} color="#10b981" />
                        <Text style={styles.trustText}>Secure payment</Text>
                    </View>
                </View>

                {/* Restore & Legal */}
                <TouchableOpacity onPress={onRestore} style={styles.restoreButton}>
                    <Text style={styles.restoreText}>Restore Purchases</Text>
                </TouchableOpacity>

                <Text style={styles.legalText}>
                    Subscription automatically renews unless cancelled 24 hours before renewal.
                </Text>
            </Animated.ScrollView>
        </View>
    );
};

// Animated Circle component for progress
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    closeButton: {
        position: 'absolute',
        left: 20,
        zIndex: 10,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingHorizontal: 24,
    },
    heroSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    urgencyBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.3)',
        marginBottom: 24,
    },
    urgencyText: {
        fontSize: 14,
        fontFamily: FONTS.semiBold,
        color: '#ef4444',
    },
    progressContainer: {
        position: 'relative',
        marginBottom: 24,
    },
    progressSvg: {
        transform: [{ rotate: '-90deg' }],
    },
    progressCenter: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    streakNumber: {
        fontSize: 36,
        fontFamily: FONTS.bold,
        color: '#fff',
        marginTop: 4,
    },
    streakLabel: {
        fontSize: 12,
        fontFamily: FONTS.regular,
        color: 'rgba(255,255,255,0.6)',
    },
    headline: {
        fontSize: 24,
        fontFamily: FONTS.bold,
        color: '#fff',
        marginBottom: 8,
        textAlign: 'center',
    },
    subheadline: {
        fontSize: 16,
        fontFamily: FONTS.regular,
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
    },
    achievementsSection: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: FONTS.bold,
        color: '#fff',
        marginBottom: 16,
    },
    badgesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    badgeCard: {
        width: '31%',
        aspectRatio: 1,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    badgeBlur: {
        flex: 1,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    lockIcon: {
        position: 'absolute',
        top: 8,
        right: 8,
    },
    badgeEmoji: {
        fontSize: 32,
        marginBottom: 8,
    },
    badgeTitle: {
        fontSize: 11,
        fontFamily: FONTS.bold,
        color: '#fff',
        textAlign: 'center',
        marginBottom: 2,
    },
    badgeDescription: {
        fontSize: 9,
        fontFamily: FONTS.regular,
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
    },
    recommendedSection: {
        marginBottom: 24,
    },
    recommendedHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    recommendedTitle: {
        fontSize: 16,
        fontFamily: FONTS.semiBold,
        color: '#FCD34D',
    },
    planCard: {
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'rgba(252, 211, 77, 0.3)',
    },
    planBlur: {
        padding: 20,
    },
    planGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    planHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    planName: {
        fontSize: 20,
        fontFamily: FONTS.bold,
        color: '#fff',
        marginBottom: 4,
    },
    planPrice: {
        fontSize: 28,
        fontFamily: FONTS.bold,
        color: '#fff',
    },
    savingsBadge: {
        backgroundColor: '#10b981',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    savingsText: {
        fontSize: 14,
        fontFamily: FONTS.bold,
        color: '#fff',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginBottom: 16,
    },
    featuresContainer: {
        gap: 12,
        marginBottom: 16,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    featureIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    featureText: {
        fontSize: 14,
        fontFamily: FONTS.regular,
        color: 'rgba(255,255,255,0.8)',
        flex: 1,
    },
    trialNote: {
        fontSize: 12,
        fontFamily: FONTS.regular,
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
    },
    ctaButton: {
        marginBottom: 24,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#FCD34D',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
    },
    ctaGradient: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    ctaText: {
        fontSize: 18,
        fontFamily: FONTS.bold,
        color: '#000',
    },
    trustSection: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 24,
        marginBottom: 20,
    },
    trustRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    trustText: {
        fontSize: 12,
        fontFamily: FONTS.regular,
        color: 'rgba(255,255,255,0.6)',
    },
    restoreButton: {
        alignSelf: 'center',
        marginBottom: 16,
    },
    restoreText: {
        fontSize: 14,
        fontFamily: FONTS.regular,
        color: 'rgba(255,255,255,0.5)',
        textDecorationLine: 'underline',
    },
    legalText: {
        fontSize: 11,
        fontFamily: FONTS.regular,
        color: 'rgba(255,255,255,0.4)',
        textAlign: 'center',
        lineHeight: 16,
    },
});
