import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

export interface CompressedImage {
  uri: string;
  width: number;
  height: number;
  type: string;
}

export const requestImagePermissions = async () => {
  if (Platform.OS !== 'web') {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to upload photos!');
      return false;
    }
  }
  return true;
};

export const pickAndCompressImage = async (): Promise<CompressedImage | null> => {
  try {
    const hasPermission = await requestImagePermissions();
    if (!hasPermission) return null;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
      base64: false,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    
    // Simple compression by limiting dimensions
    const maxWidth = 1200;
    const scale = Math.min(maxWidth / (asset.width || maxWidth), 1);
    
    return {
      uri: asset.uri,
      width: Math.round((asset.width || 0) * scale),
      height: Math.round((asset.height || 0) * scale),
      type: asset.type || 'image/jpeg',
    };
  } catch (error) {
    console.error('Error picking image:', error);
    return null;
  }
};

export const validateImageSize = (images: CompressedImage[]): boolean => {
  const maxSizeMB = 5;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  // Estimate file size (this is approximate)
  const totalEstimatedSize = images.reduce((total, img) => {
    const estimatedSize = (img.width * img.height * 3) / 4; // Rough estimate
    return total + estimatedSize;
  }, 0);
  
  return totalEstimatedSize <= maxSizeBytes;
};