import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { Mission } from '@/types';

interface InteractiveMapProps {
  missions: Mission[];
  onMarkerPress?: (mission: Mission) => void;
  onLocationPress?: () => void;
  showLocationButton?: boolean;
  center?: { lat: number; lng: number };
  height?: number;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  missions,
  onMarkerPress,
  onLocationPress,
  showLocationButton = true,
  center = { lat: 37.7749, lng: -122.4194 },
  height = 300,
}) => {
  const { width } = Dimensions.get('window');
  const isDesktop = width > 768;
  const mapHeight = isDesktop ? 500 : height;

  const getMarkerColor = (status: string) => {
    switch (status) {
      case 'needs': return '#ff073a';
      case 'progress': return '#ffff00';
      case 'cleaned': return '#39FF14';
      default: return '#ff073a';
    }
  };

  const createMapHTML = () => {
    const markersData = missions.map(mission => ({
      id: mission.id,
      lat: mission.coords.lat,
      lng: mission.coords.lng,
      title: mission.title,
      status: mission.status,
      color: getMarkerColor(mission.status),
      estBags: mission.estBags,
    }));

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Trash Treasure Map</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
        body { 
            margin: 0; 
            padding: 0; 
            background: #111827;
        }
        #map { 
            height: ${mapHeight}px; 
            width: 100%; 
            border-radius: 8px;
        }
        .custom-popup {
            background: #1f2937;
            color: #f9fafb;
            border: 2px solid #00f7ff;
            border-radius: 8px;
            box-shadow: 0 0 20px rgba(0, 247, 255, 0.5);
        }
        .custom-popup .leaflet-popup-content-wrapper {
            background: #1f2937;
            color: #f9fafb;
            border-radius: 8px;
        }
        .custom-popup .leaflet-popup-tip {
            background: #1f2937;
            border: 2px solid #00f7ff;
        }
        .popup-content {
            padding: 8px;
            text-align: center;
        }
        .popup-title {
            font-weight: bold;
            color: #00f7ff;
            margin-bottom: 4px;
        }
        .popup-subtitle {
            font-size: 12px;
            color: #9ca3af;
        }
        .location-btn {
            position: absolute;
            top: 10px;
            right: 10px;
            z-index: 1000;
            background: #1f2937;
            border: 2px solid #00f7ff;
            border-radius: 20px;
            padding: 8px;
            cursor: pointer;
            box-shadow: 0 0 10px rgba(0, 247, 255, 0.3);
        }
        .location-btn:hover {
            background: rgba(0, 247, 255, 0.1);
        }
    </style>
</head>
<body>
    ${showLocationButton ? '<button class="location-btn" onclick="getCurrentLocation()">📍</button>' : ''}
    <div id="map"></div>
    
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
        // Initialize map with dark theme
        const map = L.map('map').setView([${center.lat}, ${center.lng}], 12);
        
        // Add dark theme tiles
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '© OpenStreetMap contributors © CARTO',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(map);
        
        // Custom marker icon function
        function createCustomIcon(color, status) {
            const statusEmoji = status === 'needs' ? '🗑️' : status === 'progress' ? '⚡' : '✅';
            return L.divIcon({
                className: 'custom-marker',
                html: \`
                    <div style="
                        background: \${color};
                        width: 30px;
                        height: 30px;
                        border-radius: 50%;
                        border: 3px solid white;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 14px;
                        box-shadow: 0 0 15px \${color};
                        animation: pulse 2s infinite;
                    ">
                        \${statusEmoji}
                    </div>
                    <style>
                        @keyframes pulse {
                            0% { box-shadow: 0 0 15px \${color}; }
                            50% { box-shadow: 0 0 25px \${color}, 0 0 35px \${color}; }
                            100% { box-shadow: 0 0 15px \${color}; }
                        }
                    </style>
                \`,
                iconSize: [30, 30],
                iconAnchor: [15, 15],
                popupAnchor: [0, -15]
            });
        }
        
        // Add markers
        const markers = ${JSON.stringify(markersData)};
        
        markers.forEach(markerData => {
            const marker = L.marker([markerData.lat, markerData.lng], {
                icon: createCustomIcon(markerData.color, markerData.status)
            }).addTo(map);
            
            const popupContent = \`
                <div class="popup-content">
                    <div class="popup-title">🎯 Trash Quest</div>
                    <div class="popup-subtitle">Pick up \${markerData.estBags} bag\${markerData.estBags > 1 ? 's' : ''} here!</div>
                </div>
            \`;
            
            marker.bindPopup(popupContent, {
                className: 'custom-popup',
                closeButton: true,
                maxWidth: 200
            });
            
            marker.on('click', function() {
                window.ReactNativeWebView?.postMessage(JSON.stringify({
                    type: 'markerClick',
                    missionId: markerData.id
                }));
            });
        });
        
        // Current location function
        function getCurrentLocation() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    map.setView([lat, lng], 15);
                    
                    // Add user location marker
                    L.marker([lat, lng], {
                        icon: L.divIcon({
                            className: 'user-location',
                            html: \`
                                <div style="
                                    background: #00f7ff;
                                    width: 20px;
                                    height: 20px;
                                    border-radius: 50%;
                                    border: 3px solid white;
                                    box-shadow: 0 0 15px #00f7ff;
                                "></div>
                            \`,
                            iconSize: [20, 20],
                            iconAnchor: [10, 10]
                        })
                    }).addTo(map).bindPopup('📍 You are here!');
                    
                    window.ReactNativeWebView?.postMessage(JSON.stringify({
                        type: 'locationUpdate',
                        lat: lat,
                        lng: lng
                    }));
                });
            }
        }
        
        // Handle map events
        map.on('click', function(e) {
            window.ReactNativeWebView?.postMessage(JSON.stringify({
                type: 'mapClick',
                lat: e.latlng.lat,
                lng: e.latlng.lng
            }));
        });
    </script>
</body>
</html>`;
  };

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      switch (data.type) {
        case 'markerClick':
          const mission = missions.find(m => m.id === data.missionId);
          if (mission && onMarkerPress) {
            onMarkerPress(mission);
          }
          break;
        case 'locationUpdate':
          if (onLocationPress) {
            onLocationPress();
          }
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  return (
    <View style={[styles.container, { height: mapHeight }]}>
      <WebView
        source={{ html: createMapHTML() }}
        style={styles.webview}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        scrollEnabled={false}
        bounces={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#111827',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});