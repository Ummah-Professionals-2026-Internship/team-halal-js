import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayoutDashboard from '../PageLayoutDashboard';
import useCurrentUser from '../useCurrentUser';
import SessionCard from '../UpcomingSessions/SessionCard';
import CompletedSessionCard from '../UpcomingSessions/CompletedSessionCard';
import { getMenteeSessions } from '../../api-calls/sessions';
import { resolveNotification } from '../../api-calls/notifications';
import ActionItemsCard from '../ActionItems/ActionItemsCard';
import useActionItems from '../ActionItems/useActionItems';
import SessionFeedbackModal from '../SessionFeedbackModal';
import RescheduleRequestModal from './RescheduleRequestModal';
import SessionCancelledModal from '../ActionItems/SessionCancelledModal';
import FeedbackFollowUpModal from '../ActionItems/FeedbackFollowUpModal';
import HelpResponseModal from '../ActionItems/HelpResponseModal';

const CountBadge = ({ count }) => (
  <span className="shrink-0 rounded-full bg-[#fdbb36]/15 px-3 py-1 text-xs font-bold text-[#00212C]">
    {count}
  </span>
);

const EmptyState = ({ text }) => (
  <div className="bg-white rounded-xl border border-dashed border-slate-200 p-6 text-center">
    <p className="text-sm text-slate-400">{text}</p>
  </div>
);

const MenteeSessionsDashboard = () => {
  const { user, refreshUser } = useCurrentUser();
  const userName = `${user.firstName} ${user.lastName}`;
  const navigate = useNavigate();

  const [feedbackItem, setFeedbackItem] = useState(null);
  const [reschedulingItem, setReschedulingItem] = useState(null);
  const [cancelledItem, setCancelledItem] = useState(null);
  const [followUpItem, setFollowUpItem] = useState(null);
  const [helpResponseItem, setHelpResponseItem] = useState(null);

  const { actionItems: rawActionItems, sessions, loading: actionItemsLoading, refresh: refreshActionItems } = useActionItems(getMenteeSessions);

  const actionItems = rawActionItems.map(item =>
    item.type === 'cancelled' && item.notification.sender?.role === 'admin'
      ? { ...item, action: 'View' }
      : item
  );

  const handleActionItem = (item) => {
    if (item.type === 'feedback') {
      setFeedbackItem(item);
    } else if (item.type === 'reschedule') {
      setReschedulingItem(item);
    } else if (item.type === 'cancelled') {
      setCancelledItem(item);
    } else if (item.type === 'rescheduled') {
      resolveNotification(item.notification._id).then(refreshActionItems).catch(console.error);
    } else if (item.type === 'followup') {
      setFollowUpItem(item);
    } else if (item.type === 'help-response') {
      setHelpResponseItem(item);
    }
  };

  const isPast = s => new Date(s.scheduledTime) < new Date();
  const upcomingSessions = sessions.filter(s => s.status === 'scheduled' && !isPast(s));
  const completedSessions = sessions
    .filter(s => s.status === 'completed' || (s.status === 'scheduled' && isPast(s)))
    .sort((a, b) => new Date(b.scheduledTime) - new Date(a.scheduledTime));

  return (
    <PageLayoutDashboard userName={userName} userRole="Mentee" userPhoto={user.profilePicture} onPhotoUpdate={refreshUser}>
      <div className="max-w-5xl mx-auto w-full p-6 pb-4">
        <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
          <h1 className="text-2xl font-bold text-[#00212C]">Dashboard</h1>
          <button
            onClick={() => navigate('/mentee-dashboard')}
            className="shrink-0 bg-[#003F55] hover:bg-[#00212C] text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors cursor-pointer"
          >
            Find Mentors
          </button>
        </div>

        <div className="flex flex-col gap-8">
          <ActionItemsCard actionItems={actionItems} loading={actionItemsLoading} onAction={handleActionItem} />

          <div id="upcoming-sessions">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-[#00212C]">Upcoming Sessions</h2>
              <CountBadge count={upcomingSessions.length} />
            </div>
            {upcomingSessions.length > 0
              ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {upcomingSessions.map(s => (
                    <SessionCard key={s._id} sessionId={s._id} mentee={s.mentor} service={s.service} scheduledTime={s.scheduledTime} link={s.link} status={s.status} details={s.details} />
                  ))}
                </div>
              )
              : <EmptyState text="No upcoming sessions yet." />}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-base font-semibold text-slate-500">Completed Sessions</h2>
              <span className="text-xs text-slate-400 font-medium">({completedSessions.length})</span>
            </div>
            {completedSessions.length > 0
              ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {completedSessions.map(s => (
                    <CompletedSessionCard key={s._id} mentee={s.mentor} service={s.service} scheduledTime={s.scheduledTime} details={s.details} />
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
          otherParty={cancelledItem.session?.mentor}
          actionLabel="Rebook"
          onClose={() => setCancelledItem(null)}
          onDismiss={() => {
            resolveNotification(cancelledItem.notification._id).then(refreshActionItems).catch(console.error);
            setCancelledItem(null);
          }}
          onAction={() => {
            resolveNotification(cancelledItem.notification._id).catch(console.error);
            setCancelledItem(null);
            navigate('/mentee/schedule', { state: { mentor: cancelledItem.session?.mentor } });
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
    </PageLayoutDashboard>
  );
};

export default MenteeSessionsDashboard;
