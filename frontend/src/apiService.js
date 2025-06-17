// This file centralizes all calls to the backend API

const API_URL = 'http://localhost:5001/api';

// Use a credentials-include fetch for session cookies
const fetchWithCredentials = (url, options = {}) => {
  options.credentials = 'include'; // This is crucial for sending/receiving session cookies
  return fetch(url, options);
};


async function handleResponse(response) {
  if (response.ok) {
    // If the response is empty, return a success message
    if (response.status === 204) return { message: 'Success' };
    return response.json();
  } else {
    const error = await response.json();
    throw new Error(error.error || 'Something went wrong');
  }
}

// --- Auth Functions ---
export async function adminLogin(email, password) {
  const response = await fetchWithCredentials(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(response);
}

export async function logout() {
  const response = await fetchWithCredentials(`${API_URL}/logout`, {
    method: 'POST',
  });
  return handleResponse(response);
}

// --- Customer Management Functions ---
export async function getCustomers() {
  const response = await fetchWithCredentials(`${API_URL}/admin/customers`, {
    method: 'GET',
  });
  return handleResponse(response);
}

export async function getCustomerDetails(customerId) {
  const response = await fetchWithCredentials(`${API_URL}/admin/customer/${customerId}`, {
    method: 'GET',
  });
  return handleResponse(response);
}

export async function createCustomerWithSignature(formData) {
  const response = await fetchWithCredentials(`${API_URL}/admin/customer_with_signature`, {
    method: 'POST',
    body: formData,
  });
  return handleResponse(response);
}

export async function updateCustomer(customerId, formData) {
  const response = await fetchWithCredentials(`${API_URL}/admin/customer/${customerId}`, {
    method: 'PUT',
    body: formData,
  });
  return handleResponse(response);
}

export async function deleteCustomer(customerId) {
  const response = await fetchWithCredentials(`${API_URL}/admin/customer/${customerId}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
}

// --- Signature Management Functions ---
export async function verifySignature(nationalId, signatureFile) {
  const formData = new FormData();
  formData.append('national_id', nationalId);
  formData.append('signature_file', signatureFile);

  const response = await fetchWithCredentials(`${API_URL}/admin/signature/verify`, {
    method: 'POST',
    body: formData,
  });
  return handleResponse(response);
}
