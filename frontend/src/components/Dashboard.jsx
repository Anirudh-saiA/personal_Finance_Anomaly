import React, { useState, useMemo, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { UploadCloud, Search, AlertCircle } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const formatCurrency = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(value) || 0);

// --- AllTransactionsTable is the only sub-component needed for this view ---
const AllTransactionsTable = ({ transactions }) => {
    if (transactions.length === 0) return <p className="text-center text-gray-500 mt-4">No transactions to display.</p>;
    return (
    <div className="overflow-x-auto mt-4 h-96">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
          <tr>
            <th className="px-6 py-3">Date</th>
            <th className="px-6 py-3">Description</th>
            <th className="px-6 py-3">Amount</th>
            <th className="px-6 py-3">Category</th>
            <th className="px-6 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx, index) => (
            <tr key={index} className={`border-b ${tx.is_anomaly ? 'bg-red-50' : 'bg-white'}`}>
              <td className="px-6 py-4">{tx.Date || 'N/A'}</td>
              <td className="px-6 py-4 text-gray-600">{tx.Description || 'N/A'}</td>
              <td className="px-6 py-4 font-medium text-gray-900">{formatCurrency(tx.Amount)}</td>
              <td className="px-6 py-4 text-gray-600">{tx.Category || 'N/A'}</td>
              <td className="px-6 py-4">
                {tx.is_anomaly ? (
                    <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full">Anomaly</span>
                ) : (
                  <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">Normal</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    );
};


export default function Dashboard({ analysisToView, setAnalysisToView }) {
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // This effect checks if we need to display a historical analysis
  useEffect(() => {
      if (analysisToView) {
          setResults(analysisToView);
          // Clear the prop so it doesn't re-load on every dashboard visit
          setAnalysisToView(null);
      }
  }, [analysisToView, setAnalysisToView]);


  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setError('');
    setResults(null);
    setSearchTerm('');
    setStatusFilter('all');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('https://personal-finance-anomaly.onrender.com/process_csv', { method: 'POST', body: formData });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Server error');
      }
      const data = await response.json();
      setResults(data);

      // --- SAVE TO FIRESTORE ---
      const user = auth.currentUser;
      if (user) {
          const userAnalysesCollection = collection(db, "users", user.uid, "analyses");
          await addDoc(userAnalysesCollection, {
              ...data,
              fileName: file.name,
              uploadedAt: serverTimestamp(),
          });
      }

    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTransactions = useMemo(() => {
    if (!results) return [];
    return results.transactions
      .filter(tx => {
        if (statusFilter === 'anomalies') return tx.is_anomaly;
        if (statusFilter === 'normal') return !tx.is_anomaly;
        return true;
      })
      .filter(tx => {
        const searchLower = searchTerm.toLowerCase();
        if (!searchLower) return true;
        return (
          (tx.Description || '').toLowerCase().includes(searchLower) ||
          (tx.Category || '').toLowerCase().includes(searchLower) ||
          (tx.Amount || '').toString().includes(searchLower)
        );
      });
  }, [results, searchTerm, statusFilter]);

  // The <nav> element has been removed from here. The main layout is now handled by App.jsx
  return (
    <main className="flex-1 p-8 overflow-y-auto">
        {/* If no results, show the upload screen. Otherwise, show the dashboard. */}
        {!results ? (
            <div id="upload-section">
                <h2 className="text-3xl font-bold">Upload Your Statement</h2>
                <p className="mt-1 text-gray-500">Upload a new CSV file to begin analysis.</p>
                <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg text-left">
                    <div className="flex items-center">
                        <AlertCircle className="w-6 h-6 text-indigo-700 mr-3 flex-shrink-0" />
                        <div>
                            <h3 className="font-semibold text-indigo-800">File Format Guide</h3>
                            <p className="mt-1 text-sm text-gray-700">Please ensure your CSV file has the columns: Date,Description,Amount,Category</p>
                        </div>
                    </div>
                </div>
                <div className="mt-6 p-8 text-center bg-white border-2 border-dashed rounded-lg">
                    <UploadCloud className="w-12 h-12 mx-auto text-gray-400" />
                    <p className="mt-4 text-gray-600">Drag & drop your file here or</p>
                    <input type="file" id="csv-file-input" className="hidden" accept=".csv" onChange={handleFileUpload} />
                    <button onClick={() => document.getElementById('csv-file-input').click()} className="px-4 py-2 mt-4 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300" disabled={isLoading}>
                    Browse File
                    </button>
                    {isLoading && <div className="w-8 h-8 mx-auto mt-4 border-4 border-dashed rounded-full animate-spin border-indigo-600"></div>}
                    {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
                </div>
            </div>
        ) : (
            <div id="results-section">
                <h2 className="text-3xl font-bold">Analysis Dashboard</h2>
                <p className="mt-1 text-gray-500">Showing results for: <span className="font-semibold">{results.fileName || "Uploaded File"}</span></p>

                <div className="grid grid-cols-1 gap-6 mt-6 md:grid-cols-2 lg:grid-cols-4">
                    <div className="p-6 bg-white rounded-lg shadow"><h3 className="text-sm font-medium text-gray-500">Total Expenses</h3><p className="mt-1 text-3xl font-semibold">{formatCurrency(results.summary.total_expenses)}</p></div>
                    <div className="p-6 bg-white rounded-lg shadow"><h3 className="text-sm font-medium text-gray-500">Total Income</h3><p className="mt-1 text-3xl font-semibold">{formatCurrency(results.summary.total_income)}</p></div>
                    <div className="p-6 bg-white rounded-lg shadow"><h3 className="text-sm font-medium text-gray-500">Net Balance</h3><p className="mt-1 text-3xl font-semibold">{formatCurrency(results.summary.balance)}</p></div>
                    <div className="p-6 bg-white rounded-lg shadow"><h3 className="text-sm font-medium text-gray-500">Anomalies Found</h3><p className="mt-1 text-3xl font-semibold text-red-500">{results.summary.anomalies_found}</p></div>
                </div>
                <div className="grid grid-cols-1 gap-6 mt-8 lg:grid-cols-5">
                    <div className="p-6 bg-white rounded-lg shadow lg:col-span-3">
                        <h3 className="font-semibold">Monthly Spending</h3>
                        <Bar data={{ labels: Object.keys(results.charts_data.monthly_spending), datasets: [{ label: 'Total Spending', data: Object.values(results.charts_data.monthly_spending), backgroundColor: 'rgba(79, 70, 229, 0.8)' }] }} options={{ responsive: true }} />
                    </div>
                    <div className="p-6 bg-white rounded-lg shadow lg:col-span-2">
                        <h3 className="font-semibold">Spending by Category</h3>
                        <Pie data={{ labels: Object.keys(results.charts_data.category_spending), datasets: [{ data: Object.values(results.charts_data.category_spending), backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FFCD56'] }] }} options={{ responsive: true }} />
                    </div>
                </div>
                <div className="mt-8 p-6 bg-white rounded-lg shadow">
                    <h3 className="font-semibold">Filter & Search Transactions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="relative md:col-span-2">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><Search className="w-5 h-5 text-gray-400" /></div>
                            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search..." className="w-full p-2 pl-10 border rounded-md" />
                        </div>
                        <div className="flex items-center space-x-2 rounded-md bg-gray-100 p-1">
                            <button onClick={() => setStatusFilter('all')} className={`w-full px-3 py-1 text-sm font-medium rounded-md ${statusFilter === 'all' ? 'bg-white shadow' : ''}`}>All</button>
                            <button onClick={() => setStatusFilter('anomalies')} className={`w-full px-3 py-1 text-sm font-medium rounded-md ${statusFilter === 'anomalies' ? 'bg-white shadow' : ''}`}>Anomalies</button>
                            <button onClick={() => setStatusFilter('normal')} className={`w-full px-3 py-1 text-sm font-medium rounded-md ${statusFilter === 'normal' ? 'bg-white shadow' : ''}`}>Normal</button>
                        </div>
                    </div>
                </div>
                <div className="p-6 mt-8 bg-white rounded-lg shadow">
                    <h3 className="font-semibold">Data Preview: All Transactions</h3>
                    <AllTransactionsTable transactions={filteredTransactions} />
                </div>
            </div>
        )}
    </main>
  );
}

