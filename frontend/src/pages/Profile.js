import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';
import { API_URL } from '../config';
import './Profile.css';

const Profile = () => {
  const { user, updateUser } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);
  const [activeTab, setActiveTab] = useState('account');
  const [loading, setLoading] = useState(false);

  // Account Info State
  const [accountData, setAccountData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    profilePhoto: user?.profilePhoto || ''
  });

  // Profile photo state
  const [showPhotoOverlay, setShowPhotoOverlay] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(user?.profilePhoto || '');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Password Change State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Theme State
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  // Sync photo preview with user data
  useEffect(() => {
    if (user?.profilePhoto) {
      console.log('Syncing profile photo from user context');
      setPhotoPreview(user.profilePhoto);
      setAccountData(prev => ({ ...prev, profilePhoto: user.profilePhoto }));
    } else {
      setPhotoPreview(null);
      setAccountData(prev => ({ ...prev, profilePhoto: '' }));
    }
  }, [user?.profilePhoto]);

  // Apply theme on mount - use user's saved preference from server
  useEffect(() => {
    const userTheme = user?.themePreference || localStorage.getItem('theme') || 'light';
    setTheme(userTheme);

    if (userTheme === 'auto') {
      applyAutoTheme();
    } else {
      document.documentElement.setAttribute('data-theme', userTheme);
    }
  }, [user]);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('File selected:', file.name, file.type, file.size, 'bytes');

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showToast('Image size should be less than 5MB', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        console.log('Base64 created, length:', base64String.length);
        setPhotoPreview(base64String);
        setAccountData(prev => ({ ...prev, profilePhoto: base64String }));

        // Auto-save photo
        saveProfilePhoto(base64String);
      };
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        showToast('Failed to read file', 'error');
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoRemove = () => {
    setPhotoPreview(null);
    setAccountData({ ...accountData, profilePhoto: '' });
    saveProfilePhoto('');
  };

  const saveProfilePhoto = async (photoData) => {
    setUploadingPhoto(true);
    try {
      console.log('Uploading photo, size:', photoData?.length, 'bytes');

      const response = await axios.put(`${API_URL}/api/auth/profile`, {
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        address: user.address || '',
        profilePhoto: photoData
      });

      console.log('Upload response:', response.status, response.data);

      // Update user context with new data
      if (response.data.user) {
        updateUser(response.data.user);
        console.log('User context updated with new photo');
      }

      showToast(photoData ? 'Profile photo updated! ✓' : 'Profile photo removed! ✓', 'success');

    } catch (error) {
      console.error('Failed to save profile photo:', error);
      console.error('Error details:', error.response?.data);
      showToast('Failed to update photo: ' + (error.response?.data?.message || error.message), 'error');

      // Revert preview on error
      setPhotoPreview(user?.profilePhoto || null);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleUpdateAccount = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.put(`${API_URL}/api/auth/profile`, accountData);
      updateUser(response.data.user);
      showToast('Profile updated successfully! ✓', 'success');
    } catch (error) {
      showToast('Failed to update profile: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    setLoading(true);
    try {
      await axios.put(`${API_URL}/api/auth/change-password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      showToast('Password changed successfully! ✓', 'success');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      showToast('Failed to change password: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  const applyAutoTheme = () => {
    // Get current time in Malaysia timezone (UTC+8)
    const now = new Date();
    const malaysiaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kuala_Lumpur' }));
    const hour = malaysiaTime.getHours();

    // Dark mode: 6 PM (18:00) to 6 AM (06:00)
    // Light mode: 6 AM (06:00) to 6 PM (18:00)
    const isDarkTime = hour >= 18 || hour < 6;
    const autoTheme = isDarkTime ? 'dark' : 'light';

    document.documentElement.setAttribute('data-theme', autoTheme);
    return autoTheme;
  };

  const handleThemeChange = async (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);

    // Save theme preference to server
    try {
      await axios.put(`${API_URL}/api/auth/theme-preference`, { themePreference: newTheme });

      // Update user context with new theme preference
      updateUser({ ...user, themePreference: newTheme });

      if (newTheme === 'auto') {
        const appliedTheme = applyAutoTheme();
        showToast(`Theme set to auto (currently ${appliedTheme} mode based on Malaysia time)`, 'success');
      } else {
        document.documentElement.setAttribute('data-theme', newTheme);
        showToast(`Theme changed to ${newTheme} mode`, 'success');
      }
    } catch (error) {
      showToast('Failed to save theme preference: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  // Auto theme updater
  useEffect(() => {
    if (theme === 'auto') {
      applyAutoTheme();

      // Update theme every minute to check time changes
      const interval = setInterval(() => {
        applyAutoTheme();
      }, 60000); // Check every minute

      return () => clearInterval(interval);
    }
  }, [theme]);

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <div
            className="profile-avatar-wrapper"
            onMouseEnter={() => setShowPhotoOverlay(true)}
            onMouseLeave={() => setShowPhotoOverlay(false)}
          >
            <div className={`profile-avatar ${uploadingPhoto ? 'loading' : ''}`}>
              {uploadingPhoto ? (
                <div className="avatar-loader"></div>
              ) : photoPreview && photoPreview !== '' ? (
                <img
                  src={photoPreview}
                  alt={user?.name || 'Profile'}
                  onError={(e) => {
                    console.error('Image load error:', e);
                    setPhotoPreview(null);
                  }}
                />
              ) : (
                <span className="avatar-initial">{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
              )}
            </div>
            {showPhotoOverlay && (
              <div className="photo-overlay">
                <label htmlFor="photo-upload" className="overlay-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                  Upload
                </label>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  style={{ display: 'none' }}
                />
                {photoPreview && photoPreview !== '' && (
                  <button onClick={handlePhotoRemove} className="overlay-btn remove-btn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                    Remove
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="profile-info">
            <h1>{user?.name}</h1>
            <p className="profile-role">{user?.role}</p>
          </div>
        </div>

        <div className="profile-tabs">
          <button
            className={`tab-btn ${activeTab === 'account' ? 'active' : ''}`}
            onClick={() => setActiveTab('account')}
          >
            Account Info
          </button>
          <button
            className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            Change Password
          </button>
          <button
            className={`tab-btn ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            Preferences
          </button>
        </div>

        <div className="profile-content">
          {activeTab === 'account' && (
            <form onSubmit={handleUpdateAccount} className="profile-form">
              <h2>Account Information</h2>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={accountData.name}
                  onChange={(e) => setAccountData({ ...accountData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={accountData.email}
                  onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={accountData.phone}
                  onChange={(e) => setAccountData({ ...accountData, phone: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea
                  value={accountData.address}
                  onChange={(e) => setAccountData({ ...accountData, address: e.target.value })}
                  rows="3"
                  required
                />
              </div>
              <button type="submit" className="btn-save" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>


            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handleChangePassword} className="profile-form">
              <h2>Change Password</h2>
              <div className="form-group">
                <label>Current Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                  >
                    {showCurrentPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>New Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    required
                    minLength="6"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                  >
                    {showNewPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    required
                    minLength="6"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn-save" disabled={loading}>
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          )}

          {activeTab === 'preferences' && (
            <div className="profile-form">
              <h2>Preferences</h2>

              <div className="preference-section">
                <h3>Theme</h3>
                <p className="preference-desc">Choose your preferred color theme. Your preference will be saved and applied across all sessions.</p>
                <div className="theme-options">
                  <div
                    className={`theme-card ${theme === 'light' ? 'active' : ''}`}
                    onClick={() => handleThemeChange('light')}
                  >
                    <div className="theme-preview light-preview">
                      <div className="preview-header"></div>
                      <div className="preview-content"></div>
                    </div>
                    <span>Light</span>
                  </div>
                  <div
                    className={`theme-card ${theme === 'dark' ? 'active' : ''}`}
                    onClick={() => handleThemeChange('dark')}
                  >
                    <div className="theme-preview dark-preview">
                      <div className="preview-header"></div>
                      <div className="preview-content"></div>
                    </div>
                    <span>Dark</span>
                  </div>
                  <div
                    className={`theme-card ${theme === 'auto' ? 'active' : ''}`}
                    onClick={() => handleThemeChange('auto')}
                  >
                    <div className="theme-preview auto-preview">
                      <div className="preview-header"></div>
                      <div className="preview-content"></div>
                    </div>
                    <span>Auto</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
