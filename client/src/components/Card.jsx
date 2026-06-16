import React from 'react'

const Card = ({ title, children }) => {
  return (
    <div className="bg-white w-full max-w-md rounded-md px-8 py-8 flex flex-col items-center text-sm">
      {title && <h1 className="text-2xl font-bold mb-4 text-center">{title}</h1>}
      {children}
    </div>
  )
}

export default Card
