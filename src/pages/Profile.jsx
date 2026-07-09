import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Calendar, ShieldCheck, Database } from 'lucide-react';
import api from '../services/api';

const Profile = () => {
  const { user, getProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(user);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      await getProfile();
      setLoading(false);
    };
    loadProfile();
  }, []);

  // Update local state if context changes
  useEffect(() => {
    setProfileData(user);
  }, [user]);

  if (loading && !profileData) {
    return (
      <div className="flex-grow flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-brand-500 animate-spin"></div>
          <p className="text-sm font-semibold text-slate-500">Loading Profile Details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow p-6 space-y-8 max-w-3xl mx-auto w-full">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">My Profile</h1>
        <p className="text-sm text-slate-500 mt-1">Review your administrative metadata and security configurations.</p>
      </div>

      {/* Profile Details Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Decorative Top Banner */}
        <div className="bg-gradient-to-r from-brand-800 to-slate-900 h-32 relative">
          <div className="absolute -bottom-10 left-8">
            <div className="w-20 h-20 rounded-2xl bg-white p-1 border border-slate-200 shadow-lg">
              <div className="w-full h-full rounded-xl bg-brand-500/10 text-brand-650 flex items-center justify-center font-black text-2xl border border-brand-500/20">
                {profileData?.fullName?.charAt(0) || 'A'}
              </div>
            </div>
          </div>
        </div>

        {/* Details Block */}
        <div className="pt-16 pb-8 px-8 space-y-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">{profileData?.fullName || 'Active User'}</h2>
            <p className="text-sm text-slate-500">System Administrator / Merchant</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 text-slate-700">
            {/* ID */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-slate-100 text-slate-500">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Merchant ID</span>
                <span className="text-sm font-bold text-slate-800">#{profileData?.id || 'N/A'}</span>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-slate-100 text-slate-500">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Email Address</span>
                <span className="text-sm font-bold text-slate-800">{profileData?.email || 'N/A'}</span>
              </div>
            </div>

            {/* Mobile */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-slate-100 text-slate-500">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Contact Number</span>
                <span className="text-sm font-bold text-slate-800">{profileData?.mobile || 'N/A'}</span>
              </div>
            </div>

            {/* Registration Date */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-slate-100 text-slate-500">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Merchant Since</span>
                <span className="text-sm font-bold text-slate-800">
                  {profileData?.createdAt 
                    ? new Date(profileData.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' }) 
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Status Check */}
      <div className="p-5 rounded-2xl bg-brand-50/40 border border-brand-100 flex items-start gap-4">
        <div className="p-2 bg-brand-500/10 text-brand-600 rounded-xl">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-800">Session Securely Protected</h4>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Your connection is authenticated using standard JSON Web Token (JWT) algorithms. Session parameters automatically expire in 24 hours. Keep your secret signing keys confidential.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
