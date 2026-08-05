import { useCallback, useEffect, useState } from 'react';
import { getNotifications } from '../../api-calls/notifications';

const useActionItems = (fetchSessions) => {
  const [sessions, setSessions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    Promise.all([fetchSessions(), getNotifications()])
      .then(([sessionsData, notificationsData]) => {
        setSessions(sessionsData);
        setNotifications(notificationsData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [fetchSessions]);

  useEffect(() => { load(); }, [load]);

  const sessionsById = new Map(sessions.map(s => [s._id, s]));

  const rescheduleItems = notifications
    .filter(n => {
      if (n.type !== 'reschedule_requested' || n.actionResolved) return false;
      const session = sessionsById.get(n.relatedId);
      return session ? !!session.rescheduleRequestedAt : true;
    })
    .map(n => ({
      id: n._id,
      type: 'reschedule',
      notification: n,
      session: sessionsById.get(n.relatedId),
      title: 'Reschedule Requested',
      detail: n.message,
      time: n.createdAt,
      action: 'Reschedule',
    }));

  const feedbackItems = notifications
    .filter(n => n.type === 'feedback_requested' && !n.actionResolved)
    .map(n => {
      const otherName = `${n.sender?.firstName ?? ''} ${n.sender?.lastName ?? ''}`.trim();
      return {
        id: n._id,
        type: 'feedback',
        notification: n,
        title: 'Feedback Requested',
        detail: otherName ? `Session with ${otherName} has ended` : n.message,
        time: n.createdAt,
        action: 'Give Feedback',
      };
    });

  const cancelledItems = notifications
    .filter(n => n.type === 'session_cancelled' && !n.actionResolved)
    .map(n => ({
      id: n._id,
      type: 'cancelled',
      notification: n,
      session: sessionsById.get(n.relatedId),
      title: 'Session Cancelled',
      detail: n.message,
      time: n.createdAt,
      action: 'Rebook',
    }));

  const rescheduledItems = notifications
    .filter(n => n.type === 'session_rescheduled' && !n.actionResolved)
    .map(n => ({
      id: n._id,
      type: 'rescheduled',
      notification: n,
      session: sessionsById.get(n.relatedId),
      title: 'Session Rescheduled',
      detail: n.message,
      time: n.createdAt,
      action: 'Dismiss',
    }));

  const followUpItems = notifications
    .filter(n => n.type === 'feedback_followup' && !n.actionResolved)
    .map(n => ({
      id: n._id,
      type: 'followup',
      notification: n,
      title: 'Ummah Professionals wants to know more',
      detail: n.message,
      time: n.createdAt,
      action: 'Reply',
    }));

  const helpResponseItems = notifications
    .filter(n => n.type === 'help_request_response' && !n.actionResolved)
    .map(n => ({
      id: n._id,
      type: 'help-response',
      notification: n,
      title: 'Ummah Professionals responded to your help request',
      detail: n.message,
      time: n.createdAt,
      action: 'View',
    }));

  const actionItems = [...rescheduleItems, ...cancelledItems, ...feedbackItems, ...rescheduledItems, ...followUpItems, ...helpResponseItems]
    .sort((a, b) => new Date(b.time) - new Date(a.time));

  return { actionItems, sessions, loading, refresh: load };
};

export default useActionItems;
