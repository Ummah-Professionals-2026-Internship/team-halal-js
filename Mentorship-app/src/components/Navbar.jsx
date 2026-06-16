import React from 'react'
import logo from '../assets/white-horizontal-C2p6e4w- 1.svg'

const Navbar = () => {
  return (
    <div className="bg-[#003F55] text-white px-6 py-4 flex items-center justify-between">
      <img src={logo} alt="Ummah Professionals Logo" className="w-48 h-auto object-contain" />
      <button className="text-3xl">
        <i className="ri-menu-3-fill" />
      </button>
    </div>
  )
}

export default Navbar
