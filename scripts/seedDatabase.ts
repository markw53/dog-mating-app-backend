import { db } from "../src/config/firebase";
import { faker } from "@faker-js/faker";
import { Dog, User, Match, Message } from "../src/models";

// Install faker first:
// npm install @faker-js/faker

const SAMPLE_SIZE = {
  USERS: 10,
  DOGS_PER_USER: 2,
  MATCHES: 15,
  MESSAGES_PER_MATCH: 5
};

async function seedDatabase() {
  try {
    console.log("Starting database seeding...");

    // Create Users
    const users: User[] = [];
    for (let i = 0; i < SAMPLE_SIZE.USERS; i++) {
      const userData: Partial<User> = {
        email: faker.internet.email(),
        name: faker.person.fullName(),
        createdAt: new Date(),
        photoURL: faker.image.avatar(),
        phoneNumber: faker.phone.number(),
        preferences: {
          notifications: true,
          emailUpdates: true,
          radius: faker.number.int({ min: 5, max: 50 })
        }
      };

      const userRef = await db.collection("users").add(userData);
      users.push({ id: userRef.id, ...userData } as User);
      console.log(`Created user: ${userData.email}`);
    }

    // Create Dogs
    const dogs: Dog[] = [];
    for (const user of users) {
      for (let i = 0; i < SAMPLE_SIZE.DOGS_PER_USER; i++) {
        const dogData: Partial<Dog> = {
          ownerId: user.id,
          name: faker.animal.dog(),
          breed: faker.helpers.arrayElement([
            "Labrador",
            "German Shepherd",
            "Golden Retriever",
            "Bulldog",
            "Poodle",
            "Beagle",
            "Rottweiler"
          ]),
          age: faker.number.int({ min: 1, max: 12 }),
          gender: faker.helpers.arrayElement(["male", "female"]),
          photos: Array(3)
            .fill(null)
            .map(() => faker.image.url()),
          description: faker.lorem.paragraph(),
          location: {
            latitude: faker.location.latitude(),
            longitude: faker.location.longitude()
          },
          createdAt: new Date(),
          traits: {
            size: faker.helpers.arrayElement(["small", "medium", "large"]),
            energy: faker.helpers.arrayElement(["low", "medium", "high"]),
            friendliness: faker.helpers.arrayElement(["low", "medium", "high"])
          },
          medicalInfo: {
            vaccinated: faker.datatype.boolean(),
            neutered: faker.datatype.boolean(),
            lastCheckup: faker.date.past()
          }
        };

        const dogRef = await db.collection("dogs").add(dogData);
        dogs.push({ id: dogRef.id, ...dogData } as Dog);
        console.log(`Created dog: ${dogData.name} for user: ${user.email}`);
      }
    }

    // Create Matches
    const matches: Match[] = [];
    for (let i = 0; i < SAMPLE_SIZE.MATCHES; i++) {
      const randomDogs = faker.helpers.arrayElements(dogs, 2);
      const matchData: Partial<Match> = {
        dog1Id: randomDogs[0].id,
        dog2Id: randomDogs[1].id,
        status: faker.helpers.arrayElement(["pending", "accepted", "rejected"]),
        createdAt: new Date(),
        matchPreferences: {
          purpose: faker.helpers.arrayElement(["breeding", "playdate"]),
          preferredDate: faker.date.future(),
          location: {
            latitude: faker.location.latitude(),
            longitude: faker.location.longitude()
          }
        }
      };

      const matchRef = await db.collection("matches").add(matchData);
      matches.push({ id: matchRef.id, ...matchData } as Match);
      console.log(
        `Created match between dogs: ${randomDogs[0].name} and ${randomDogs[1].name}`
      );

      // Create Messages for each match
      for (let j = 0; j < SAMPLE_SIZE.MESSAGES_PER_MATCH; j++) {
        const messageData = {
          matchId: matchRef.id,
          senderId: faker.helpers.arrayElement([
            randomDogs[0].ownerId,
            randomDogs[1].ownerId
          ]),
          content: faker.lorem.sentence(),
          createdAt: faker.date.recent(),
          readAt: faker.helpers.maybe(() => faker.date.recent())
        };

        await db.collection("messages").add(messageData);
        console.log(`Created message for match: ${matchRef.id}`);
      }
    }

    console.log("Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();
