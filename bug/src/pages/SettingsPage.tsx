import { useState, useEffect } from 'react';
import { Building2, Users, FolderKanban, Shield, Bell, Lock, FileText, Save, Trash2, UserPlus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

const tabs = [
  { id: 'company', icon: Building2, label: 'Company Profile' },
  { id: 'members', icon: Users, label: 'Members' },
  { id: 'projects', icon: FolderKanban, label: 'Projects' },
  { id: 'roles', icon: Shield, label: 'Roles & Permissions' },
  { id: 'notifications', icon: Bell, label: 'Notifications' },
  { id: 'security', icon: Lock, label: 'Security' },
  { id: 'audit', icon: FileText, label: 'Audit Logs' },
];

export const SettingsPage = () => (<SettingsPageInner />);
function SettingsPageInner() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('company');
  const [company, setCompany] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<Record<string, boolean>>({
    bug_assigned: true,
    comment: true,
    status_changed: true,
    mention: true,
    overdue: true,
    weekly_digest: false,
  });
  const [security, setSecurity] = useState({
    two_factor: false,
    sso: false,
    session_timeout: true,
    ip_allowlist: false,
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.company_id) return;

    const fetchData = async () => {
      setLoading(true);

      // Fetch company
      const { data: companyData } = await supabase
        .from('companies')
        .select('*')
        .eq('id', profile.company_id)
        .single();

      // Fetch members
      const { data: memberData } = await supabase
        .from('profiles')
        .select('id, name, email, avatar, role, status')
        .eq('company_id', profile.company_id);

      // Fetch projects
      const { data: projectData } = await supabase
        .from('projects')
        .select('id, name, status, created_at')
        .eq('company_id', profile.company_id);

      // Fetch audit logs
      const { data: auditData } = await supabase
        .from('audit_logs')
        .select('*, profiles!audit_logs_actor_id_fkey(name, avatar)')
        .order('created_at', { ascending: false })
        .limit(20);

      // Fetch notification preferences
      const { data: notifData } = await supabase
        .from('app_settings')
        .select('value')
        .eq('profile_id', profile.id)
        .eq('key', 'notification_preferences')
        .single();

      // Fetch security settings
      const { data: secData } = await supabase
        .from('app_settings')
        .select('value')
        .eq('profile_id', profile.id)
        .eq('key', 'security_settings')
        .single();

      setCompany(companyData);
      setMembers(memberData || []);
      setProjects(projectData || []);
      setAuditLogs(auditData || []);
      if (notifData?.value) setNotifications(notifData.value);
      if (secData?.value) setSecurity(secData.value);
      setLoading(false);
    };

    fetchData();
  }, [profile?.company_id, profile?.id]);

  const saveCompany = async () => {
    if (!company) return;
    setSaving(true);
    await supabase
      .from('companies')
      .update({ name: company.name, description: company.description })
      .eq('id', company.id);
    setSaving(false);
  };

  const saveNotificationPrefs = async () => {
    if (!profile?.id) return;
    setSaving(true);
    await supabase
      .from('app_settings')
      .upsert({
        profile_id: profile.id,
        key: 'notification_preferences',
        value: notifications,
      });
    setSaving(false);
  };

  const saveSecuritySettings = async () => {
    if (!profile?.id) return;
    setSaving(true);
    await supabase
      .from('app_settings')
      .upsert({
        profile_id: profile.id,
        key: 'security_settings',
        value: security,
      });
    setSaving(false);
  };

  const inviteMember = async (email: string) => {
    // In production, this would send an invite email
    alert(`Invite would be sent to ${email}`);
  };

  const updateMemberRole = async (memberId: string, newRole: string) => {
    await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', memberId);

    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: newRole } : m));
  };

  const archiveProject = async (projectId: string) => {
    await supabase
      .from('projects')
      .update({ status: 'archived' })
      .eq('id', projectId);

    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status: 'archived' } : p));
  };

  const rolePermissions = [
    { role: 'admin', permissions: ['Create projects', 'Delete projects', 'Manage members', 'Edit settings', 'View all bugs', 'Manage bugs'] },
    { role: 'manager', permissions: ['Create projects', 'View all bugs', 'Manage bugs', 'View reports'] },
    { role: 'developer', permissions: ['View assigned bugs', 'Update bug status', 'Comment on bugs', 'View project'] },
    { role: 'tester', permissions: ['Report bugs', 'View assigned bugs', 'Update bug status', 'Comment on bugs'] },
  ];

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: '#9b7cf4',
      manager: '#FB923C',
      developer: '#3dd68c',
      tester: '#e5a435',
    };
    return colors[role] || '#7c85a2';
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: '#0b0e18' }}>
        <div className="text-center">
          <div style={{
            width: 32, height: 32,
            border: '3px solid rgba(251,146,60,0.2)',
            borderTopColor: '#FB923C',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 12px',
          }} />
          <p style={{ color: '#7c85a2', fontSize: 13 }}>Loading settings...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex overflow-hidden" style={{ background: '#0b0e18' }}>
      {/* Settings sidebar */}
      <div className="w-52 shrink-0 py-6 px-3" style={{ background: '#10131f', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-xs font-medium uppercase tracking-wider px-3 mb-3" style={{ color: '#2e3450', fontSize: 10 }}>Settings</p>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs mb-0.5 transition-colors"
            style={{
              background: activeTab === t.id ? 'rgba(251,146,60,0.12)' : 'transparent',
              color: activeTab === t.id ? '#FB923C' : '#7c85a2',
            }}
            onMouseEnter={e => { if (activeTab !== t.id) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
            onMouseLeave={e => { if (activeTab !== t.id) e.currentTarget.style.background = 'transparent'; }}
          >
            <t.icon size={13} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Settings content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {/* Company Profile */}
        {activeTab === 'company' && (
          <div>
            <h2 className="text-base font-semibold mb-5" style={{ color: '#e8eaf0' }}>Company Profile</h2>
            <div className="space-y-4 max-w-xl">
              <SettingField label="Company Name">
                <input
                  value={company?.name || ''}
                  onChange={e => setCompany({ ...company, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-md text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#d9dff0' }}
                />
              </SettingField>
              <SettingField label="Description">
                <textarea
                  rows={3}
                  value={company?.description || ''}
                  onChange={e => setCompany({ ...company, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-md text-sm outline-none resize-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#d9dff0' }}
                />
              </SettingField>
              <button
                onClick={saveCompany}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium"
                style={{ background: '#FB923C', color: '#fff', opacity: saving ? 0.6 : 1 }}
              >
                <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {/* Members */}
        {activeTab === 'members' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold" style={{ color: '#e8eaf0' }}>Team Members ({members.length})</h2>
              <button
                onClick={() => {
                  const email = prompt('Enter email to invite:');
                  if (email) inviteMember(email);
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium"
                style={{ background: '#FB923C', color: '#fff' }}
              >
                <UserPlus size={13} /> Invite Member
              </button>
            </div>
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
              {members.map((member, i) => (
                <div
                  key={member.id}
                  className="flex items-center gap-4 px-4 py-3"
                  style={{
                    borderBottom: i < members.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    background: member.id === profile?.id ? 'rgba(251,146,60,0.04)' : 'transparent',
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ background: `${getRoleColor(member.role)}20`, color: getRoleColor(member.role) }}
                  >
                    {member.avatar || member.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: '#d9dff0' }}>
                      {member.name}
                      {member.id === profile?.id && <span className="text-xs ml-2" style={{ color: '#484f6b' }}>(you)</span>}
                    </p>
                    <p className="text-xs" style={{ color: '#484f6b' }}>{member.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{
                      background: member.status === 'online' ? '#3dd68c' : member.status === 'away' ? '#e5a435' : '#484f6b'
                    }} />
                    <span className="text-xs capitalize" style={{ color: '#7c85a2' }}>{member.status}</span>
                  </div>
                  <select
                    value={member.role}
                    onChange={e => updateMemberRole(member.id, e.target.value)}
                    disabled={member.id === profile?.id}
                    className="px-2 py-1 rounded text-xs outline-none"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#d9dff0' }}
                  >
                    <option value="admin" style={{ background: '#141826' }}>Admin</option>
                    <option value="manager" style={{ background: '#141826' }}>Manager</option>
                    <option value="developer" style={{ background: '#141826' }}>Developer</option>
                    <option value="tester" style={{ background: '#141826' }}>Tester</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {activeTab === 'projects' && (
          <div>
            <h2 className="text-base font-semibold mb-5" style={{ color: '#e8eaf0' }}>Projects</h2>
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
              {projects.map((project, i) => (
                <div
                  key={project.id}
                  className="flex items-center gap-4 px-4 py-3"
                  style={{ borderBottom: i < projects.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: '#d9dff0' }}>{project.name}</p>
                    <p className="text-xs" style={{ color: '#484f6b' }}>Created {new Date(project.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-xs font-medium capitalize" style={{
                    background: project.status === 'active' ? 'rgba(61,214,140,0.15)' : 'rgba(120,133,162,0.15)',
                    color: project.status === 'active' ? '#3dd68c' : '#7c85a2',
                  }}>
                    {project.status}
                  </span>
                  {project.status !== 'archived' && (
                    <button
                      onClick={() => archiveProject(project.id)}
                      className="p-1 rounded transition-colors"
                      style={{ color: '#484f6b' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#f75f6b')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#484f6b')}
                      title="Archive project"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
              {projects.length === 0 && (
                <div className="py-8 text-center" style={{ color: '#484f6b' }}>
                  <p className="text-xs">No projects yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Roles & Permissions */}
        {activeTab === 'roles' && (
          <div>
            <h2 className="text-base font-semibold mb-5" style={{ color: '#e8eaf0' }}>Roles & Permissions</h2>
            <div className="space-y-4">
              {rolePermissions.map(rp => (
                <div key={rp.role} className="rounded-lg p-4" style={{ background: '#141826', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-0.5 rounded text-xs font-medium capitalize" style={{
                      background: `${getRoleColor(rp.role)}20`,
                      color: getRoleColor(rp.role),
                    }}>
                      {rp.role}
                    </span>
                    <span className="text-xs" style={{ color: '#484f6b' }}>
                      {members.filter(m => m.role === rp.role).length} members
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {rp.permissions.map(p => (
                      <span key={p} className="px-2 py-0.5 rounded text-xs" style={{ background: 'rgba(255,255,255,0.04)', color: '#7c85a2' }}>
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notifications */}
        {activeTab === 'notifications' && (
          <div>
            <h2 className="text-base font-semibold mb-5" style={{ color: '#e8eaf0' }}>Notification Preferences</h2>
            <div className="space-y-3 max-w-xl">
              {[
                { key: 'bug_assigned', label: 'Bug assigned to me' },
                { key: 'comment', label: 'Comment on my bugs' },
                { key: 'status_changed', label: 'Bug status changed' },
                { key: 'mention', label: 'Mentioned in comment' },
                { key: 'overdue', label: 'Overdue bug reminders' },
                { key: 'weekly_digest', label: 'Weekly summary digest' },
              ].map(pref => (
                <div key={pref.key} className="flex items-center justify-between py-2.5 px-3 rounded-lg" style={{ background: '#141826', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="text-sm" style={{ color: '#d9dff0' }}>{pref.label}</span>
                  <Toggle
                    defaultOn={notifications[pref.key]}
                    onChange={(on) => setNotifications(prev => ({ ...prev, [pref.key]: on }))}
                  />
                </div>
              ))}
              <button
                onClick={saveNotificationPrefs}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium"
                style={{ background: '#FB923C', color: '#fff', opacity: saving ? 0.6 : 1 }}
              >
                <Save size={14} /> {saving ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </div>
        )}

        {/* Security */}
        {activeTab === 'security' && (
          <div>
            <h2 className="text-base font-semibold mb-5" style={{ color: '#e8eaf0' }}>Security</h2>
            <div className="space-y-3 max-w-xl">
              {[
                { key: 'two_factor', label: 'Two-factor authentication', desc: 'Require 2FA for all team members' },
                { key: 'sso', label: 'SSO / SAML', desc: 'Configure single sign-on provider' },
                { key: 'session_timeout', label: 'Session timeout', desc: 'Auto-logout after 24 hours of inactivity' },
                { key: 'ip_allowlist', label: 'IP allowlist', desc: 'Restrict access to specified IP ranges' },
              ].map(s => (
                <div key={s.key} className="flex items-center justify-between p-3 rounded-lg" style={{ background: '#141826', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div>
                    <div className="text-sm font-medium" style={{ color: '#d9dff0' }}>{s.label}</div>
                    <div className="text-xs mt-0.5" style={{ color: '#484f6b' }}>{s.desc}</div>
                  </div>
                  <Toggle
                    defaultOn={security[s.key as keyof typeof security]}
                    onChange={(on) => setSecurity(prev => ({ ...prev, [s.key]: on }))}
                  />
                </div>
              ))}
              <button
                onClick={saveSecuritySettings}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium"
                style={{ background: '#FB923C', color: '#fff', opacity: saving ? 0.6 : 1 }}
              >
                <Save size={14} /> {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        )}

        {/* Audit Logs */}
        {activeTab === 'audit' && (
          <div>
            <h2 className="text-base font-semibold mb-5" style={{ color: '#e8eaf0' }}>Audit Logs</h2>
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
              {auditLogs.map((log, i) => (
                <div
                  key={log.id}
                  className="flex items-center gap-4 px-4 py-3"
                  style={{ borderBottom: i < auditLogs.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', background: 'transparent' }}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: '#FB923C20', color: '#FB923C' }}>
                    {log.profiles?.avatar || log.profiles?.name?.[0] || '?'}
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-medium" style={{ color: '#d9dff0' }}>{log.profiles?.name || 'Unknown'}</span>
                    <span className="text-xs" style={{ color: '#7c85a2' }}> {log.action} </span>
                    <span className="text-xs font-medium" style={{ color: '#FB923C' }}>{log.detail}</span>
                  </div>
                  <span className="text-xs shrink-0" style={{ color: '#484f6b' }}>
                    {new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
              {auditLogs.length === 0 && (
                <div className="py-8 text-center" style={{ color: '#484f6b' }}>
                  <p className="text-xs">No audit logs yet</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SettingField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium mb-1.5 block" style={{ color: '#7c85a2' }}>{label}</label>
      {children}
    </div>
  );
}

function Toggle({ defaultOn, onChange }: { defaultOn?: boolean; onChange?: (on: boolean) => void }) {
  const [on, setOn] = useState(defaultOn || false);

  const handleToggle = () => {
    const newVal = !on;
    setOn(newVal);
    onChange?.(newVal);
  };

  return (
    <button
      onClick={handleToggle}
      className="relative w-10 h-5 rounded-full transition-colors shrink-0"
      style={{ background: on ? '#FB923C' : 'rgba(255,255,255,0.1)' }}
    >
      <div
        className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
        style={{ background: '#fff', left: on ? 'calc(100% - 18px)' : 2 }}
      />
    </button>
  );
}
