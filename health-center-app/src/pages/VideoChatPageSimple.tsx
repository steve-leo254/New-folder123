import React from 'react';

const VideoChatPageSimple: React.FC = () => {
  console.log('VideoChatPageSimple loaded!');
  
  const handleEndCall = () => {
    console.log('End call button clicked!');
    alert('End call clicked!');
  };
  
  const handleTest = () => {
    console.log('Test button clicked!');
    alert('Test button clicked!');
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-4">Simple Video Chat Test</h1>
      <p className="text-xl mb-8">Testing basic button functionality</p>
      
      <div className="space-x-4">
        <button 
          onClick={handleEndCall}
          className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          End Call
        </button>
        
        <button 
          onClick={handleTest}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Test Button
        </button>
        
        <button 
          onClick={() => console.log('Inline test clicked!')}
          className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          Inline Test
        </button>
      </div>
      
      <div className="mt-8 p-4 bg-gray-800 rounded-lg">
        <h2 className="text-xl font-bold mb-2">Instructions:</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>Open browser console (F12)</li>
          <li>Click each button above</li>
          <li>Check for console messages and alerts</li>
          <li>If this works, the issue is with the complex VideoChatPage</li>
        </ol>
      </div>
    </div>
  );
};

export default VideoChatPageSimple;
