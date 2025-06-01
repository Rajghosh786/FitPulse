import { Link, Navigate } from 'react-router-dom';
import useAuth from '../Context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg p-8 text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">
                        Access Restricted
                    </h2>
                    <p className="text-gray-300 mb-6">
                        Please log in to access this page and explore our workout features.
                    </p>
                    <Link 
                        to="/login"
                        className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;