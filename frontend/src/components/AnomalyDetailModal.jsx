import React from 'react';
import { X, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

// Helper to format currency
const formatCurrency = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);

// This component generates the explanation for why a transaction is an anomaly
const AnomalyExplanation = ({ transaction, categoryAverages }) => {
    if (!transaction || !categoryAverages) return null;

    const { Amount, Category } = transaction;
    const isExpense = Amount < 0;
    const absoluteAmount = Math.abs(Amount);
    const average = categoryAverages[Category];

    // Case 1: Large Income
    if (!isExpense && absoluteAmount > 50000) { // Threshold for large income
        return (
            <div className="flex items-start">
                <TrendingUp className="w-5 h-5 mr-3 text-green-500 flex-shrink-0" />
                <p>This is a **large income transaction**, which is statistically rare compared to your regular expenses.</p>
            </div>
        );
    }
    
    // Case 2: Expense compared to average
    if (isExpense && average && average > 0) {
        const multiple = (absoluteAmount / average).toFixed(1);
        if (multiple > 1.5) { // If it's more than 1.5x the average
             return (
                <div className="flex items-start">
                    <TrendingDown className="w-5 h-5 mr-3 text-red-500 flex-shrink-0" />
                    <p>This expense of **{formatCurrency(absoluteAmount)}** is **{multiple} times higher** than your average spend of **{formatCurrency(average)}** for the '{Category}' category.</p>
                </div>
            );
        }
    }
    
    // Default case for other anomalies (e.g., first time in a category, rare category)
    return (
        <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 mr-3 text-yellow-500 flex-shrink-0" />
            <p>This transaction is flagged as a potential anomaly because its spending pattern is statistically different from your other transactions.</p>
        </div>
    );
};


export default function AnomalyDetailModal({ transaction, categoryAverages, onClose }) {
    if (!transaction) return null;

    return (
        // Backdrop
        <div 
            onClick={onClose} 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
            {/* Modal Body */}
            <div 
                onClick={(e) => e.stopPropagation()} 
                className="bg-white rounded-lg shadow-2xl w-full max-w-lg p-6 relative animate-fade-in-up"
            >
                {/* Close Button */}
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
                    <X className="w-6 h-6" />
                </button>

                <div className="flex items-center">
                    <AlertTriangle className="w-8 h-8 mr-4 text-red-500" />
                    <h2 className="text-2xl font-bold text-gray-800">Anomaly Details</h2>
                </div>

                {/* Transaction Info */}
                <div className="mt-6 space-y-3 text-gray-700">
                    <div className="flex justify-between">
                        <span className="font-semibold">Description:</span>
                        <span>{transaction.Description}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-semibold">Date:</span>
                        <span>{transaction.Date}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-semibold">Category:</span>
                        <span>{transaction.Category}</span>
                    </div>
                    <div className="flex justify-between items-center text-xl">
                        <span className="font-semibold">Amount:</span>
                        <span className={`font-bold ${transaction.Amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {formatCurrency(transaction.Amount)}
                        </span>
                    </div>
                </div>

                {/* Explanation Section */}
                <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-2">Why was this flagged?</h3>
                    <div className="text-sm text-gray-600">
                       <AnomalyExplanation transaction={transaction} categoryAverages={categoryAverages} />
                    </div>
                </div>
            </div>
             <style>{`
                @keyframes fade-in-up {
                    0% { opacity: 0; transform: translateY(20px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
}
