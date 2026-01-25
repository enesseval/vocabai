// src/types/navigation.ts
import { Story } from './story';

export type RootStackParamList = {
  Welcome: undefined;
  Onboarding: undefined;
  MainTabs: undefined;
  ReadStory: { isFirstStory?: boolean };
  StoryModal: { story: Story };
  PostStoryQuiz: { story: Story };
  PaywallScreen: undefined;
  Profile: undefined;
  Progress: undefined;
  Settings: undefined;
  VocabQuiz: undefined;
  DBViewer:undefined;
};