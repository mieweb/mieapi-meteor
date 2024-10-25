import React, { useState, useEffect } from 'react';
import { FaPlug, FaEdit, FaCheckCircle, FaExclamationCircle, FaArrowLeft, FaSpinner } from 'react-icons/fa';
import { Session } from 'meteor/session';
import { Meteor } from 'meteor/meteor';
import { useNavigate } from 'react-router-dom';

const IntegrationsPage = () => {
  const [isWebChartSetup, setIsWebChartSetup] = useState(false);
  const [step, setStep] = useState(1); // 1: Setup/Dashboard button, 2: Practice confirmation, 3: Login button
  const [practice, setPractice] = useState('');
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authToken, setAuthToken] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the practice name and connectToken from the session
    const userSession = Session.get('userSession');
    if (userSession && userSession.practiceName) {
      setPractice(userSession.practiceName);
    }
    if (userSession && userSession.connectToken) {
      setIsWebChartSetup(true);
    }
  }, []);

  const integrations = [
    {
      name: 'WebChart',
      description: 'Integrate your WebChart API for seamless access to health records.',
      status: isWebChartSetup ? 'connected' : 'disconnected',
    },
  ];

  const handleButtonClick = (status) => {
    if (status === 'connected') {
      // Navigate to the dashboard
      alert('Navigating to Dashboard');
      navigate('/dashboard'); 
    } else {
      setStep(2); // Move to the practice confirmation step
    }
  };

  const handlePracticeSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true); // Show spinner

    Meteor.call('generateJwtToken', practice, (err, authToken) => {
      setIsLoading(false); // Hide spinner
      if (err) {
        setError('Error generating token');
        console.error('Error:', err);
      } else {
        const url = `https://${practice}.webchartnow.com/webchart.cgi`;
        setGeneratedUrl(url);
        setAuthToken(authToken);
        setStep(3); // Move to the login step
      }
    });
  };

  const handleLoginClick = () => {
    const fullUrl = `https://${practice}.webchartnow.com/webchart.cgi?f=layout&module=BlueHive&name=AI_Accept_Connection&authToken=${authToken}`;
    window.location.href = fullUrl;
  };

  const handleLogout = () => {
    Meteor.logout(() => {
      Session.set('userSession', null);
      window.location.href = '/'; // Redirect to login page
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

      {/* Integrations Container */}
      <div className="mt-24 p-6 w-full max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Integrations</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {integrations.map((integration, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-md flex flex-col items-start transition-all duration-300 hover:shadow-lg"
            >
              <FaPlug className="text-2xl text-blue-500 mb-4" />
              <h2 className="text-xl font-semibold mb-2">{integration.name}</h2>
              <p className="text-gray-700 mb-4">{integration.description}</p>
              <div className="flex items-center space-x-2">
                {integration.status === 'connected' ? (
                  <>
                    <FaCheckCircle className="text-green-500" />
                    <span className="text-green-500">Connected</span>
                  </>
                ) : (
                  <>
                    <FaExclamationCircle className="text-red-500" />
                    <span className="text-red-500">Not Connected</span>
                  </>
                )}
              </div>

              {step === 1 && (
                <button
                  className={`mt-4 px-4 py-2 rounded-lg text-white ${integration.status === 'connected' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'} transition duration-300`}
                  onClick={() => handleButtonClick(integration.status)}
                >
                  {integration.status === 'connected' ? 'Dashboard' : 'Setup'}
                </button>
              )}

              {step === 2 && (
                <div className="mt-4 animate-fadeIn">
                  <label className="text-sm text-gray-500 mb-2">Practice Name:</label>
                  <div className="bg-blue-100 text-blue-800 py-2 px-4 rounded-lg mb-4 flex items-center justify-between">
                    <span className="font-medium">{practice}</span>
                    <FaEdit
                      className="text-blue-500 cursor-pointer ml-2"
                      onClick={() => setIsEditing(true)}
                    />
                  </div>
                  {!isEditing ? (
                    <button
                      className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300"
                      onClick={handlePracticeSubmit}
                    >
                      Confirm
                    </button>
                  ) : (
                    <form onSubmit={handlePracticeSubmit}>
                      <input
                        type="text"
                        value={practice}
                        onChange={(e) => setPractice(e.target.value)}
                        className="w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 border-gray-300 shadow-sm mb-4"
                      />
                      {error && <p className="text-red-500 mb-2">{error}</p>}
                      <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300"
                      >
                        Confirm
                      </button>
                    </form>
                  )}
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="mt-2 text-blue-500 hover:text-blue-700 flex items-center space-x-1"
                  >
                    <FaArrowLeft /> <span>Back</span>
                  </button>
                </div>
              )}

              {step === 3 && (
                <div className="mt-4">
                  <label className="text-sm text-gray-500 mb-2">Generated URL:</label>
                  <p className="text-blue-600 underline mb-4 truncate">{generatedUrl}</p>
                  <button
                    className="px-4 py-2 rounded-lg text-white bg-green-500 hover:bg-green-600 transition duration-300 animate-fadeIn"
                    onClick={handleLoginClick}
                  >
                    Login with WebChart
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="mt-2 text-blue-500 hover:text-blue-700 flex items-center space-x-1"
                  >
                    <FaArrowLeft /> <span>Back</span>
                  </button>
                </div>
              )}

              {isLoading && (
                <div className="flex justify-center mt-4">
                  <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-8 w-8 animate-spin"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IntegrationsPage;
