import React, { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Tipler
import { RootStackParamList } from './src/types/navigation';

// Context & Utils
import './src/i18n';
import { OnboardingProvider } from './src/context/OnboardingContext';
import { VocabularyProvider } from './src/context/VocabularyContext';
import { SubscriptionProvider } from './src/context/SubscriptionContext';
import { XPProvider } from './src/context/XPContext';

// Ekranlar
import WelcomeScreen from './src/screens/WelcomeScreen';
import OnboardingScreen from './src/screens/onboarding/OnboardingScreen';
import ReadStoryScreen from './src/screens/ReadStoryScreen';
import PostStoryQuizScreen from './src/screens/PostStoryQuizScreen';
import PaywallScreen from './src/screens/PaywallScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import DBViewerScreen from './src/screens/DBViewerScreen';
import WordDetailScreen from './src/screens/WordDetailScreen';
import TabNavigator from './src/navigation/TabNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Native Splash'in otomatik kapanmasını engelle (Fontlar yüklenene kadar)
SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  duration: 500,
  fade: true,
})

export default function App() {
  // 1. Sadece Fontları Yükle (Başka bir şey bekleme)
  const [fontsLoaded, fontError] = useFonts({
    'Merriweather-Bold': require('./src/assets/fonts/Merriweather-Bold.ttf'),
    'Merriweather-Regular': require('./src/assets/fonts/Merriweather-Regular.ttf'),
    'Inter-Regular': require('./src/assets/fonts/Inter-Regular.ttf'),
    'Inter-SemiBold': require('./src/assets/fonts/Inter-SemiBold.ttf'),
  });

  // 2. Fontlar yüklenir yüklenmez Native Splash'i GİZLE
  // useEffect kullanıyoruz çünkü onLayout production build'lerde tetiklenmeyebilir
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  // 3. Güvenlik: 5 saniye sonra splash'i zorla gizle (fontlar yüklenmese bile)
  useEffect(() => {
    const timeout = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
    }, 5000);
    return () => clearTimeout(timeout);
  }, []);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <OnboardingProvider>
        <VocabularyProvider>
          <SubscriptionProvider>
            <XPProvider>
              <SafeAreaProvider>
            <View style={{ flex: 1 }}>
              <NavigationContainer>
                {/* initialRouteName her zaman 'Welcome' olsun ki animasyonu görelim */}
                <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Welcome">

                  {/* Bu ekran artık bizim "Custom Splash" ekranımız */}
                  <Stack.Screen name="Welcome" component={WelcomeScreen} />

                  <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                  <Stack.Screen name="MainTabs" component={TabNavigator} />

                  <Stack.Screen
                    name="ReadStory"
                    component={ReadStoryScreen}
                    options={{ animation: 'slide_from_bottom' }}
                  />

                  <Stack.Screen
                    name="PostStoryQuiz"
                    component={PostStoryQuizScreen}
                    options={{ animation: 'slide_from_right' }}
                  />

                  <Stack.Screen
                    name="PaywallScreen"
                    component={PaywallScreen}
                    options={{ animation: 'slide_from_bottom' }}
                  />

                  <Stack.Screen
                    name="Profile"
                    component={ProfileScreen}
                    options={{ animation: 'slide_from_right' }}
                  />

                  <Stack.Screen
                    name="DBViewer"
                    component={DBViewerScreen}
                    options={{ animation: 'slide_from_right' }}
                  />

                  <Stack.Screen
                    name="StoryModal"
                    component={ReadStoryScreen}
                    options={{
                      presentation: 'transparentModal',
                      animation: 'fade',
                      headerShown: false,
                    }}
                  />

                  <Stack.Screen
                    name="WordDetail"
                    component={WordDetailScreen}
                    options={{
                      presentation: 'transparentModal',
                      animation: 'fade',
                      headerShown: false,
                    }}
                  />

                </Stack.Navigator>
              </NavigationContainer>
            </View>
            </SafeAreaProvider>
            </XPProvider>
          </SubscriptionProvider>
        </VocabularyProvider>
      </OnboardingProvider>
    </GestureHandlerRootView>
  );
}