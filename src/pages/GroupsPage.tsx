import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';
import { Topbar } from '../components/common/Topbar';
import { Group } from '../types';
import { api } from '../services/api';
import { Users, Plus, ChevronRight, X, Sparkles, FolderPlus } from 'lucide-react';

export const GroupsPage: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // New Group form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Travel');
  const [currency, setCurrency] = useState('INR');
  const [description, setDescription] = useState('');
  const [member1Name, setMember1Name] = useState('');
  const [member1Email, setMember1Email] = useState('');
  const [member2Name, setMember2Name] = useState('');
  const [member2Email, setMember2Email] = useState('');

  const fetchGroups = async () => {
    try {
      const res = await api.getGroups();
      setGroups(res.groups || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const initialMembers = [];
    if (member1Name && member1Email) initialMembers.push({ name: member1Name, email: member1Email });
    if (member2Name && member2Email) initialMembers.push({ name: member2Name, email: member2Email });

    try {
      await api.createGroup({
        name: name.trim(),
        category,
        currency,
        description,
        initialMembers,
      });
      setIsCreateOpen(false);
      setName('');
      setDescription('');
      fetchGroups();
    } catch (err: any) {
      alert(err.message || 'Failed to create group');
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F9FF] dark:bg-[#080808] text-[#10274A] dark:text-[#F5F5F5] flex transition-colors">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        <Topbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="p-4 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#10274A] dark:text-[#F5F5F5] tracking-tight">
                My Groups
              </h1>
              <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#A1A1AA] mt-0.5">
                Manage your shared trip, roommate, and expense groups
              </p>
            </div>

            <button
              onClick={() => setIsCreateOpen(true)}
              className="clay-btn-primary px-5 py-2.5 text-xs sm:text-sm font-bold flex items-center space-x-1.5 shadow-clay-btn"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Group</span>
            </button>
          </div>

          {/* Groups Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map(group => (
              <div
                key={group.id}
                onClick={() => navigate(`/groups/${group.id}`)}
                className="clay-card-hover p-6 bg-white dark:bg-[#101010] dark:border-[#303030] dark:hover:bg-[#141414] cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl p-2 rounded-2xl bg-[#F1F9FF] dark:bg-[#141414] border border-[#D8E9FA] dark:border-[#303030]">
                      {group.category === 'Travel' && '✈️'}
                      {group.category === 'Entertainment' && '🎟️'}
                      {group.category === 'Utilities' && '🏠'}
                      {group.category === 'Food' && '🍽️'}
                      {!['Travel', 'Entertainment', 'Utilities', 'Food'].includes(group.category) && '👥'}
                    </span>
                    <span className="text-[10px] font-bold text-[#1685F8] dark:text-[#2589FF] px-2.5 py-1 rounded-full bg-[#E9F5FE] dark:bg-[#2589FF]/15 border border-[#BFE9FF] dark:border-[#2589FF]/30">
                      {group.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#10274A] dark:text-[#F5F5F5] mb-1">{group.name}</h3>
                  <p className="text-xs text-[#64748B] dark:text-[#A1A1AA] line-clamp-2 mb-4">
                    {group.description || 'Shared expense circle for group adventures and settlements.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#D8E9FA]/60 dark:border-[#303030] flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-[#64748B] dark:text-[#737373]">Total Spent</div>
                    <div className="text-base font-extrabold text-[#1685F8] dark:text-[#2589FF]">
                      {group.currency} {(group.totalSpent || 0).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="flex -space-x-1.5">
                      {group.members.slice(0, 3).map((m, idx) => (
                        <div
                          key={idx}
                          className="w-6 h-6 rounded-full bg-[#1685F8] dark:bg-[#2589FF] text-white text-[10px] font-bold border border-white dark:border-[#101010] flex items-center justify-center uppercase"
                        >
                          {m.name.charAt(0)}
                        </div>
                      ))}
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#64748B] dark:text-[#737373]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Create Group Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#101010] rounded-3xl p-6 sm:p-8 shadow-clay-float dark:shadow-none border border-[#D8E9FA] dark:border-[#303030]">
            <div className="flex justify-between items-center pb-4 border-b border-[#D8E9FA]/60 dark:border-[#303030]">
              <div className="flex items-center space-x-2">
                <FolderPlus className="w-6 h-6 text-[#1685F8] dark:text-[#2589FF]" />
                <h3 className="text-lg font-bold text-[#10274A] dark:text-[#F5F5F5]">Create New Group</h3>
              </div>
              <button onClick={() => setIsCreateOpen(false)} className="text-[#64748B] dark:text-[#A1A1AA] hover:text-[#10274A] dark:hover:text-[#F5F5F5]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#10274A] dark:text-[#F5F5F5] mb-1">Group Name</label>
                <input
                  type="text"
                  placeholder="e.g. Manali Adventure 2026"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="clay-input w-full px-3.5 py-2.5 text-xs sm:text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#10274A] dark:text-[#F5F5F5] mb-1">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="clay-input w-full px-3.5 py-2.5 text-xs font-medium dark:bg-[#0D0D0D] dark:text-[#F5F5F5] dark:border-[#303030]"
                  >
                    <option value="Travel">✈️ Travel</option>
                    <option value="Entertainment">🎟️ Entertainment</option>
                    <option value="Utilities">🏠 Roommates / Rent</option>
                    <option value="Food">🍽️ Food & Dining</option>
                    <option value="General">👥 General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#10274A] dark:text-[#F5F5F5] mb-1">Currency</label>
                  <select
                    value={currency}
                    onChange={e => setCurrency(e.target.value)}
                    className="clay-input w-full px-3.5 py-2.5 text-xs font-medium dark:bg-[#0D0D0D] dark:text-[#F5F5F5] dark:border-[#303030]"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#10274A] dark:text-[#F5F5F5] mb-1">Description (Optional)</label>
                <input
                  type="text"
                  placeholder="Trip notes or house rules"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="clay-input w-full px-3.5 py-2.5 text-xs font-medium"
                />
              </div>

              <div className="pt-2">
                <span className="block text-xs font-bold text-[#10274A] dark:text-[#F5F5F5] mb-2">Invite Initial Friends (Optional)</span>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Friend 1 Name"
                      value={member1Name}
                      onChange={e => setMember1Name(e.target.value)}
                      className="clay-input px-3 py-2 text-xs font-medium"
                    />
                    <input
                      type="email"
                      placeholder="friend1@example.com"
                      value={member1Email}
                      onChange={e => setMember1Email(e.target.value)}
                      className="clay-input px-3 py-2 text-xs font-medium"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Friend 2 Name"
                      value={member2Name}
                      onChange={e => setMember2Name(e.target.value)}
                      className="clay-input px-3 py-2 text-xs font-medium"
                    />
                    <input
                      type="email"
                      placeholder="friend2@example.com"
                      value={member2Email}
                      onChange={e => setMember2Email(e.target.value)}
                      className="clay-input px-3 py-2 text-xs font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="clay-btn-secondary px-4 py-2 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="clay-btn-primary px-6 py-2 text-xs font-bold"
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
