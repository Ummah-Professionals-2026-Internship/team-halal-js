import React, {useRef} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.svg';


const Navbar = ({ userName, userRole, userPhoto, onPhotoUpdate }) => {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const fileInputRef = useRef(null);
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
    <header className="w-full h-[126px] bg-[#003F55] flex justify-between items-center px-[42px] box-border">
      <Link to={userRole === 'Mentor' ? '/mentor-dashboard' : userRole === 'Mentee' ? '/mentee-dashboard' : '/login'} className="flex items-center cursor-pointer">
        <img src={logo} className="h-[74px] w-auto object-contain" alt="Ummah Professionals Logo" />
      </Link>
      {userName && (
        <div className="flex items-center gap-4">
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
