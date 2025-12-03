import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API configuration
const getBaseUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8080';
  }
  return 'http://localhost:8080';
};

const BASE_URL = getBaseUrl();

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export class UploadService {
  /**
   * Upload ảnh hoặc video lên thông qua backend API
   */
  static async uploadMedia(
    uri: string,
    type: 'image' | 'video' = 'image'
  ): Promise<string> {
    try {
      console.log('Starting upload via backend:', uri);

      // Lấy token từ AsyncStorage
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        console.error('No access token found');
        throw new Error('Please login first');
      }

      // Tạo form data
      const formData = new FormData();
      
      // Lấy tên file và extension
      const filename = uri.split('/').pop() || 'upload';
      const match = /\.(\w+)$/.exec(filename);
      const fileType = match ? `${type}/${match[1]}` : `${type}/jpeg`;

      // Thêm file vào form data
      formData.append('file', {
        uri,
        type: fileType,
        name: filename,
      } as any);

      // Upload qua backend
      const uploadUrl = `${BASE_URL}/file/upload-story`;

      console.log('Uploading to:', uploadUrl);

      // Gửi request với token
      const response = await axios.post<ApiResponse<string>>(uploadUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
        timeout: 60000, // 60 seconds
      });

      console.log('Upload successful:', response.data.data);

      return response.data.data || uri;
    } catch (error: any) {
      console.error('Upload error:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      
      // Fallback: trả về URI local nếu upload thất bại
      console.warn('Upload failed, using local URI as fallback');
      return uri;
    }
  }

  /**
   * Upload ảnh
   */
  static async uploadImage(uri: string): Promise<string> {
    return this.uploadMedia(uri, 'image');
  }

  /**
   * Upload video
   */
  static async uploadVideo(uri: string): Promise<string> {
    return this.uploadMedia(uri, 'video');
  }
}

export default UploadService;
