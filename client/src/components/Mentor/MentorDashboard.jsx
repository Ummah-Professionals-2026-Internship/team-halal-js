import PageLayoutDashboard from '../PageLayoutDashboard';
import UpcomingSessions from '../UpcomingSessions/UpcomingSessions';
import MentorAvailabilityCard from './MentorAvailabilityCard';
import MentorServicesCard from './MentorServicesCard';
import useCurrentUser from '../useCurrentUser';

const MentorDashboard = () => {
  const { user, refreshUser } = useCurrentUser()
  if(!user.firstName) return <div>Loading ...</div>
  const userName = `${user.firstName} ${user.lastName}`
  const services = Array.isArray(user.mentorProfile?.volunteeringFor) ? user.mentorProfile.volunteeringFor : []

  return (
    <PageLayoutDashboard userName={userName} userRole="Mentor" userPhoto={user.profilePicture} onPhotoUpdate={refreshUser}>
      <div className="max-w-6xl mx-auto w-full pb-4">

        {/* Welcome header */}
        <div className="mb-6 mt-2">
          <div className="w-12 h-1.5 rounded-full bg-[#fdbb36] mb-3" />
          <h1 className="text-2xl font-bold text-[#00212C]">
            Welcome back{user.firstName ? `, ${user.firstName}` : ''}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your services, availability, and upcoming sessions.
          </p>
        </div>

        {/* Services offered */}
        <MentorServicesCard services={services} />

        {/* Availability + Sessions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 items-start">
          <MentorAvailabilityCard />
          <UpcomingSessions />
        </div>
      </div>
    </PageLayoutDashboard>
  );
};

export default MentorDashboard;
