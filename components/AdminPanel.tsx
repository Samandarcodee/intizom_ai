
import React, { useEffect, useState } from 'react';
import { useUserStore } from '../store/userStore';
import { Users, Activity, Calendar, CheckCircle, ShieldCheck } from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  activeUsersToday: number;
  totalHabits: number;
  totalTasksCompleted: number;
  users: {
    id: string;
    telegramId: string;
    name: string;
    createdAt: string;
    habitsCount: number;
  }[];
}

export const AdminPanel: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { userProfile } = useUserStore();

  // Hardcoded Admin ID (Security by Obscurity for MVP, better to move to server env)
  // Telegram ID: 5928372261 (Neo)
  const ADMIN_ID = '5928372261'; 

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // We need to send the current user's Telegram ID to verify admin status on server
        // For now, we'll trust the client side check + server verification
        const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
        
        if (String(tgUser?.id) !== ADMIN_ID) {
           setError('Access Denied');
           setLoading(false);
           return;
        }

        const response = await fetch(`/api/admin/stats?telegramId=${tgUser.id}`);
        if (!response.ok) throw new Error('Failed to fetch stats');
        
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError('Error loading stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleMigrate = async () => {
    if (!window.confirm('Are you sure you want to run database migrations manually?')) return;
    try {
      const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
      const res = await fetch(`/api/admin/migrate?telegramId=${tgUser?.id}`);
      const data = await res.json();
      alert(JSON.stringify(data, null, 2));
    } catch (e) {
      alert('Migration failed: ' + e);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Loading Admin Data...</div>;
  
  // Even if error, show UI with Fix Button
  return (
    <div className="pb-24 animate-fade-in px-4 pt-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center">
          <ShieldCheck size={28} className="text-brand-accent mr-2" />
          Admin Dashboard
        </h1>
        <button 
          onClick={handleMigrate}
          className="bg-red-500/20 text-red-500 text-[10px] px-2 py-1 rounded border border-red-500/50 hover:bg-red-500/30 font-bold animate-pulse"
        >
          FIX DATABASE
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl mb-6 text-center">
          <p className="text-red-500 font-bold mb-2">{error}</p>
          <p className="text-xs text-gray-400 mb-3">Database tables are missing.</p>
          <button 
            onClick={handleMigrate}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm"
          >
            RUN MIGRATION NOW
          </button>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-brand-dark border border-brand-gray p-4 rounded-xl">
          <div className="flex items-center text-gray-400 mb-2">
            <Users size={16} className="mr-2" /> Total Users
          </div>
          <p className="text-2xl font-bold text-white">{stats?.totalUsers}</p>
        </div>
        <div className="bg-brand-dark border border-brand-gray p-4 rounded-xl">
          <div className="flex items-center text-green-400 mb-2">
            <Activity size={16} className="mr-2" /> Active Today
          </div>
          <p className="text-2xl font-bold text-white">{stats?.activeUsersToday}</p>
        </div>
        <div className="bg-brand-dark border border-brand-gray p-4 rounded-xl">
          <div className="flex items-center text-blue-400 mb-2">
            <CheckCircle size={16} className="mr-2" /> Total Habits
          </div>
          <p className="text-2xl font-bold text-white">{stats?.totalHabits}</p>
        </div>
        <div className="bg-brand-dark border border-brand-gray p-4 rounded-xl">
          <div className="flex items-center text-orange-400 mb-2">
            <Calendar size={16} className="mr-2" /> Tasks Done
          </div>
          <p className="text-2xl font-bold text-white">{stats?.totalTasksCompleted}</p>
        </div>
      </div>

      {/* Recent Users List */}
      <h2 className="text-lg font-bold text-white mb-4">Recent Users</h2>
      <div className="space-y-3">
        {stats?.users.map((user) => (
          <div key={user.id} className="bg-brand-dark border border-brand-gray p-3 rounded-lg flex justify-between items-center">
            <div>
              <p className="text-white font-medium">{user.name || 'No Name'}</p>
              <p className="text-xs text-gray-500">ID: {user.telegramId}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</p>
              <p className="text-xs text-brand-accent">{user.habitsCount} habits</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

