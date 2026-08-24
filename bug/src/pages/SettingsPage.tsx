import { useState } from 'react';
import { Building2, Users, FolderKanban, Shield, Bell, Lock, FileText } from 'lucide-react';

const tabs = [
  { id: 'company', icon: Building2, label: 'Company Profile' },
  { id: 'members', icon: Users, label: 'Members' },
  { id: 'projects', icon: FolderKanban, label: 'Projects' },
  { id: 'roles', icon: Shield, label: 'Roles & Permissions' },
  { id: 'notifications', icon: Bell, label: 'Notifications' },
  { id: 'security', icon: Lock, label: 'Security' },
  { id: 'audit', icon: FileText, label: 'Audit Logs' },
];

const auditLogs = [
  { id: 'al1', user: 'Alex Serame', action: 'Created project', detail: 'Mobile Banking App', timestamp: '2025-08-20T14:30:00Z' },
  { id: 'al2', user: 'Sarah Thusego', action: 'Created bug', detail: 'BUG-1042', timestamp: '2025-08-20T10:42:00Z' },
  { id: 'al3', user: 'Alex Serame', action: 'Reassigned bug', detail: 'BUG-1041 → Boago Mosupi', timestamp: '2025-08-19T09:15:00Z' },
  { id: 'al4', user: 'Marcus Kelentse', action: 'Changed bug status', detail: 'BUG-1040 → Under Review', timestamp: '2025-08-20T08:30:00Z' },
  { id: 'al5', user: 'Alex Serame', action: 'Added team member', detail: 'Sethunya Thata', timestamp: '2025-08-15T11:00:00Z' },
];

export const SettingsPage = () => (<SettingsPageInner />);
function SettingsPageInner() {
  const [activeTab, setActiveTab] = useState('company');
  const [companyName, setCompanyName] = useState('Stargaze Inc');
  const [industry, setIndustry] = useState('Software & Technology');

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
              background: activeTab === t.id ? 'rgba(92,110,248,0.12)' : 'transparent',
              color: activeTab === t.id ? '#5c6ef8' : '#7c85a2',
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
        {activeTab === 'company' && (
          <div>
            <h2 className="text-base font-semibold mb-5" style={{ color: '#e8eaf0' }}>Company Profile</h2>
            <div className="space-y-4">
              <SettingField label="Company Name">
                <input value={companyName} onChange={e => setCompanyName(e.target.value)} className="w-full px-3 py-2 rounded-md text-sm outline-none" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#d9dff0' }} />
              </SettingField>
              <SettingField label="Industry">
                <input value={industry} onChange={e => setIndustry(e.target.value)} className="w-full px-3 py-2 rounded-md text-sm outline-none" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#d9dff0' }} />
              </SettingField>
              <SettingField label="Description">
                <textarea rows={3} placeholder="Describe your company..." className="w-full px-3 py-2 rounded-md text-sm outline-none resize-none" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#d9dff0' }} />
              </SettingField>
              <button className="px-4 py-2 rounded-md text-sm font-medium" style={{ background: '#5c6ef8', color: '#fff' }}>Save Changes</button>
            </div>
          </div>
        )}

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
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: '#5c6ef820', color: '#5c6ef8' }}>
                    {log.user[0]}
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-medium" style={{ color: '#d9dff0' }}>{log.user}</span>
                    <span className="text-xs" style={{ color: '#7c85a2' }}> {log.action} </span>
                    <span className="text-xs font-medium" style={{ color: '#5c6ef8' }}>{log.detail}</span>
                  </div>
                  <span className="text-xs shrink-0" style={{ color: '#484f6b' }}>
                    {new Date(log.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div>
            <h2 className="text-base font-semibold mb-5" style={{ color: '#e8eaf0' }}>Notification Preferences</h2>
            <div className="space-y-3">
              {[
                'Bug assigned to me',
                'Comment on my bugs',
                'Bug status changed',
                'Mentioned in comment',
                'Bug take request approved',
                'Overdue bug reminders',
                'Weekly summary digest',
              ].map(pref => (
                <div key={pref} className="flex items-center justify-between py-2.5 px-3 rounded-lg" style={{ background: '#141826', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="text-sm" style={{ color: '#d9dff0' }}>{pref}</span>
                  <Toggle defaultOn />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div>
            <h2 className="text-base font-semibold mb-5" style={{ color: '#e8eaf0' }}>Security</h2>
            <div className="space-y-3">
              {[
                { label: 'Two-factor authentication', desc: 'Require 2FA for all team members', on: false },
                { label: 'SSO / SAML', desc: 'Configure single sign-on provider', on: false },
                { label: 'Session timeout', desc: 'Auto-logout after 24 hours of inactivity', on: true },
                { label: 'IP allowlist', desc: 'Restrict access to specified IP ranges', on: false },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between p-3 rounded-lg" style={{ background: '#141826', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div>
                    <div className="text-sm font-medium" style={{ color: '#d9dff0' }}>{s.label}</div>
                    <div className="text-xs mt-0.5" style={{ color: '#484f6b' }}>{s.desc}</div>
                  </div>
                  <Toggle defaultOn={s.on} />
                </div>
              ))}
            </div>
          </div>
        )}

        {!['company', 'audit', 'notifications', 'security'].includes(activeTab) && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-4xl mb-3">⚙️</div>
            <p className="text-sm" style={{ color: '#7c85a2' }}>Settings for <span className="capitalize">{tabs.find(t => t.id === activeTab)?.label}</span></p>
            <p className="text-xs mt-1" style={{ color: '#484f6b' }}>Configuration options will appear here</p>
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

function Toggle({ defaultOn }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn || false);
  return (
    <button
      onClick={() => setOn(!on)}
      className="relative w-10 h-5 rounded-full transition-colors shrink-0"
      style={{ background: on ? '#5c6ef8' : 'rgba(255,255,255,0.1)' }}
    >
      <div
        className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
        style={{ background: '#fff', left: on ? 'calc(100% - 18px)' : 2 }}
      />
    </button>
  );
}
