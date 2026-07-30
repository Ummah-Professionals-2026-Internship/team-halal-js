import React from 'react';
import UserListRow from '../rows/UserListRow';

const UserListSection = ({ title, people, emptyText, onView }) => (
  <div>
    <div className="flex items-center gap-2.5 mb-4">
      <h1 className="text-2xl font-bold text-[#00212C]">{title}</h1>
      <span className="bg-slate-100 text-slate-600 text-xs font-bold rounded-full px-2.5 py-1">{people.length}</span>
    </div>
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {people.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-10">
          <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4zm6 0a4 4 0 10-4-4" />
          </svg>
          <p className="text-sm text-slate-400">{emptyText}</p>
        </div>
      )}
      {people.map(person => (
        <UserListRow key={person._id} person={person} onView={onView} />
      ))}
    </div>
  </div>
);

export default UserListSection;
