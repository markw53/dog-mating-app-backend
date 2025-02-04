import axios, { AxiosError } from 'axios';
import { config } from 'dotenv';
import { faker } from '@faker-js/faker';

config();

const API_URL = process.env.API_URL || 'http://localhost:5000/api';
let authToken: string;

interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, any>;
}

async function makeRequest(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  data?: any,
  config: RequestConfig = {},
) {
  try {
    const headers = {
      ...(authToken && { Authorization: `Bearer ${authToken}` }),
      ...config.headers,
    };

    const axiosConfig = {
      ...config,
      headers,
    };

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
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Request failed:', {
      endpoint,
      method,
      error: axiosError.response?.data || axiosError.message,
    });
    throw error;
  }
}

async function testAuth() {
  console.log('\n🔐 Testing Authentication...');

  const userData = {
    email: faker.internet.email(),
    password: 'Test123!@#',
    name: faker.person.fullName(),
  };

  try {
    const registerResponse = await makeRequest('/auth/register', 'POST', userData);
    console.log('✅ Registration successful');
    authToken = registerResponse.token;
  } catch (error) {
    console.log('❌ Registration failed');
    throw error;
  }

  try {
    const loginResponse = await makeRequest('/auth/login', 'POST', {
      email: userData.email,
      password: userData.password,
    });
    console.log('✅ Login successful');
    authToken = loginResponse.token;
  } catch (error) {
    console.log('❌ Login failed');
    throw error;
  }
}

async function testDogs() {
  console.log('\n🐕 Testing Dogs API...');

  let testDogId: string;

  // Create Dog
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
    const createDogResponse = await makeRequest('/dogs', 'POST', dogData);
    testDogId = createDogResponse.id;
    console.log('✅ Dog created successfully');
  } catch (error) {
    console.log('❌ Dog creation failed');
    throw error;
  }

  // Get Dogs
  try {
    const dogs = await makeRequest('/dogs', 'GET');
    console.log(`✅ Retrieved ${dogs.length} dogs`);
  } catch (error) {
    console.log('❌ Failed to retrieve dogs');
    throw error;
  }

  // Get Nearby Dogs
  try {
    const nearbyDogs = await makeRequest('/dogs/nearby', 'GET', null, {
      params: {
        latitude: Number(faker.location.latitude()),
        longitude: Number(faker.location.longitude()),
        radius: 10,
      },
    });
    console.log(`✅ Found ${nearbyDogs.length} nearby dogs`);
  } catch (error) {
    console.log('❌ Failed to retrieve nearby dogs');
    throw error;
  }

  return testDogId;
}

async function testMatches(testDogId: string) {
  console.log('\n❤️ Testing Matches API...');
  let testMatchId: string;

  try {
    const dogs = await makeRequest('/dogs', 'GET');
    const otherDog = dogs.find((dog: any) => dog.id !== testDogId);

    if (!otherDog) {
      throw new Error('No other dog found for matching');
    }

    const matchData = {
      dog1Id: testDogId,
      dog2Id: otherDog.id,
    };

    const createMatchResponse = await makeRequest('/matches', 'POST', matchData);
    testMatchId = createMatchResponse.id;
    console.log('✅ Match created successfully');

    return testMatchId;
  } catch (error) {
    console.log('❌ Match creation failed');
    throw error;
  }
}

async function testMessages(testMatchId: string) {
  console.log('\n💬 Testing Messages API...');

  try {
    const messageData = {
      matchId: testMatchId,
      content: faker.lorem.sentence(),
    };

    await makeRequest('/messages', 'POST', messageData);
    console.log('✅ Message sent successfully');

    const messages = await makeRequest(`/messages/${testMatchId}`, 'GET');
    console.log(`✅ Retrieved ${messages.length} messages`);
  } catch (error) {
    console.log('❌ Message operations failed');
    throw error;
  }
}

async function runTests() {
  try {
    console.log('🚀 Starting API tests...');

    await testAuth();
    const testDogId = await testDogs();
    const testMatchId = await testMatches(testDogId);
    await testMessages(testMatchId);

    console.log('\n✅ All tests completed successfully!');
  } catch (error) {
    console.error('\n❌ Tests failed:', error);
    process.exit(1);
  }
}

runTests();
