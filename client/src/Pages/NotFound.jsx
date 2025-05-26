import React from 'react';

const NotFound = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white">
      <div className="text-center space-y-8">
        <h1 className="text-9xl font-extrabold">404</h1>
        <h2 className="text-4xl font-semibold">Oops! Page not found</h2>
        <p className="text-lg">Sorry, we couldn't find the page you were looking for. It might have been moved or deleted.</p>
        <a href="/" className="px-6 py-3 mt-4 text-lg font-semibold bg-white text-gray-900 rounded-full shadow-lg hover:bg-gray-100 transition-all duration-300">
          Go Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
