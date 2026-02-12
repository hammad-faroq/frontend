import React, { useState, useEffect } from 'react';
import axios from 'axios';

const NotificationPreferences = () => {
  const [preferences, setPreferences] = useState({
    email_contact_messages: true,
    email_job_alerts: true,
    email_application_updates: true,
    email_security_alerts: true,
    inapp_contact_messages: true,
    inapp_job_alerts: true,
    inapp_application_updates: true,
    inapp_interview_invites: true,
    inapp_shortlist_updates: true,
    push_notifications: true,
    quiet_hours_start: '22:00',
    quiet_hours_end: '08:00',
    muted_categories: [],
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/notifications/preferences/my_preferences/', {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      setPreferences(response.data);
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  const handleToggle = (key) => (event) => {
    setPreferences({
      ...preferences,
      [key]: event.target.checked,
    });
  };

  const handleTimeChange = (key) => (event) => {
    setPreferences({
      ...preferences,
      [key]: event.target.value,
    });
  };

  const savePreferences = async () => {
    try {
      setSaving(true);
      setMessage(null);
      
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:8000/api/notifications/preferences/my_preferences/', preferences, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      
      setMessage({ type: 'success', text: 'Preferences saved successfully!' });
    } catch (error) {
      console.error('Error saving preferences:', error);
      setMessage({ type: 'error', text: 'Failed to save preferences' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {/* Email Notifications */}
      <div>
        <h3 className="text-lg font-medium text-gray-700 mb-4">📧 Email Notifications</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="email_contact_messages"
              checked={preferences.email_contact_messages}
              onChange={handleToggle('email_contact_messages')}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <label htmlFor="email_contact_messages" className="ml-2 text-gray-700">
              Contact Messages
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="email_job_alerts"
              checked={preferences.email_job_alerts}
              onChange={handleToggle('email_job_alerts')}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <label htmlFor="email_job_alerts" className="ml-2 text-gray-700">
              Job Alerts
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="email_application_updates"
              checked={preferences.email_application_updates}
              onChange={handleToggle('email_application_updates')}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <label htmlFor="email_application_updates" className="ml-2 text-gray-700">
              Application Updates
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="email_security_alerts"
              checked={preferences.email_security_alerts}
              onChange={handleToggle('email_security_alerts')}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <label htmlFor="email_security_alerts" className="ml-2 text-gray-700">
              Security Alerts
            </label>
          </div>
        </div>
      </div>

      {/* In-App Notifications */}
      <div>
        <h3 className="text-lg font-medium text-gray-700 mb-4">📱 In-App Notifications</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="inapp_contact_messages"
              checked={preferences.inapp_contact_messages}
              onChange={handleToggle('inapp_contact_messages')}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <label htmlFor="inapp_contact_messages" className="ml-2 text-gray-700">
              Contact Messages
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="inapp_job_alerts"
              checked={preferences.inapp_job_alerts}
              onChange={handleToggle('inapp_job_alerts')}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <label htmlFor="inapp_job_alerts" className="ml-2 text-gray-700">
              Job Alerts
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="inapp_application_updates"
              checked={preferences.inapp_application_updates}
              onChange={handleToggle('inapp_application_updates')}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <label htmlFor="inapp_application_updates" className="ml-2 text-gray-700">
              Application Updates
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="inapp_interview_invites"
              checked={preferences.inapp_interview_invites}
              onChange={handleToggle('inapp_interview_invites')}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <label htmlFor="inapp_interview_invites" className="ml-2 text-gray-700">
              Interview Invites
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="inapp_shortlist_updates"
              checked={preferences.inapp_shortlist_updates}
              onChange={handleToggle('inapp_shortlist_updates')}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <label htmlFor="inapp_shortlist_updates" className="ml-2 text-gray-700">
              Shortlist Updates
            </label>
          </div>
        </div>
      </div>

      {/* Quiet Hours */}
      <div>
        <h3 className="text-lg font-medium text-gray-700 mb-4">⏰ Quiet Hours</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="quiet_hours_start" className="block text-sm font-medium text-gray-700 mb-1">
              Start Time
            </label>
            <input
              type="time"
              id="quiet_hours_start"
              value={preferences.quiet_hours_start}
              onChange={handleTimeChange('quiet_hours_start')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="quiet_hours_end" className="block text-sm font-medium text-gray-700 mb-1">
              End Time
            </label>
            <input
              type="time"
              id="quiet_hours_end"
              value={preferences.quiet_hours_end}
              onChange={handleTimeChange('quiet_hours_end')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Push Notifications */}
      <div>
        <h3 className="text-lg font-medium text-gray-700 mb-4">📲 Push Notifications</h3>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="push_notifications"
            checked={preferences.push_notifications}
            onChange={handleToggle('push_notifications')}
            className="h-4 w-4 text-blue-600 rounded"
          />
          <label htmlFor="push_notifications" className="ml-2 text-gray-700">
            Enable push notifications
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 pt-4 border-t">
        <button
          onClick={fetchPreferences}
          disabled={saving}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Reset
        </button>
        <button
          onClick={savePreferences}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
};

export default NotificationPreferences;