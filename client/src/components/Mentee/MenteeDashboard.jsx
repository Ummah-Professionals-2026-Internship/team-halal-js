import React, { useState, useEffect } from 'react';
import PageLayoutDashboard from '../PageLayoutDashboard';
import useCurrentUser from '../useCurrentUser';
import { getMatchSuggestions } from '../../api-calls/mentees';
import MentorCard from './MentorCard';

const MenteeDashboard = () => {
  const { user } = useCurrentUser();
  const userName = `${user.firstName} ${user.lastName}`;

  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getMatchSuggestions()
      .then(setMentors)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSchedule = (mentor) => {
    // TODO: navigate to schedule session page once built
  };

  const recommended = mentors[0] || null;
  const moreMentors = mentors.slice(1);

  return (
    <PageLayoutDashboard userName={userName} userRole="Mentee" userPhoto={user.profilePicture}>
      <div className="flex flex-col items-center w-full max-w-3xl mx-auto mt-6 gap-3">
        <h1 className="text-2xl font-bold text-[#00212C]">Find a Mentor to Meet With</h1>

        {loading && (
          <p className="text-gray-500 mt-4">Finding your best mentors...</p>
        )}

        {error && (
          <p className="text-red-500 mt-4">Could not load mentors: {error}</p>
        )}

        {!loading && !error && mentors.length === 0 && (
          <p className="text-gray-500 mt-4">No mentors found yet. Check back soon!</p>
        )}

        {!loading && !error && recommended && (
          <>
            <p className="text-[#00212C] self-start">Recommended Mentor</p>
            <MentorCard
              mentor={recommended}
              bg="bg-[#C5DCE8]"
              onSchedule={handleSchedule}
            />
          </>
        )}

        {!loading && !error && moreMentors.length > 0 && (
          <>
            <p className="text-[#00212C] self-start mt-2">More Mentors</p>
            <div className="flex flex-col w-full gap-3">
              {moreMentors.map((mentor, i) => (
                <MentorCard
                  key={mentor._id}
                  mentor={mentor}
                  bg="bg-[#D4C9B8]"
                  selected={i === 0}
                  onSchedule={handleSchedule}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </PageLayoutDashboard>
  );
};

export default MenteeDashboard;
