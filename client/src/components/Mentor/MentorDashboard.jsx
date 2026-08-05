import { useState, useEffect } from 'react';
import PageLayoutDashboard from '../PageLayoutDashboard';
import UpcomingSessions from '../UpcomingSessions/UpcomingSessions';
import CompletedSessionCard from '../UpcomingSessions/CompletedSessionCard';
import MentorServicesCard from './MentorServicesCard';
import useCurrentUser from '../useCurrentUser';
import { getSessions } from '../../api-calls/sessions';
import { resolveNotification } from '../../api-calls/notifications';
import ActionItemsCard from '../ActionItems/ActionItemsCard';
import useActionItems from '../ActionItems/useActionItems';
import SessionFeedbackModal from '../SessionFeedbackModal';
import RescheduleRequestModal from './RescheduleRequestModal';
import SessionCancelledModal from '../ActionItems/SessionCancelledModal';
import FeedbackFollowUpModal from '../ActionItems/FeedbackFollowUpModal';
import HelpResponseModal from '../ActionItems/HelpResponseModal';
import ChangeAvailabilityModal from './ChangeAvailabilityModal';

const EmptyState = ({ text }) => (
  <div className="bg-white rounded-xl border border-dashed border-slate-200 p-6 text-center">
    <p className="text-sm text-slate-400">{text}</p>
  </div>
);

const MentorDashboard = () => {
  const { user, refreshUser } = useCurrentUser()
  const [feedbackItem, setFeedbackItem] = useState(null);
  const [reschedulingItem, setReschedulingItem] = useState(null);
  const [cancelledItem, setCancelledItem] = useState(null);
  const [followUpItem, setFollowUpItem] = useState(null);
  const [helpResponseItem, setHelpResponseItem] = useState(null);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [sessions, setSessions] = useState([]);
  const { actionItems: rawActionItems, loading: actionItemsLoading, refresh: refreshActionItems } = useActionItems(getSessions);

  useEffect(() => {
    getSessions().then(setSessions).catch(console.error);
  }, []);

  const userName = `${user.firstName} ${user.lastName}`

  if (!user.firstName) {
    return (
      <PageLayoutDashboard userName="" userRole="Mentor" userPhoto={null} onPhotoUpdate={refreshUser}>
        <div className="max-w-6xl mx-auto w-full pt-10 text-center text-sm text-slate-400">Loading ...</div>
      </PageLayoutDashboard>
    );
  }

  const services = Array.isArray(user.mentorProfile?.volunteeringFor) ? user.mentorProfile.volunteeringFor : [];

  const isPast = s => new Date(s.scheduledTime) < new Date();
  const completedSessions = sessions
    .filter(s => s.status === 'completed' || (s.status === 'scheduled' && isPast(s)))
    .sort((a, b) => new Date(b.scheduledTime) - new Date(a.scheduledTime));

  const actionItems = rawActionItems.map(item =>
    item.type === 'cancelled' ? { ...item, action: 'View' } : item
  );

  const handleActionItem = (item) => {
    if (item.type === 'feedback') {
      setFeedbackItem(item);
    } else if (item.type === 'reschedule') {
      setReschedulingItem(item);
    } else if (item.type === 'rescheduled') {
      resolveNotification(item.notification._id).then(refreshActionItems).catch(console.error);
    } else if (item.type === 'cancelled') {
      setCancelledItem(item);
    } else if (item.type === 'followup') {
      setFollowUpItem(item);
    } else if (item.type === 'help-response') {
      setHelpResponseItem(item);
    }
  };

  return (
    <PageLayoutDashboard userName={userName} userRole="Mentor" userPhoto={user.profilePicture} onPhotoUpdate={refreshUser}>
      <div className="max-w-6xl mx-auto w-full pb-4">

        {/* Welcome header */}
        <div className="mb-6 mt-2 flex items-start justify-between gap-4">
          <div>
            <div className="w-12 h-1.5 rounded-full bg-[#fdbb36] mb-3" />
            <h1 className="text-2xl font-bold text-[#00212C]">
              Welcome back{user.firstName ? `, ${user.firstName}` : ''}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Stay on top of what needs your attention and your upcoming sessions.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAvailabilityModal(true)}
            className="shrink-0 bg-[#00212C] text-white font-bold text-sm px-5 py-2.5 rounded-lg shadow-sm transition hover:brightness-110 cursor-pointer"
          >
            Change Availability
          </button>
        </div>

        <div className="flex flex-col gap-8">
          <MentorServicesCard services={services} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <ActionItemsCard actionItems={actionItems} loading={actionItemsLoading} onAction={handleActionItem} />

            <div id="upcoming-sessions">
              <UpcomingSessions showCompleted={false} />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-base font-semibold text-slate-500">Completed Sessions</h2>
              <span className="text-xs text-slate-400 font-medium">({completedSessions.length})</span>
            </div>
            {completedSessions.length > 0
              ? (
                <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-1 -mr-1">
                  {completedSessions.map(s => (
                    <CompletedSessionCard key={s._id} mentee={s.mentee} service={s.service} scheduledTime={s.scheduledTime} details={s.details} />
                  ))}
                </div>
              )
              : <EmptyState text="No completed sessions so far." />}
          </div>
        </div>
      </div>

      {feedbackItem && (
        <SessionFeedbackModal
          sessionId={feedbackItem.notification.relatedId}
          otherPersonName={feedbackItem.notification.sender?.firstName}
          onClose={() => setFeedbackItem(null)}
          onSubmitted={() => {
            resolveNotification(feedbackItem.notification._id).then(refreshActionItems).catch(console.error);
            setFeedbackItem(null);
          }}
        />
      )}

      {reschedulingItem && (
        <RescheduleRequestModal
          item={reschedulingItem}
          onClose={() => setReschedulingItem(null)}
        />
      )}

      {cancelledItem && (
        <SessionCancelledModal
          item={cancelledItem}
          otherParty={cancelledItem.session?.mentee}
          onClose={() => {
            resolveNotification(cancelledItem.notification._id).then(refreshActionItems).catch(console.error);
            setCancelledItem(null);
          }}
        />
      )}

      {followUpItem && (
        <FeedbackFollowUpModal
          item={followUpItem}
          onClose={() => setFollowUpItem(null)}
          onReplied={() => {
            setFollowUpItem(null);
            refreshActionItems();
          }}
        />
      )}

      {helpResponseItem && (
        <HelpResponseModal
          item={helpResponseItem}
          onClose={() => {
            resolveNotification(helpResponseItem.notification._id).then(refreshActionItems).catch(console.error);
            setHelpResponseItem(null);
          }}
        />
      )}

      {showAvailabilityModal && (
        <ChangeAvailabilityModal onClose={() => setShowAvailabilityModal(false)} />
      )}
    </PageLayoutDashboard>
  );
};

export default MentorDashboard;
