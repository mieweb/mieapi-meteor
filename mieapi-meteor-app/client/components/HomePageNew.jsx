import React, { useState, useEffect } from 'react';
import { FaClock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Session } from 'meteor/session';
import { Meteor } from 'meteor/meteor';

const HomePageNew = () => {
    const [time, setTime] = useState(new Date());
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if the user is authenticated
        const userSession = Session.get('userSession');
        
        if (!userSession || !userSession.isAuthenticated || !userSession.practiceName || !userSession.userId) {
            console.warn('User session is invalid or user not authenticated. Redirecting to login page...');
            navigate('/'); // Redirect to Welcome Page
        } else {
            try {
                // Call the Meteor method to fetch the user data
                Meteor.call('findUserByHandle', userSession.practiceName, (error, user) => {
                    if (error) {
                        console.error('User does not exist :', error);
                    } else if (user) {
                        // Set the user data in the session if the user is found
                        Session.set('userSession', {
                            isAuthenticated: true,
                            practiceName: userSession.practiceName,
                            userId: user._id,
                            wcUsrId: user.services.webchart.wcUsrId,
                            ip: user.services.webchart.ip,
                            connectToken: user.services.webchart.connectToken,
                        });
                        console.log('User is authenticated. Starting session with details:', Session.get('userSession'));

                    } else {
                        console.error('User not found');
                    }
                });
            } catch (error) {
                console.error('Failed to authenticate user details:', error);
            } 
            console.log('User session:', userSession);
        }

        // Update the clock every second
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, [navigate]);

    // Functions to handle navigation
    const goToProfile = () => {
        setLoading(true);
        setTimeout(() => {
            navigate('/profile');
        }, 1000);
    };

    const goToIntegrations = () => {
        setLoading(true);
        setTimeout(() => {
            navigate('/integration');
        }, 1000);
    };

    // Function to handle logout
    const handleLogout = () => {
        setLoading(true);
        Meteor.logout(() => {
            // Clear the session
            Session.set('userSession', null);
            navigate('/'); // Redirect to Welcome Page after logout
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-blue-50 to-blue-100 text-gray-900 flex flex-col items-center justify-center transition-all duration-300">
            {/* Navbar */}
            <nav className="bg-white fixed w-full z-20 top-0 start-0 border-b border-gray-200 shadow-md">
                <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                    <a href="https://www.webchartnow.com" className="flex items-center space-x-3 rtl:space-x-reverse">
                        <img src="https://www.webchartnow.com/gfx/png/wc_logo_full.png" className="h-11" alt="Webchart Logo" />
                        <span className="self-center text-2xl font-semibold whitespace-nowrap text-gray-900">WebChart MIE Api</span>
                    </a>
                    <div className="flex space-x-4">
                        <button onClick={goToProfile} className="nav-button">Profile</button>
                        <button onClick={goToIntegrations} className="nav-button">Integrations</button>
                        <button onClick={handleLogout} className="nav-button">Logout</button>
                    </div>
                </div>
            </nav>

            {/* Clock Container */}
            <div className="flex flex-col items-center justify-center mt-32 p-8 bg-gradient-to-br from-white to-gray-200 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105">
                <FaClock className="text-5xl mb-4 text-gray-700" />
                <div className="text-3xl font-light text-gray-800">{time.toLocaleTimeString()}</div>
            </div>

            {/* Loading Spinner */}
            {loading && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-25 z-30">
                    <div className="loader ease-linear rounded-full border-8 border-t-8 border-blue-400 h-16 w-16"></div>
                </div>
            )}
        </div>
    );
};

export default HomePageNew;
