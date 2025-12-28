import { useState } from 'react';
import { Users, UserPlus, Settings, Trash2, Mail, Loader2 } from 'lucide-react';
import { useTeamStore } from '../store';
import { teamsApi } from '../lib/api';

interface TeamMember {
  id: string;
  role: string;
  joined_at: string;
  is_active: number;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
}

export default function Team() {
  const { currentTeam, fetchTeams } = useTeamStore();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteData, setInviteData] = useState({ email: '', role: 'parent' });
  const [isInviting, setIsInviting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Get team members from currentTeam (would be populated by fetchTeam with members)
  const members: TeamMember[] = (currentTeam as typeof currentTeam & { members?: TeamMember[] })?.members || [];

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTeam) return;

    setError('');
    setSuccess('');
    setIsInviting(true);

    try {
      await teamsApi.addMember(currentTeam.id, inviteData.email, inviteData.role);
      setSuccess('Team member added successfully!');
      setInviteData({ email: '', role: 'parent' });
      setShowInviteModal(false);
      fetchTeams();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to invite team member');
    } finally {
      setIsInviting(false);
    }
  };

  if (!currentTeam) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Users size={48} className="text-gray-300 mb-4" />
        <p className="text-gray-500">Please select a team first</p>
      </div>
    );
  }

  const roleColors: Record<string, string> = {
    treasurer: 'bg-purple-100 text-purple-700',
    coach: 'bg-blue-100 text-blue-700',
    parent: 'bg-green-100 text-green-700',
    admin: 'bg-amber-100 text-amber-700',
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
          <p className="text-gray-500">Manage {currentTeam.name} members</p>
        </div>
        <button onClick={() => setShowInviteModal(true)} className="btn-primary">
          <UserPlus size={18} />
          <span className="ml-2">Invite Member</span>
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-6 p-4 bg-success-50 border border-success-200 rounded-lg text-success-700">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Team Settings Card */}
      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-700">
                {currentTeam.name.charAt(0)}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{currentTeam.name}</h2>
              <p className="text-gray-500">
                {currentTeam.sport} • {currentTeam.season}
                {currentTeam.ageGroup && ` • ${currentTeam.ageGroup}`}
              </p>
            </div>
          </div>
          <button className="btn-secondary">
            <Settings size={18} />
            <span className="ml-2 hidden sm:inline">Settings</span>
          </button>
        </div>
      </div>

      {/* Members List */}
      <div className="card">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Members ({members.length})</h3>
        </div>

        {members.length === 0 ? (
          <div className="p-8 text-center">
            <Users size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">No team members yet</p>
            <button onClick={() => setShowInviteModal(true)} className="btn-primary">
              Invite Your First Member
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 font-medium">
                      {member.first_name?.[0]}
                      {member.last_name?.[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {member.first_name} {member.last_name}
                    </p>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${
                      roleColors[member.role] || 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {member.role}
                  </span>
                  {member.role !== 'treasurer' && (
                    <button className="p-2 text-gray-400 hover:text-red-600" title="Remove member">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Invite Team Member</h3>

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label htmlFor="email" className="label">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    id="email"
                    type="email"
                    required
                    value={inviteData.email}
                    onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                    className="input pl-10"
                    placeholder="member@example.com"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  The user must already have a TeamBudget account
                </p>
              </div>

              <div>
                <label htmlFor="role" className="label">
                  Role
                </label>
                <select
                  id="role"
                  value={inviteData.role}
                  onChange={(e) => setInviteData({ ...inviteData, role: e.target.value })}
                  className="input"
                >
                  <option value="parent">Parent (View Only)</option>
                  <option value="coach">Coach (View Only)</option>
                  <option value="treasurer">Treasurer (Full Access)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 btn-secondary"
                  disabled={isInviting}
                >
                  Cancel
                </button>
                <button type="submit" disabled={isInviting} className="flex-1 btn-primary">
                  {isInviting ? (
                    <>
                      <Loader2 size={18} className="animate-spin mr-2" />
                      Inviting...
                    </>
                  ) : (
                    'Send Invite'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
