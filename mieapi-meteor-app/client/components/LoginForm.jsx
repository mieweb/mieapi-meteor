import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { useNavigate } from 'react-router-dom';
import { Session } from 'meteor/session';

const LoginForm = () => {
  const [practice, setPractice] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1); // To manage transitions between sections
  const navigate = useNavigate();

  const handlePracticeSubmit = (e) => {
    e.preventDefault();
    // Move to the next step
    setStep(2);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    Meteor.call('user.validateOrLogin', { practice, username, password }, (err, res) => {
      if (err) {
        setError(err.reason);
      } else if (res && res.success) {
        // Set the session variable to true on successful login
        Session.set('isLoggedIn', true);

        // Redirect user to the home page
        navigate('/home');
      }
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
        </div>
      </nav>

      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
          {/* Logo Section */}
          <div className="text-center mb-6">
            <img src="https://www.webchartnow.com/gfx/png/wc_logo_full.png" alt="Logo" className="mx-auto w-25 h-25" />
          </div>

          {step === 1 && (
            <form onSubmit={handlePracticeSubmit}>
              {/* Practice Information Box */}
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
            </form>
          )}

          {step === 2 && (
            <div>
              <button
                onClick={() => setStep(1)}
                className="text-blue-500 hover:text-blue-700 focus:outline-none mb-4"
              >
                ← Back to Practice Information
              </button>
              {/* User Login Box */}
              <h2 className="text-xl font-bold text-gray-800 mb-4">User Login</h2>
              {error && <p className="text-red-500 mb-4">{error}</p>}
              <form onSubmit={handleLoginSubmit}>
                <div className="mb-4">
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="mt-1 block w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 border-gray-300 shadow-sm"
                    placeholder="Enter Username"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 block w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 border-gray-300 shadow-sm"
                    placeholder="Enter Password"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition duration-300"
                >
                  Login
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
