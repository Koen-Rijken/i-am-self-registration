import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import QRCodeDisplay from '../components/QRCodeDisplay';
import { UserPlus, ArrowRight, Loader2, Fingerprint } from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const { startAuthentication, qrCodeData, isLoading, isVerifying } = useAuth();
  const [showQrCode, setShowQrCode] = useState(false);

  const handleShowQrCode = async () => {
    setShowQrCode(true);
    await startAuthentication();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-custom-primary via-custom-primary to-custom-secondary">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            True Passwordless Identity &<br />
            Access Management
          </h1>
          <p className="text-xl text-white max-w-2xl mx-auto">
            Experience next-generation identity verification with QR code authentication.
            Simple, secure, and seamless.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {!showQrCode ? (
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div className="bg-white p-8 rounded-xl shadow-lg transform transition-all hover:scale-105 duration-300">
                <div className="mb-6">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    <Fingerprint size={24} className="text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">QR Code Login</h2>
                  <p className="text-gray-600">
                    Scan a QR code with your i.AM app for a secure, passwordless authentication experience.
                  </p>
                </div>
                <button
                  onClick={handleShowQrCode}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={20} className="mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      Login with QR Code
                      <ArrowRight size={20} className="ml-2" />
                    </>
                  )}
                </button>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-lg transform transition-all hover:scale-105 duration-300">
                <div className="mb-6">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <UserPlus size={24} className="text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Request Access</h2>
                  <p className="text-gray-600">
                    Regiter with your name and email to access this demo application.
                  </p>
                </div>
                <Link
                  to="/register"
                  className="w-full flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300"
                >
                  Register Now
                  <ArrowRight size={20} className="ml-2" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white p-10 rounded-xl shadow-xl max-w-lg mx-auto">
              {qrCodeData ? (
                <QRCodeDisplay qrCodeData={qrCodeData} isVerifying={isVerifying} />
              ) : (
                <div className="flex flex-col items-center justify-center p-12">
                  <Loader2 size={48} className="text-blue-500 animate-spin mb-4" />
                  <p className="text-gray-600">Generating QR code...</p>
                </div>
              )}
              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowQrCode(false)}
                  className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  Back
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;