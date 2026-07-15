import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayoutDashboard from './PageLayoutDashboard'
import useCurrentUser from './useCurrentUser'
import {
  getNotifications,
  markAsRead,
  markAsUnread,
  markAllAsRead,
  getNotificationPreferences,
  updateNotificationPreferences
} from '../api-calls/notifications'

const NotificationsPage = () => {
  const navigate = useNavigate()
  const { user, refreshUser } = useCurrentUser()
  const [notifications, setNotifications] = useState([])
  const [preferences, setPreferences] = useState({ email: true, sms: true, inApp: true })
  const [loading, setLoading] = useState(true)
  const [savingPrefs, setSavingPrefs] = useState(false)
  const [error, setError] = useState(null)

  const userName = user ? `${user.firstName} ${user.lastName}` : ''
  const userRole = user?.role === 'mentor' ? 'Mentor' : 'Mentee'

  const fetchData = async () => {
    try {
      setLoading(true)
      const [notifsData, prefsData] = await Promise.all([
        getNotifications(),
        getNotificationPreferences()
      ])
      setNotifications(notifsData)
      setPreferences(prefsData)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Failed to load notifications.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?._id) {
      fetchData()
    }
  }, [user?._id])

  const handleToggleRead = async (notification) => {
    try {
      if (notification.isRead) {
        await markAsUnread(notification._id)
        setNotifications(prev => prev.map(n => n._id === notification._id ? { ...n, isRead: false } : n))
      } else {
        await markAsRead(notification._id)
        setNotifications(prev => prev.map(n => n._id === notification._id ? { ...n, isRead: true } : n))
      }
    } catch (err) {
      alert(err.message || 'Failed to update notification status.')
    }
  }

  const handleMarkAllAsRead = async () => {
    if (notifications.filter(n => !n.isRead).length === 0) return
    try {
      await markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch (err) {
      alert(err.message || 'Failed to mark all as read.')
    }
  }

  const handlePreferenceChange = async (key, val) => {
    const updated = { ...preferences, [key]: val }
    setSavingPrefs(true)
    try {
      const data = await updateNotificationPreferences(updated)
      setPreferences(data)
    } catch (err) {
      alert(err.message || 'Failed to update preferences.')
    } finally {
      setSavingPrefs(false)
    }
  }

  const handleBack = () => {
    if (user?.role === 'mentor') {
      navigate('/mentor-dashboard')
    } else {
      navigate('/mentee-dashboard')
    }
  }

  if (!user?._id) return <div className="p-6 text-center">Loading session profile...</div>

  return (
    <PageLayoutDashboard userName={userName} userRole={userRole} userPhoto={user.profilePicture} onPhotoUpdate={refreshUser} onBack={handleBack}>
      <div className="max-w-6xl mx-auto w-full mt-6 pb-6">
        
        {/* Header Block */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="w-12 h-1.5 rounded-full bg-[#fdbb36] mb-3" />
            <h1 className="text-2xl font-bold text-[#00212C]">Notifications Center</h1>
            <p className="text-sm text-slate-500 mt-1">Manage notifications and communication alerts</p>
          </div>
          {notifications.filter(n => !n.isRead).length > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="bg-[#003F55]/10 hover:bg-[#003F55]/15 text-[#003F55] font-semibold text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              Mark All as Read
            </button>
          )}
        </div>

        {error && (
          <div className="p-4 mb-4 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Column: Notifications List */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 p-5 shadow-sm min-h-[300px]">
            {loading ? (
              <p className="text-center text-slate-400 text-sm mt-12">Loading notifications...</p>
            ) : notifications.length > 0 ? (
              <div className="flex flex-col divide-y divide-slate-100">
                {notifications.map(n => (
                  <div 
                    key={n._id}
                    className={`py-4 flex gap-4 items-start transition-colors ${!n.isRead ? 'bg-slate-50/20' : ''}`}
                  >
                    <div className="flex items-center h-5">
                      <input 
                        type="checkbox"
                        checked={n.isRead}
                        onChange={() => handleToggleRead(n)}
                        title={n.isRead ? "Mark as Unread" : "Mark as Read"}
                        className="w-4 h-4 text-[#007CA6] border-slate-300 rounded focus:ring-[#007CA6]/20 cursor-pointer"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`text-sm text-slate-800 leading-normal ${!n.isRead ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>
                        {n.message}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(n.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {new Date(n.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center">
                      <span className={`inline-block w-2.5 h-2.5 rounded-full ${!n.isRead ? 'bg-[#007CA6]' : 'bg-transparent'}`} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-slate-400 text-sm py-16">
                You have no notifications yet.
              </div>
            )}
          </div>

          {/* Right Column: Preferences Settings */}
          <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm flex flex-col gap-5 text-[#00212C]">
            <div>
              <h3 className="font-bold text-sm text-[#003F55]">Notification Preferences</h3>
              <p className="text-xs text-slate-400 mt-1">Choose how you want to be notified of updates.</p>
            </div>

            <div className="flex flex-col gap-4 pt-2">
              <label className="flex items-start justify-between gap-4 p-2 bg-slate-50 rounded-lg hover:bg-slate-50/80 transition-colors cursor-pointer">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800">Email Alerts</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">Receive email receipts for bookings and reschedules.</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.email}
                  disabled={savingPrefs}
                  onChange={(e) => handlePreferenceChange('email', e.target.checked)}
                  className="w-4 h-4 text-[#007CA6] border-slate-300 rounded focus:ring-[#007CA6]/20 cursor-pointer shrink-0 mt-0.5"
                />
              </label>

              <label className="flex flex-col gap-2 p-3 bg-slate-50 rounded-lg hover:bg-slate-50/80 transition-colors cursor-pointer">
                <div className="flex items-start justify-between gap-4 w-full">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800">SMS Alerts</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">Get SMS/WhatsApp reminders on your phone.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.sms}
                    disabled={savingPrefs}
                    onChange={(e) => handlePreferenceChange('sms', e.target.checked)}
                    className="w-4 h-4 text-[#007CA6] border-slate-300 rounded focus:ring-[#007CA6]/20 cursor-pointer shrink-0 mt-0.5"
                  />
                </div>
                {preferences.sms && (
                  <p className="text-[9px] text-slate-400 leading-snug mt-1 pt-1.5 border-t border-slate-200/80">
                    By checking this box, you agree to receive automated text messages. Msg & data rates may apply. Message frequency varies. Reply STOP to opt out. View our <a href="/privacy-policy" className="text-[#007CA6] underline hover:text-[#006080]">Privacy Policy</a>.
                  </p>
                )}
              </label>

              <label className="flex items-start justify-between gap-4 p-2 bg-slate-50 rounded-lg hover:bg-slate-50/80 transition-colors cursor-pointer">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800">In-App Notifications</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">Show notifications inside the header bell icon.</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.inApp}
                  disabled={savingPrefs}
                  onChange={(e) => handlePreferenceChange('inApp', e.target.checked)}
                  className="w-4 h-4 text-[#007CA6] border-slate-300 rounded focus:ring-[#007CA6]/20 cursor-pointer shrink-0 mt-0.5"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </PageLayoutDashboard>
  )
}

export default NotificationsPage
