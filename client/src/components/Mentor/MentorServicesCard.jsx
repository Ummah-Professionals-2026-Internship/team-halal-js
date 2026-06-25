import { MENTOR_SERVICES } from '../../constants/services'
import SectionHeading from '../SectionHeading'

const ICONS = {
  heart: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  ),
  users: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  ),
  document: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  ),
  chat: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  ),
  bulb: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
  ),
}

const ServiceTile = ({ service, isOffered, neutral }) => {
  const iconWrap = isOffered
    ? 'bg-[#fdbb36] text-[#00212C]'
    : neutral
    ? 'bg-[#003F55]/10 text-[#003F55]'
    : 'bg-slate-200 text-slate-400'

  const container = isOffered
    ? 'border-[#fdbb36] bg-[#fdbb36]/10'
    : neutral
    ? 'border-slate-200 bg-white'
    : 'border-slate-200 bg-slate-50'

  const titleColor = isOffered || neutral ? 'text-[#00212C]' : 'text-slate-400'

  return (
    <div className={`relative rounded-xl border p-3.5 transition-colors ${container}`}>
      {isOffered && (
        <span className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full bg-[#fdbb36] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#00212C]">
          <svg className="w-2.5 h-2.5" viewBox="0 0 10 10" fill="none">
            <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Offering
        </span>
      )}
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2.5 ${iconWrap}`}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {ICONS[service.icon]}
        </svg>
      </div>
      <p className={`text-sm font-semibold leading-snug ${titleColor}`}>{service.label}</p>
      <p className={`text-[11px] mt-1 leading-snug ${isOffered || neutral ? 'text-slate-500' : 'text-slate-400'}`}>
        {service.description}
      </p>
    </div>
  )
}

const MentorServicesCard = ({ services = [] }) => {
  const offered = Array.isArray(services) ? services : []
  const hasSelection = offered.length > 0

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
      <SectionHeading
        title={hasSelection ? 'Services You Offer' : 'Services You Can Offer'}
        subtitle={
          hasSelection
            ? 'The services mentees can request from you.'
            : 'Select services during setup to start matching with mentees.'
        }
        right={
          <span className="shrink-0 rounded-full bg-[#fdbb36]/15 px-3 py-1 text-xs font-bold text-[#00212C]">
            <span className="text-[#00212C]">{offered.length}</span>
            <span className="text-slate-400"> / {MENTOR_SERVICES.length}</span>
          </span>
        }
        className="mb-4"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {MENTOR_SERVICES.map(service => (
          <ServiceTile
            key={service.id}
            service={service}
            isOffered={hasSelection && offered.includes(service.id)}
            neutral={!hasSelection}
          />
        ))}
      </div>
    </div>
  )
}

export default MentorServicesCard
