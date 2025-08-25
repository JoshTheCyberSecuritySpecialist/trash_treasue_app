import React from 'react';
import { InteractiveMap } from './InteractiveMap';
import { Mission } from '@/types';

interface SimpleMapProps {
  missions: Mission[];
  onMarkerPress?: (mission: Mission) => void;
  onLocationPress?: () => void;
  showLocationButton?: boolean;
  center?: { lat: number; lng: number };
  height?: number;
}

export const SimpleMap: React.FC<SimpleMapProps> = ({
  missions,
  onMarkerPress,
  onLocationPress,
  showLocationButton = true,
  center = { lat: 37.7749, lng: -122.4194 },
  height = 300,
}) => {
  return (
    <InteractiveMap
      missions={missions}
      onMarkerPress={onMarkerPress}
      onLocationPress={onLocationPress}
      showLocationButton={showLocationButton}
      center={center}
      height={height}
    />
  );
};