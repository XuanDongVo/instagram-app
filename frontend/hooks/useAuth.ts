import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiService } from '../services/api';
import { AuthState, User } from '../types/user';


export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
  });

  // Initialize auth state from storage
  const initializeAuth = useCallback(async () => {
    try {
      const [accessToken, userStr] = await Promise.all([
        AsyncStorage.getItem('accessToken'),
        AsyncStorage.getItem('user'),
      ]);

      const isAuthenticated = !!(accessToken && accessToken !== 'null' && accessToken.trim() !== '');
      const user = userStr && userStr !== 'null' ? JSON.parse(userStr) : null;

      setAuthState({
        isAuthenticated,
        user,
        loading: false,
      });
    } catch (error) {
      console.error('Failed to initialize auth state:', error);
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
      });
    }
  }, []);

  // Login function
  const login = useCallback(async (accessToken: string, refreshToken: string, user: User) => {
    try {
      await Promise.all([
        ApiService.setTokens(accessToken, refreshToken),
        AsyncStorage.setItem('user', JSON.stringify(user)),
      ]);

      setAuthState({
        isAuthenticated: true,
        user,
        loading: false,
      });
    } catch (error) {
      console.error('Failed to save auth data:', error);
      throw error;
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await ApiService.logout();
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
      });
    } catch (error) {
      console.error('Failed to logout:', error);
      // Force logout even if API call fails
      await ApiService.clearTokens();
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
      });
    }
  }, []);

  // Update user data
  const updateUser = useCallback(async (updatedUser: User) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
      }));
    } catch (error) {
      console.error('Failed to update user data:', error);
    }
  }, []);

  // Check if token is valid (optional - for when you want to verify with backend)
  const validateToken = useCallback(async (): Promise<boolean> => {
    try {
      // Call a protected endpoint to verify token validity
      // Example: await ApiService.get('/v1/auth/verify-token');
      return true;
    } catch (error) {
      console.error('Token validation failed:', error);
      await logout();
      return false;
    }
  }, [logout]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return {
    ...authState,
    login,
    logout,
    updateUser,
    validateToken,
    refresh: initializeAuth,
  };
};