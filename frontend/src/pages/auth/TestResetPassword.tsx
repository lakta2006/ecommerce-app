import React, { useState } from 'react';
import { authService } from '@/services/authService';

export const TestResetPasswordPage: React.FC = () => {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTest = async () => {
    setIsLoading(true);
    setResult('');
    setError('');
    
    console.log('[TestPage] Starting test with token:', token ? '***' : 'empty');
    
    try {
      console.log('[TestPage] Calling authService.resetPassword...');
      const response = await authService.resetPassword({
        token,
        new_password: password,
      });
      console.log('[TestPage] Response received:', response);
      setResult(JSON.stringify(response, null, 2));
    } catch (err: any) {
      console.error('[TestPage] Error:', err);
      setError(err.message || JSON.stringify(err));
    } finally {
      console.log('[TestPage] Setting isLoading to false');
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Test Reset Password</h1>
      <div style={{ marginBottom: '10px' }}>
        <label>Token: </label>
        <input
          type="text"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          style={{ width: '400px', padding: '8px' }}
          placeholder="Paste reset token here"
        />
      </div>
      <div style={{ marginBottom: '10px' }}>
        <label>Password: </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '200px', padding: '8px' }}
          placeholder="New password"
        />
      </div>
      <button
        onClick={handleTest}
        disabled={isLoading}
        style={{
          padding: '10px 20px',
          backgroundColor: isLoading ? '#ccc' : '#16a34a',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
        }}
      >
        {isLoading ? 'Loading...' : 'Test Reset Password'}
      </button>
      
      {result && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#d4edda', borderRadius: '4px' }}>
          <h3>Success:</h3>
          <pre>{result}</pre>
        </div>
      )}
      
      {error && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f8d7da', borderRadius: '4px' }}>
          <h3>Error:</h3>
          <pre>{error}</pre>
        </div>
      )}
      
      <div style={{ marginTop: '20px' }}>
        <h3>Console Logs:</h3>
        <p>Open browser DevTools (F12) → Console tab to see detailed logs</p>
      </div>
    </div>
  );
};
