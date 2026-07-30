import React from 'react';
import HelpRequestRow from '../rows/HelpRequestRow';

const HelpRequestsSection = ({ helpRequests, onRespond }) => (
  <div>
    <div className="flex items-center gap-2.5 mb-4">
      <h1 className="text-2xl font-bold text-[#00212C]">Help Requests</h1>
      <span className="bg-slate-100 text-slate-600 text-xs font-bold rounded-full px-2.5 py-1">{helpRequests.length}</span>
    </div>
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {helpRequests.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-10">
          <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-slate-400">No help requests yet.</p>
        </div>
      )}
      {helpRequests.map(hr => (
        <HelpRequestRow key={hr._id} helpRequest={hr} onRespond={onRespond} />
      ))}
    </div>
  </div>
);

export default HelpRequestsSection;
