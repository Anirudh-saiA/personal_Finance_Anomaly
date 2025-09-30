import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Home from './components/Home';
import History from './components/History'; // Import the new History component
import { Home as HomeIcon, LayoutDashboard, LogIn, LogOut, History as HistoryIcon } from 'lucide-react';

// --- Reusable Navbar Component (Now with History link) ---
const Navbar = ({ user, currentPage, setCurrentPage }) => {
  const handleLogout = async () => {
    await signOut(auth);
    setCurrentPage('home');
  };

  return (
    <nav className="flex flex-col justify-between w-64 p-4 bg-white border-r">
      <div>
        <div className="flex items-center space-x-2 mb-8">
            <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 8l3 5m0 0l3-5m-3 5v4m-3-5h6m-6 4h6m6-4a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h1 className="text-xl font-bold">Anomaly Detector</h1>
        </div>
        <ul className="space-y-2">
            <li>
                <button onClick={() => setCurrentPage('home')} className={`flex items-center w-full px-4 py-2 rounded-md ${currentPage === 'home' ? 'text-white bg-indigo-600' : 'text-gray-600 hover:bg-gray-100'}`}>
                    <HomeIcon className="w-5 h-5 mr-3" /> Home / News
                </button>
            </li>
            {user && (
                <>
                 <li>
                    <button onClick={() => setCurrentPage('dashboard')} className={`flex items-center w-full px-4 py-2 rounded-md ${currentPage === 'dashboard' ? 'text-white bg-indigo-600' : 'text-gray-600 hover:bg-gray-100'}`}>
                        <LayoutDashboard className="w-5 h-5 mr-3" /> Dashboard
                    </button>
                </li>
                {/* NEW History button */}
                <li>
                    <button onClick={() => setCurrentPage('history')} className={`flex items-center w-full px-4 py-2 rounded-md ${currentPage === 'history' ? 'text-white bg-indigo-600' : 'text-gray-600 hover:bg-gray-100'}`}>
                        <HistoryIcon className="w-5 h-5 mr-3" /> History
                    </button>
                </li>
                </>
            )}
        </ul>
      </div>
      <div>
          {user ? (
               <button onClick={handleLogout} className="flex items-center w-full px-4 py-2 mt-4 text-gray-600 rounded-md hover:bg-gray-100">
                    <LogOut className="w-5 h-5 mr-3" /> Log Out
               </button>
          ) : (
                <button onClick={() => setCurrentPage('login')} className="flex items-center w-full px-4 py-2 mt-4 text-gray-600 rounded-md hover:bg-gray-100">
                    <LogIn className="w-5 h-5 mr-3" /> Login / Register
                </button>
          )}
      </div>
    </nav>
  );
};

// --- Main App Component ---
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('home');
  // NEW: State to hold a historical analysis to be viewed on the dashboard
  const [analysisToView, setAnalysisToView] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && currentPage !== 'history') {
          setCurrentPage('dashboard');
      } else if (!currentUser) {
          setCurrentPage('home');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // NEW: Function to handle viewing a past analysis
  const handleViewAnalysis = (analysisData) => {
    setAnalysisToView(analysisData);
    setCurrentPage('dashboard'); // Switch to the dashboard to view it
  };

  const renderPage = () => {
    switch(currentPage) {
        case 'home':
            return <Home />;
        case 'login':
            return <Auth />;
        case 'dashboard':
            if (user) return <Dashboard analysisToView={analysisToView} setAnalysisToView={setAnalysisToView} />;
            return <Home />; // Fallback
        case 'history':
            if (user) return <History onViewAnalysis={handleViewAnalysis} />;
            return <Home />; // Fallback
        default:
            return <Home />;
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="flex w-full h-screen bg-gray-50 font-sans text-gray-800">
      <Navbar user={user} currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="flex-1 overflow-y-auto">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
