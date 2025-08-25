export const Colors = {
  // Dark neon theme
  primary: '#00f7ff', // Neon aqua
  secondary: '#a855f7', // Neon purple
  accent: '#39FF14', // Neon green
  needs: '#ff073a', // Neon red
  progress: '#ffff00', // Neon yellow
  cleaned: '#39FF14', // Neon green
  background: '#111827', // Dark base
  surface: '#1f2937', // Dark surface
  surfaceLight: '#374151', // Lighter surface
  text: '#f9fafb', // Light text
  textSecondary: '#9ca3af', // Secondary text
  border: '#374151', // Dark border
  shadow: 'rgba(0, 0, 0, 0.5)',
  
  // Level colors with glow
  level1: '#9ca3af', // Gray
  level2: '#3b82f6', // Blue
  level3: '#8b5cf6', // Purple
  level4: '#f59e0b', // Gold
  level5: '#ef4444', // Red/Legend
  
  // Podium colors
  gold: '#ffd700',
  silver: '#c0c0c0',
  bronze: '#cd7f32',
};

export const getStatusColor = (status: 'needs' | 'progress' | 'cleaned') => {
  let color;
  switch (status) {
    case 'needs':
      color = Colors.needs;
      break;
    case 'progress':
      color = Colors.progress;
      break;
    case 'cleaned':
      color = Colors.cleaned;
      break;
    default:
      color = Colors.textSecondary;
      break;
  }
  return color;
}