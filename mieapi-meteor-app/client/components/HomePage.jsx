import React, { useState, useEffect } from 'react';
import { apiEndpoints } from '../../imports/api/apiEndpoint.js';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const [apiResponse, setApiResponse] = useState(null);
  const [parameters, setParameters] = useState({
    filter: '',
    limit: '',
  });
  const [jsonBody, setJsonBody] = useState(''); // For PUT/POST requests
  const [apiMethod, setApiMethod] = useState('GET'); // Default to GET
  const [selectedApi, setSelectedApi] = useState('');
  const [apiList, setApiList] = useState([]); // API names fetched from list
  const [apiLog, setApiLog] = useState('// API logs will appear here after requests.');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setApiList(apiEndpoints);
    // Check if the user is logged in
    if (!Session.get('isLoggedIn')) {
      // Redirect to login page if not logged in
      navigate('/');
    }
  }, [navigate]);
  
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  
  );
  const handleInputChange = (e) => {
    setParameters({ ...parameters, [e.target.name]: e.target.value });
  };

  const handleJsonChange = (e) => {
    setJsonBody(e.target.value);
  };

  const handleSubmitRequest = () => {
    if (!selectedApi) {
      setApiLog('Please select an API to interact with.');
      return;
    }
    setLoading(true);

    const params = { filter: parameters.filter, limit: parameters.limit ? `&limit=${parameters.limit}` : '' };

    // Call the generic callApi method
    Meteor.call('callApi', apiMethod, selectedApi, params, jsonBody, (error, result) => {
      setLoading(false);
      if (error) {
        setApiLog(`Error: ${error.message}`);
      } else {
        setApiLog(`Success: ${apiMethod} request to ${selectedApi} was successful.`);
        setApiResponse(result);
      }
    });
  };

  const handleClear = () => {
    setApiMethod('GET');
    setSelectedApi('');
    setParameters({ filter: '', limit: '' });
    setJsonBody('');
    setApiLog('// API logs will appear here after requests.');
    setApiResponse(null);
  };

  const fetchApiResponse = () => {
    // Call the generic callApi method
    const params = { filter: parameters.filter, limit: parameters.limit ? `&limit=${parameters.limit}` : '' };
    
    Meteor.call('callApi', 'GET', selectedApi, params, null, (err, res) => {
      if (err) {
        setApiLog(`Error: ${err.message}`);
      } else {
        setApiLog(`Success: GET request to ${selectedApi} was successful.`);
        setJsonBody(JSON.stringify(res, null, 2)); // Populate JSON Body
      }
    });

  };
  const handleLogout = () => {
    Meteor.logout(() => {
      // Clear the session
      Session.set('isLoggedIn', false);

      // Redirect to login page and clear history to prevent back navigation
      navigate('/', { replace: true });
    });
  };

  return (
    <div>
      {/* Navbar */}
      <nav className="bg-white dark:bg-gray-900 fixed w-full z-20 top-0 start-0 border-b border-gray-200 dark:border-gray-600">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <a href="https://www.webchartnow.com" className="flex items-center space-x-3 rtl:space-x-reverse">
            <img src="https://www.webchartnow.com/gfx/png/wc_logo_full.png" className="h-11" alt="Webchart Logo" />
            <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">WebChart MIE API</span>
          </a>
          <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
            <button
              type="button"
              onClick={handleLogout}
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* API Interaction Section */}
      <div className="container mx-auto mt-24 p-6 font-sans">
        <h1 className="text-4xl font-bold mb-10 text-center">API Interaction</h1>

        <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200">

          {/* API Dropdowns and Submit/Clear Buttons */}
          <div className="flex justify-between items-center mb-6 space-x-4">
            {/* API Method Dropdown (GET, POST, PUT) */}
            <select
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 w-1/4"
              value={apiMethod}
              onChange={(e) => setApiMethod(e.target.value)}
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
            </select>

            {/* API Name Dropdown */}
            <select
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 w-1/4"
              value={selectedApi}
              onChange={(e) => setSelectedApi(e.target.value)}
            >
              <option value="">Select API</option>
              {apiList.map((api) => (
                <option key={api} value={api}>
                  {api}
                </option>
              ))}
            </select>

            {/* Submit Button */}
            <button
              onClick={handleSubmitRequest}
              className="text-white bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2"
            >
              Submit Request
            </button>

            {/* Clear Button */}
            <button
              onClick={handleClear}
              className="text-white bg-red-500 hover:bg-red-600 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-4 py-2"
            >
              Clear
            </button>
          </div>

          {/* API Logs Box (Shows API logs) */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-300 mb-6">
            <pre>{apiLog}</pre>
          </div>

          {/* JSON Body Area for POST/PUT requests */}
          {(apiMethod === 'POST' || apiMethod === 'PUT') && (
            <>
              <div className="flex justify-end mb-2">
                <button
                  onClick={fetchApiResponse}
                  className="text-white bg-green-500 hover:bg-green-600 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-2"
                >
                  View API Response
                </button>
              </div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">JSON Body</h3>
                <textarea
                  value={jsonBody}
                  onChange={handleJsonChange}
                  placeholder="Enter JSON body for POST or PUT requests"
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  rows="6"
                />
              </div>
            </>
          )}

          {/* API Parameters Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Parameters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Filter (e.g - LIKE_id=something)</label>
                <input
                  type="text"
                  name="filter"
                  value={parameters.filter}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Limit</label>
                <input
                  type="text"
                  name="limit"
                  value={parameters.limit}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* API Response Box */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-300">
            <h3 className="text-lg font-semibold mb-2">Response</h3>
            <pre className="whitespace-pre-wrap break-all bg-gray-100 p-4 rounded-lg">
              {apiResponse ? JSON.stringify(apiResponse, null, 2) : '// No response received yet.'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
