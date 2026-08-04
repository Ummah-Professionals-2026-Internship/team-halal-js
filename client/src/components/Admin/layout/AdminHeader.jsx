import React, { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../../assets/logo.svg';
import NotificationDetailModal from '../../NotificationDetailModal';
import AdminInviteModal from '../modals/AdminInviteModal';
import useCurrentUser from '../../useCurrentUser';
import {
  getNotifications,
  markAsRead,
  markAllAsRead
} from '../../../api-calls/notifications';

const AdminHeader = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);
  const { user, refreshUser } = useCurrentUser();
  const adminName = `${user.firstName} ${user.lastName}`.trim() || 'Admin';

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [viewingNotification, setViewingNotification] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('profilePicture', file);

    const token = localStorage.getItem('token');
    await fetch('/api/upload/profile-picture', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });

    refreshUser();
  };

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.isRead).length);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="relative z-20 w-full h-[100px] 2xl:h-[120px] 3xl:h-[140px] bg-gradient-to-b from-[#0c4a63] to-[#00303f] flex justify-between items-center px-8 2xl:px-12 3xl:px-16 shrink-0 shadow-[0_4px_18px_rgba(0,0,0,0.18)]">
      <img src={logo} className="h-14 2xl:h-18 3xl:h-22 w-auto object-contain" alt="Ummah Professionals Logo" />
      <div className="flex items-center gap-4 2xl:gap-6 3xl:gap-8">
        <button
          onClick={() => setShowInviteModal(true)}
          className="bg-[#0089b8] hover:bg-[#009dcf] text-white text-xs 2xl:text-base 3xl:text-lg font-bold px-3.5 2xl:px-5 3xl:px-6 py-2 2xl:py-3 3xl:py-3.5 rounded-lg 2xl:rounded-xl transition-all duration-200 shadow-sm flex items-center gap-1.5 2xl:gap-2.5 cursor-pointer hover:shadow-md"
        >
          <svg className="w-4 h-4 2xl:w-5 2xl:h-5 3xl:w-6 3xl:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Invite Admin
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="relative text-white hover:text-[#fdbb36] p-2 2xl:p-3 transition-colors cursor-pointer outline-none"
          >
            <svg className="w-6 h-6 2xl:w-8 2xl:h-8 3xl:w-9 3xl:h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 2xl:top-2 2xl:right-2 flex h-4 w-4 2xl:h-5 2xl:w-5 items-center justify-center rounded-full bg-red-500 text-[10px] 2xl:text-xs font-bold text-white shadow-sm ring-1 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-1 w-80 2xl:w-96 bg-white rounded-xl shadow-2xl border border-slate-100 text-[#00212C] text-left z-50 overflow-hidden flex flex-col">
              <div className="flex justify-between items-center px-4 py-3 2xl:px-5 2xl:py-4 border-b border-slate-100 bg-slate-50 shrink-0">
                <h3 className="font-bold text-xs 2xl:text-sm uppercase tracking-wider text-slate-500">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-[11px] 2xl:text-xs font-semibold text-[#007CA6] hover:underline cursor-pointer"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="max-h-64 2xl:max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length > 0 ? (
                  notifications.slice(0, 5).map(n => (
                    <div
                      key={n._id}
                      onClick={() => {
                        if (!n.isRead) handleMarkAsRead(n._id);
                        setViewingNotification(n);
                        setShowDropdown(false);
                      }}
                      className={`p-3 2xl:p-4 text-xs 2xl:text-sm leading-normal transition-colors flex gap-2.5 items-start cursor-pointer hover:bg-slate-50 ${!n.isRead ? 'bg-slate-50/50 font-medium' : ''}`}
                    >
                      <div className={`w-2 h-2 2xl:w-2.5 2xl:h-2.5 rounded-full mt-1.5 shrink-0 ${!n.isRead ? 'bg-[#007CA6]' : 'bg-transparent'}`} />
                      <div className="flex-1">
                        <p className="text-slate-700">{n.message}</p>
                        <p className="text-[10px] 2xl:text-xs text-slate-400 mt-1">
                          {new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs 2xl:text-sm text-slate-400">
                    No notifications yet.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="text-right">
          <p className="text-white font-semibold text-base 2xl:text-xl 3xl:text-2xl">{adminName}</p>
          <p onClick={handleLogout} className="text-[#8ACBDB] text-sm 2xl:text-base 3xl:text-lg cursor-pointer hover:underline">Logout</p>
          <Link to="/admin/profile" className="text-[#8ACBDB] text-sm 2xl:text-base 3xl:text-lg cursor-pointer hover:underline block">View Profile</Link>
        </div>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          onChange={handlePhotoChange}
        />

        <div onClick={() => fileInputRef.current.click()} className="cursor-pointer relative group">
          {user.profilePicture ? (
            <img src={user.profilePicture} alt={adminName} referrerPolicy="no-referrer" className="w-11 h-11 2xl:w-14 2xl:h-14 3xl:w-16 3xl:h-16 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-11 h-11 2xl:w-14 2xl:h-14 3xl:w-16 3xl:h-16 rounded-full bg-slate-300 shrink-0 flex items-center justify-center text-[#00212C] text-lg 2xl:text-xl font-bold">
              {adminName?.[0] ?? '?'}
            </div>
          )}

          <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs text-white font-bold">
            📷
          </div>
        </div>
      </div>

      {viewingNotification && (
        <NotificationDetailModal
          notification={viewingNotification}
          onClose={() => setViewingNotification(null)}
        />
      )}

      {showInviteModal && (
        <AdminInviteModal
          onClose={() => setShowInviteModal(false)}
        />
      )}
    </header>
  );
};

export default AdminHeader;
