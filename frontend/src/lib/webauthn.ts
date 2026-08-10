import { startRegistration, startAuthentication } from '@simplewebauthn/browser';

const API_BASE = 'http://localhost:5000/api/v1/auth'; // Adjust to backend URL

export const registerBiometric = async (token: string) => {
  try {
    // 1. GET registration options from backend
    const resp = await fetch(`${API_BASE}/webauthn/register`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!resp.ok) throw new Error('Failed to get registration options');
    const options = await resp.json();

    // 2. Pass options to browser authenticator
    let attResp;
    try {
      attResp = await startRegistration({ optionsJSON: options });
    } catch (error: any) {
      if (error.name === 'InvalidStateError') {
        throw new Error('Authenticator was probably already registered');
      }
      throw error;
    }

    // 3. POST response back to backend
    const verifyResp = await fetch(`${API_BASE}/webauthn/register`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(attResp)
    });
    
    const verification = await verifyResp.json();
    return verification.verified;
  } catch (error) {
    console.error('Biometric registration error:', error);
    throw error;
  }
};

export const triggerBiometricAuth = async (token: string) => {
  try {
    // 1. GET authentication options from backend
    const resp = await fetch(`${API_BASE}/webauthn/authenticate`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!resp.ok) throw new Error('Failed to get authentication options');
    const options = await resp.json();

    // 2. Pass options to browser authenticator
    const asseResp = await startAuthentication({ optionsJSON: options });

    // 3. POST response back to backend
    const verifyResp = await fetch(`${API_BASE}/webauthn/authenticate`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(asseResp)
    });

    const verification = await verifyResp.json();
    return verification.verified;
  } catch (error) {
    console.error('Biometric authentication error:', error);
    throw error;
  }
};
