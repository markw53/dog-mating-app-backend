import axios, { AxiosError } from "axios";
import { config } from "dotenv";
import { faker } from "@faker-js/faker";

config();

const API_URL = process.env.API_URL || "http://localhost:5000/api";
let authToken: string;
let testUserId: string;
let testDogId: string;
let testMatchId: string;

interface TestResult {
  endpoint: string;
  method: string;
  success: boolean;
  data?: any;
  error?: string;
}

const results: TestResult[] = [];

async function makeRequest(
  method: string,
  endpoint: string,
  data?: any,
  auth: boolean = true
) {
  try {
    const config = {
      headers: auth ? { Authorization: `Bearer ${authToken}` } : {}
    };

    let response;
    if (method === "GET") {
      response = await axios.get(`${API_URL}${endpoint}`, config);
    } else if (method === "POST") {
      response = await axios.post(`${API_URL}${endpoint}`, data, config);
    } else if (method === "PUT") {
      response = await axios.put(`${API_URL}${endpoint}`, data, config);
    } else if (method === "DELETE") {
      response = await axios.delete(`${API_URL}${endpoint}`, config);
    }

    results.push({
      endpoint,
      method,
      success: true,
      data: response?.data
    });

    return response?.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    const errorMessage = axiosError.response?.data || axiosError.message;

    results.push({
      endpoint,
      method,
      success: false,
      error: JSON.stringify(errorMessage)
    });

    throw error;
  }
}

async function testAuth() {
  console.log("\n🔐 Testing Authentication...");

  // Test Registration
  const userData = {
    email: faker.internet.email(),
    password: "Test123!@#",
    name: faker.person.fullName()
  };

  try {
    const registerResponse = await makeRequest(
      "/auth/register",
      "POST",
      userData,
      false
    );
    console.log("✅ Registration successful");
    authToken = registerResponse.token;
    testUserId = registerResponse.user.id;
  } catch (error) {
    console.log("❌ Registration failed");
    throw error;
  }

  // Test Login
  try {
    const loginResponse = await makeRequest(
      "/auth/login",
      "POST",
      {
        email: userData.email,
        password: userData.password
      },
      false
    );
    console.log("✅ Login successful");
    authToken = loginResponse.token;
  } catch (error) {
    console.log("❌ Login failed");
    throw error;
  }
}

async function testDogs() {
  console.log("\n🐕 Testing Dogs API...");

  // Create Dog
  const dogData = {
    name: faker.animal.dog(),
    breed: faker.helpers.arrayElement([
      "Labrador",
      "German Shepherd",
      "Golden Retriever"
    ]),
    age: faker.number.int({ min: 1, max: 12 }),
    gender: faker.helpers.arrayElement(["male", "female"]),
    description: faker.lorem.paragraph(),
    location: {
      latitude: parseFloat(faker.location.latitude()),
      longitude: parseFloat(faker.location.longitude())
    }
  };

  try {
    const createDogResponse = await makeRequest("/dogs", "POST", dogData);
    testDogId = createDogResponse.id;
    console.log("✅ Dog created successfully");
  } catch (error) {
    console.log("❌ Dog creation failed");
    throw error;
  }

  // Get Dogs
  try {
    const dogs = await makeRequest("/dogs", "GET");
    console.log(`✅ Retrieved ${dogs.length} dogs`);
  } catch (error) {
    console.log("❌ Failed to retrieve dogs");
    throw error;
  }

  // Get Nearby Dogs
  try {
    const nearbyDogs = await makeRequest("/dogs/nearby", "GET", null, {
      params: {
        latitude: 40.7128,
        longitude: -74.006,
        radius: 10
      }
    });
    console.log(`✅ Found ${nearbyDogs.length} nearby dogs`);
  } catch (error) {
    console.log("❌ Failed to retrieve nearby dogs");
    throw error;
  }
}

async function testMatches() {
  console.log("\n❤️ Testing Matches API...");

  // Create Match
  try {
    const matchData = {
      dog1Id: testDogId,
      dog2Id: (await makeRequest("/dogs", "GET"))[0].id
    };
    const createMatchResponse = await makeRequest(
      "/matches",
      "POST",
      matchData
    );
    testMatchId = createMatchResponse.id;
    console.log("✅ Match created successfully");
  } catch (error) {
    console.log("❌ Match creation failed");
    throw error;
  }

  // Get Matches
  try {
    const matches = await makeRequest("/matches", "GET");
    console.log(`✅ Retrieved ${matches.length} matches`);
  } catch (error) {
    console.log("❌ Failed to retrieve matches");
    throw error;
  }

  // Update Match Status
  try {
    await makeRequest(`/matches/${testMatchId}/status`, "PUT", {
      status: "accepted"
    });
    console.log("✅ Match status updated successfully");
  } catch (error) {
    console.log("❌ Failed to update match status");
    throw error;
  }
}

async function testMessages() {
  console.log("\n💬 Testing Messages API...");

  // Send Message
  try {
    const messageData = {
      matchId: testMatchId,
      content: faker.lorem.sentence()
    };
    await makeRequest("/messages", "POST", messageData);
    console.log("✅ Message sent successfully");
  } catch (error) {
    console.log("❌ Message sending failed");
    throw error;
  }

  // Get Messages
  try {
    const messages = await makeRequest(`/messages/${testMatchId}`, "GET");
    console.log(`✅ Retrieved ${messages.length} messages`);
  } catch (error) {
    console.log("❌ Failed to retrieve messages");
    throw error;
  }
}

async function testNotifications() {
  console.log("\n🔔 Testing Notifications API...");

  try {
    const notifications = await makeRequest("/notifications", "GET");
    console.log(`✅ Retrieved ${notifications.length} notifications`);
  } catch (error) {
    console.log("❌ Failed to retrieve notifications");
    throw error;
  }
}

async function runTests() {
  console.log("🚀 Starting API tests...");

  try {
    await testAuth();
    await testDogs();
    await testMatches();
    await testMessages();
    await testNotifications();

    console.log("\n📊 Test Results Summary:");
    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;
    console.log(`Total Tests: ${results.length}`);
    console.log(`Successful: ${successful}`);
    console.log(`Failed: ${failed}`);

    if (failed > 0) {
      console.log("\n❌ Failed Tests:");
      results
        .filter((r) => !r.success)
        .forEach((r) => {
          console.log(`${r.method} ${r.endpoint}: ${r.error}`);
        });
    }
  } catch (error) {
    console.error("\n❌ Tests failed with error:", error);
  }
}

runTests();
