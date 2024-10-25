import React, { useState } from 'react';
import { FaWrench } from 'react-icons/fa';

const SetupPage = ({ closeModal }) => {
  const [practice, setPractice] = useState('');
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  const handleConfirm = () => {
    // Logic to save practice information and complete setup
    setIsSetupComplete(true);
  };

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
        {/* Setup Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-blue-900 text-white p-4 rounded-full">
            <FaWrench className="text-4xl" />
          </div>
        </div>

        {/* Setup Form */}
        {!isSetupComplete ? (
          <form className="space-y-4">
            <div className="relative">
              <label htmlFor="practice" className="block text-sm font-medium text-gray-700">Practice Name</label>
              <input
                type="text"
                id="practice"
                placeholder="Practice"
                value={practice}
                onChange={(e) => setPractice(e.target.value)}
                className="pl-4 py-2 w-full bg-blue-100 text-blue-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="button"
              onClick={handleConfirm}
              className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300"
            >
              Confirm
            </button>
          </form>
        ) : (
          <div className="text-center text-gray-800">
            <p>Setup Complete! You can now proceed to the Dashboard.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SetupPage;
