import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, TextInput, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, MapPin, Camera, X } from 'lucide-react-native';
import { SimpleMap } from '@/components/SimpleMap';
import { XPToast } from '@/components/XPToast';
import { BadgeUnlock } from '@/components/BadgeUnlock';
import { useAppData } from '@/hooks/useAppData';
import { Colors } from '@/constants/Colors';
import { pickAndCompressImage, CompressedImage } from '@/utils/imageUtils';
import { getCurrentLocation, Coordinates } from '@/utils/locationUtils';
import { XP_REWARDS, updateUserStreak } from '@/constants/GameMechanics';

const trashTypes = [
  { value: 'bags', label: 'Bags & Bottles' },
  { value: 'construction', label: 'Construction Debris' },
  { value: 'illegal_dump', label: 'Illegal Dumping' },
  { value: 'misc', label: 'Miscellaneous' },
];

export default function ReportScreen() {
  const router = useRouter();
  const { missions, user, updateMissions, updateUser } = useAppData();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTrashType, setSelectedTrashType] = useState('bags');
  const [estBags, setEstBags] = useState('1');
  const [photos, setPhotos] = useState<CompressedImage[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(false);
  const [xpToast, setXpToast] = useState({ visible: false, xp: 0, message: '' });
  const [badgeUnlock, setBadgeUnlock] = useState({ visible: false, badge: '' });

  const showXpToast = (xp: number, message: string) => {
    setXpToast({ visible: true, xp, message });
  };

  const hideXpToast = () => {
    setXpToast({ ...xpToast, visible: false });
  };

  const showBadgeUnlock = (badge: string) => {
    setBadgeUnlock({ visible: true, badge });
  };

  const hideBadgeUnlock = () => {
    setBadgeUnlock({ ...badgeUnlock, visible: false });
  };

  const handleUseGPS = async () => {
    setLoading(true);
    try {
      const location = await getCurrentLocation();
      if (location) {
        setSelectedLocation(location);
        showXpToast(0, 'Location updated');
      } else {
        showXpToast(0, 'Unable to get your location');
      }
    } catch (error) {
      showXpToast(0, 'Location access denied');
    } finally {
      setLoading(false);
    }
  };

  const handleUseMapLocation = () => {
    // For demo, use SF coordinates
    setSelectedLocation({ lat: 37.7749, lng: -122.4194 });
    showXpToast(0, 'Using map location');
  };

  const handleAddPhoto = async () => {
    if (photos.length >= 3) {
      showXpToast(0, 'Maximum 3 photos allowed');
      return;
    }

    const photo = await pickAndCompressImage();
    if (photo) {
      setPhotos([...photos, photo]);
      showXpToast(0, 'Photo added');
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (title.length < 5) {
      showXpToast(0, 'Title must be at least 5 characters');
      return false;
    }
    
    if (description.length < 30 || description.length > 500) {
      showXpToast(0, 'Description must be 30-500 characters');
      return false;
    }
    
    if (!selectedLocation) {
      showXpToast(0, 'Please select a location');
      return false;
    }
    
    if (photos.length === 0) {
      showXpToast(0, 'Please add at least one photo');
      return false;
    }
    
    const bags = parseInt(estBags);
    if (isNaN(bags) || bags < 1 || bags > 100) {
      showXpToast(0, 'Estimated bags must be 1-100');
      return false;
    }

    return true;
  };

  const checkRateLimit = () => {
    if (!user) return false;
    
    const today = new Date().toISOString().split('T')[0];
    const todayCount = user.dailyReportCount[today] || 0;
    
    if (todayCount >= 5) {
      showXpToast(0, 'Daily quest limit reached (5/day)');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !checkRateLimit() || !user) return;

    setLoading(true);
    
    try {
      const newQuest = {
        id: `mission_${Date.now()}`,
        title: title.trim(),
        description: description.trim(),
        status: 'needs' as const,
        coords: selectedLocation!,
        trashType: selectedTrashType as any,
        estBags: parseInt(estBags),
        reporterId: user.id,
        upvotes: 0,
        photosBefore: photos.map(p => p.uri),
        photosAfter: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedMissions = [...missions, newQuest];
      await updateMissions(updatedMissions);

      // Update user points and stats
      const today = new Date().toISOString().split('T')[0];
      const newBadges = [...user.badges];
      
      let newBadgeUnlocked = '';
      // Award first report badge
      if (missions.filter(m => m.reporterId === user.id).length === 0 && !newBadges.includes('firstReport')) {
        newBadges.push('firstReport');
        newBadgeUnlocked = 'firstReport';
      }

      let updatedUser = updateUserStreak(user);
      updatedUser = {
        ...updatedUser,
        points: updatedUser.points + XP_REWARDS.REPORT,
        xp: updatedUser.xp + XP_REWARDS.REPORT,
        badges: newBadges,
        dailyReportCount: {
          ...updatedUser.dailyReportCount,
          [today]: (updatedUser.dailyReportCount[today] || 0) + 1
        }
      };

      await updateUser(updatedUser);
      
      showXpToast(XP_REWARDS.REPORT, '🎯 Quest Dropped!');
      
      // Reset form
      setTitle('');
      setDescription('');
      setSelectedTrashType('bags');
      setEstBags('1');
      setPhotos([]);
      setSelectedLocation(null);
      
      if (newBadgeUnlocked) {
        setTimeout(() => showBadgeUnlock(newBadgeUnlocked), 1500);
      }
      
      // Navigate back after delay
      setTimeout(() => {
        router.back();
      }, 2000);
      
    } catch (error) {
      showXpToast(0, 'Failed to drop quest');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>🎯 Drop Quest</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.locationSection}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.mapContainer}>
            <SimpleMap
              missions={[]}
              height={200}
              center={selectedLocation || { lat: 37.7749, lng: -122.4194 }}
              showLocationButton={false}
            />
          </View>
          
          <View style={styles.locationButtons}>
            <TouchableOpacity
              style={styles.locationButton}
              onPress={handleUseMapLocation}
              activeOpacity={0.7}
            >
              <MapPin size={16} color={Colors.primary} />
              <Text style={styles.locationButtonText}>Use This Location</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.locationButton}
              onPress={handleUseGPS}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={styles.locationButtonText}>
                {loading ? 'Getting GPS...' : 'Use My GPS'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Quest Details</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Title *</Text>
            <TextInput
              style={styles.textInput}
              value={title}
              onChangeText={setTitle}
              placeholder="Brief title for the quest location"
              maxLength={60}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description * (30-500 characters)</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe what you see and any important details"
              multiline
              numberOfLines={4}
              maxLength={500}
            />
            <Text style={styles.characterCount}>{description.length}/500</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Trash Type</Text>
            <View style={styles.chipContainer}>
              {trashTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.chip,
                    selectedTrashType === type.value && styles.chipSelected
                  ]}
                  onPress={() => setSelectedTrashType(type.value)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.chipText,
                    selectedTrashType === type.value && styles.chipTextSelected
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Estimated Bags (1-100)</Text>
            <TextInput
              style={styles.textInput}
              value={estBags}
              onChangeText={setEstBags}
              placeholder="Number of trash bags needed"
              keyboardType="numeric"
              maxLength={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Photos * (1-3 required)</Text>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.photoContainer}>
                {photos.map((photo, index) => (
                  <View key={index} style={styles.photoWrapper}>
                    <Image source={{ uri: photo.uri }} style={styles.photo} />
                    <TouchableOpacity
                      style={styles.removePhoto}
                      onPress={() => handleRemovePhoto(index)}
                      activeOpacity={0.7}
                    >
                      <X size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                ))}
                
                {photos.length < 3 && (
                  <TouchableOpacity
                    style={styles.addPhoto}
                    onPress={handleAddPhoto}
                    activeOpacity={0.7}
                  >
                    <Camera size={24} color={Colors.textSecondary} />
                    <Text style={styles.addPhotoText}>Add Photo</Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          </View>
        </View>

        <View style={styles.disclaimerSection}>
          <Text style={styles.disclaimerText}>
            By dropping this quest, you confirm this is accurate information about a real trash location that needs community cleanup.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.submitSection}>
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.7}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Dropping...' : `Drop Quest (+${XP_REWARDS.REPORT} XP)`}
          </Text>
        </TouchableOpacity>
      </View>

      <XPToast
        xpGained={xpToast.xp}
        message={xpToast.message}
        visible={xpToast.visible}
        onHide={hideXpToast}
      />
      
      <BadgeUnlock
        badgeKey={badgeUnlock.badge}
        visible={badgeUnlock.visible}
        onHide={hideBadgeUnlock}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: Colors.background,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    textShadowColor: Colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  locationSection: {
    backgroundColor: Colors.surface,
    padding: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  mapContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  locationButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  locationButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: 'rgba(0, 247, 255, 0.1)',
  },
  locationButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  formSection: {
    backgroundColor: Colors.surface,
    padding: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.surfaceLight,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'right',
    marginTop: 4,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: 'rgba(0, 247, 255, 0.1)',
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 14,
    color: Colors.primary,
  },
  chipTextSelected: {
    color: 'white',
  },
  photoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  photoWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  removePhoto: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.needs,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhoto: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 247, 255, 0.1)',
  },
  addPhotoText: {
    fontSize: 12,
    color: Colors.primary,
    marginTop: 4,
  },
  disclaimerSection: {
    backgroundColor: Colors.surface,
    padding: 16,
  },
  disclaimerText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  submitSection: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  submitButtonDisabled: {
    backgroundColor: Colors.textSecondary,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});