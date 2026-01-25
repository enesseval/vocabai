// src/screens/paywall/PaywallVariantA.tsx
// Social Proof Paywall

import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Animated,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { SubscriptionPlan } from '../../types/subscription';
import { CTAButton } from '../../components/paywall/CTAButton';
import { PlanCard } from '../../components/paywall/PlanCard';
import { TrustIndicators } from '../../components/paywall/TrustIndicators';
import { TestimonialCard } from '../../components/paywall/TestimonialCard';
import { FONTS } from '../../constants/theme';

const { width } = Dimensions.get('window');

// Types
interface PaywallVariantProps {
    onSubscribe: (plan: SubscriptionPlan) => Promise<void>;
    onDismiss: () => void;
    onRestore: () => void;
    currentStreak?: number;
    daysSinceSignup: number;
    isLoading: boolean;
}

interface Testimonial {
    name: string;
    role: string;
    quote: string;
    avatar: string;
}

// Data
const TESTIMONIALS: Testimonial[] = [
    {
        name: 'Sarah Jenkins',
        role: 'Learning Spanish',
        quote: 'Finally, a vocab app that sticks! The AI conversations are incredibly realistic.',
        avatar: 'https://i.pravatar.cc/150?img=1',
    },
    {
        name: 'James Chen',
        role: 'Polyglot & Tutor',
        quote: 'The SRS algorithm is the best I\'ve used. I mastered 500 new words in just a month.',
        avatar: 'https://i.pravatar.cc/150?img=12',
    },
    {
        name: 'Elena Rodriguez',
        role: 'University Student',
        quote: 'Record time results. It\'s like having a personal tutor in my pocket 24/7.',
        avatar: 'https://i.pravatar.cc/150?img=5',
    },
];

const RATING_STATS = {
    rating: 4.8,
    totalUsers: '50,000+',
};

export const PaywallVariantA: React.FC<PaywallVariantProps> = ({
    onSubscribe,
    onDismiss,
    onRestore,
    isLoading,
}) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('yearly');
    const scrollViewRef = useRef<ScrollView>(null);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scrollXPosition = useRef(0);

    React.useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
        }).start();
    }, []);

    // Auto-scroll testimonials
    React.useEffect(() => {
        const scrollInterval = setInterval(() => {
            if (scrollViewRef.current) {
                scrollXPosition.current += 1;

                // Reset to start when reaching end
                if (scrollXPosition.current >= 296 * TESTIMONIALS.length) {
                    scrollXPosition.current = 0;
                }

                scrollViewRef.current.scrollTo({
                    x: scrollXPosition.current,
                    animated: false,
                });
            }
        }, 30); // Smooth scroll speed

        return () => clearInterval(scrollInterval);
    }, []);

    const handleSubscribe = async () => {
        await onSubscribe(selectedPlan);
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#0f172a', '#1e1b4b', '#000000']}
                style={StyleSheet.absoluteFill}
            />

            {/* Close Button */}
            <TouchableOpacity
                style={[styles.closeButton, { top: insets.top - 10 }]}
                onPress={onDismiss}
            >
                <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>

            <Animated.ScrollView
                showsVerticalScrollIndicator={false}
                style={{ opacity: fadeAnim }}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 40 }
                ]}
            >
                {/* Rating Header */}
                <View style={styles.ratingSection}>
                    <Text style={styles.ratingNumber}>{RATING_STATS.rating}</Text>
                    <View style={styles.starsContainer}>
                        {[...Array(5)].map((_, index) => (
                            <Ionicons
                                key={index}
                                name={index < 4 ? 'star' : 'star-half'}
                                size={24}
                                color="#fbbf24"
                            />
                        ))}
                    </View>
                    <Text style={styles.userCount}>
                        Join {RATING_STATS.totalUsers} happy language learners
                    </Text>
                </View>

                {/* Testimonials Carousel - Auto-scrolling */}
                <ScrollView
                    ref={scrollViewRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.testimonialsScroll}
                    contentContainerStyle={styles.testimonialsContent}
                    snapToInterval={296}
                    decelerationRate="fast"
                    pagingEnabled={false}
                >
                    {/* Duplicate testimonials for infinite scroll effect */}
                    {[...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS].map((testimonial, index) => (
                        <TestimonialCard key={index} testimonial={testimonial} />
                    ))}
                </ScrollView>

                {/* Headline */}
                <View style={styles.headlineSection}>
                    <Text style={styles.headline}>7-Day Free Trial</Text>
                    <Text style={styles.subheadline}>Full access to all premium features</Text>
                </View>

                {/* Pricing Plans */}
                <View style={styles.plansContainer}>
                    <PlanCard
                        name="Monthly"
                        price="₺199"
                        duration="month"
                        isSelected={selectedPlan === 'monthly'}
                        onSelect={() => setSelectedPlan('monthly')}
                    />
                    <PlanCard
                        name="Yearly"
                        price="₺1,199"
                        pricePerMonth="₺99"
                        duration="year"
                        savings="50%"
                        isBestValue
                        isSelected={selectedPlan === 'yearly'}
                        onSelect={() => setSelectedPlan('yearly')}
                    />
                </View>

                {/* CTA Button */}
                <CTAButton
                    title="Start My Free Week"
                    onPress={handleSubscribe}
                    isLoading={isLoading}
                    style={styles.ctaButton}
                />

                {/* Trust Indicators */}
                <TrustIndicators
                    onRestorePress={onRestore}
                    showDetailedLinks
                />
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
    ratingSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    ratingNumber: {
        fontSize: 48,
        fontFamily: FONTS.bold,
        color: '#fff',
        marginBottom: 8,
    },
    starsContainer: {
        flexDirection: 'row',
        gap: 4,
        marginBottom: 12,
    },
    userCount: {
        fontSize: 14,
        fontFamily: FONTS.regular,
        color: 'rgba(255,255,255,0.7)',
    },
    testimonialsScroll: {
        marginBottom: 20,
    },
    testimonialsContent: {
        paddingRight: 24,
    },
    headlineSection: {
        alignItems: 'center',
        marginBottom: 20,
    },
    headline: {
        fontSize: 32,
        fontFamily: FONTS.bold,
        color: '#fff',
        marginBottom: 8,
    },
    subheadline: {
        fontSize: 16,
        fontFamily: FONTS.regular,
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
    },
    plansContainer: {
        gap: 16,
        marginBottom: 20,
    },
    ctaButton: {
        marginBottom: 0,
    },
});
