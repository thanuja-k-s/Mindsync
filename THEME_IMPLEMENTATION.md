# Dark/Light Theme Implementation

## Overview
Implemented a global dark/light theme toggle system accessible from the Settings page. Users can now switch between dark and light themes for the entire website.

## Implementation Details

### 1. Theme Context (`src/contexts/ThemeContext.js`)
- **Purpose**: Centralized theme management using React Context API
- **Features**:
  - Theme persistence via localStorage (key: `appTheme`)
  - CSS custom properties for dynamic color switching
  - Auto-loads saved theme on app initialization
  
#### Theme Colors:
- **Light Mode**:
  - `--bg-primary`: #ffffff
  - `--bg-secondary`: #f9fafb
  - `--text-primary`: #1f2937
  - `--text-secondary`: #6b7280
  
- **Dark Mode**:
  - `--bg-primary`: #0f1729
  - `--bg-secondary`: #1a1f3a
  - `--text-primary`: #f1f5f9
  - `--text-secondary`: #cbd5e1

### 2. App Root (`src/App.js`)
- Wrapped entire app with `<ThemeProvider>`
- Ensures all child components have access to theme context

### 3. Settings Page (`src/pages/Settings.js`)
- Added theme toggle section at the top of settings
- **Features**:
  - Displays current theme (🌙 Dark Mode / ☀️ Light Mode)
  - Two buttons: "🌙 Dark" and "☀️ Light"
  - Active button is highlighted in blue
  - Clicking switches between themes instantly
  - Updated API URL to use correct port (5000)

### 4. Settings Styling (`src/pages/Settings.css`)
- Replaced all hardcoded colors with CSS variables
- Theme-aware styling for:
  - Container backgrounds
  - Text colors
  - Borders
  - Input fields
  - Button states
  - Card shadows
- Responsive design with mobile optimization

## How It Works

1. **On App Load**: 
   - ThemeContext checks localStorage for saved theme preference
   - If found, applies that theme; otherwise defaults to 'dark'
   - CSS variables are set on document root

2. **Theme Toggle**:
   - User clicks either "Dark" or "Light" button in Settings
   - `toggleTheme()` function switches theme
   - New theme preference is saved to localStorage
   - CSS variables are updated on document root
   - All components using CSS variables automatically update

3. **Persistence**:
   - Theme preference survives page refresh
   - Theme persists across navigation
   - Works across browser sessions

## Usage

### For Users:
1. Go to Settings page (`/settings`)
2. Look for "Theme" section at the top
3. Click either "🌙 Dark" or "☀️ Light" button
4. Theme applies immediately to entire website

### For Developers:
Use the theme context in any component:

```javascript
import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';

function MyComponent() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  
  return (
    <div>
      Current theme: {theme}
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
}
```

## CSS Variables Available

All components can use these variables:
- `--bg-primary`: Main background
- `--bg-secondary`: Secondary background (cards, containers)
- `--bg-tertiary`: Tertiary background
- `--text-primary`: Primary text color
- `--text-secondary`: Secondary text color
- `--text-tertiary`: Tertiary text color
- `--border-color`: Border colors
- `--card-shadow`: Box shadows

## Files Modified

1. **src/contexts/ThemeContext.js** - Created
2. **src/App.js** - Added ThemeProvider
3. **src/pages/Settings.js** - Added theme toggle UI
4. **src/pages/Settings.css** - Updated with theme-aware styles

## Browser Support
Works on all modern browsers that support:
- CSS Custom Properties (var())
- localStorage API
- React Hooks (useState, useEffect, useContext)

## Notes
- Theme switching is instantaneous with no page reload
- All components automatically respect the theme through CSS variables
- The system is extensible and can support more themes in the future
