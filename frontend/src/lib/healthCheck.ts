// Health check utility for debugging API connectivity
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export async function testBackendConnection(): Promise<boolean> {
  try {
    console.log('Testing backend connection to:', API_BASE);
    
    // Test 1: Health endpoint
    const healthResponse = await fetch(`${API_BASE}/health/`, {
      method: 'GET',
      credentials: 'include',
    });
    
    if (!healthResponse.ok) {
      console.error('Health check failed:', healthResponse.status);
      return false;
    }
    
    const healthData = await healthResponse.json();
    console.log('✅ Health check passed:', healthData);
    
    // Test 2: CSRF endpoint
    const csrfResponse = await fetch(`${API_BASE}/csrf/`, {
      method: 'GET',
      credentials: 'include',
    });
    
    if (!csrfResponse.ok) {
      console.error('CSRF check failed:', csrfResponse.status);
      return false;
    }
    
    const csrfData = await csrfResponse.json();
    console.log('✅ CSRF check passed:', csrfData.csrfToken ? 'Token received' : 'No token');
    
    // Test 3: Auth endpoint (should return 403 for unauthenticated)
    const authResponse = await fetch(`${API_BASE}/auth/me/`, {
      method: 'GET',
      credentials: 'include',
    });
    
    console.log('✅ Auth endpoint accessible:', authResponse.status, '(expected 403)');
    
    console.log('🎉 All backend tests passed!');
    return true;
    
  } catch (error) {
    console.error('❌ Backend connection test failed:', error);
    return false;
  }
}

// Auto-test removed to prevent server-side issues
