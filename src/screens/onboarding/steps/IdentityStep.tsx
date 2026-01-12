import React from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useOnboarding } from '../../../context/OnboardingContext';
import { COLORS, FONTS } from '../../../constants/theme';

export default function IdentityStep() {
    const { t } = useTranslation();
    const { userProfile, updateProfile } = useOnboarding();

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                <View style={styles.formContainer}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>{t('onboarding.identity.nameLabel')}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder={t('onboarding.identity.namePlaceholder')}
                            placeholderTextColor="rgba(255,255,255,0.3)"
                            value={userProfile.name}
                            onChangeText={(text) => updateProfile({ name: text })}
                            keyboardAppearance="dark"
                        />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>{t('onboarding.identity.ageLabel')}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="00"
                            placeholderTextColor="rgba(255,255,255,0.3)"
                            value={userProfile.age}
                            onChangeText={(text) => updateProfile({ age: text })}
                            keyboardType="number-pad"
                            maxLength={2}
                            keyboardAppearance="dark"
                        />
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    formContainer: { gap: 30, marginTop: 20 },
    inputGroup: { gap: 10 },
    label: { color: COLORS.inputLabel, fontSize: 12, letterSpacing: 1.5, fontFamily: FONTS.semiBold, textTransform: 'uppercase' },
    input: { color: COLORS.text, fontSize: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.inputBorder, fontFamily: FONTS.regular },
});
