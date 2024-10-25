import React from 'react';
import { FaUserCircle } from 'react-icons/fa';

const ProfilePage = ({ practiceName, lastLogin, sessionExpiration, closeModal }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full relative">
        {/* Close Button */}
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={closeModal}
        >
          X
        </button>
        {/* Profile Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-blue-900 text-white p-4 rounded-full">
            <FaUserCircle className="text-5xl" />
          </div>
        </div>

        {/* Profile Information */}
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-800">{practiceName}</h2>
            <p className="text-gray-600">Last Login: {lastLogin}</p>
            <p className="text-gray-600">Session Expires: {sessionExpiration}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
