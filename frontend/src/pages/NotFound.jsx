import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-24 h-24 bg-indigo-50 rounded-3xl flex items-center justify-center mb-6">
        <span className="text-5xl">🔍</span>
      </div>
      <h1 className="text-6xl font-black text-indigo-600 mb-2">404</h1>
      <h2 className="text-xl font-bold text-gray-800 mb-2">Page Not Found</h2>
      <p className="text-gray-400 text-sm max-w-xs mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex items-center gap-3">
        <button onClick={() => window.history.back()} className="btn-secondary">
          <ArrowLeft size={15} /> Go Back
        </button>
        <Link to="/dashboard" className="btn-primary">
          <Home size={15} /> Dashboard
        </Link>
      </div>
    </div>
  );
}