import React from 'react';
import { Scan } from 'lucide-react';

interface QRCodeDisplayProps {
  qrCodeData: string;
  isVerifying: boolean;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ qrCodeData, isVerifying }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-semibold mb-2 text-gray-800">Scan QR Code to Login</h2>
        <p className="text-gray-600 max-w-md">
          Use the i.AM app to scan this QR code and authenticate securely.
        </p>
      </div>
      
      <div className="relative">
        <div className={`p-4 bg-white rounded-2xl shadow-md ${isVerifying ? 'border-4 border-blue-400' : ''}`}>
          <img 
            src={`data:image/png;base64,${qrCodeData}`} 
            alt="Authentication QR Code" 
            className="w-64 h-64"
          />
        </div>
      </div>
      
      <div className="mt-6 text-sm text-gray-500 max-w-xs text-center">
        <p>The QR code will expire after 5 minutes for security reasons.</p>
      </div>
    </div>
  );
};

export default QRCodeDisplay;