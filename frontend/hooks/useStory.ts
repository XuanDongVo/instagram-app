import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { storyService } from '@/services/storyService';
import { StoryResponse, MediaType } from '@/types/story';

export interface UseStoryReturn {
  stories: StoryResponse[];
  myStories: StoryResponse[];
  loading: boolean;
  error: string | null;
  currentUserId: string | null;
  
  // Actions
  loadStories: () => Promise<void>;
  loadMyStories: () => Promise<void>;
  createStory: (mediaUrl: string, mediaType: MediaType) => Promise<void>;
  viewStory: (storyId: string) => Promise<void>;
  deleteStory: (storyId: string) => Promise<void>;
  pickImage: () => Promise<string | null>;
  pickVideo: () => Promise<string | null>;
}

export function useStory(): UseStoryReturn {
  const [stories, setStories] = useState<StoryResponse[]>([]);
  const [myStories, setMyStories] = useState<StoryResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Load current user ID
  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('currentUser');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        setCurrentUserId(userData.id);
      }
    } catch (err) {
      console.error('Error loading current user:', err);
    }
  };

  // Load stories from following
  const loadStories = useCallback(async () => {
    if (!currentUserId) return;
    
    try {
      setLoading(true);
      setError(null);
      console.log('Loading stories from following...');
      const response = await storyService.getStoriesFromFollowing(currentUserId);
      console.log('Stories response:', response);
      if (response.data) {
        console.log('Stories loaded:', response.data.length);
        setStories(response.data);
      }
    } catch (err: any) {
      console.error('Error loading stories:', err);
      setError(err.message || 'Failed to load stories');
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  // Load my stories
  const loadMyStories = useCallback(async () => {
    if (!currentUserId) return;
    
    try {
      setLoading(true);
      setError(null);
      console.log('Loading my stories...');
      const response = await storyService.getMyStories(currentUserId);
      console.log('My stories response:', response);
      if (response.data) {
        console.log('My stories loaded:', response.data.length);
        setMyStories(response.data);
      }
    } catch (err: any) {
      console.error('Error loading my stories:', err);
      setError(err.message || 'Failed to load my stories');
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  // Create story
  const createStory = useCallback(async (mediaUrl: string, mediaType: MediaType) => {
    if (!currentUserId) {
      Alert.alert('Error', 'Please login first');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('Creating story with:', { userId: currentUserId, mediaUrl, mediaType });
      
      const response = await storyService.createStory({
        userId: currentUserId,
        mediaUrl,
        mediaType,
      });
      
      console.log('Create story response:', response);
      
      // Reload stories regardless of response format
      Alert.alert('Success', 'Story created successfully!');
      await Promise.all([loadMyStories(), loadStories()]);
      
    } catch (err: any) {
      console.error('Error creating story:', err);
      setError(err.message || 'Failed to create story');
      Alert.alert('Error', err.message || 'Failed to create story');
    } finally {
      setLoading(false);
    }
  }, [currentUserId, loadMyStories, loadStories]);

  // View story
  const viewStory = useCallback(async (storyId: string) => {
    if (!currentUserId) return;

    try {
      await storyService.viewStory(storyId, currentUserId);
    } catch (err) {
      console.error('Error viewing story:', err);
    }
  }, [currentUserId]);

  // Delete story
  const deleteStory = useCallback(async (storyId: string) => {
    if (!currentUserId) return;

    try {
      setLoading(true);
      await storyService.deleteStory(storyId, currentUserId);
      Alert.alert('Success', 'Story deleted successfully!');
      await loadMyStories();
      await loadStories();
    } catch (err: any) {
      console.error('Error deleting story:', err);
      Alert.alert('Error', err.message || 'Failed to delete story');
    } finally {
      setLoading(false);
    }
  }, [currentUserId, loadMyStories, loadStories]);

  // Pick image
  const pickImage = useCallback(async (): Promise<string | null> => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photo library');
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [9, 16],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        return result.assets[0].uri;
      }
      return null;
    } catch (err) {
      console.error('Error picking image:', err);
      return null;
    }
  }, []);

  // Pick video
  const pickVideo = useCallback(async (): Promise<string | null> => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photo library');
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        return result.assets[0].uri;
      }
      return null;
    } catch (err) {
      console.error('Error picking video:', err);
      return null;
    }
  }, []);

  // Load stories on mount
  useEffect(() => {
    if (currentUserId) {
      loadStories();
      loadMyStories();
    }
  }, [currentUserId]);

  return {
    stories,
    myStories,
    loading,
    error,
    currentUserId,
    loadStories,
    loadMyStories,
    createStory,
    viewStory,
    deleteStory,
    pickImage,
    pickVideo,
  };
}
