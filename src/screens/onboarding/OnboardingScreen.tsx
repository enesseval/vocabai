import React, { useState, useRef } from 'react';
import { View, StyleSheet, Animated, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

import { RootStackParamList } from '../../types/navigation';
import OnboardingHeader from '../../components/OnboardingHeader';
import OnboardingFooter from '../../components/OnboardingFooter';
import { useOnboarding } from '../../context/OnboardingContext';
import { COLORS, SIZES } from '../../constants/theme';

// STEPS
import IdentityStep from './steps/IdentityStep';
import LanguageStep from './steps/LanguageStep';
import PurposeStep from './steps/PurposeStep';
import LevelStep from './steps/LevelStep'; // <--- YENİ IMPORT
import InterestsStep from './steps/InterestsStep';

export default function OnboardingScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { t } = useTranslation();
    const { userProfile } = useOnboarding();

    const [currentStep, setCurrentStep] = useState(1);
    const fadeAnim = useRef(new Animated.Value(1)).current;

    // Başlıkları Yönet (Sıralama Değişti)
    const getHeaderProps = () => {
        switch (currentStep) {
            case 1: // Identity
                return {
                    title: t('onboarding.identity.title'),
                    highlight: t('onboarding.identity.highlight'),
                    subtitle: t('onboarding.identity.subtitle')
                };
            case 2: // Language
                return {
                    title: t('onboarding.language.title'),
                    highlight: t('onboarding.language.highlight'),
                    subtitle: t('onboarding.language.subtitle')
                };
            case 3: // Purpose
                return {
                    title: t('onboarding.purpose.title'),
                    highlight: t('onboarding.purpose.highlight'),
                    subtitle: t('onboarding.purpose.subtitle')
                };
            case 4: // Level (YENİ ADIM)
                return {
                    title: t('onboarding.level.title'),
                    highlight: t('onboarding.level.highlight'),
                    subtitle: t('onboarding.level.subtitle')
                };
            case 5: // Interests (SON ADIM)
                return {
                    title: t('onboarding.interests.title'),
                    highlight: t('onboarding.interests.highlight'),
                    subtitle: t('onboarding.interests.subtitle')
                };
            default:
                return {};
        }
    };

    // Validasyon
    const isStepValid = () => {
        switch (currentStep) {
            case 1: return !!userProfile.name.trim() && !!userProfile.age.trim();
            case 2: return !!userProfile.nativeLang && !!userProfile.targetLang && userProfile.nativeLang !== userProfile.targetLang;
            case 3: return !!userProfile.purpose;
            case 4: return !!userProfile.level; // Seviye seçildi mi?
            case 5: return userProfile.interests.length > 0;
            default: return false;
        }
    };

    const handleNext = async () => {
        // Toplam 5 adım var, o yüzden < 5 kontrolü
        if (currentStep < 5) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true
            }).start(() => {
                setCurrentStep(prev => prev + 1);
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true
                }).start();
            });

        } else {
            // SON ADIM (5. Adım): Kayıt & ReadStory
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            try {
                await AsyncStorage.setItem('user_persona', JSON.stringify(userProfile));
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'ReadStory' }],
                });
            } catch (error) {
                console.error("Kayıt hatası:", error);
            }
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1: return <IdentityStep />;
            case 2: return <LanguageStep />;
            case 3: return <PurposeStep />;
            case 4: return <LevelStep />; // <--- EKLENDİ
            case 5: return <InterestsStep />;
            default: return null;
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <StatusBar style="light" />
                <LinearGradient colors={['#1e1b4b', '#050406', '#000']} locations={[0, 0.3, 1]} style={StyleSheet.absoluteFill} />

                <SafeAreaView style={styles.safeArea}>
                    <OnboardingHeader
                        currentStep={currentStep}
                        totalSteps={5} // <--- GÜNCELLENDİ
                        {...getHeaderProps()}
                    />

                    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
                        {renderStepContent()}
                    </Animated.View>

                    <OnboardingFooter
                        // Son adım artık 5. adım
                        text={currentStep === 5 ? t('onboarding.common.createPersona') : t('onboarding.common.continue')}
                        onPress={handleNext}
                        disabled={!isStepValid()}
                    />
                </SafeAreaView>
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    safeArea: { flex: 1, paddingHorizontal: SIZES.padding },
});