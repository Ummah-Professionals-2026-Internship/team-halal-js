import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayoutDashboard from '../PageLayoutDashboard';
import SectionHeading from '../SectionHeading';
import useCurrentUser from '../useCurrentUser';

const inputClass = "border border-slate-200 rounded-lg px-3 py-2 w-full text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#007CA6]/20 focus:border-[#007CA6] transition-colors";
const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";

const AdminViewProfile = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useCurrentUser();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user.firstName) return;
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || ''
    });
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to update profile.');
      }

      refreshUser();
      setMessage('Admin profile updated successfully.');
    } catch (err) {
      setMessage(err.message || 'Error updating profile.');
    } finally {
      setSaving(false);
    }
  };

  if (!user.firstName) return <div className="p-8 text-center text-slate-500">Loading profile...</div>;

  const name = `${formData.firstName} ${formData.lastName}`.trim();

  return (
    <PageLayoutDashboard
      userName={name}
      userRole="Administrator"
      userPhoto={user.profilePicture}
      onPhotoUpdate={refreshUser}
      onBack={() => navigate('/admin-dashboard')}
    >
      <div className="max-w-4xl mx-auto w-full pb-8">
        <div className="mb-6 mt-2">
          <div className="w-12 h-1.5 rounded-full bg-[#fdbb36] mb-3" />
          <h1 className="text-2xl font-bold text-[#00212C]">Admin Profile & Account Settings</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Admin Badge Preview */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 text-center">
            {user.profilePicture ? (
              <img src={user.profilePicture} alt={name} className="w-24 h-24 rounded-full object-cover mx-auto shadow-md" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-[#003F55] text-white flex items-center justify-center font-bold text-3xl mx-auto shadow-md">
                {name?.[0]?.toUpperCase() ?? 'A'}
              </div>
            )}
            <p className="font-bold text-[#00212C] text-xl mt-4">{name}</p>
            <span className="inline-block bg-[#0089b8] text-white text-xs font-bold px-3 py-1 rounded-full mt-2">
              System Administrator
            </span>
            <p className="text-xs text-slate-500 mt-3">{user.email}</p>
          </div>

          {/* Edit Form */}
          <div className="md:col-span-2">
            <SectionHeading title="Administrator Information" className="mb-4" />
            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>First Name</label>
                  <input
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Last Name</label>
                  <input
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Email Address</label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>

              {message && (
                <p className={`text-xs font-medium rounded-lg px-3 py-2 border ${
                  message.includes('successfully')
                    ? 'text-emerald-700 bg-emerald-50 border-emerald-100'
                    : 'text-red-600 bg-red-50 border-red-100'
                }`}>
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={saving}
                className="bg-[#0089b8] hover:bg-[#007096] disabled:opacity-50 text-white w-full py-3 rounded-lg font-bold text-sm transition-colors shadow-sm"
              >
                {saving ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </PageLayoutDashboard>
  );
};

export default AdminViewProfile;
