// src/screens/paywall/PaywallVariantB.tsx
// Daily Cost Anchoring Paywall

import React, { useState, useRef } from 'react';
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
import { PRICING } from '../../constants/paywallConfig';
import { FONTS } from '../../constants/theme';

export const PaywallVariantB: React.FC<PaywallVariantProps> = ({
    onSubscribe,
    onDismiss,
    onRestore,
    isLoading,
}) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');

    const fadeAnim = useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
        }).start();
    }, []);

    const handleSubscribe = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await onSubscribe(selectedPlan);
    };

    const handlePlanSelect = (plan: 'monthly' | 'yearly') => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedPlan(plan);
    };

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
                {/* Hero Section with Coffee Icon */}
                <View style={styles.heroSection}>
                    <View style={styles.iconContainer}>
                        <LinearGradient
                            colors={['#FCD34D', '#F59E0B']}
                            style={styles.iconGradient}
                        >
                            <Ionicons name="cafe" size={48} color="#000" />
                        </LinearGradient>
                    </View>

                    <Text style={styles.headline}>Less than a coffee a day</Text>
                    <Text style={styles.priceHighlight}>₺{PRICING.yearly.dailyCost}/day</Text>
                    <Text style={styles.subheadline}>
                        Master a new language for the price of your morning coffee
                    </Text>
                </View>

                {/* Annual Plan Card (Highlighted) */}
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => handlePlanSelect('yearly')}
                    style={styles.recommendedCard}
                >
                    <BlurView intensity={20} tint="dark" style={styles.cardBlur}>
                        <LinearGradient
                            colors={selectedPlan === 'yearly'
                                ? ['rgba(252, 211, 77, 0.15)', 'rgba(245, 158, 11, 0.05)']
                                : ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']}
                            style={styles.cardGradient}
                        />

                        {/* Best Value Badge */}
                        <View style={styles.bestValueBadge}>
                            <LinearGradient
                                colors={['#FCD34D', '#F59E0B']}
                                style={styles.badgeGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <Ionicons name="star" size={14} color="#000" />
                                <Text style={styles.badgeText}>BEST VALUE</Text>
                            </LinearGradient>
                        </View>

                        {/* Radio Button */}
                        <View style={[styles.radioButton, selectedPlan === 'yearly' && styles.radioButtonSelected]}>
                            {selectedPlan === 'yearly' && (
                                <View style={styles.radioInner} />
                            )}
                        </View>

                        <View style={styles.cardContent}>
                            <Text style={styles.planName}>Annual Plan</Text>
                            <Text style={styles.planPrice}>₺{PRICING.yearly.price}/year</Text>
                            <Text style={styles.planEquivalent}>₺{PRICING.yearly.monthlyEquivalent}/month</Text>

                            <View style={styles.savingsContainer}>
                                <Ionicons name="arrow-down-circle" size={20} color="#10b981" />
                                <Text style={styles.savingsText}>
                                    Save {PRICING.yearly.savingsPercent}% vs monthly
                                </Text>
                            </View>

                            <View style={styles.divider} />

                            {/* Benefits */}
                            <View style={styles.benefitsContainer}>
                                {[
                                    'Unlimited AI-generated stories',
                                    'Advanced vocabulary tracking',
                                    'Offline mode',
                                    'Priority support',
                                ].map((benefit, index) => (
                                    <View key={index} style={styles.benefitRow}>
                                        <Ionicons name="checkmark-circle" size={18} color="#10b981" />
                                        <Text style={styles.benefitText}>{benefit}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </BlurView>
                </TouchableOpacity>

                {/* Monthly Plan Card */}
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => handlePlanSelect('monthly')}
                    style={styles.planCard}
                >
                    <BlurView intensity={15} tint="dark" style={styles.cardBlur}>
                        <LinearGradient
                            colors={selectedPlan === 'monthly'
                                ? ['rgba(252, 211, 77, 0.1)', 'rgba(245, 158, 11, 0.05)']
                                : ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.01)']}
                            style={styles.cardGradient}
                        />

                        {/* Radio Button */}
                        <View style={[styles.radioButton, selectedPlan === 'monthly' && styles.radioButtonSelected]}>
                            {selectedPlan === 'monthly' && (
                                <View style={styles.radioInner} />
                            )}
                        </View>

                        <View style={styles.cardContent}>
                            <Text style={styles.planName}>Monthly Plan</Text>
                            <Text style={styles.planPrice}>₺{PRICING.monthly.price}/month</Text>
                            <Text style={styles.planDescription}>Perfect for trying out</Text>
                        </View>
                    </BlurView>
                </TouchableOpacity>

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
                                <Text style={styles.ctaText}>Start 7-Day Free Trial</Text>
                                <Ionicons name="arrow-forward" size={20} color="#000" />
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>

                {/* Trust Indicators */}
                <View style={styles.trustSection}>
                    <View style={styles.trustRow}>
                        <Ionicons name="shield-checkmark" size={16} color="rgba(255,255,255,0.6)" />
                        <Text style={styles.trustText}>Cancel anytime</Text>
                    </View>
                    <View style={styles.trustRow}>
                        <Ionicons name="lock-closed" size={16} color="rgba(255,255,255,0.6)" />
                        <Text style={styles.trustText}>Secure payment</Text>
                    </View>
                </View>

                {/* Restore & Legal */}
                <TouchableOpacity onPress={onRestore} style={styles.restoreButton}>
                    <Text style={styles.restoreText}>Restore Purchases</Text>
                </TouchableOpacity>

                <Text style={styles.legalText}>
                    Subscription automatically renews unless auto-renew is turned off at least 24 hours before the end of the current period.
                </Text>
            </Animated.ScrollView>
        </View>
    );
};

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
    iconContainer: {
        marginBottom: 24,
    },
    iconGradient: {
        width: 96,
        height: 96,
        borderRadius: 48,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#FCD34D',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
    },
    headline: {
        fontSize: 28,
        fontFamily: FONTS.bold,
        color: '#fff',
        marginBottom: 12,
        textAlign: 'center',
    },
    priceHighlight: {
        fontSize: 48,
        fontFamily: FONTS.bold,
        color: '#FCD34D',
        marginBottom: 8,
    },
    subheadline: {
        fontSize: 16,
        fontFamily: FONTS.regular,
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    recommendedCard: {
        marginBottom: 16,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'rgba(252, 211, 77, 0.3)',
    },
    planCard: {
        marginBottom: 20,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    cardBlur: {
        padding: 20,
    },
    cardGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    bestValueBadge: {
        position: 'absolute',
        top: -1,
        right: -1,
        zIndex: 10,
    },
    badgeGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderBottomLeftRadius: 12,
        gap: 4,
    },
    badgeText: {
        fontSize: 11,
        fontFamily: FONTS.bold,
        color: '#000',
        letterSpacing: 0.5,
    },
    radioButton: {
        position: 'absolute',
        top: 20,
        left: 20,
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioButtonSelected: {
        borderColor: '#FCD34D',
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#FCD34D',
    },
    cardContent: {
        marginLeft: 36,
    },
    planName: {
        fontSize: 20,
        fontFamily: FONTS.bold,
        color: '#fff',
        marginBottom: 4,
    },
    planPrice: {
        fontSize: 32,
        fontFamily: FONTS.bold,
        color: '#fff',
        marginBottom: 4,
    },
    planEquivalent: {
        fontSize: 14,
        fontFamily: FONTS.regular,
        color: 'rgba(255,255,255,0.6)',
        marginBottom: 12,
    },
    planDescription: {
        fontSize: 14,
        fontFamily: FONTS.regular,
        color: 'rgba(255,255,255,0.6)',
    },
    savingsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 16,
    },
    savingsText: {
        fontSize: 14,
        fontFamily: FONTS.semiBold,
        color: '#10b981',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginBottom: 16,
    },
    benefitsContainer: {
        gap: 10,
    },
    benefitRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    benefitText: {
        fontSize: 14,
        fontFamily: FONTS.regular,
        color: 'rgba(255,255,255,0.8)',
        flex: 1,
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
