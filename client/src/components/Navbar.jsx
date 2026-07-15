import React, { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.svg';
import {
  getNotifications,
  markAsRead,
  markAllAsRead
} from '../api-calls/notifications';


const Navbar = ({ userName, userRole, userPhoto, onPhotoUpdate }) => {
  const navigate = useNavigate()
  const fileInputRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

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
    if (userName) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [userName]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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


  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if(!file) return;
    const formData = new FormData();
    formData.append('profilePicture', file);

    const token = localStorage.getItem('token');
    await fetch('/api/upload/profile-picture', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`},
      body: formData,
    });

    onPhotoUpdate?.();
  };
  return (
    <header className="relative z-20 w-full h-[126px] bg-gradient-to-b from-[#0c4a63] to-[#00303f] flex justify-between items-center px-[42px] box-border shadow-[0_4px_18px_rgba(0,0,0,0.25)]">
      <div className="flex items-center gap-8">
        <Link to={userRole === 'Mentor' ? '/mentor-dashboard' : userRole === 'Mentee' ? '/mentee-dashboard' : '/login'} className="flex items-center cursor-pointer">
          <img src={logo} className="h-[74px] w-auto object-contain" alt="Ummah Professionals Logo" />
        </Link>
        {userName && (
          <nav className="flex gap-6 text-white/95 font-bold text-sm ml-4">
            <Link to={userRole === 'Mentor' ? '/mentor-dashboard' : '/mentee-dashboard'} className="hover:text-[#fdbb36] transition-colors">
              Dashboard
            </Link>
            {userRole === 'Mentee' && (
              <Link to="/mentee/sessions" className="hover:text-[#fdbb36] transition-colors">
                My Sessions
              </Link>
            )}
          </nav>
        )}
      </div>
      {userName && (
        <div className="flex items-center gap-6">
          {/* Bell Icon & Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="relative text-white hover:text-[#fdbb36] p-2 transition-colors cursor-pointer outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-1 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-1 w-80 bg-white rounded-xl shadow-2xl border border-slate-100 text-[#00212C] text-left z-50 overflow-hidden flex flex-col">
                <div className="flex justify-between items-center px-4 py-3 border-b border-slate-100 bg-slate-50 shrink-0">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">Notifications</h3>
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAllAsRead}
                      className="text-[11px] font-semibold text-[#007CA6] hover:underline cursor-pointer"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length > 0 ? (
                    notifications.slice(0, 5).map(n => (
                      <div 
                        key={n._id} 
                        onClick={() => !n.isRead && handleMarkAsRead(n._id)}
                        className={`p-3 text-xs leading-normal transition-colors flex gap-2.5 items-start cursor-pointer hover:bg-slate-50 ${!n.isRead ? 'bg-slate-50/50 font-medium' : ''}`}
                      >
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.isRead ? 'bg-[#007CA6]' : 'bg-transparent'}`} />
                        <div className="flex-1">
                          <p className="text-slate-700">{n.message}</p>
                          <p className="text-[10px] text-slate-400 mt-1">
                            {new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No notifications yet.
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-100 shrink-0">
                  <button 
                    onClick={() => {
                      setShowDropdown(false);
                      navigate('/notifications');
                    }}
                    className="w-full text-center py-3 text-xs font-bold text-[#003F55] hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Notification Center
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="text-right">
            <p className="text-white font-semibold text-base">
              {userName} · {userRole}
            </p>
            <p onClick={handleLogout} className="text-[#8ACBDB] text-sm cursor-pointer hover:underline">Logout</p>
            {(userRole === 'Mentor' || userRole === 'Mentee') && (
              <p onClick={() => navigate(userRole === 'Mentor' ? '/mentor/profile' : '/mentee/profile')} className="text-[#8ACBDB] text-sm cursor-pointer hover:underline">View Profile</p>
            )}
          </div>

          <input 
            type="file"
            accept = "image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handlePhotoChange}
          />

          <div onClick={()=>fileInputRef.current.click()} className="cursor-pointer relative group">
            {userPhoto
            ? <img src={userPhoto} alt={userName} referrerPolicy="no-referrer" className="w-12 h-12 rounded-full object-cover shrink-0" />
            : <div className="w-12 h-12 rounded-full bg-gray-400 shrink-0 flex items-center justify-center text-white text-lg font-bold">
                {userName?.[0] ?? '?'}
              </div>
            }

            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              📷
            </div>
          </div>
          
          
        </div>
      )}

    </header>
  );
};

export default Navbar;
