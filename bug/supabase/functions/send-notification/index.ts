import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'BugTracker <notifications@yourdomain.com>'

interface NotificationPayload {
  type: 'assignment' | 'status_change' | 'comment' | 'mention'
  bug_id: string
  bug_title: string
  recipient_id: string
  actor_name: string
  actor_email: string
  project_name?: string
  old_status?: string
  new_status?: string
  comment_preview?: string
}

const statusLabels: Record<string, string> = {
  'open': 'Open',
  'in_progress': 'In Progress',
  'assigned': 'Assigned',
  'under_review': 'Under Review',
  'resolved': 'Resolved',
  'closed': 'Closed',
}

function getSubject(type: string, bugTitle: string, actorName: string): string {
  switch (type) {
    case 'assignment':
      return `🐛 You've been assigned to "${bugTitle}"`
    case 'status_change':
      return `🔄 Status changed on "${bugTitle}"`
    case 'comment':
      return `💬 ${actorName} commented on "${bugTitle}"`
    case 'mention':
      return `📢 ${actorName} mentioned you in "${bugTitle}"`
    default:
      return `🔔 Update on "${bugTitle}"`
  }
}

function getHtmlContent(payload: NotificationPayload, recipientName: string): string {
  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      'open': '#FB923C',
      'in_progress': '#e5a435',
      'under_review': '#9b7cf4',
      'resolved': '#3dd68c',
      'closed': '#7c85a2',
    }
    const color = colors[status] || '#FB923C'
    return `<span style="background:${color}20;color:${color};padding:2px 8px;border-radius:4px;font-size:12px;font-weight:600;">${statusLabels[status] || status}</span>`
  }

  let body = ''
  switch (payload.type) {
    case 'assignment':
      body = `
        <p style="color:#6B7280;font-size:14px;">Hi ${recipientName},</p>
        <p style="color:#374151;font-size:14px;">You've been assigned to a bug by <strong>${payload.actor_name}</strong>.</p>
        <div style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:8px;padding:16px;margin:16px 0;">
          <p style="color:#111827;font-size:16px;font-weight:600;margin:0 0 8px 0;">${payload.bug_title}</p>
          <p style="color:#6B7280;font-size:13px;margin:0;">Project: ${payload.project_name || 'Unknown'}</p>
        </div>
      `
      break
    case 'status_change':
      body = `
        <p style="color:#6B7280;font-size:14px;">Hi ${recipientName},</p>
        <p style="color:#374151;font-size:14px;"><strong>${payload.actor_name}</strong> changed the status of a bug.</p>
        <div style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:8px;padding:16px;margin:16px 0;">
          <p style="color:#111827;font-size:16px;font-weight:600;margin:0 0 8px 0;">${payload.bug_title}</p>
          <p style="color:#6B7280;font-size:13px;margin:0 0 8px 0;">
            Status: ${payload.old_status ? statusBadge(payload.old_status) : ''} → ${payload.new_status ? statusBadge(payload.new_status) : ''}
          </p>
        </div>
      `
      break
    case 'comment':
      body = `
        <p style="color:#6B7280;font-size:14px;">Hi ${recipientName},</p>
        <p style="color:#374151;font-size:14px;"><strong>${payload.actor_name}</strong> commented on a bug.</p>
        <div style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:8px;padding:16px;margin:16px 0;">
          <p style="color:#111827;font-size:16px;font-weight:600;margin:0 0 8px 0;">${payload.bug_title}</p>
          <p style="color:#6B7280;font-size:13px;font-style:italic;margin:0;">"${payload.comment_preview || ''}"</p>
        </div>
      `
      break
    case 'mention':
      body = `
        <p style="color:#6B7280;font-size:14px;">Hi ${recipientName},</p>
        <p style="color:#374151;font-size:14px;"><strong>${payload.actor_name}</strong> mentioned you in a comment.</p>
        <div style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:8px;padding:16px;margin:16px 0;">
          <p style="color:#111827;font-size:16px;font-weight:600;margin:0 0 8px 0;">${payload.bug_title}</p>
          <p style="color:#6B7280;font-size:13px;font-style:italic;margin:0;">"${payload.comment_preview || ''}"</p>
        </div>
      `
      break
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background-color:#F3F4F6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
      <div style="max-width:600px;margin:0 auto;padding:24px;">
        <div style="background:#FFFFFF;border-radius:12px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          <div style="margin-bottom:24px;">
            <h1 style="color:#111827;font-size:20px;font-weight:700;margin:0;">🐛 BugTracker</h1>
          </div>
          ${body}
          <div style="border-top:1px solid #E5E7EB;padding-top:16px;margin-top:24px;">
            <p style="color:#9CA3AF;font-size:12px;margin:0;">
              This is a notification from BugTracker. 
              <a href="#" style="color:#FB923C;text-decoration:none;">Manage notification preferences</a>
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}

serve(async (req) => {
  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    const payload: NotificationPayload = await req.json()

    // Validate required fields
    if (!payload.type || !payload.bug_id || !payload.bug_title || !payload.recipient_id || !payload.actor_name) {
      return new Response('Missing required fields', { status: 400 })
    }

    // Check if Resend API key is configured
    if (!RESEND_API_KEY) {
      console.log('RESEND_API_KEY not configured, skipping email')
      return new Response(JSON.stringify({ success: true, skipped: true, reason: 'No API key' }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Create Supabase client to fetch recipient info
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch recipient profile
    const { data: recipient, error: recipientError } = await supabase
      .from('profiles')
      .select('name, email')
      .eq('id', payload.recipient_id)
      .single()

    if (recipientError || !recipient) {
      console.error('Failed to fetch recipient:', recipientError)
      return new Response('Recipient not found', { status: 404 })
    }

    // Don't send email to yourself
    if (payload.actor_email === recipient.email) {
      return new Response(JSON.stringify({ success: true, skipped: true, reason: 'Self-notification' }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Check notification preferences
    const { data: prefs } = await supabase
      .from('app_settings')
      .select('value')
      .eq('profile_id', payload.recipient_id)
      .eq('key', 'notification_preferences')
      .single()

    if (prefs?.value) {
      const prefKey = payload.type === 'assignment' ? 'bug_assigned' 
        : payload.type === 'status_change' ? 'status_changed'
        : payload.type === 'mention' ? 'mention'
        : 'comment'
      
      if (prefs.value[prefKey] === false) {
        return new Response(JSON.stringify({ success: true, skipped: true, reason: 'Disabled by user' }), {
          headers: { 'Content-Type': 'application/json' },
        })
      }
    }

    // Send email via Resend
    const subject = getSubject(payload.type, payload.bug_title, payload.actor_name)
    const html = getHtmlContent(payload, recipient.name)

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [recipient.email],
        subject,
        html,
      }),
    })

    const resendData = await resendResponse.json()

    if (!resendResponse.ok) {
      console.error('Resend error:', resendData)
      return new Response(JSON.stringify({ error: 'Email send failed', details: resendData }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    console.log('Email sent successfully:', resendData.id)

    return new Response(JSON.stringify({ success: true, emailId: resendData.id }), {
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Function error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
