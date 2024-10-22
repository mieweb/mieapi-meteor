import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const [practice, setPractice] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1); // To manage transitions between sections
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // Step 1: Generate the URL based on the practice name
  const handlePracticeSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true); // Show spinner

    // Call the Meteor method to generate the JWT token
    Meteor.call('generateJwtToken', practice, (err, authToken) => {
      setIsLoading(false); // Hide spinner
      if (err) {
        setError('Error generating token');
        console.error('Error:', err);
      } else {
        const url = `https://${practice}.webchartnow.com/webchart.cgi?f=layout&module=BlueHive&name=AI_Accept_Connection&authToken=${authToken}&tabmodule=+`;
        
        setGeneratedUrl(url);
        
        setStep(2); // Move to the next step to show the URL
      }
    });
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true); // Show spinner
    window.location.href = generatedUrl; // Redirect to WebChart
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
        </div>
      </nav>

      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
          {/* Logo Section */}
          <div className="text-center mb-6">
            <img src="https://www.webchartnow.com/gfx/png/wc_logo_full.png" alt="Logo" className="mx-auto w-25 h-25" />
          </div>

          {/* Step 1: Input Practice Name */}
          {step === 1 && (
            <form onSubmit={handlePracticeSubmit}>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-2">Practice Information</h2>
                <label htmlFor="practice" className="block text-sm font-medium text-gray-700">Practice Name</label>
                <input
                  type="text"
                  id="practice"
                  value={practice}
                  onChange={(e) => setPractice(e.target.value)}
                  className="mt-1 block w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 border-gray-300 shadow-sm"
                  placeholder="Enter Practice Name"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition duration-300"
              >
                Next
              </button>
              {isLoading && (
                <div className="flex justify-center mt-4">
                  <div className="loader border-t-transparent border-solid border-blue-600 rounded-full w-8 h-8 animate-spin"></div>
                </div>
              )}
              {error && <p className="text-red-500 mt-4">{error}</p>}
            </form>
          )}

          {/* Step 2: Show the generated URL */}
          {step === 2 && (
            <div>
              <button
                onClick={() => setStep(1)}
                className="text-blue-500 hover:text-blue-700 focus:outline-none mb-4"
              >
                ← Back to Practice Information
              </button>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Generated WebChart URL</h2>
              {error && <p className="text-red-500 mb-4">{error}</p>}
              <p className="mb-4">
                WebChart URL: <a href={generatedUrl} target="_blank" className="text-blue-600">{generatedUrl}</a>
              </p>
              <button
                onClick={handleLoginSubmit}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition duration-300"
              >
                Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
