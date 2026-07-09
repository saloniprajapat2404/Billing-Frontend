import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    // Read redirected success messages (e.g. from signup page)
    if (location.state?.signupSuccess) {
      setSuccessMsg(location.state.signupSuccess);
      // Clear location state history
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSuccessMsg('');

    if (!validate()) return;

    setLoading(true);
    const result = await login(formData.email, formData.password);
    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setSubmitError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center py-12 px-6 relative overflow-hidden">
      {/* Visual background accents */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-brand-500/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md z-10 animate-fade-in">
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
          <h2 className="text-2xl font-extrabold text-white mb-2">Welcome Back</h2>
          <p className="text-sm text-slate-400 mb-6">Sign in to manage invoices and view revenue statistics.</p>

          {/* Success Alerts */}
          {successMsg && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Error Alerts */}
          {submitError && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Mail className="w-4.5 h-4.5" />
                </span>
                <input
                  id="inp-login-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                  className={`w-full bg-slate-900/60 border ${errors.email ? 'border-red-500' : 'border-slate-700/60'} rounded-xl py-3.5 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors`}
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-400 font-semibold">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Password</label>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Lock className="w-4.5 h-4.5" />
                </span>
                <input
                  id="inp-login-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full bg-slate-900/60 border ${errors.password ? 'border-red-500' : 'border-slate-700/60'} rounded-xl py-3.5 pl-11 pr-11 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors`}
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

            {/* Submit Button */}
            <button
              id="btn-login-submit"
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-500 active:bg-brand-700 disabled:opacity-50 text-white font-bold text-sm tracking-wide rounded-xl py-3.5 mt-4 transition-colors flex justify-center items-center gap-2 shadow-lg shadow-brand-600/10"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-white animate-spin"></div>
                  <span>Signing In...</span>
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Redirect to signup link */}
          <div className="mt-8 text-center text-sm text-slate-400">
            Don't have an account?{' '}
            <Link id="link-to-register" to="/signup" className="text-brand-400 hover:text-brand-300 font-bold hover:underline">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
