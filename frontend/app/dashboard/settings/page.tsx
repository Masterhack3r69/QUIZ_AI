'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { apiClient, APIRequestError } from '@/lib/api';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  
  // Profile form state
  const [name, setName] = useState(user?.name || '');
  const [nameError, setNameError] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  
  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPasswordError, setCurrentPasswordError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Toast state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  const showToast = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };
  
  const validateProfileForm = (): boolean => {
    let isValid = true;
    
    if (!name.trim()) {
      setNameError('Name is required');
      isValid = false;
    } else {
      setNameError('');
    }
    
    return isValid;
  };
  
  const validatePasswordForm = (): boolean => {
    let isValid = true;
    
    if (!currentPassword) {
      setCurrentPasswordError('Current password is required');
      isValid = false;
    } else {
      setCurrentPasswordError('');
    }
    
    if (!newPassword) {
      setNewPasswordError('New password is required');
      isValid = false;
    } else if (newPassword.length < 6) {
      setNewPasswordError('Password must be at least 6 characters');
      isValid = false;
    } else {
      setNewPasswordError('');
    }
    
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your new password');
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    } else {
      setConfirmPasswordError('');
    }
    
    return isValid;
  };
  
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateProfileForm()) {
      return;
    }
    
    setIsUpdatingProfile(true);
    
    try {
      const response = await apiClient.updateProfile(name.trim());
      updateUser(response.user);
      showToast('success', 'Profile updated successfully');
    } catch (error) {
      if (error instanceof APIRequestError) {
        showToast('error', error.message);
      } else {
        showToast('error', 'Failed to update profile. Please try again.');
      }
    } finally {
      setIsUpdatingProfile(false);
    }
  };
  
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }
    
    setIsChangingPassword(true);
    
    try {
      await apiClient.changePassword(currentPassword, newPassword);
      showToast('success', 'Password changed successfully');
      
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      if (error instanceof APIRequestError) {
        showToast('error', error.message);
      } else {
        showToast('error', 'Failed to change password. Please try again.');
      }
    } finally {
      setIsChangingPassword(false);
    }
  };
  
  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Account Settings</h1>
      
      {/* Toast notifications */}
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{ top: `${1 + index * 5}rem` }}
          className="fixed right-4 z-50"
        >
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border-l-4 shadow-lg ${
              toast.type === 'success'
                ? 'bg-green-50 border-green-500 text-green-800'
                : 'bg-red-50 border-red-500 text-red-800'
            }`}
            role="alert"
          >
            {toast.type === 'success' ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
        </div>
      ))}
      
      {/* Profile Information */}
      <Card title="Profile Information" className="mb-6">
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={nameError}
              required
              placeholder="Enter your name"
            />
            
            <Input
              label="Email"
              type="email"
              value={user?.email || ''}
              disabled
              helperText="Email cannot be changed"
            />
          </div>
          
          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              loading={isUpdatingProfile}
              disabled={isUpdatingProfile || name === user?.name}
            >
              Update Profile
            </Button>
          </div>
        </form>
      </Card>
      
      {/* Change Password */}
      <Card title="Change Password" className="mb-6">
        <form onSubmit={handleChangePassword} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            error={currentPasswordError}
            required
            placeholder="Enter current password"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={newPasswordError}
              required
              placeholder="Enter new password"
              helperText="Minimum 6 characters"
            />
            
            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={confirmPasswordError}
              required
              placeholder="Confirm new password"
            />
          </div>
          
          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              loading={isChangingPassword}
              disabled={isChangingPassword}
            >
              Change Password
            </Button>
          </div>
        </form>
      </Card>
      
      {/* Account Information */}
      <Card title="Account Information">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Account Type</span>
            <span className="font-medium text-gray-900">Teacher</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Member Since</span>
            <span className="font-medium text-gray-900">
              {user ? new Date(parseInt(user._id.substring(0, 8), 16) * 1000).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
