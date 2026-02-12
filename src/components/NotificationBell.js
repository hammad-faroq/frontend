import React, { useState, useEffect, useRef } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { Link } from 'react-router-dom';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'message': return '💬';
      default: return 'ℹ️';
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString();
    } catch {
      return '';
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    setIsOpen(false);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="relative p-2 text-gray-300 hover:text-white transition"
        aria-label="Notifications"
      >
        <span className="text-2xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50 border border-gray-200">
          <div className="p-3 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              <>
                {unreadNotifications.length > 0 && (
                  <>
                    <div className="px-3 py-2 bg-blue-50 text-xs font-medium text-blue-700">
                      New ({unreadNotifications.length})
                    </div>
                    {unreadNotifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onClick={handleNotificationClick}
                        formatTime={formatTime}
                        getNotificationIcon={getNotificationIcon}
                      />
                    ))}
                  </>
                )}

                {readNotifications.length > 0 && (
                  <>
                    <div className="px-3 py-2 bg-gray-50 text-xs font-medium text-gray-500">
                      Earlier
                    </div>
                    {readNotifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onClick={handleNotificationClick}
                        formatTime={formatTime}
                        getNotificationIcon={getNotificationIcon}
                      />
                    ))}
                  </>
                )}
              </>
            )}
          </div>

          <div className="p-3 border-t border-gray-200 text-center">
            <Link
              to="/notifications"
              className="text-sm text-blue-600 hover:text-blue-800"
              onClick={() => setIsOpen(false)}
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

const NotificationItem = ({ notification, onClick, formatTime, getNotificationIcon }) => {
  return (
    <div
      onClick={() => onClick(notification)}
      className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
        notification.read ? 'bg-white' : 'bg-blue-50'
      }`}
    >
      <div className="flex items-start">
        <span className="text-lg mr-2">{getNotificationIcon(notification.notification_type)}</span>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h4 className={`font-medium ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
              {notification.title}
            </h4>
            <span className="text-xs text-gray-500">{formatTime(notification.created_at)}</span>
          </div>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {notification.message}
          </p>
          <div className="flex items-center mt-2 gap-2">
            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
              {notification.category}
            </span>
            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
              {notification.recipient_type}
            </span>
            {!notification.read && (
              <span className="inline-block h-2 w-2 rounded-full bg-blue-500"></span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationBell;