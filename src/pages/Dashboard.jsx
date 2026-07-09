import React from 'react';
import { 
  Receipt, 
  IndianRupee, 
  Users, 
  ArrowRight,
  TrendingUp,
  Clock,
  ChevronRight,
  Plus
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { dashboardStats: stats } = useAuth();
  const navigate = useNavigate();

  if (!stats) {
    return (
      <div className="flex-grow flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-brand-500 animate-spin"></div>
          <p className="text-sm font-semibold text-slate-500">Loading Dashboard Metrics...</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(val || 0);
  };

  return (
    <div className="flex-grow p-6 space-y-8 max-w-7xl mx-auto w-full">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Here is a snapshot of your invoice performance.</p>
        </div>
        <Link
          id="btn-quick-bill"
          to="/billing"
          className="inline-flex items-center gap-2 px-5 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm tracking-wide rounded-xl shadow-lg shadow-brand-500/10 hover-lift transition-all"
        >
          <Plus className="w-4.5 h-4.5" />
          Create New Bill
        </Link>
      </div>

      {/* Cards Aggregates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card: Total Revenue */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm shadow-slate-100 hover-lift flex justify-between items-start group">
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Revenue</p>
            <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              {formatCurrency(stats?.totalRevenue)}
            </h3>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100">
              <TrendingUp className="w-3.5 h-3.5" /> +8.2% this month
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform duration-300">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>

        {/* Card: Total Bills */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm shadow-slate-100 hover-lift flex justify-between items-start group">
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Invoices</p>
            <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              {stats?.totalBills || 0}
            </h3>
            <span className="text-xs text-slate-500 font-medium">Logged in repository</span>
          </div>
          <div className="p-3.5 rounded-xl bg-brand-50/50 text-brand-600 group-hover:scale-105 transition-transform duration-300">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

        {/* Card: Total Customers */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm shadow-slate-100 hover-lift flex justify-between items-start group">
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Customers</p>
            <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              {stats?.totalCustomers || 0}
            </h3>
            <span className="text-xs text-slate-500 font-medium">Unique contact numbers</span>
          </div>
          <div className="p-3.5 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-105 transition-transform duration-300">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Recents list & shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Bills list */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-400" />
                Recent Invoices
              </h3>
              <Link
                id="link-view-all-bills"
                to="/reports"
                className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 hover:underline"
              >
                View all reports <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* List */}
            {!stats?.recentBills || stats.recentBills.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-slate-400 text-sm">No bills saved yet.</p>
                <Link to="/billing" className="text-sm font-bold text-brand-500 hover:underline mt-2 inline-block">
                  Create your first bill
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                      <th className="pb-3 pr-4 font-semibold">Invoice No</th>
                      <th className="pb-3 px-4 font-semibold">Customer</th>
                      <th className="pb-3 px-4 font-semibold">Date</th>
                      <th className="pb-3 pl-4 font-semibold text-right">Amount</th>
                      <th className="pb-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {stats.recentBills.map((bill) => (
                      <tr 
                        key={bill.id} 
                        className="group hover:bg-slate-50/50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/billing?viewId=${bill.id}`)}
                      >
                        <td className="py-4 pr-4 font-semibold text-sm text-brand-600">{bill.invoiceNumber}</td>
                        <td className="py-4 px-4 text-sm text-slate-800 font-bold">{bill.customerName}</td>
                        <td className="py-4 px-4 text-sm text-slate-500">
                          {new Date(bill.billDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                        </td>
                        <td className="py-4 pl-4 text-sm text-slate-900 font-extrabold text-right">{formatCurrency(bill.grandTotal)}</td>
                        <td className="py-4 w-10 text-right">
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Shortcuts / Quick Actions Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-brand-900 to-brand-950 text-white shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-extrabold text-lg">Quick Insights</h3>
            <p className="text-sm text-brand-200 leading-relaxed">
              Your billing metrics are updated instantly. Track daily operations, search past invoices, print PDFs, and download client statistics directly from the Reports tab.
            </p>
          </div>

          <div className="space-y-3 pt-6 border-t border-brand-800 mt-6">
            <Link
              id="lnk-shortcut-billing"
              to="/billing"
              className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Receipt className="w-5 h-5 text-brand-300" />
                <span className="text-sm font-semibold">Open Billing Screen</span>
              </div>
              <ChevronRight className="w-4 h-4 text-brand-300 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              id="lnk-shortcut-reports"
              to="/reports"
              className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-brand-300" />
                <span className="text-sm font-semibold">View Revenue Reports</span>
              </div>
              <ChevronRight className="w-4 h-4 text-brand-300 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
