import { useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

// Component to dynamically update the theme-color meta tag based on current theme
const ThemeColorManager = () => {
  const { darkMode } = useTheme();
  
  useEffect(() => {
    // Get the theme-color meta tag
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    
    // If it doesn't exist, create it
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.name = 'theme-color';
      document.head.appendChild(metaThemeColor);
    }
    
    // Update the color based on current theme
    if (darkMode) {
      metaThemeColor.content = '#1e1e1e'; // Dark theme color
    } else {
      metaThemeColor.content = '#ffffff'; // Light theme color
    }
  }, [darkMode]);
  
  // This component doesn't render anything
  return null;
};

export default ThemeColorManager;
