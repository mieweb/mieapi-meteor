import React, { useState, useEffect } from 'react';
import { FaUser, FaLock } from 'react-icons/fa';
import { Meteor } from 'meteor/meteor';
import { useNavigate } from 'react-router-dom';
import { Session } from 'meteor/session';

const LoginFormNew = ({ closeModal }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [practice, setPractice] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Meteor login call
    Meteor.loginWithPassword(practice, password, (err) => {
      if (err) {
        setLoading(false);
        setError('Invalid credentials. Please try again.');
      } else {
        // Fetch the logged-in user's information
        const user = Meteor.user();
        
        // Set the session
        Session.set('userSession', {
          isAuthenticated: true,
          practiceName: practice,
          userId: user._id,
        });

        // Display the loading spinner briefly before redirecting
        setTimeout(() => {
          navigate('/homenew');
        }, 1000);
      }
    });
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      closeModal();
    }, 500); // Adjust timing to match animation duration + delay
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div
        className={`bg-white rounded-lg shadow-xl p-8 max-w-md w-full relative transition-all duration-300 ${
          isVisible ? 'animate-fadeIn' : 'animate-fadeOut'
        }`}
      >
        {/* Close Button */}
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={handleClose}
        >
          X
        </button>
        {/* Profile Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-blue-900 text-white p-4 rounded-full">
            <FaUser className="text-4xl" />
          </div>
        </div>

        {/* Error Message */}
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {/* Input Fields */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="relative">
            <FaUser className="absolute left-3 top-3 text-blue-900" />
            <input
              type="text"
              id="practice"
              placeholder="Practice"
              value={practice}
              onChange={(e) => setPractice(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-blue-100 text-blue-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div className="relative">
            <FaLock className="absolute left-3 top-3 text-blue-900" />
            <input
              type="password"
              id="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-blue-100 text-blue-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex justify-between items-center text-sm">
            <div>
              <input type="checkbox" id="rememberMe" className="mr-2" />
              <label htmlFor="rememberMe" className="text-blue-900">Remember me</label>
            </div>
            <a href="#" className="text-blue-900">Forgot Password?</a>
          </div>

          {/* Login Button or Spinner */}
          {loading ? (
            <div className="flex justify-center">
              <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-8 w-8 animate-spin"></div>
            </div>
          ) : (
            <button
              type="submit"
              className="w-full py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-700 transition duration-300"
            >
              Login
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default LoginFormNew;
