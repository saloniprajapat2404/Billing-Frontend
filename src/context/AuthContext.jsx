import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

const DASHBOARD_CACHE_KEY = 'billflow_dashboard_cache_v1';
const REPORT_CACHE_KEY = 'billflow_reports_cache_v1';
const CACHE_MAX_AGE_MS = 5 * 60 * 1000;

const readCache = (key) => {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (!parsed?.timestamp || Date.now() - parsed.timestamp > CACHE_MAX_AGE_MS) {
      return null;
    }

    return parsed.data || null;
  } catch {
    return null;
  }
};

const writeCache = (key, data) => {
  sessionStorage.setItem(key, JSON.stringify({ timestamp: Date.now(), data }));
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState(() => readCache(DASHBOARD_CACHE_KEY));
  const [reportsData, setReportsData] = useState(() => readCache(REPORT_CACHE_KEY));

  useEffect(() => {
    // Load persisted session
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!token) {
      return;
    }

    const loadDashboard = async () => {
      try {
        const response = await api.get('/api/reports');
        setDashboardStats(response.data);
        writeCache(DASHBOARD_CACHE_KEY, response.data);
      } catch (error) {
        console.error('Failed to preload dashboard metrics', error);
      }
    };

    const loadReports = async () => {
      try {
        const [historyRes, dailyRes, monthlyRes] = await Promise.all([
          api.get('/api/bills'),
          api.get('/api/reports/daily'),
          api.get('/api/reports/monthly'),
        ]);

        const bills = historyRes.data || [];
        const customerStats = bills.reduce((acc, bill) => {
          const mobile = bill.customerMobile;
          if (!acc[mobile]) {
            acc[mobile] = {
              customerName: bill.customerName,
              customerMobile: mobile,
              totalRevenue: 0,
              billCount: 0,
              lastBillingDate: bill.billDate,
            };
          }

          acc[mobile].totalRevenue += bill.grandTotal;
          acc[mobile].billCount += 1;
          if (new Date(bill.billDate) > new Date(acc[mobile].lastBillingDate)) {
            acc[mobile].lastBillingDate = bill.billDate;
          }

          return acc;
        }, {});

        const nextReports = {
          historyList: bills,
          dailyList: dailyRes.data || [],
          monthlyList: monthlyRes.data || [],
          customerStatsList: Object.values(customerStats),
        };

        setReportsData(nextReports);
        writeCache(REPORT_CACHE_KEY, nextReports);
      } catch (error) {
        console.error('Failed to preload reports data', error);
      }
    };

    loadDashboard();
    loadReports();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { token, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setToken(token);
      setUser(userData);

      void Promise.allSettled([
        api.get('/api/reports').then((response) => {
          setDashboardStats(response.data);
          writeCache(DASHBOARD_CACHE_KEY, response.data);
        }),
        Promise.all([
          api.get('/api/bills'),
          api.get('/api/reports/daily'),
          api.get('/api/reports/monthly'),
        ]).then(([historyRes, dailyRes, monthlyRes]) => {
          const bills = historyRes.data || [];
          const customerStats = bills.reduce((acc, bill) => {
            const mobile = bill.customerMobile;
            if (!acc[mobile]) {
              acc[mobile] = {
                customerName: bill.customerName,
                customerMobile: mobile,
                totalRevenue: 0,
                billCount: 0,
                lastBillingDate: bill.billDate,
              };
            }

            acc[mobile].totalRevenue += bill.grandTotal;
            acc[mobile].billCount += 1;
            if (new Date(bill.billDate) > new Date(acc[mobile].lastBillingDate)) {
              acc[mobile].lastBillingDate = bill.billDate;
            }

            return acc;
          }, {});

          const nextReports = {
            historyList: bills,
            dailyList: dailyRes.data || [],
            monthlyList: monthlyRes.data || [],
            customerStatsList: Object.values(customerStats),
          };

          setReportsData(nextReports);
          writeCache(REPORT_CACHE_KEY, nextReports);
        }),
      ]);
      return { success: true };
    } catch (error) {
      console.error("Login failed:", error);
      const message = error.response?.data?.message || 'Invalid email or password';
      return { success: false, error: message };
    }
  };

  const signup = async (fullName, email, mobile, password, confirmPassword) => {
    try {
      await api.post('/api/auth/register', {
        fullName,
        email,
        mobile,
        password,
        confirmPassword,
      });
      return { success: true };
    } catch (error) {
      console.error("Signup failed:", error);
      let errorMsg = 'Registration failed. Please check details.';
      if (error.response?.data?.validationErrors) {
        // Collect validation messages
        errorMsg = Object.values(error.response.data.validationErrors).join(', ');
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      return { success: false, error: errorMsg };
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (e) {
      console.warn("Logout request failed on server, cleaning up local session anyway.");
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
      setDashboardStats(null);
      setReportsData(null);
      sessionStorage.removeItem(DASHBOARD_CACHE_KEY);
      sessionStorage.removeItem(REPORT_CACHE_KEY);
    }
  };

  const getProfile = async () => {
    try {
      const response = await api.get('/api/users/profile');
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
    } catch (error) {
      console.error("Failed to load profile", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, dashboardStats, reportsData, login, signup, logout, getProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
