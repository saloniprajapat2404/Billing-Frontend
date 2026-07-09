import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { 
  Plus, 
  Trash2, 
  RefreshCw, 
  Save, 
  Printer, 
  Download, 
  Search, 
  Calendar, 
  User, 
  Phone, 
  FileText,
  AlertCircle,
  CheckCircle,
  Eye,
  Edit2
} from 'lucide-react';

const Billing = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const viewId = searchParams.get('viewId');

  // Main Billing Form State
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [items, setItems] = useState([
    { itemName: '', quantity: 1, price: '', total: 0 }
  ]);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [billDate, setBillDate] = useState('');

  // Editing state
  const [editingBillId, setEditingBillId] = useState(null);

  // Lists and searching states
  const [previousBills, setPreviousBills] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('name'); // 'name' or 'invoice'
  const [listLoading, setListLoading] = useState(false);

  // Status Alerts
  const [alert, setAlert] = useState(null); // { type: 'success'|'error', msg: '' }

  // Modal / Preview state
  const [activePreviewBill, setActivePreviewBill] = useState(null);

  // Load Previous Bills on start
  useEffect(() => {
    fetchBills();
  }, []);

  // Load specific bill if viewId parameter present
  useEffect(() => {
    if (viewId) {
      loadBillForPreview(viewId);
    }
  }, [viewId]);

  const fetchBills = async (queryVal = '') => {
    setListLoading(true);
    try {
      const response = await api.get('/api/bills', {
        params: {
          query: queryVal,
          type: searchType
        }
      });
      setPreviousBills(response.data);
    } catch (err) {
      console.error("Error loading bills list", err);
      showAlert('error', 'Failed to retrieve billing history.');
    } finally {
      setListLoading(false);
    }
  };

  const showAlert = (type, msg) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 5000);
  };

  // Items Operations
  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    
    if (field === 'quantity' || field === 'price') {
      const q = parseInt(updated[index].quantity) || 0;
      const p = parseFloat(updated[index].price) || 0;
      updated[index].total = parseFloat((q * p).toFixed(2));
    }
    
    setItems(updated);
  };

  const addItemRow = () => {
    setItems([...items, { itemName: '', quantity: 1, price: '', total: 0 }]);
  };

  const removeItemRow = (index) => {
    if (items.length === 1) {
      showAlert('error', 'Bill must contain at least one item.');
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateGrandTotal = () => {
    return items.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0).toFixed(2);
  };

  const resetForm = () => {
    setCustomerName('');
    setCustomerMobile('');
    setItems([{ itemName: '', quantity: 1, price: '', total: 0 }]);
    setInvoiceNumber('');
    setBillDate('');
    setEditingBillId(null);
    setSearchParams({});
  };

  const saveBill = async () => {
    if (!customerName.trim()) {
      showAlert('error', 'Customer name is required.');
      return;
    }
    if (!customerMobile.trim() || !/^\+?[0-9\-\s]{10,15}$/.test(customerMobile)) {
      showAlert('error', 'Please enter a valid customer mobile number.');
      return;
    }

    // Validate Items
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.itemName.trim()) {
        showAlert('error', `Item name at row ${i + 1} is empty.`);
        return;
      }
      if (parseFloat(item.price) <= 0 || isNaN(parseFloat(item.price))) {
        showAlert('error', `Price at row ${i + 1} must be positive.`);
        return;
      }
    }

    const payload = {
      customerName,
      customerMobile,
      invoiceNumber,
      billDate: billDate ? new Date(billDate).toISOString() : null,
      items: items.map(itm => ({
        itemName: itm.itemName,
        quantity: parseInt(itm.quantity),
        price: parseFloat(itm.price)
      }))
    };

    try {
      if (editingBillId) {
        // Update bill
        const response = await api.put(`/api/bills/${editingBillId}`, payload);
        showAlert('success', 'Bill updated successfully!');
        resetForm();
        fetchBills();
        loadBillForPreview(response.data.id);
      } else {
        // Save new bill
        const response = await api.post('/api/bills', payload);
        showAlert('success', 'Invoice generated and saved successfully!');
        resetForm();
        fetchBills();
        loadBillForPreview(response.data.id);
      }
    } catch (err) {
      console.error("Save bill failed", err);
      const errMsg = err.response?.data?.message || 'Failed to save billing details.';
      showAlert('error', errMsg);
    }
  };

  const loadBillForPreview = async (id) => {
    try {
      const response = await api.get(`/api/bills/${id}`);
      setActivePreviewBill(response.data);
    } catch (err) {
      console.error("Error loading bill details", err);
      showAlert('error', 'Failed to load details for invoice preview.');
    }
  };

  const editBill = (bill) => {
    setEditingBillId(bill.id);
    setCustomerName(bill.customerName);
    setCustomerMobile(bill.customerMobile);
    setInvoiceNumber(bill.invoiceNumber);
    // Format date for datetime-local input
    if (bill.billDate) {
      const date = new Date(bill.billDate);
      const formatted = date.toISOString().slice(0, 16);
      setBillDate(formatted);
    }
    setItems(bill.items.map(itm => ({
      itemName: itm.itemName,
      quantity: itm.quantity,
      price: itm.price,
      total: itm.total
    })));
    setActivePreviewBill(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteBill = async (id) => {
    if (!window.confirm("Are you sure you want to delete this invoice?")) return;
    try {
      await api.delete(`/api/bills/${id}`);
      showAlert('success', 'Invoice deleted successfully.');
      if (activePreviewBill?.id === id) setActivePreviewBill(null);
      if (editingBillId === id) resetForm();
      fetchBills();
    } catch (err) {
      console.error("Delete bill failed", err);
      showAlert('error', 'Failed to delete billing entry.');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBills(searchQuery);
  };

  const printInvoice = () => {
    window.print();
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(val || 0);
  };

  return (
    <div className="flex-grow p-6 space-y-8 max-w-7xl mx-auto w-full">
      {/* Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">Billing Management</h1>
        <p className="text-sm text-slate-500 mt-1">Generate invoices, customize line items, and print billing summaries.</p>
      </div>

      {alert && (
        <div className={`p-4 rounded-xl text-sm border flex items-center gap-2.5 transition-all ${
          alert.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'
        }`}>
          {alert.type === 'success' ? <CheckCircle className="w-4.5 h-4.5" /> : <AlertCircle className="w-4.5 h-4.5" />}
          <span>{alert.msg}</span>
        </div>
      )}

      {/* Main Billing Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Billing form & items builder */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-extrabold text-slate-800 text-lg">
                {editingBillId ? `Edit Invoice (${invoiceNumber})` : 'New Invoice'}
              </h3>
              <button 
                id="btn-reset-bill"
                onClick={resetForm}
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 font-bold transition-all px-2.5 py-1.5 rounded-lg hover:bg-slate-100"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reset Form
              </button>
            </div>

            {/* Inputs Block */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5 mb-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Customer Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><User className="w-4.5 h-4.5" /></span>
                  <input
                    id="inp-customer-name"
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter Customer Name"
                    className="w-full bg-slate-50/50 border border-slate-250 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-800 focus:outline-none focus:border-brand-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Mobile Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><Phone className="w-4.5 h-4.5" /></span>
                  <input
                    id="inp-customer-mobile"
                    type="text"
                    value={customerMobile}
                    onChange={(e) => setCustomerMobile(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full bg-slate-50/50 border border-slate-250 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-800 focus:outline-none focus:border-brand-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {editingBillId && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Invoice Date</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><Calendar className="w-4.5 h-4.5" /></span>
                    <input
                      id="inp-bill-date"
                      type="datetime-local"
                      value={billDate}
                      onChange={(e) => setBillDate(e.target.value)}
                      className="w-full bg-slate-50/50 border border-slate-250 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-800 focus:outline-none focus:border-brand-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Line Items Table */}
            <div className="mb-6">
              <h4 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider mb-3">Line Items</h4>
              
              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div key={idx} className="flex flex-col md:flex-row gap-3 items-start md:items-center bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                    <div className="flex-grow w-full">
                      <input
                        type="text"
                        placeholder="Item Description / Service Name"
                        value={item.itemName}
                        onChange={(e) => handleItemChange(idx, 'itemName', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-sm text-slate-800 focus:outline-none focus:border-brand-500"
                      />
                    </div>
                    
                    <div className="flex gap-2 w-full md:w-auto">
                      <div className="w-24">
                        <input
                          type="number"
                          placeholder="Qty"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-sm text-slate-800 text-center focus:outline-none focus:border-brand-500"
                        />
                      </div>
                      
                      <div className="w-32">
                        <input
                          type="number"
                          placeholder="Price"
                          min="0.01"
                          step="0.01"
                          value={item.price}
                          onChange={(e) => handleItemChange(idx, 'price', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-sm text-slate-800 text-right focus:outline-none focus:border-brand-500"
                        />
                      </div>

                      <div className="w-36 py-2 px-3 text-sm font-bold text-slate-700 text-right bg-slate-100/60 rounded-xl">
                        {formatCurrency(item.total)}
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItemRow(idx)}
                        className="p-2 text-slate-400 hover:text-red-500 rounded-xl hover:bg-slate-100 transition-colors"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                id="btn-add-item-row"
                onClick={addItemRow}
                className="mt-4 flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-brand-600 hover:bg-brand-50 rounded-xl transition-all"
              >
                <Plus className="w-4 h-4" /> Add Item Line
              </button>
            </div>

            {/* Total Summary Block */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-4 border-t border-slate-100">
              <div className="text-center sm:text-left">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Grand Total</span>
                <span className="text-3xl font-extrabold text-slate-900 leading-tight">
                  {formatCurrency(calculateGrandTotal())}
                </span>
              </div>

              <button
                id="btn-save-bill"
                onClick={saveBill}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm tracking-wide rounded-xl shadow-lg shadow-brand-500/10 hover-lift transition-all"
              >
                <Save className="w-4.5 h-4.5" />
                {editingBillId ? 'Update Bill' : 'Save Invoice'}
              </button>
            </div>
          </div>

          {/* Past Invoices Search Panel */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <h3 className="font-extrabold text-slate-800 text-lg mb-4">Billing Log</h3>

            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="flex-grow relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><Search className="w-4.5 h-4.5" /></span>
                <input
                  id="inp-billing-search"
                  type="text"
                  placeholder="Search invoices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-250 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-800 focus:outline-none focus:border-brand-500 focus:bg-white transition-all"
                />
              </div>

              <div className="flex gap-2">
                <select
                  id="sel-billing-search-type"
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="bg-slate-50 border border-slate-250 rounded-xl py-2.5 px-4 text-sm text-slate-800 focus:outline-none font-bold"
                >
                  <option value="name">Customer Name</option>
                  <option value="invoice">Invoice Number</option>
                </select>

                <button
                  id="btn-search-bill"
                  type="submit"
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-all"
                >
                  Search
                </button>
              </div>
            </form>

            {/* List */}
            {listLoading ? (
              <div className="py-12 text-center text-slate-400 text-sm">Searching records...</div>
            ) : previousBills.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">No invoice records match your search.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                      <th className="pb-3 pr-2">Invoice No</th>
                      <th className="pb-3 px-2">Customer</th>
                      <th className="pb-3 px-2">Mobile</th>
                      <th className="pb-3 px-2">Date</th>
                      <th className="pb-3 px-2 text-right">Amount</th>
                      <th className="pb-3 pl-2 w-28"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {previousBills.map((bill) => (
                      <tr key={bill.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 pr-2 font-bold text-sm text-brand-600">{bill.invoiceNumber}</td>
                        <td className="py-3.5 px-2 text-sm text-slate-800 font-semibold">{bill.customerName}</td>
                        <td className="py-3.5 px-2 text-xs text-slate-500">{bill.customerMobile}</td>
                        <td className="py-3.5 px-2 text-xs text-slate-500">
                          {new Date(bill.billDate).toLocaleDateString(undefined, { dateStyle: 'short' })}
                        </td>
                        <td className="py-3.5 px-2 text-sm font-bold text-slate-900 text-right">{formatCurrency(bill.grandTotal)}</td>
                        <td className="py-3.5 pl-2 w-28 flex justify-end gap-1.5">
                          <button
                            onClick={() => loadBillForPreview(bill.id)}
                            className="p-1.5 text-slate-400 hover:text-brand-600 rounded-lg hover:bg-slate-100 transition-colors"
                            title="View Invoice"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => editBill(bill)}
                            className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-slate-100 transition-colors"
                            title="Edit Invoice"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteBill(bill.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: High-Fidelity Invoice Preview / Print Panel */}
        <div className="space-y-6">
          {activePreviewBill ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden sticky top-24">
              
              {/* Header Preview Actions */}
              <div className="bg-slate-950 p-4 text-white flex justify-between items-center">
                <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">Live Print Preview</span>
                <div className="flex gap-2">
                  <button
                    onClick={printInvoice}
                    className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                    title="Print Invoice"
                  >
                    <Printer className="w-4.5 h-4.5" />
                  </button>
                  <button
                    onClick={printInvoice} // standard trigger works for pdf printing save
                    className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                    title="Save PDF"
                  >
                    <Download className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>

              {/* Printable Invoice Container */}
              <div id="printable-invoice" className="p-8 space-y-6 text-slate-800 bg-white">
                
                {/* Invoice Top Header */}
                <div className="flex justify-between items-start border-b border-slate-100 pb-6">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">INVOICE</h2>
                    <p className="text-xs font-semibold text-brand-600 mt-1">{activePreviewBill.invoiceNumber}</p>
                  </div>
                  <div className="text-right">
                    <h4 className="font-extrabold text-sm text-slate-900">BillFlow Corp</h4>
                    <p className="text-xs text-slate-400 leading-relaxed mt-0.5">Finance Suite Center<br />Tech Park Way, FL</p>
                  </div>
                </div>

                {/* Billing Info */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block uppercase font-bold tracking-wider mb-1">Billed To</span>
                    <span className="text-sm font-extrabold text-slate-900">{activePreviewBill.customerName}</span>
                    <span className="block text-slate-500 mt-0.5">{activePreviewBill.customerMobile}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block uppercase font-bold tracking-wider mb-1">Invoice Date</span>
                    <span className="text-sm font-semibold text-slate-900">
                      {new Date(activePreviewBill.billDate).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>
                </div>

                {/* Items details table */}
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase font-bold tracking-wider">
                      <th className="py-2.5">Item Description</th>
                      <th className="py-2.5 text-center w-12">Qty</th>
                      <th className="py-2.5 text-right w-24">Price</th>
                      <th className="py-2.5 text-right w-24">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activePreviewBill.items.map((itm) => (
                      <tr key={itm.id}>
                        <td className="py-3 text-slate-800 font-semibold">{itm.itemName}</td>
                        <td className="py-3 text-center text-slate-500">{itm.quantity}</td>
                        <td className="py-3 text-right text-slate-500">{formatCurrency(itm.price)}</td>
                        <td className="py-3 text-right text-slate-900 font-bold">{formatCurrency(itm.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totals Section */}
                <div className="border-t border-slate-200 pt-4 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Payment Terms</p>
                    <p className="text-[11px] text-slate-500 font-medium">Due immediately upon receipt.</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Grand Total</span>
                    <span className="text-2xl font-black text-slate-950">
                      {formatCurrency(activePreviewBill.grandTotal)}
                    </span>
                  </div>
                </div>

                {/* Footnote */}
                <div className="pt-6 border-t border-slate-100 text-center text-[10px] text-slate-400">
                  Thank you for your business! Generated via BillFlow Suite.
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center text-slate-400 text-sm py-16">
              <FileText className="w-10 h-10 mx-auto text-slate-300 mb-3" />
              <span>Select or save an invoice to see the live print-ready card.</span>
            </div>
          )}
        </div>

      </div>

      {/* Embedded CSS for clean browser printing layouts */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-invoice, #printable-invoice * {
            visibility: visible;
          }
          #printable-invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Billing;
