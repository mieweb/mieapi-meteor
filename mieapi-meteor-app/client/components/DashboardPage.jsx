import React, { useState, useEffect } from 'react';
import { apiEndpoints } from '../../imports/api/apiEndpoint.js';
import { useNavigate } from 'react-router-dom';
import { Session } from 'meteor/session';

const DashboardPage = () => {
    const userSession = Session.get('userSession');
    const [apiResponse, setApiResponse] = useState(null);
    const [parameters, setParameters] = useState({ filter: '', limit: '' });
    const [jsonBody, setJsonBody] = useState(''); // For PUT/POST requests
    const [apiMethod, setApiMethod] = useState('GET'); // Default to GET
    const [selectedApi, setSelectedApi] = useState('');
    const [apiList, setApiList] = useState([]); // API names fetched from list
    const [apiLog, setApiLog] = useState('// API logs will appear here after requests.');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setApiList(apiEndpoints);
        // Check if the user is authenticated
        if (!userSession || !userSession.isAuthenticated) {
            setApiLog('User not authenticated. Redirecting to login page...');
            navigate('/'); // Redirect to login page if not authenticated
        }

        console.log('User session:', Session.get('userSession'));
    }, [navigate, userSession]);

    const LoadingSpinner = () => (
        <div className="flex items-center justify-center mt-4">
            <div className="loader ease-linear rounded-full border-4 border-t-4 border-blue-500 h-12 w-12 animate-spin"></div>
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
        let parsedJsonBody = null;
        if (apiMethod === 'POST' || apiMethod === 'PUT') {
            try {
                parsedJsonBody = JSON.parse(jsonBody);
            } catch (e) {
                setApiLog('Invalid JSON format in the body.');
                setLoading(false);
                return;
            }
        }

        Meteor.call(
            'callApi',
            userSession.practiceName,
            userSession.connectToken,
            userSession.ip,
            userSession.wcUsrId,
            apiMethod,
            selectedApi,
            params,
            parsedJsonBody,
            (error, result) => {
                setLoading(false);
                if (error) {
                    setApiLog(`Error: ${error.message}`);
                } else {
                    setApiLog(`Success: ${apiMethod} request to ${selectedApi} was successful.`);
                    setApiResponse(result);
                }
            }
        );
    };

    const handleClear = () => {
        setApiMethod('GET');
        setSelectedApi('');
        setParameters({ filter: '', limit: '' });
        setJsonBody('');
        setApiLog('// API logs will appear here after requests.');
        setApiResponse(null);
    };

    const handleLogout = () => {
        setLoading(true);
        Meteor.logout(() => {
            Session.set('userSession', null);
            navigate('/'); // Redirect to login page after logout
        });
    };
    const fetchApiResponse = () => {
        // Call the generic callApi method
        const params = { filter: parameters.filter, limit: parameters.limit ? `&limit=${parameters.limit}` : '' };
        Meteor.call('callApi', userSession.practiceName, userSession.connectToken, userSession.ip, userSession.wcUsrId,  'GET', selectedApi, params, jsonBody, (error, result) => {
          setLoading(false);
          if (error) {
            setApiLog(`Error: ${error.message}`);
          } else {
            setApiLog(`Success: GET request to ${selectedApi} was successful.`);
            setJsonBody(JSON.stringify(result, null, 2)); // Populate JSON Body
          }
        });
    
      };

    return (
        <div className="min-h-screen bg-gradient-to-r from-blue-50 to-blue-100 text-gray-900 flex flex-col items-center">
            {/* Navbar */}
            <nav className="bg-white fixed w-full z-20 top-0 start-0 border-b border-gray-200 shadow-md">
                <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                    <a href="https://www.webchartnow.com" className="flex items-center space-x-3 rtl:space-x-reverse">
                        <img src="https://www.webchartnow.com/gfx/png/wc_logo_full.png" className="h-11" alt="Webchart Logo" />
                        <span className="self-center text-2xl font-semibold whitespace-nowrap text-gray-900">WebChart MIE Api</span>
                    </a>
                    <div className="flex space-x-4">
                        <button onClick={() => navigate('/homenew')} className="nav-button">Home</button>
                        <button onClick={() => navigate('/profile')} className="nav-button">Profile</button>
                        <button onClick={() => navigate('/integration')} className="nav-button">Integrations</button>
                        <button onClick={handleLogout} className="nav-button">Logout</button>
                    </div>
                </div>
            </nav>

            {/* API Interaction Section */}
            <div className="container mx-auto mt-24 p-6 font-sans">
                <h1 className="text-4xl font-bold mb-10 text-center">API Interaction</h1>

                <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200 transition duration-300 ease-in-out hover:shadow-2xl hover:opacity-90">

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
                            className="interactive-button"
                        >
                            Submit Request
                        </button>

                        {/* Clear Button */}
                        <button
                            onClick={handleClear}
                            className="interactive-button"
                        >
                            Clear
                        </button>
                    </div>

                    {/* API Logs Box */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-300 mb-6">
                        <pre className="whitespace-pre-wrap">{apiLog}</pre>
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
                                <label className="block text-sm font-medium text-gray-700">Filter</label>
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
                        <pre className="whitespace-pre-wrap bg-gray-100 p-4 rounded-lg">
                            {apiResponse ? JSON.stringify(apiResponse, null, 2) : '// No response received yet.'}
                        </pre>
                    </div>
                </div>
            </div>

            {/* Loading Spinner */}
            {loading && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-25 z-30">
                    <LoadingSpinner />
                </div>
            )}
        </div>
    );
};

export default DashboardPage;
