import React from 'react';
import RegistrationForm from '../components/RegistrationForm';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const RegistrationPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-custom-primary via-custom-primary to-custom-secondary flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            True Passwordless Identity &<br />
            Access Management
          </h1>
          <p className="text-xl text-white max-w-2xl mx-auto mb-6">
            Experience next-generation identity verification with QR code authentication.
            Simple, secure, and seamless.
          </p>
        </div>        
        <div className="flex justify-center">
          <RegistrationForm />
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;