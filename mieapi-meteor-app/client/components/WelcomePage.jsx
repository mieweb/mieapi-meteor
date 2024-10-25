import React, { useEffect, useState } from 'react';
import LoginFormNew from './LoginFormNew';
import RegisterForm from './RegisterForm';
import { Session } from 'meteor/session';
import { useNavigate } from 'react-router-dom';

const WelcomePage = () => {
    const userSession = Session.get('userSession');
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const navigate = useNavigate();

  const openLogin = () => {
    setShowLogin(true);
    setShowRegister(false);
  };

  const openRegister = () => {
    setShowRegister(true);
    setShowLogin(false);
  };

  const closeModal = () => {
    setShowLogin(false);
    setShowRegister(false);
  };
  useEffect(() => {
    
    // Check if the user is authenticated
    if (!userSession || !userSession.isAuthenticated) {
        console.log('user not authenticated or session expired. Login again');
      navigate('/'); // Redirect to login page if not authenticated console.log('user not authenticated or session expired. Login again');
    }    
    console.log(Session.get('userSession'))
  }, [navigate, userSession]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <nav className="bg-white dark:bg-gray-900 fixed w-full z-20 top-0 start-0 border-b border-gray-200 dark:border-gray-600">
    <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
      <a href="https://www.webchartnow.com" className="flex items-center space-x-3 rtl:space-x-reverse">
        <img src="https://www.webchartnow.com/gfx/png/wc_logo_full.png" className="h-11" alt="Webchart Logo" />
        <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">WebChart MIE Api</span>
      </a>
    </div>
  </nav>
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-6 text-gray-800">Welcome to MIE Web App</h1>
        <div className="space-x-4">
          <button
            onClick={openLogin}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Login
          </button>
          <button
            onClick={openRegister}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300"
          >
            Register
          </button>
        </div>
      </div>

      {/* Login Modal */}
      {showLogin && (
        <LoginFormNew closeModal={closeModal} />
      )}

      {/* Register Modal */}
      {showRegister && (
        <RegisterForm closeModal={closeModal} />
      )}
    </div>
  );
};

export default WelcomePage;
