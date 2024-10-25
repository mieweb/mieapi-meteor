import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa';
import { Accounts } from 'meteor/accounts-base';
import { useNavigate } from 'react-router-dom';

const RegisterForm = ({ closeModal }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [practice, setPractice] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    // Create a new user account
    Accounts.createUser(
      {
        username: practice,
        email,
        password,
      },
      (err) => {
        setLoading(false);
        if (err) {
          setError('Error creating account. Please try again.');
        } else {
          setSuccess(true);
          setTimeout(() => {
            handleClose();
            navigate('/'); // Redirect to the login page after successful registration
          }, 1000);
        }
      }
    );
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      closeModal();
    }, 300); // Match this with the animation duration
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
        {/* Success Message */}
        {success && (
          <p className="text-green-500 text-sm mb-4">
            Registration successful! You can now log in.
          </p>
        )}

        {!success ? (
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
              <FaEnvelope className="absolute left-3 top-3 text-blue-900" />
              <input
                type="email"
                id="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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

            {/* Register Button or Spinner */}
            {loading ? (
              <div className="flex justify-center">
                <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-8 w-8 animate-spin"></div>
              </div>
            ) : (
              <button
                type="submit"
                className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300"
              >
                Register
              </button>
            )}
          </form>
        ) : (
          <button
            onClick={handleClose}
            className="w-full py-2 mt-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Go to Login
          </button>
        )}
      </div>
    </div>
  );
};

export default RegisterForm;
