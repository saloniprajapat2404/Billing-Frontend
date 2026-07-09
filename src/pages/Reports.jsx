import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  User, 
  History, 
  Search,
  IndianRupee,
  Receipt,
  FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const REPORT_CACHE_KEY = 'billflow_reports_cache_v1';
const REPORT_CACHE_MAX_AGE_MS = 5 * 60 * 1000;

const readCachedReports = () => {
  try {
    const raw = sessionStorage.getItem(REPORT_CACHE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (!parsed?.timestamp || Date.now() - parsed.timestamp > REPORT_CACHE_MAX_AGE_MS) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

const Reports = () => {
  const [activeTab, setActiveTab] = useState('history'); // 'history', 'daily', 'monthly', 'customers'
  
  // Data states
  const cachedReports = readCachedReports();
  const [historyList, setHistoryList] = useState(cachedReports?.historyList || []);
  const [dailyList, setDailyList] = useState(cachedReports?.dailyList || []);
  const [monthlyList, setMonthlyList] = useState(cachedReports?.monthlyList || []);
  const [customerStatsList, setCustomerStatsList] = useState(cachedReports?.customerStatsList || []);
  
  const [loading, setLoading] = useState(!cachedReports);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const cached = readCachedReports();
    if (cached) {
      setHistoryList(cached.historyList || []);
      setDailyList(cached.dailyList || []);
      setMonthlyList(cached.monthlyList || []);
      setCustomerStatsList(cached.customerStatsList || []);
      setLoading(false);
    }

    fetchReportData(cached);
  }, []);

  const fetchReportData = async (cached = null) => {
    if (!cached) {
      setLoading(true);
    }
    setError('');
    try {
      const [historyRes, dailyRes, monthlyRes] = await Promise.all([
        api.get('/api/bills'),
        api.get('/api/reports/daily'),
        api.get('/api/reports/monthly')
      ]);

      const nextHistoryList = historyRes.data || [];
      const nextDailyList = dailyRes.data || [];
      const nextMonthlyList = monthlyRes.data || [];
      const nextCustomerStatsList = computeCustomerSummaries(nextHistoryList);

      setHistoryList(nextHistoryList);
      setDailyList(nextDailyList);
      setMonthlyList(nextMonthlyList);
      setCustomerStatsList(nextCustomerStatsList);

      sessionStorage.setItem(REPORT_CACHE_KEY, JSON.stringify({
        timestamp: Date.now(),
        historyList: nextHistoryList,
        dailyList: nextDailyList,
        monthlyList: nextMonthlyList,
        customerStatsList: nextCustomerStatsList,
      }));

    } catch (err) {
      console.error("Failed to load reports data", err);
      if (!cached) {
        setError("Failed to fetch reporting parameters. Please verify server connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  const computeCustomerSummaries = (bills) => {
    const clientsMap = {};
    bills.forEach(bill => {
      const mobile = bill.customerMobile;
      if (!clientsMap[mobile]) {
        clientsMap[mobile] = {
          customerName: bill.customerName,
          customerMobile: mobile,
          totalRevenue: 0,
          billCount: 0,
          lastBillingDate: bill.billDate
        };
      }
      clientsMap[mobile].totalRevenue += bill.grandTotal;
      clientsMap[mobile].billCount += 1;
      // compare dates
      if (new Date(bill.billDate) > new Date(clientsMap[mobile].lastBillingDate)) {
        clientsMap[mobile].lastBillingDate = bill.billDate;
      }
    });
    return Object.values(clientsMap);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(val || 0);
  };

  // Filter lists based on query
  const filteredHistory = historyList.filter(bill => 
    bill.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bill.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCustomers = customerStatsList.filter(client => 
    client.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.customerMobile.includes(searchQuery)
  );

  return (
    <div className="flex-grow p-6 space-y-8 max-w-7xl mx-auto w-full">
      {/* Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">Reports & Analytics</h1>
        <p className="text-sm text-slate-500 mt-1">Review revenue logs, historical records, and client totals.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm border border-red-200">
          {error}
        </div>
      )}

      {/* Tabs list */}
      <div className="flex flex-wrap border-b border-slate-200 gap-1.5">
        <button
          onClick={() => { setActiveTab('history'); setSearchQuery(''); }}
          className={`flex items-center gap-2 px-4.5 py-3 text-sm font-semibold tracking-wide border-b-2 transition-all ${
            activeTab === 'history' 
              ? 'border-brand-600 text-brand-600 bg-brand-50/10' 
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-350'
          }`}
        >
          <History className="w-4.5 h-4.5" /> Invoice History
        </button>

        <button
          onClick={() => { setActiveTab('daily'); setSearchQuery(''); }}
          className={`flex items-center gap-2 px-4.5 py-3 text-sm font-semibold tracking-wide border-b-2 transition-all ${
            activeTab === 'daily' 
              ? 'border-brand-600 text-brand-600 bg-brand-50/10' 
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-350'
          }`}
        >
          <Calendar className="w-4.5 h-4.5" /> Daily Reports
        </button>

        <button
          onClick={() => { setActiveTab('monthly'); setSearchQuery(''); }}
          className={`flex items-center gap-2 px-4.5 py-3 text-sm font-semibold tracking-wide border-b-2 transition-all ${
            activeTab === 'monthly' 
              ? 'border-brand-600 text-brand-600 bg-brand-50/10' 
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-350'
          }`}
        >
          <TrendingUp className="w-4.5 h-4.5" /> Monthly Reports
        </button>

        <button
          onClick={() => { setActiveTab('customers'); setSearchQuery(''); }}
          className={`flex items-center gap-2 px-4.5 py-3 text-sm font-semibold tracking-wide border-b-2 transition-all ${
            activeTab === 'customers' 
              ? 'border-brand-600 text-brand-600 bg-brand-50/10' 
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-350'
          }`}
        >
          <User className="w-4.5 h-4.5" /> Customer Summaries
        </button>
      </div>

      {/* Query Bar */}
      {(activeTab === 'history' || activeTab === 'customers') && (
        <div className="relative max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><Search className="w-4.5 h-4.5" /></span>
          <input
            id="inp-reports-query"
            type="text"
            placeholder={activeTab === 'history' ? "Search by customer or invoice..." : "Search by customer name or mobile..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-800 focus:outline-none focus:border-brand-500 transition-all shadow-sm"
          />
        </div>
      )}

      {/* Main Tables Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-slate-400 font-semibold">Loading Report Parameters...</div>
        ) : (
          <div>
            
            {/* Tab 1: Invoice History */}
            {activeTab === 'history' && (
              <div className="space-y-4">
                <h3 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-slate-400" /> Invoice Logs
                </h3>

                {filteredHistory.length === 0 ? (
                  <p className="py-12 text-center text-slate-400 text-sm">No historical invoices matches filter.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                          <th className="pb-3 pr-2">Invoice No</th>
                          <th className="pb-3 px-2">Customer</th>
                          <th className="pb-3 px-2">Contact</th>
                          <th className="pb-3 px-2">Date</th>
                          <th className="pb-3 px-2 text-right">Grand Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150">
                        {filteredHistory.map((bill) => (
                          <tr 
                            key={bill.id} 
                            className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                            onClick={() => navigate(`/billing?viewId=${bill.id}`)}
                          >
                            <td className="py-3.5 pr-2 font-bold text-sm text-brand-600">{bill.invoiceNumber}</td>
                            <td className="py-3.5 px-2 text-sm text-slate-800 font-bold">{bill.customerName}</td>
                            <td className="py-3.5 px-2 text-xs text-slate-500">{bill.customerMobile}</td>
                            <td className="py-3.5 px-2 text-xs text-slate-500">
                              {new Date(bill.billDate).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                            </td>
                            <td className="py-3.5 px-2 text-sm font-extrabold text-slate-900 text-right">{formatCurrency(bill.grandTotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Daily Reports */}
            {activeTab === 'daily' && (
              <div className="space-y-4">
                <h3 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-slate-400" /> Daily Revenue Aggregates
                </h3>

                {dailyList.length === 0 ? (
                  <p className="py-12 text-center text-slate-400 text-sm">No daily metrics recorded.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                          <th className="pb-3 pr-2">Billing Date</th>
                          <th className="pb-3 px-2 text-center">Invoices Generated</th>
                          <th className="pb-3 px-2 text-right">Daily Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150">
                        {dailyList.map((day, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3.5 pr-2 font-bold text-sm text-slate-800">
                              {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}
                            </td>
                            <td className="py-3.5 px-2 text-center text-sm font-semibold text-slate-600">{day.billCount}</td>
                            <td className="py-3.5 px-2 text-sm font-extrabold text-emerald-600 text-right">{formatCurrency(day.totalRevenue)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Monthly Reports */}
            {activeTab === 'monthly' && (
              <div className="space-y-4">
                <h3 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-slate-400" /> Monthly Revenue Aggregates
                </h3>

                {monthlyList.length === 0 ? (
                  <p className="py-12 text-center text-slate-400 text-sm">No monthly metrics recorded.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                          <th className="pb-3 pr-2">Billing Month</th>
                          <th className="pb-3 px-2 text-center">Invoices Generated</th>
                          <th className="pb-3 px-2 text-right">Monthly Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150">
                        {monthlyList.map((month, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3.5 pr-2 font-bold text-sm text-slate-800">
                              {month.month}
                            </td>
                            <td className="py-3.5 px-2 text-center text-sm font-semibold text-slate-600">{month.billCount}</td>
                            <td className="py-3.5 px-2 text-sm font-extrabold text-emerald-600 text-right">{formatCurrency(month.totalRevenue)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: Customer Summary */}
            {activeTab === 'customers' && (
              <div className="space-y-4">
                <h3 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
                  <User className="w-5 h-5 text-slate-400" /> Customer Analytics
                </h3>

                {filteredCustomers.length === 0 ? (
                  <p className="py-12 text-center text-slate-400 text-sm">No customer stats logged.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                          <th className="pb-3 pr-2">Customer Profile</th>
                          <th className="pb-3 px-2">Contact Details</th>
                          <th className="pb-3 px-2 text-center">Visit Count</th>
                          <th className="pb-3 px-2 text-right">LTD Revenue</th>
                          <th className="pb-3 px-2 text-right">Last Visit Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150">
                        {filteredCustomers.map((client, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3.5 pr-2 font-bold text-sm text-slate-800">{client.customerName}</td>
                            <td className="py-3.5 px-2 text-sm text-slate-550">{client.customerMobile}</td>
                            <td className="py-3.5 px-2 text-center text-sm font-semibold text-slate-600">{client.billCount}</td>
                            <td className="py-3.5 px-2 text-sm font-extrabold text-brand-600 text-right">{formatCurrency(client.totalRevenue)}</td>
                            <td className="py-3.5 px-2 text-xs text-slate-500 text-right font-medium">
                              {new Date(client.lastBillingDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
// Using semantic HTML tables structures with unique IDs and custom typography styling.
