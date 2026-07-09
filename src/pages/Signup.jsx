import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-specific error as user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^[0-9+\-\s]{10,15}$/.test(formData.mobile)) {
      newErrors.mobile = 'Please enter a valid mobile number (10-15 digits)';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!validate()) return;

    setLoading(true);
    const result = await signup(
      formData.fullName,
      formData.email,
      formData.mobile,
      formData.password,
      formData.confirmPassword
    );
    setLoading(false);

    if (result.success) {
      // Redirect to login on success
      navigate('/login', { state: { signupSuccess: 'Account created successfully! Please sign in.' } });
    } else {
      setSubmitError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center py-12 px-6 relative overflow-hidden">
      {/* Visual background accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-brand-500/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-lg z-10 animate-fade-in">
        {/* Brand Header */}
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="p-2.5 bg-brand-600 rounded-xl">
            <span className="text-2xl">🧾</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">BillFlow</h1>
            <p className="text-xs text-slate-400">Enterprise Billing Suite</p>
          </div>
        </div>

        {/* Card Panel */}
        <div className="p-8 rounded-3xl bg-slate-800/40 border border-slate-700/60 shadow-2xl backdrop-blur-md">
          <h2 className="text-2xl font-extrabold text-white mb-2">Create Account</h2>
          <p className="text-sm text-slate-400 mb-6">Join BillFlow to generate bills and track analytics.</p>

          {submitError && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500"><User className="w-4.5 h-4.5" /></span>
                <input
                  id="inp-register-name"
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                  className={`w-full bg-slate-900/60 border ${errors.fullName ? 'border-red-500' : 'border-slate-700/60'} rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors`}
                />
              </div>
              {errors.fullName && <p className="mt-1 text-xs text-red-400 font-semibold">{errors.fullName}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500"><Mail className="w-4.5 h-4.5" /></span>
                <input
                  id="inp-register-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                  className={`w-full bg-slate-900/60 border ${errors.email ? 'border-red-500' : 'border-slate-700/60'} rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors`}
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-400 font-semibold">{errors.email}</p>}
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Mobile Number</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500"><Phone className="w-4.5 h-4.5" /></span>
                <input
                  id="inp-register-mobile"
                  type="text"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="+1 555-0199"
                  className={`w-full bg-slate-900/60 border ${errors.mobile ? 'border-red-500' : 'border-slate-700/60'} rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors`}
                />
              </div>
              {errors.mobile && <p className="mt-1 text-xs text-red-400 font-semibold">{errors.mobile}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500"><Lock className="w-4.5 h-4.5" /></span>
                <input
                  id="inp-register-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 8 characters"
                  className={`w-full bg-slate-900/60 border ${errors.password ? 'border-red-500' : 'border-slate-700/60'} rounded-xl py-3 pl-11 pr-11 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-400 font-semibold">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Confirm Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500"><Lock className="w-4.5 h-4.5" /></span>
                <input
                  id="inp-register-confirm"
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Retype password"
                  className={`w-full bg-slate-900/60 border ${errors.confirmPassword ? 'border-red-500' : 'border-slate-700/60'} rounded-xl py-3 pl-11 pr-11 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors`}
                />
              </div>
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-400 font-semibold">{errors.confirmPassword}</p>}
            </div>

            {/* Submit Button */}
            <button
              id="btn-register-submit"
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-500 active:bg-brand-700 disabled:opacity-50 text-white font-bold text-sm tracking-wide rounded-xl py-3.5 mt-4 transition-colors flex justify-center items-center gap-2 shadow-lg shadow-brand-600/10"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-white animate-spin"></div>
                  <span>Creating Account...</span>
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Redirect to login link */}
          <div className="mt-8 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link id="link-to-login" to="/login" className="text-brand-400 hover:text-brand-300 font-bold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
