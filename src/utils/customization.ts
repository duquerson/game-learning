/**
 * Theme Customization System - Rainblur Theme
 * Runtime theme adjustment functions with value clamping and localStorage persistence
 */

// =========================================
// TYPES AND INTERFACES
// =========================================

export interface ThemeCustomization {
  fontSize: number;      // Base font size in px (14-24)
  spacingScale: number;  // Spacing scale multiplier (0.5-2.0)
  saturation: number;    // Color saturation percentage (0-100)
}

export interface UserPreferences {
  fontSize: number;
  spacingScale: number;
  saturation: number;
  lastUpdated: number;
}

// =========================================
// DEFAULT VALUES AND BOUNDS
// =========================================

export const DEFAULT_CUSTOMIZATION: ThemeCustomization = {
  fontSize: 16,        // Default 16px
  spacingScale: 1.0,   // Default 1x spacing
  saturation: 100,     // Default 100% saturation
};

export const FONT_SIZE_MIN = 14;
export const FONT_SIZE_MAX = 24;
export const SPACING_SCALE_MIN = 0.5;
export const SPACING_SCALE_MAX = 2.0;
export const SATURATION_MIN = 0;
export const SATURATION_MAX = 100;

// =========================================
// VALUE CLAMPING UTILITIES
// =========================================

/**
 * Clamp a number to a specified range
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Clamp font size to valid range (14-24px)
 */
export function clampFontSize(size: number): number {
  return clamp(size, FONT_SIZE_MIN, FONT_SIZE_MAX);
}

/**
 * Clamp spacing scale to valid range (0.5x-2.0x)
 */
export function clampSpacingScale(scale: number): number {
  return clamp(scale, SPACING_SCALE_MIN, SPACING_SCALE_MAX);
}

/**
 * Clamp saturation to valid range (0-100%)
 */
export function clampSaturation(saturation: number): number {
  return clamp(saturation, SATURATION_MIN, SATURATION_MAX);
}

/**
 * Clamp all customization values to their valid ranges
 */
export function clampCustomization(customization: ThemeCustomization): ThemeCustomization {
  return {
    fontSize: clampFontSize(customization.fontSize),
    spacingScale: clampSpacingScale(customization.spacingScale),
    saturation: clampSaturation(customization.saturation),
  };
}

// =========================================
// STORAGE UTILITIES
// =========================================

const STORAGE_KEY = 'rainblur-theme-customization';

/**
 * Load user preferences from localStorage
 */
export function loadPreferences(): UserPreferences | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored) as UserPreferences;
    
    // Validate and clamp values
    return {
      ...parsed,
      fontSize: clampFontSize(parsed.fontSize),
      spacingScale: clampSpacingScale(parsed.spacingScale),
      saturation: clampSaturation(parsed.saturation),
    };
  } catch (error) {
    console.error('Failed to load theme preferences:', error);
    return null;
  }
}

/**
 * Save user preferences to localStorage
 */
export function savePreferences(preference: UserPreferences): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const validated = {
      ...preference,
      fontSize: clampFontSize(preference.fontSize),
      spacingScale: clampSpacingScale(preference.spacingScale),
      saturation: clampSaturation(preference.saturation),
      lastUpdated: Date.now(),
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(validated));
  } catch (error) {
    console.error('Failed to save theme preferences:', error);
  }
}

/**
 * Remove user preferences from localStorage
 */
export function clearPreferences(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear theme preferences:', error);
  }
}

// =========================================
// THEME ADJUSTMENT FUNCTIONS
// =========================================

/**
 * Update font size and persist
 */
export function updateFontSize(size: number): UserPreferences {
  const clampedSize = clampFontSize(size);
  const preferences = loadPreferences() || getDefaultPreferences();
  
  const newPreferences: UserPreferences = {
    ...preferences,
    fontSize: clampedSize,
    lastUpdated: Date.now(),
  };
  
  savePreferences(newPreferences);
  return newPreferences;
}

/**
 * Update spacing scale and persist
 */
export function updateSpacingScale(scale: number): UserPreferences {
  const clampedScale = clampSpacingScale(scale);
  const preferences = loadPreferences() || getDefaultPreferences();
  
  const newPreferences: UserPreferences = {
    ...preferences,
    spacingScale: clampedScale,
    lastUpdated: Date.now(),
  };
  
  savePreferences(newPreferences);
  return newPreferences;
}

/**
 * Update saturation and persist
 */
export function updateSaturation(saturation: number): UserPreferences {
  const clampedSaturation = clampSaturation(saturation);
  const preferences = loadPreferences() || getDefaultPreferences();
  
  const newPreferences: UserPreferences = {
    ...preferences,
    saturation: clampedSaturation,
    lastUpdated: Date.now(),
  };
  
  savePreferences(newPreferences);
  return newPreferences;
}

/**
 * Update multiple customization values at once
 */
export function updateCustomization(updates: Partial<ThemeCustomization>): UserPreferences {
  const preferences = loadPreferences() || getDefaultPreferences();
  
  const newPreferences: UserPreferences = {
    ...preferences,
    fontSize: updates.fontSize !== undefined ? clampFontSize(updates.fontSize) : preferences.fontSize,
    spacingScale: updates.spacingScale !== undefined ? clampSpacingScale(updates.spacingScale) : preferences.spacingScale,
    saturation: updates.saturation !== undefined ? clampSaturation(updates.saturation) : preferences.saturation,
    lastUpdated: Date.now(),
  };
  
  savePreferences(newPreferences);
  return newPreferences;
}

/**
 * Reset all customization to defaults
 */
export function resetCustomization(): UserPreferences {
  const defaults = getDefaultPreferences();
  savePreferences(defaults);
  return defaults;
}

// =========================================
// HELPER FUNCTIONS
// =========================================

/**
 * Get default preferences
 */
function getDefaultPreferences(): UserPreferences {
  return {
    fontSize: DEFAULT_CUSTOMIZATION.fontSize,
    spacingScale: DEFAULT_CUSTOMIZATION.spacingScale,
    saturation: DEFAULT_CUSTOMIZATION.saturation,
    lastUpdated: Date.now(),
  };
}

/**
 * Get current customization from localStorage or defaults
 */
export function getCurrentCustomization(): ThemeCustomization {
  const preferences = loadPreferences();
  return preferences ? {
    fontSize: preferences.fontSize,
    spacingScale: preferences.spacingScale,
    saturation: preferences.saturation,
  } : DEFAULT_CUSTOMIZATION;
}

/**
 * Apply customization to CSS custom properties
 */
export function applyCustomizationToCSS(customization: ThemeCustomization): void {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;
  
  // Update font size (base font size)
  root.style.setProperty('--font-size-base', `${customization.fontSize}px`);
  
  // Update spacing scale (multiply base spacing by scale)
  const spacingScale = customization.spacingScale;
  root.style.setProperty('--spacing-scale-factor', String(spacingScale));
  
  // Update saturation (for accent colors)
  root.style.setProperty('--color-saturation', `${customization.saturation}%`);
}

/**
 * Initialize theme customization from stored preferences
 */
export function initializeCustomization(): void {
  const customization = getCurrentCustomization();
  applyCustomizationToCSS(customization);
}
