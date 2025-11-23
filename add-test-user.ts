
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

async function addTestUser() {
  // Safety: Only run seeds in development
  if (process.env.NODE_ENV === 'production') {
    console.log('⚠️  Test user creation skipped in production environment');
    process.exit(0);
  }

  try {
    console.log("🔧 Adding Test user (development mode)...");
    
    // Check if Test user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.username, "Test")
    });
    
    if (existingUser) {
      console.log("✓ Test user already exists");
      return;
    }
    
    // Create Test user
    await db.insert(users).values({
      username: "Test",
      password: "password2025",
      role: "teacher",
      firstName: "Test",
      lastName: "Teacher",
    });
    
    console.log("✅ Test user created successfully");
    console.log("   Username: Test");
    console.log("   Password: password2025");
    console.log("   Role: teacher");
    
  } catch (error) {
    console.error("❌ Error adding Test user:", error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  addTestUser()
    .then(() => {
      console.log("✓ Operation completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("✗ Operation failed:", error);
      process.exit(1);
    });
}
