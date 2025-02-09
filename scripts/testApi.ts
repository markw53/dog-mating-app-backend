import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { config } from 'dotenv';
import { faker } from '@faker-js/faker';

config();

const API_URL = process.env.API_URL || 'http://localhost:5000/api';
let authToken: string;
let currentUserId: string;

interface ApiResponse {
  token?: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
  message?: string;
  error?: string;
}

interface ApiError {
  response?: {
    data?: {
      error?: string;
      message?: string;
    };
    status?: number;
  };
  message: string;
}

async function makeRequest<T = ApiResponse>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  data?: any,
  config: AxiosRequestConfig = {},
): Promise<T> {
  try {
    const headers = {
      ...(authToken && { Authorization: `Bearer ${authToken}` }),
      ...config.headers,
    };

    const axiosConfig: AxiosRequestConfig = {
      ...config,
      headers,
    };

    console.log(`Making ${method} request to ${endpoint}`);
    if (authToken) {
      console.log('Using token:', authToken.substring(0, 20) + '...');
    }

    let response;
    switch (method) {
      case 'GET':
        response = await axios.get(`${API_URL}${endpoint}`, axiosConfig);
        break;
      case 'POST':
        response = await axios.post(`${API_URL}${endpoint}`, data, axiosConfig);
        break;
      case 'PUT':
        response = await axios.put(`${API_URL}${endpoint}`, data, axiosConfig);
        break;
      case 'DELETE':
        response = await axios.delete(`${API_URL}${endpoint}`, axiosConfig);
        break;
    }

    return response?.data;
  } catch (err) {
    const error = err as AxiosError;
    console.error('Request failed:', {
      endpoint,
      method,
      error: error.response?.data || error.message,
      status: error.response?.status,
    });
    throw error;
  }
}

async function testAuth() {
  console.log('\n🔐 Testing Authentication...');

  const testUserData = {
    email: faker.internet.email(),
    password: 'Test123!@#',
    name: faker.person.fullName(),
  };

  try {
    console.log('Registering user:', testUserData.email);
    const registerResponse = await makeRequest<AuthResponse>(
      '/auth/register',
      'POST',
      testUserData,
    );
    console.log('✅ Registration successful');

    // Store the token (which is the user ID)
    authToken = registerResponse.token;
    currentUserId = registerResponse.user.id;

    console.log('Token received (User ID):', authToken);

    // Test the token with profile endpoint
    console.log('Verifying token with profile request...');
    const profileResponse = await makeRequest('/auth/profile', 'GET');
    console.log('✅ Token verified - Profile retrieved:', profileResponse);

    return currentUserId;
  } catch (err) {
    const error = err as AxiosError;
    console.log('❌ Authentication failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testDogs() {
  console.log('\n🐕 Testing Dogs API...');

  const dogData = {
    name: faker.animal.dog(),
    breed: faker.helpers.arrayElement(['Labrador', 'German Shepherd', 'Golden Retriever']),
    age: faker.number.int({ min: 1, max: 12 }),
    gender: faker.helpers.arrayElement(['male', 'female'] as const),
    description: faker.lorem.paragraph(),
    location: {
      latitude: Number(faker.location.latitude()),
      longitude: Number(faker.location.longitude()),
    },
  };

  try {
    const createDogResponse = await makeRequest<DogResponse>('/dogs', 'POST', dogData);
    console.log('✅ Dog created successfully');
    return createDogResponse.id;
  } catch (err) {
    const error = err as AxiosError;
    console.log('❌ Dog creation failed:', error.response?.data || error.message);
    throw error;
  }
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

interface DogResponse {
  id: string;
  [key: string]: any;
}

async function runTests() {
  try {
    console.log('🚀 Starting API tests...');

    await testAuth();
    const dogId = await testDogs();

    console.log('\n✅ All tests completed successfully!');
    return { success: true, dogId };
  } catch (err) {
    const error = err as AxiosError;
    console.error('\n❌ Tests failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run the tests
void runTests();
