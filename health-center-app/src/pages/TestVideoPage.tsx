import React from 'react';

const TestVideoPage: React.FC = () => {
  console.log('TestVideoPage loaded!');
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-4">Test Video Page</h1>
      <p className="text-xl mb-4">If you can see this, the route is working!</p>
      
      <div className="space-y-4">
        <button 
          onClick={() => console.log('Test button clicked!')}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Test Console Log
        </button>
        
        <button 
          onClick={() => alert('Alert works!')}
          className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 ml-4"
        >
          Test Alert
        </button>
      </div>
      
      <div className="mt-8 p-4 bg-gray-800 rounded-lg">
        <h2 className="text-xl font-bold mb-2">Debug Info:</h2>
        <p>Current URL: {window.location.href}</p>
        <p>Timestamp: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
};

export default TestVideoPage;
