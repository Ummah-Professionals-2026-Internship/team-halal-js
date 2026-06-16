import React from 'react'
import Navbar from './Navbar'

const PageLayout = ({ children, onBack }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#8ACBDB]">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-5">
        {children}
      </div>
      {onBack && (
        <button
          onClick={onBack}
          className="bg-[#00212C] text-white px-6 py-3 rounded mx-6 mb-6 self-start"
        >
          Back
        </button>
      )}
    </div>
  )
}

export default PageLayout
