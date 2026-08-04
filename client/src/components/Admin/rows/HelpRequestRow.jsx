import React from 'react';
import { formatTimeAgo } from '../adminUtils';

const HelpRequestRow = ({ helpRequest, onRespond }) => {
  const resolved = helpRequest.status === 'resolved';
  const name = `${helpRequest.user?.firstName ?? 'Someone'} ${helpRequest.user?.lastName ?? ''}`.trim();
  return (
    <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60 transition-colors">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-bold text-[#00212C] text-sm">{name || 'Someone'} ({helpRequest.user?.role === 'mentor' ? 'Mentor' : 'Mentee'})</p>
          <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
            resolved ? 'bg-emerald-100 text-emerald-700' : 'bg-[#fdbb36]/20 text-[#00212C]'
          }`}>
            {resolved ? 'Resolved' : 'Open'}
          </span>
        </div>
        {helpRequest.topics?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-1.5">
            {helpRequest.topics.map(topic => (
              <span key={topic} className="bg-[#fdbb36]/15 text-[#00212C] text-xs font-semibold px-2 py-0.5 rounded-full">
                {topic}
              </span>
            ))}
          </div>
        )}
        {helpRequest.message && (
          <p className="text-sm text-slate-700 mb-1.5">"{helpRequest.message}"</p>
        )}
        {resolved && helpRequest.response && (
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-xs text-slate-600 mt-1.5">
            <span className="font-bold text-slate-400 uppercase tracking-wide text-[10px] block mb-1">Admin Response</span>
            {helpRequest.response}
          </div>
        )}
        <p className="text-xs text-slate-400 mt-1.5">{formatTimeAgo(helpRequest.createdAt)}</p>
      </div>
      {!resolved && (
        <button
          onClick={() => onRespond(helpRequest)}
          className="shrink-0 bg-[#fdbb36] text-[#00212C] font-semibold text-sm px-4 py-2 rounded-lg hover:brightness-95 transition"
        >
          Respond
        </button>
      )}
    </div>
  );
};

export default HelpRequestRow;
