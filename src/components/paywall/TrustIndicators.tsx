// src/components/paywall/TrustIndicators.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { FONTS } from '../../constants/theme';

interface TrustIndicatorsProps {
    onRestorePress: () => void;
    onPrivacyPress?: () => void;
    onTermsPress?: () => void;
    showDetailedLinks?: boolean;
}

export const TrustIndicators: React.FC<TrustIndicatorsProps> = ({
    onRestorePress,
    onPrivacyPress,
    onTermsPress,
    showDetailedLinks = true,
}) => {
    const { t } = useTranslation();

    const handlePress = (callback: () => void) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        callback();
    };

    return (
        <View style={styles.container}>
            {/* Trust Badges */}
            <View style={styles.badgesContainer}>
                <View style={styles.badge}>
                    <Ionicons name="calendar-outline" size={16} color="rgba(251, 189, 35, 0.6)" />
                    <Text style={styles.badgeText}>7-Day Free Trial</Text>
                </View>
                <View style={[styles.badge, styles.badgeBordered]}>
                    <Ionicons name="close-circle-outline" size={16} color="rgba(251, 189, 35, 0.6)" />
                    <Text style={styles.badgeText}>Cancel Anytime</Text>
                </View>
                <View style={styles.badge}>
                    <Ionicons name="lock-closed-outline" size={16} color="rgba(251, 189, 35, 0.6)" />
                    <Text style={styles.badgeText}>Secure Payment</Text>
                </View>
            </View>

            {/* Legal Text */}
            <Text style={styles.legalText}>
                By subscribing, you agree to our{' '}
                {onTermsPress && (
                    <Text style={styles.linkText} onPress={() => handlePress(onTermsPress)}>
                        Terms
                    </Text>
                )}
                {' '}and{' '}
                {onPrivacyPress && (
                    <Text style={styles.linkText} onPress={() => handlePress(onPrivacyPress)}>
                        Privacy Policy
                    </Text>
                )}
                . Subscription renews automatically unless canceled.
            </Text>

            {/* Action Links */}
            {showDetailedLinks && (
                <View style={styles.linksContainer}>
                    <TouchableOpacity onPress={() => handlePress(onRestorePress)}>
                        <Text style={styles.actionLink}>{t('paywall.restore') || 'Restore Purchase'}</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 24,
        alignItems: 'center',
    },
    badgesContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        gap: 4,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 6,
    },
    badgeBordered: {
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    badgeText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 10,
        fontFamily: FONTS.bold,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    legalText: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 10,
        fontFamily: FONTS.regular,
        textAlign: 'center',
        lineHeight: 16,
        paddingHorizontal: 24,
    },
    linkText: {
        textDecorationLine: 'underline',
        color: 'rgba(255,255,255,0.4)',
    },
    linksContainer: {
        marginTop: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 24,
    },
    actionLink: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 14,
        fontFamily: FONTS.regular,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
});
