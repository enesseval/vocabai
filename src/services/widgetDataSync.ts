/**
 * Widget Data Synchronization Service
 *
 * Syncs vocabulary data to native widgets (iOS & Android)
 */

import { Platform, NativeModules } from 'react-native';

const { WidgetDataModule } = NativeModules;

export interface WidgetVocabularyData {
  words: Array<{
    word: string;
    translation: string;
    explanation: string;
    savedAt: string;
    masteryLevel: number;
  }>;
  lastUpdate: string;
}

/**
 * Sync vocabulary data to native widget
 */
export async function syncToWidget(vocabularyData: WidgetVocabularyData): Promise<void> {
  try {
    if (!WidgetDataModule) {
      console.warn('⚠️ WidgetDataModule not available - widgets not configured');
      return;
    }

    if (Platform.OS === 'ios') {
      // iOS: Use native module to write to App Group
      const result = await WidgetDataModule.updateWidget(vocabularyData);
      console.log('✅ iOS widget data synced:', result);
    } else if (Platform.OS === 'android') {
      // Android: Use SharedPreferences
      const result = await WidgetDataModule.updateWidget(vocabularyData);
      console.log('✅ Android widget data synced:', result);
    } else {
      console.warn('⚠️ Widget sync not supported on this platform');
    }
  } catch (error) {
    // Non-blocking: widget sync failure shouldn't crash the app
    console.error('❌ Failed to sync widget data:', error);
  }
}

/**
 * Trigger widget reload
 */
export async function reloadWidgets(): Promise<void> {
  try {
    if (!WidgetDataModule) {
      return;
    }

    if (Platform.OS === 'ios') {
      await WidgetDataModule.reloadWidgets();
      console.log('🔄 iOS widgets reloaded');
    } else if (Platform.OS === 'android') {
      await WidgetDataModule.reloadWidgets();
      console.log('🔄 Android widgets reloaded');
    }
  } catch (error) {
    console.error('❌ Failed to reload widgets:', error);
  }
}

/**
 * Check if widget module is available
 */
export function isWidgetAvailable(): boolean {
  return !!WidgetDataModule;
}
