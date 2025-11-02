/**
 * Centralized configuration for the application.
 */

// Single source of truth for shoe sizes.
// Used by App.tsx to initialize state and by OrderForm.tsx to render the UI.
export const SIZES_CONFIG = ['#2', '#3', '#4', '#5', '#6', '#7', '#8', '#9', '#10'];

// Shared across Order and Quote forms
export const PRODUCTION_TIME_OPTIONS = [5, 8, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 120, 150];

// Specific for Quote form
export const QUOTE_PROFILE_OPTIONS = ['DS', 'CF', 'RT'];