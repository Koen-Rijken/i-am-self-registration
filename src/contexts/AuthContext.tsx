import React, { createContext, useContext, useState, useEffect } from 'react';
import { IAMService } from '../services/IAMService';

interface AuthContextType {
  isAuthenticated: boolean;
  userEmail: string | null;
  error: string | null;
  qrCodeData: string | null;
  isLoading: boolean;
  isVerifying: boolean;
  startAuthentication: () => Promise<void>;
  logout: () => void;
  registerUser: (name: string, email: string) => void;
  username: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

const iamService = new IAMService();
const APP_ID = 'c1eef700-a8fd-4944-a604-ac076d79501c';
const HUB_ID = 'b54e124f-49f0-48cb-9c11-ea6c29b88766';
const PRIVATE_KEY = 'MCwCAQAwBQYDK2VwBCCzMloUy/5H0ufRNLBjEaYBHLKpRQr/aO6ZWp9Lv5HwNw==';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationInterval, setVerificationInterval] = useState<number | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  const clearVerificationInterval = () => {
    if (verificationInterval) {
      window.clearInterval(verificationInterval);
      setVerificationInterval(null);
    }
  };

  useEffect(() => {
    return () => clearVerificationInterval();
  }, []);

  const startAuthentication = async () => {
    try {
      setError(null);
      setIsLoading(true);
      setIsVerifying(true);
      
      const qrResponse = await iamService.generateAuthQRCode({
        appId: APP_ID,
        hubId: HUB_ID,
        signingPrivateKey: PRIVATE_KEY,
      });

      setQrCodeData(qrResponse.qrCodeBase64);
      setTransactionId(qrResponse.transactionId);
      setIsLoading(false);

      // Start polling for verification
      const intervalId = window.setInterval(async () => {
        try {
          const verificationResponse = await iamService.checkVerification({
            applicationId: APP_ID,
            transactionId: qrResponse.transactionId,
            timeoutInMs: 5000,
          });

          if (verificationResponse.verified && 
              verificationResponse.encryptedSessionToken && 
              verificationResponse.encryptionIv) {
            clearVerificationInterval();
            setIsVerifying(false);

            const sessionResponse = await iamService.verifySession({
              encryptedSessionToken: verificationResponse.encryptedSessionToken,
              encryptionIv: verificationResponse.encryptionIv,
              applicationId: APP_ID,
            });

            setUserEmail(sessionResponse.email);
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.error('Verification check failed:', error);
        }
      }, 2000);

      setVerificationInterval(intervalId);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Authentication failed');
      setIsLoading(false);
      setIsVerifying(false);
      console.error('Authentication error:', error);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserEmail(null);
    setUsername(null);
    setQrCodeData(null);
    setError(null);
    setTransactionId(null);
    setIsVerifying(false);
    clearVerificationInterval();
  };

  const registerUser = (name: string, email: string) => {
    setUsername(name);
    setUserEmail(email);
    // In a real app, you would send this data to a backend
    // For demo purposes, we'll just set the user as authenticated
    setIsAuthenticated(true);
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      userEmail,
      username,
      error,
      qrCodeData,
      isLoading,
      isVerifying,
      startAuthentication,
      logout,
      registerUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};