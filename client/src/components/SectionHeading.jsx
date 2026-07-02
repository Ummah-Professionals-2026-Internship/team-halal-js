// Section heading with a small yellow accent marker, used across the mentor dashboard.
const SectionHeading = ({ title, subtitle, right, className = '' }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="w-1.5 h-6 rounded-full bg-[#fdbb36] shrink-0" />
      <div className="min-w-0 flex-1">
        <h2 className="text-base font-bold text-[#00212C] leading-tight">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {right}
    </div>
  )
}

export default SectionHeading
