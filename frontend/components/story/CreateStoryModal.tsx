import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { MediaType } from '@/types/story';
import { UploadService } from '@/services/uploadService';

interface CreateStoryModalProps {
  visible: boolean;
  onClose: () => void;
  onPickImage: () => Promise<string | null>;
  onPickVideo: () => Promise<string | null>;
  onCreateStory: (mediaUrl: string, mediaType: MediaType) => Promise<void>;
  loading?: boolean;
}

export function CreateStoryModal({
  visible,
  onClose,
  onPickImage,
  onPickVideo,
  onCreateStory,
  loading = false,
}: CreateStoryModalProps) {
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<MediaType>(MediaType.IMAGE);
  const [uploading, setUploading] = useState(false);

  const handlePickImage = async () => {
    const uri = await onPickImage();
    if (uri) {
      setSelectedMedia(uri);
      setMediaType(MediaType.IMAGE);
    }
  };

  const handlePickVideo = async () => {
    const uri = await onPickVideo();
    if (uri) {
      setSelectedMedia(uri);
      setMediaType(MediaType.VIDEO);
    }
  };

  const handleCreate = async () => {
    if (!selectedMedia) {
      Alert.alert('Error', 'Please select an image or video');
      return;
    }

    try {
      setUploading(true);
      
      // Upload to Cloudinary first
      console.log('Uploading media to Cloudinary...');
      const uploadedUrl = mediaType === MediaType.IMAGE
        ? await UploadService.uploadImage(selectedMedia)
        : await UploadService.uploadVideo(selectedMedia);
      
      console.log('Uploaded URL:', uploadedUrl);
      
      // Create story with uploaded URL
      await onCreateStory(uploadedUrl, mediaType);
      
      // Reset and close
      setSelectedMedia(null);
      setMediaType(MediaType.IMAGE);
      onClose();
    } catch (err: any) {
      console.error('Error creating story:', err);
      Alert.alert('Error', err.message || 'Failed to create story');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedMedia(null);
    setMediaType(MediaType.IMAGE);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.overlay}>
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={handleClose} hitSlop={10}>
                <Feather name="x" size={28} color="#000" />
              </TouchableOpacity>
              <Text style={styles.title}>Create Story</Text>
              <View style={{ width: 28 }} />
            </View>

            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* Preview Area */}
              <View style={styles.previewArea}>
                {selectedMedia ? (
                  <Image
                    source={{ uri: selectedMedia }}
                    style={styles.preview}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.placeholder}>
                    <Feather name="image" size={64} color="#ccc" />
                    <Text style={styles.placeholderText}>
                      Select a photo or video
                    </Text>
                  </View>
                )}
              </View>

              {/* Action Buttons */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={handlePickImage}
                  disabled={uploading || loading}
                >
                  <Feather name="image" size={24} color="#fff" />
                  <Text style={styles.buttonText}>Choose Photo</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.button}
                  onPress={handlePickVideo}
                  disabled={uploading || loading}
                >
                  <Feather name="video" size={24} color="#fff" />
                  <Text style={styles.buttonText}>Choose Video</Text>
                </TouchableOpacity>
              </View>

              {/* Create Button */}
              {selectedMedia && (
                <TouchableOpacity
                  style={[styles.createButton, (uploading || loading) && styles.createButtonDisabled]}
                  onPress={handleCreate}
                  disabled={uploading || loading}
                >
                  {uploading || loading ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <ActivityIndicator color="#fff" />
                      <Text style={styles.createButtonText}>Uploading...</Text>
                    </View>
                  ) : (
                    <Text style={styles.createButtonText}>Share to Story</Text>
                  )}
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  previewArea: {
    width: '100%',
    height: 400,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    marginTop: 12,
    fontSize: 16,
    color: '#999',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#f77737',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
