/**
 * Auto-generated Supabase Database types.
 * Matches the schema in supabase/migrations/001_initial.sql
 */

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          industry: string | null;
          logo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          industry?: string | null;
          logo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          industry?: string | null;
          logo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          company_id: string | null;
          name: string;
          email: string;
          avatar: string | null;
          role: 'admin' | 'manager' | 'developer' | 'tester';
          status: 'online' | 'offline' | 'away';
          notification_prefs: Record<string, boolean>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          company_id?: string | null;
          name: string;
          email: string;
          avatar?: string | null;
          role?: 'admin' | 'manager' | 'developer' | 'tester';
          status?: 'online' | 'offline' | 'away';
          notification_prefs?: Record<string, boolean>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string | null;
          name?: string;
          email?: string;
          avatar?: string | null;
          role?: 'admin' | 'manager' | 'developer' | 'tester';
          status?: 'online' | 'offline' | 'away';
          notification_prefs?: Record<string, boolean>;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          company_id: string | null;
          name: string;
          description: string | null;
          status: 'active' | 'on-hold' | 'completed';
          color: string;
          created_at: string;
          updated_at: string;
          is_archived: boolean;
          archived_at: string | null;
        };
        Insert: {
          id?: string;
          company_id?: string | null;
          name: string;
          description?: string | null;
          status?: 'active' | 'on-hold' | 'completed';
          color?: string;
          created_at?: string;
          updated_at?: string;
          is_archived?: boolean;
          archived_at?: string | null;
        };
        Update: {
          id?: string;
          company_id?: string | null;
          name?: string;
          description?: string | null;
          status?: 'active' | 'on-hold' | 'completed';
          color?: string;
          created_at?: string;
          updated_at?: string;
          is_archived?: boolean;
          archived_at?: string | null;
        };
      };
      project_members: {
        Row: {
          project_id: string;
          profile_id: string;
          role: 'manager' | 'developer' | 'tester';
          joined_at: string;
        };
        Insert: {
          project_id: string;
          profile_id: string;
          role?: 'manager' | 'developer' | 'tester';
          joined_at?: string;
        };
        Update: {
          project_id?: string;
          profile_id?: string;
          role?: 'manager' | 'developer' | 'tester';
          joined_at?: string;
        };
      };
      bugs: {
        Row: {
          id: string;
          bug_number: number;
          project_id: string | null;
          title: string;
          description: string | null;
          steps_to_reproduce: string | null;
          expected_behavior: string | null;
          actual_behavior: string | null;
          status: 'open' | 'in-progress' | 'under-review' | 'resolved' | 'closed' | 'reopened';
          priority: 'low' | 'medium' | 'high' | 'critical';
          severity: 'minor' | 'major' | 'severe' | 'blocker';
          reporter_id: string | null;
          assignee_id: string | null;
          due_date: string | null;
          environment: {
            device: string;
            os: string;
            browser: string;
            version: string;
          };
          labels: string[];
          screenshot_url: string | null;
          is_archived: boolean;
          archived_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          bug_number?: never; // auto-generated
          project_id?: string | null;
          title: string;
          description?: string | null;
          steps_to_reproduce?: string | null;
          expected_behavior?: string | null;
          actual_behavior?: string | null;
          status?: 'open' | 'in-progress' | 'under-review' | 'resolved' | 'closed' | 'reopened';
          priority?: 'low' | 'medium' | 'high' | 'critical';
          severity?: 'minor' | 'major' | 'severe' | 'blocker';
          reporter_id?: string | null;
          assignee_id?: string | null;
          due_date?: string | null;
          environment?: {
            device: string;
            os: string;
            browser: string;
            version: string;
          };
          labels?: string[];
          screenshot_url?: string | null;
          is_archived?: boolean;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          bug_number?: never;
          project_id?: string | null;
          title?: string;
          description?: string | null;
          steps_to_reproduce?: string | null;
          expected_behavior?: string | null;
          actual_behavior?: string | null;
          status?: 'open' | 'in-progress' | 'under-review' | 'resolved' | 'closed' | 'reopened';
          priority?: 'low' | 'medium' | 'high' | 'critical';
          severity?: 'minor' | 'major' | 'severe' | 'blocker';
          reporter_id?: string | null;
          assignee_id?: string | null;
          due_date?: string | null;
          environment?: {
            device: string;
            os: string;
            browser: string;
            version: string;
          };
          labels?: string[];
          screenshot_url?: string | null;
          is_archived?: boolean;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      bug_comments: {
        Row: {
          id: string;
          bug_id: string | null;
          author_id: string | null;
          content: string;
          attachment_url: string | null;
          type: 'comment' | 'status-change' | 'assignment' | 'info-request';
          created_at: string;
        };
        Insert: {
          id?: string;
          bug_id?: string | null;
          author_id?: string | null;
          content: string;
          attachment_url?: string | null;
          type?: 'comment' | 'status-change' | 'assignment' | 'info-request';
          created_at?: string;
        };
        Update: {
          id?: string;
          bug_id?: string | null;
          author_id?: string | null;
          content?: string;
          attachment_url?: string | null;
          type?: 'comment' | 'status-change' | 'assignment' | 'info-request';
          created_at?: string;
        };
      };
      bug_activity: {
        Row: {
          id: string;
          bug_id: string | null;
          user_id: string | null;
          action: string;
          detail: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          bug_id?: string | null;
          user_id?: string | null;
          action: string;
          detail?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          bug_id?: string | null;
          user_id?: string | null;
          action?: string;
          detail?: string | null;
          created_at?: string;
        };
      };
      channels: {
        Row: {
          id: string;
          company_id: string | null;
          name: string;
          type: 'project' | 'team' | 'direct';
          project_id: string | null;
          created_by: string | null;
          created_at: string;
          is_archived: boolean;
        };
        Insert: {
          id?: string;
          company_id?: string | null;
          name: string;
          type?: 'project' | 'team' | 'direct';
          project_id?: string | null;
          created_by?: string | null;
          created_at?: string;
          is_archived?: boolean;
        };
        Update: {
          id?: string;
          company_id?: string | null;
          name?: string;
          type?: 'project' | 'team' | 'direct';
          project_id?: string | null;
          created_by?: string | null;
          created_at?: string;
          is_archived?: boolean;
        };
      };
      channel_members: {
        Row: {
          channel_id: string;
          profile_id: string;
          last_read_at: string;
          joined_at: string;
        };
        Insert: {
          channel_id: string;
          profile_id: string;
          last_read_at?: string;
          joined_at?: string;
        };
        Update: {
          channel_id?: string;
          profile_id?: string;
          last_read_at?: string;
          joined_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          channel_id: string | null;
          sender_id: string | null;
          content: string;
          attachment_url: string | null;
          attachment_name: string | null;
          mentions: string[];
          is_edited: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          channel_id?: string | null;
          sender_id?: string | null;
          content: string;
          attachment_url?: string | null;
          attachment_name?: string | null;
          mentions?: string[];
          is_edited?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          channel_id?: string | null;
          sender_id?: string | null;
          content?: string;
          attachment_url?: string | null;
          attachment_name?: string | null;
          mentions?: string[];
          is_edited?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          profile_id: string | null;
          type: 'assignment' | 'comment' | 'status' | 'mention' | 'overdue';
          text: string;
          bug_id: string | null;
          channel_id: string | null;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id?: string | null;
          type: 'assignment' | 'comment' | 'status' | 'mention' | 'overdue';
          text: string;
          bug_id?: string | null;
          channel_id?: string | null;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string | null;
          type?: 'assignment' | 'comment' | 'status' | 'mention' | 'overdue';
          text?: string;
          bug_id?: string | null;
          channel_id?: string | null;
          read?: boolean;
          created_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          company_id: string | null;
          user_id: string | null;
          user_name: string | null;
          action: string;
          detail: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id?: string | null;
          user_id?: string | null;
          user_name?: string | null;
          action: string;
          detail?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string | null;
          user_id?: string | null;
          user_name?: string | null;
          action?: string;
          detail?: string | null;
          created_at?: string;
        };
      };
      app_settings: {
        Row: {
          id: string;
          company_id: string | null;
          key: string;
          value: any;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id?: string | null;
          key: string;
          value?: any;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string | null;
          key?: string;
          value?: any;
          updated_at?: string;
        };
      };
      dashboard_widgets: {
        Row: {
          id: string;
          profile_id: string | null;
          widget_key: string;
          position: number;
          is_visible: boolean;
          config: Record<string, any>;
        };
        Insert: {
          id?: string;
          profile_id?: string | null;
          widget_key: string;
          position?: number;
          is_visible?: boolean;
          config?: Record<string, any>;
        };
        Update: {
          id?: string;
          profile_id?: string | null;
          widget_key?: string;
          position?: number;
          is_visible?: boolean;
          config?: Record<string, any>;
        };
      };
    };
    Views: {
      bugs_with_details: {
        Row: {
          id: string;
          bug_number: number;
          project_id: string | null;
          title: string;
          description: string | null;
          steps_to_reproduce: string | null;
          expected_behavior: string | null;
          actual_behavior: string | null;
          status: string;
          priority: string;
          severity: string;
          reporter_id: string | null;
          assignee_id: string | null;
          due_date: string | null;
          environment: any;
          labels: string[];
          screenshot_url: string | null;
          is_archived: boolean;
          archived_at: string | null;
          created_at: string;
          updated_at: string;
          project_name: string | null;
          project_color: string | null;
          reporter_name: string | null;
          reporter_email: string | null;
          assignee_name: string | null;
          assignee_email: string | null;
          comment_count: number;
          project_health: number;
        };
      };
      channels_with_unread: {
        Row: {
          id: string;
          company_id: string | null;
          name: string;
          type: string;
          project_id: string | null;
          created_by: string | null;
          created_at: string;
          is_archived: boolean;
          message_count: number;
          unread_count: number;
        };
      };
      project_stats: {
        Row: {
          id: string;
          company_id: string | null;
          name: string;
          description: string | null;
          status: string;
          color: string;
          created_at: string;
          updated_at: string;
          is_archived: boolean;
          archived_at: string | null;
          member_count: number;
          total_bugs: number;
          open_bugs: number;
          critical_bugs: number;
          resolved_bugs: number;
          in_progress_bugs: number;
          health: number;
        };
      };
      member_stats: {
        Row: {
          id: string;
          company_id: string | null;
          name: string;
          email: string;
          avatar: string | null;
          role: string;
          status: string;
          notification_prefs: Record<string, boolean>;
          created_at: string;
          updated_at: string;
          active_bugs: number;
          completed_bugs: number;
          project_count: number;
        };
      };
    };
    Functions: {
      get_user_company_id: {
        Args: Record<string, never>;
        Returns: string;
      };
      user_has_role: {
        Args: { required_roles: string[] };
        Returns: boolean;
      };
      is_project_member: {
        Args: { proj_id: string };
        Returns: boolean;
      };
      is_channel_member: {
        Args: { chan_id: string };
        Returns: boolean;
      };
      get_unread_count: {
        Args: { chan_id: string };
        Returns: number;
      };
      calc_project_health: {
        Args: { proj_id: string };
        Returns: number;
      };
    };
    Enums: {};
  };
}
