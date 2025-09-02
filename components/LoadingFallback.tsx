import React from 'react';

interface LoadingFallbackProps {
  message?: string;
  className?: string;
}

export function LoadingFallback({ 
  message = "Loading...", 
  className = "" 
}: LoadingFallbackProps) {
  return (
    <div className={`min-h-screen flex items-center justify-center ${className}`}>
      <div className="text-center space-y-4">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}

export function PageLoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-900">Loading Application</h2>
          <p className="text-gray-600">Please wait while we prepare your content...</p>
        </div>
      </div>
    </div>
  );
}
