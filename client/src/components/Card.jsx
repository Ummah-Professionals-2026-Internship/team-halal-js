import React from 'react'

const Card = ({ title, children, className = '' }) => {
  return (
    <div className={`bg-white w-full max-w-2xl rounded-2xl p-6 sm:p-8 md:p-10 flex flex-col items-center text-sm shadow-[0_4px_24px_rgba(0,32,43,0.08)] border border-slate-100 ${className}`}>
      {title && <h1 className="text-2xl md:text-3xl font-extrabold mb-6 text-center text-slate-800 tracking-tight">{title}</h1>}
      {children}
    </div>
  )
}

export default Card
