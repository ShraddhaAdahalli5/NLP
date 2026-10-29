import React, { useState } from 'react';
import {
  User,
  Mail,
  School,
  Briefcase,
  Edit3,
  Check,
  Sparkles,
  Shield,
  Clock,
  Layers,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';

interface ProfileViewProps {
  totalAnalysesCount: number;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ totalAnalysesCount }) => {
  const { user, userProfile, updateUserBio, signOut } = useAuth();
  const { showToast } = useToast();

  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [collegeName, setCollegeName] = useState(userProfile?.collegeName || 'AI & Data Science Engineering Dept');
  const [projectRole, setProjectRole] = useState(userProfile?.projectRole || 'Lead NLP Researcher');
  const [bio, setBio] = useState(
    userProfile?.bio || 'Conducting sentiment classification on Romanized Indic code-switched texts.'
  );
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUserBio({
        displayName,
        collegeName,
        projectRole,
        bio,
      });
      setIsEditing(false);
      showToast('Profile Updated', 'Your researcher profile details have been saved.');
    } catch (err) {
      showToast('Update Failed', 'Could not save profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Profile Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center text-2xl font-bold shadow-md shadow-indigo-500/20">
              {displayName ? displayName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {displayName || 'Researcher'}
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  {user?.isAnonymous ? 'Guest Demo' : 'Verified Researcher'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {user?.email || 'guest.researcher@academic.demo'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Profile Details Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-6">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            ) : (
              <div className="flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-200 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <User className="w-4 h-4 text-slate-400" />
                <span>{displayName || 'Not specified'}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              College / University Department
            </label>
            {isEditing ? (
              <input
                type="text"
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            ) : (
              <div className="flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-200 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <School className="w-4 h-4 text-slate-400" />
                <span>{collegeName}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Project Role & Designation
            </label>
            {isEditing ? (
              <input
                type="text"
                value={projectRole}
                onChange={(e) => setProjectRole(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            ) : (
              <div className="flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-200 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <Briefcase className="w-4 h-4 text-slate-400" />
                <span>{projectRole}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Saved Analyses Count
            </label>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-200 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40">
              <Layers className="w-4 h-4 text-slate-400" />
              <span>{totalAnalysesCount} Recorded Sentences</span>
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Research Project Bio / Summary
            </label>
            {isEditing ? (
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            ) : (
              <p className="text-sm text-slate-700 dark:text-slate-300 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 leading-relaxed">
                {bio}
              </p>
            )}
          </div>
        </div>

        {/* Sign Out */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={() => signOut()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </div>
    </div>
  );
};
