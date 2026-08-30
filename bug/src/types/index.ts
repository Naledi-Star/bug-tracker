// Re-export database types for convenience
export type { Database } from './database';

// Legacy types (will be removed once all pages use Supabase)
export type { Company, LegacyUser as User, LegacyProject as Project, LegacyComment as Comment, Defect } from '../data/mockData';

// App-level types derived from Supabase schema
import type { Database } from './database';

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

export type Views<T extends keyof Database['public']['Views']> =
  Database['public']['Views'][T]['Row'];

// Convenience type aliases
export type CompanyRow = Tables<'companies'>;
export type ProfileRow = Tables<'profiles'>;
export type ProjectRow = Tables<'projects'>;
export type ProjectMemberRow = Tables<'project_members'>;
export type BugRow = Tables<'bugs'>;
export type BugCommentRow = Tables<'bug_comments'>;
export type BugActivityRow = Tables<'bug_activity'>;
export type ChannelRow = Tables<'channels'>;
export type ChannelMemberRow = Tables<'channel_members'>;
export type MessageRow = Tables<'messages'>;
export type NotificationRow = Tables<'notifications'>;
export type AuditLogRow = Tables<'audit_logs'>;
export type AppSettingRow = Tables<'app_settings'>;
export type DashboardWidgetRow = Tables<'dashboard_widgets'>;
