import Navbar from './Navbar'

const PageLayout = ({ children, onBack, backVariant = 'default' }) => {
  const isAccent = backVariant === 'accent'

  return (
    <div className="min-h-screen flex flex-col bg-[#8ACBDB]">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-5">
        {children}
      </div>
      {onBack && (
        isAccent ? (
          <button
            onClick={onBack}
            className="group inline-flex items-center gap-2 bg-[#fdbb36] text-[#00212C] font-bold px-6 py-3 rounded-lg mx-6 mb-6 self-start shadow-sm transition hover:brightness-95"
          >
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        ) : (
          <button
            onClick={onBack}
            className="bg-[#00212C] text-white px-6 py-3 rounded mx-6 mb-6 self-start"
          >
            Back
          </button>
        )
      )}
    </div>
  )
}

export default PageLayout
