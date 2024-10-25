import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Session } from 'meteor/session'; // Import Meteor's Session API
import { Meteor } from 'meteor/meteor';

const AuthCallback = () => {
    const queryParams = new URLSearchParams(location.search);
    const practice = queryParams.get('practice'); // Get the 'practice' parameter
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const authenticateUser = async () => {
            try {
                // Call the Meteor method to fetch the user data
                Meteor.call('findUserByHandle', practice, (error, user) => {
                    if (error) {
                        console.error('Error fetching user:', error);
                        navigate('/'); // Redirect to login if there's an error
                    } else if (user) {
                        // Set the user data in the session if the user is found
                        Session.set('userSession', {
                            isAuthenticated: true,
                            practiceName: practice,
                            userId: user._id,
                            wcUsrId: user.services.webchart.wcUsrId,
                            ip: user.services.webchart.ip,
                            connectToken: user.services.webchart.connectToken,
                        });
                        console.log('User is authenticated. Starting session with details:', Session.get('userSession'));

                        navigate('/integration'); // Redirect to the home page
                    } else {
                        console.error('User not found');
                        navigate('/'); // Redirect to login if user is not found
                    }
                });
            } catch (error) {
                console.error('Failed to authenticate user:', error);
                navigate('/');
            } finally {
                setIsLoading(false); // Stop loading spinner
            }
        };

        authenticateUser(); 
    }, [navigate, practice]);

    return (
        <div>
            {isLoading ? (
                <div>Authenticating...</div> // Show loading spinner while processing
            ) : (
                <div>Redirecting...</div>
            )}
        </div>
    );
};

export default AuthCallback;
