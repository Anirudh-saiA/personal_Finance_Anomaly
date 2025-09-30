import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { History as HistoryIcon, BarChart2, AlertTriangle, Calendar, Eye } from 'lucide-react';

export default function History({ onViewAnalysis }) {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          throw new Error("User not found.");
        }
        
        // Create a query to get all documents from the user's personal 'analyses' collection
        const q = query(
          collection(db, "users", user.uid, "analyses"),
          orderBy("uploadedAt", "desc") // Show the most recent uploads first
        );

        const querySnapshot = await getDocs(q);
        const historyData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setHistory(historyData);
      } catch (err) {
        setError("Failed to fetch analysis history.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (isLoading) {
    return <div className="p-8 text-center">Loading history...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="p-8">
      <div className="flex items-center mb-6">
        <HistoryIcon className="w-8 h-8 mr-3 text-indigo-600" />
        <h1 className="text-3xl font-bold text-gray-900">Analysis History</h1>
      </div>

      {history.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">You haven't uploaded any statements yet.</p>
      ) : (
        <div className="space-y-4">
          {history.map(item => (
            <div key={item.id} className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-800">{item.fileName || "Analysis"}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                  <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" /> {new Date(item.uploadedAt.toDate()).toLocaleDateString()}</span>
                  <span className="flex items-center"><AlertTriangle className="w-4 h-4 mr-1" /> {item.summary.anomalies_found} Anomalies</span>
                  <span className="flex items-center"><BarChart2 className="w-4 h-4 mr-1" /> {item.summary.total_transactions} Transactions</span>
                </div>
              </div>
              <button
                onClick={() => onViewAnalysis(item)}
                className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                <Eye className="w-4 h-4 mr-2" /> View
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
