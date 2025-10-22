export type Theme = 'light' | 'dark' | 'system';
export type BubbleShape = 'rounded' | 'square';
export type AnimationSpeed = 'fast' | 'medium' | 'slow';
export interface Settings {
  theme: Theme;
  fontSize: number;
  chatWidth: number;
  bubbleShape: BubbleShape;
  defaultTextModel: string;
  defaultImageModel: string;
  customTextEndpoint: string;
  customImageEndpoint: string;
  animationSpeed: AnimationSpeed;
  reduceMotion: boolean;
  showTimestamps: boolean;
}
const SETTINGS_KEY = 'deep-down-ai-settings';
export const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  fontSize: 14,
  chatWidth: 100,
  bubbleShape: 'rounded',
  defaultTextModel: 'google-ai-studio/gemini-2.5-flash',
  defaultImageModel: 'pollinations/stable-diffusion-xl',
  customTextEndpoint: '',
  customImageEndpoint: '',
  animationSpeed: 'medium',
  reduceMotion: false,
  showTimestamps: true,
};
export const settingsManager = {
  loadSettings(): Settings {
    try {
      const storedSettings = localStorage.getItem(SETTINGS_KEY);
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (error) {
      console.error('Failed to load settings from localStorage', error);
    }
    return DEFAULT_SETTINGS;
  },
  saveSettings(settings: Partial<Settings>) {
    try {
      const currentSettings = this.loadSettings();
      const newSettings = { ...currentSettings, ...settings };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      return newSettings;
    } catch (error) {
      console.error('Failed to save settings to localStorage', error);
      return { ...DEFAULT_SETTINGS, ...settings };
    }
  },
};