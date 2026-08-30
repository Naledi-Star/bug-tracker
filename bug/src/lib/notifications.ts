import { supabase } from './supabase';

interface NotificationPayload {
  type: 'assignment' | 'status_change' | 'comment' | 'mention';
  bug_id: string;
  bug_title: string;
  recipient_id: string;
  actor_name: string;
  actor_email: string;
  project_name?: string;
  old_status?: string;
  new_status?: string;
  comment_preview?: string;
}

/**
 * Send an email notification via Supabase Edge Function
 */
export async function sendEmailNotification(payload: NotificationPayload): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    const response = await supabase.functions.invoke('send-notification', {
      body: payload,
    });

    if (response.error) {
      console.error('Email notification failed:', response.error);
    }
  } catch (error) {
    console.error('Failed to send email notification:', error);
  }
}

/**
 * Create an in-app notification in the notifications table
 */
export async function createInAppNotification(data: {
  profile_id: string;
  type: string;
  text: string;
  bug_id?: string;
}): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .insert({
      profile_id: data.profile_id,
      type: data.type,
      text: data.text,
      bug_id: data.bug_id || null,
      read: false,
    });

  if (error) {
    console.error('Failed to create in-app notification:', error);
  }
}

/**
 * Notify when a bug is assigned
 */
export async function notifyBugAssigned(params: {
  bugId: string;
  bugTitle: string;
  assigneeId: string;
  assigneeName: string;
  assigneeEmail: string;
  actorName: string;
  actorEmail: string;
  projectName?: string;
}): Promise<void> {
  // In-app notification
  await createInAppNotification({
    profile_id: params.assigneeId,
    type: 'assignment',
    text: `${params.actorName} assigned you to "${params.bugTitle}"`,
    bug_id: params.bugId,
  });

  // Email notification
  await sendEmailNotification({
    type: 'assignment',
    bug_id: params.bugId,
    bug_title: params.bugTitle,
    recipient_id: params.assigneeId,
    actor_name: params.actorName,
    actor_email: params.actorEmail,
    project_name: params.projectName,
  });
}

/**
 * Notify when a bug's status changes
 */
export async function notifyStatusChanged(params: {
  bugId: string;
  bugTitle: string;
  oldStatus: string;
  newStatus: string;
  assigneeId?: string;
  assigneeName?: string;
  assigneeEmail?: string;
  reporterId?: string;
  reporterName?: string;
  reporterEmail?: string;
  actorName: string;
  actorEmail: string;
  projectName?: string;
}): Promise<void> {
  const statusLabel = params.newStatus.replace('_', ' ');
  const text = `${params.actorName} changed status to "${statusLabel}" on "${params.bugTitle}"`;

  // Notify assignee (if different from actor)
  if (params.assigneeId && params.assigneeEmail !== params.actorEmail) {
    await createInAppNotification({
      profile_id: params.assigneeId,
      type: 'status',
      text,
      bug_id: params.bugId,
    });

    await sendEmailNotification({
      type: 'status_change',
      bug_id: params.bugId,
      bug_title: params.bugTitle,
      recipient_id: params.assigneeId,
      actor_name: params.actorName,
      actor_email: params.actorEmail,
      old_status: params.oldStatus,
      new_status: params.newStatus,
      project_name: params.projectName,
    });
  }

  // Notify reporter (if different from actor and assignee)
  if (params.reporterId && params.reporterEmail !== params.actorEmail && params.reporterId !== params.assigneeId) {
    await createInAppNotification({
      profile_id: params.reporterId,
      type: 'status',
      text,
      bug_id: params.bugId,
    });

    await sendEmailNotification({
      type: 'status_change',
      bug_id: params.bugId,
      bug_title: params.bugTitle,
      recipient_id: params.reporterId,
      actor_name: params.actorName,
      actor_email: params.actorEmail,
      old_status: params.oldStatus,
      new_status: params.newStatus,
      project_name: params.projectName,
    });
  }
}

/**
 * Notify when someone comments on a bug
 */
export async function notifyCommentAdded(params: {
  bugId: string;
  bugTitle: string;
  assigneeId?: string;
  assigneeEmail?: string;
  reporterId?: string;
  reporterEmail?: string;
  actorName: string;
  actorEmail: string;
  commentPreview: string;
  projectName?: string;
}): Promise<void> {
  const text = `${params.actorName} commented on "${params.bugTitle}"`;

  // Notify assignee
  if (params.assigneeId && params.assigneeEmail !== params.actorEmail) {
    await createInAppNotification({
      profile_id: params.assigneeId,
      type: 'comment',
      text,
      bug_id: params.bugId,
    });

    await sendEmailNotification({
      type: 'comment',
      bug_id: params.bugId,
      bug_title: params.bugTitle,
      recipient_id: params.assigneeId,
      actor_name: params.actorName,
      actor_email: params.actorEmail,
      comment_preview: params.commentPreview,
      project_name: params.projectName,
    });
  }

  // Notify reporter
  if (params.reporterId && params.reporterEmail !== params.actorEmail && params.reporterId !== params.assigneeId) {
    await createInAppNotification({
      profile_id: params.reporterId,
      type: 'comment',
      text,
      bug_id: params.bugId,
    });

    await sendEmailNotification({
      type: 'comment',
      bug_id: params.bugId,
      bug_title: params.bugTitle,
      recipient_id: params.reporterId,
      actor_name: params.actorName,
      actor_email: params.actorEmail,
      comment_preview: params.commentPreview,
      project_name: params.projectName,
    });
  }
}
