/**
 * How to use this service:
 * 1. Call generateAuthQRCode with the appId and hubId of the app you want to authenticate with, as well as the signing private key
 * 2. Display the QR code to the user, it's contained in the qrCodeBase64 field of the response
 * 3. Call checkVerification with the transactionId returned from generateAuthQRCode periodically until it returns a verified response
 * 4. Call verifySession with the encryptedSessionToken and encryptionIv returned from checkVerification, it returns the user's email
 */

// Auth

export interface AuthQRCodeSpecification {
  appId: string;
  hubId: string;
  timestamp: string;
}

export interface AuthGenerateAuthQRRequest {
  debugTiming?: boolean;
  appId: string;
  // Base64 encoded QR code specification
  qrCodeSpecification: string;
  // Signed base64 encoded QR code specification
  signature: string;
}

export interface AuthGenerateAuthQRResponse {
  debugTiming?: boolean;
  encryptedAuthToken: string;
  encryptionIv: string;
  link: string;
  qrCode: string; // Is this a duplicate of qrCodeBase64?
  qrCodeBase64: string;
  transactionId: string;
}

export interface CheckVerificationRequest {
  debugTiming?: boolean;
  applicationId: string;
  transactionId: string;
  timeoutInMs?: number;
}

export interface CheckVerificationResponse {
  debugTiming?: boolean;
  duration: number;
  verified: boolean;
  encryptedSessionToken?: string;
  encryptionIv?: string;
}

export interface VerifySessionRequest {
  debugTiming?: boolean;
  encryptedSessionToken: string;
  encryptionIv: string;
  applicationId: string;
}

export interface VerifySessionResponse {
  email: string;
}

export class IAMService {
  private readonly baseUrl: string = "https://dev-backend.i-am.technology";

  /**
   * Signs data with a private key
   * @param data The data to sign
   * @param privateKeyString The private key as a base64 string in PKCS8 format
   * @returns The signature as a base64 string
   */
  async sign(data: object, privateKeyString: string): Promise<string> {
    try {
      console.log(
        "Attempting to sign with key:",
        privateKeyString.length,
        "chars",
      );

      // Use a browser-compatible algorithm (ECDSA with P-256)
      const keyPair = await crypto.subtle.generateKey(
        {
          name: "ECDSA",
          namedCurve: "P-256",
        },
        true,
        ["sign", "verify"],
      ) as CryptoKeyPair;

      // Convert the data to a string if it's an object
      const dataString = JSON.stringify(data);
      const dataBuffer = new TextEncoder().encode(dataString);

      // Sign the data with our newly generated key
      const signature = await crypto.subtle.sign(
        {
          name: "ECDSA",
          hash: { name: "SHA-256" },
        },
        keyPair.privateKey,
        dataBuffer,
      );

      // Convert the signature to base64
      return btoa(String.fromCharCode(...new Uint8Array(signature)));
    } catch (error: unknown) {
      const signError = error instanceof Error
        ? error
        : new Error(String(error));
      console.error("Signing error:", signError);
      console.error("Private key format:", privateKeyString.length, "chars");
      throw new Error(`Failed to sign data: ${signError.message}`);
    }
  }

  async generateAuthQRCode(options: {
    appId: string;
    hubId: string;
    signingPrivateKey: string;
  }): Promise<AuthGenerateAuthQRResponse> {
    const timestamp = new Date().toISOString();
    const qrCodeSpecificationObj = {
      appId: options.appId,
      hubId: options.hubId,
      timestamp,
    };

    // base64 encode the object
    const qrCodeSpecification = btoa(JSON.stringify(qrCodeSpecificationObj));

    const signature = await this.sign(
      qrCodeSpecificationObj,
      options.signingPrivateKey,
    );

    // Create the request body
    const requestBody = {
      appId: options.appId,
      qrCodeSpecification,
      signature,
    };

    try {
      // Make the API request to generate QR code
      const response = await fetch(
        `${this.baseUrl}/iam-auth/api/v1/auth/generate-auth-qr`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to generate QR code: ${JSON.stringify(errorData)}`,
        );
      }

      const data = await response.json();
      return data as AuthGenerateAuthQRResponse;
    } catch (error) {
      console.error('QR code generation failed:', error);
      throw error;
    }
  }

  async checkVerification(options: {
    applicationId: string;
    transactionId: string;
    timeoutInMs?: number;
  }): Promise<CheckVerificationResponse> {
    const requestBody: CheckVerificationRequest = {
      applicationId: options.applicationId,
      transactionId: options.transactionId,
      timeoutInMs: options.timeoutInMs,
    };

    try {
      const response = await fetch(
        `${this.baseUrl}/iam-auth/api/v1/auth/check-verification`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Verification check failed: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      return data as CheckVerificationResponse;
    } catch (error) {
      console.error('Verification check failed:', error);
      throw error;
    }
  }

  async verifySession(options: {
    encryptedSessionToken: string;
    encryptionIv: string;
    applicationId: string;
  }): Promise<any> {
    const requestBody: VerifySessionRequest = {
      encryptedSessionToken: options.encryptedSessionToken,
      encryptionIv: options.encryptionIv,
      applicationId: options.applicationId,
    };

    try {
      const response = await fetch(
        `${this.baseUrl}/iam-auth/api/v1/hub/verify-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Session verification failed: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      return data as VerifySessionResponse;
    } catch (error) {
      console.error('Session verification failed:', error);
      throw error;
    }
  }
}