import { useState } from 'react';
import { Bell, Palette, Shield, Globe, ToggleLeft, ToggleRight, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const Toggle = ({ enabled, onChange }) => (
  <button onClick={() => onChange(!enabled)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-indigo-600' : 'bg-gray-200'}`}>
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
);

export default function Settings() {
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    leadUpdates: true,
    teamActivity: false,
    weeklyReport: true,
    browserNotifications: false,
  });

  const [preferences, setPreferences] = useState({
    compactView: false,
    showCurrency: true,
    dateFormat: 'DD/MM/YYYY',
    timezone: 'Asia/Kolkata',
    language: 'English',
  });

  const setNotif = (k, v) => setNotifications((p) => ({ ...p, [k]: v }));
  const setPref = (k, v) => setPreferences((p) => ({ ...p, [k]: v }));

  const handleSave = () => {
    toast.success('Settings saved successfully!');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Settings</h2>
        <p className="text-sm text-gray-500">Manage your app preferences and notifications</p>
      </div>

      {/* Notifications */}
      <div className="card p-6 space-y-4">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
          <Bell size={14} /> Notification Preferences
        </h3>
        <div className="space-y-4">
          {[
            { key: 'emailAlerts', label: 'Email Alerts', desc: 'Receive important alerts via email' },
            { key: 'leadUpdates', label: 'Lead Updates', desc: 'Get notified when a lead status changes' },
            { key: 'teamActivity', label: 'Team Activity', desc: 'Updates about your team members' },
            { key: 'weeklyReport', label: 'Weekly Report', desc: 'Summary of your performance every Monday' },
            { key: 'browserNotifications', label: 'Browser Notifications', desc: 'Desktop push notifications' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800">{label}</p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
              <Toggle enabled={notifications[key]} onChange={(v) => setNotif(key, v)} />
            </div>
          ))}
        </div>
      </div>

      {/* Display Preferences */}
      <div className="card p-6 space-y-4">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
          <Palette size={14} /> Display Preferences
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-800">Compact View</p>
              <p className="text-xs text-gray-400">Show more data in less space</p>
            </div>
            <Toggle enabled={preferences.compactView} onChange={(v) => setPref('compactView', v)} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-800">Show Currency Symbol</p>
              <p className="text-xs text-gray-400">Display ₹ symbol next to values</p>
            </div>
            <Toggle enabled={preferences.showCurrency} onChange={(v) => setPref('showCurrency', v)} />
          </div>
          <div>
            <label className="label">Date Format</label>
            <select className="select" value={preferences.dateFormat} onChange={(e) => setPref('dateFormat', e.target.value)}>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
          <div>
            <label className="label">Timezone</label>
            <select className="select" value={preferences.timezone} onChange={(e) => setPref('timezone', e.target.value)}>
              <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">America/New York (EST)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="card p-6 space-y-3">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
          <Shield size={14} /> Security
        </h3>
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <div>
            <p className="text-sm font-medium text-gray-800">Two-Factor Authentication</p>
            <p className="text-xs text-gray-400">Add an extra layer of security</p>
          </div>
          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded font-medium">Coming Soon</span>
        </div>
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-gray-800">Active Sessions</p>
            <p className="text-xs text-gray-400">1 active session on this device</p>
          </div>
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium">● Active</span>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} className="btn-primary">
          <Save size={14} /> Save Settings
        </button>
      </div>
    </div>
  );
}
