#!/usr/bin/env node

/**
 * Debug script to check what's actually stored in the Neon database
 */

// Load environment variables
require("dotenv").config();

const config = require("./src/config/config");
const databaseService = require("./src/services/databaseService");

async function debugDatabase() {
  console.log("🔍 Debugging Neon DB contents...");
  console.log("=====================================");

  try {
    // Initialize database connection
    await databaseService.initialize();

    if (!databaseService.isReady) {
      console.log("❌ Database not ready");
      return;
    }

    const client = await databaseService.getClient();
    try {
      const tableName = config.database.vectorStore.tableName;

      // Check table structure
      console.log("\n📋 Table structure:");
      const columns = await client.query(
        `
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = $1
        ORDER BY ordinal_position
      `,
        [tableName],
      );

      columns.rows.forEach((row) => {
        console.log(`   - ${row.column_name}: ${row.data_type}`);
      });

      // Check all data in the table
      console.log("\n📊 All data in table:");
      const allData = await client.query(`SELECT * FROM ${tableName}`);
      console.log(`   Total rows: ${allData.rows.length}`);

      if (allData.rows.length > 0) {
        console.log("   Sample data:");
        allData.rows.forEach((row, index) => {
          console.log(`   Row ${index + 1}:`);
          console.log(`     - UUID: ${row.uuid}`);
          console.log(`     - Collection: "${row.collection_name}"`);
          console.log(`     - Custom ID: "${row.custom_id}"`);
          console.log(
            `     - Text preview: "${(row.text || "").substring(0, 50)}..."`,
          );
          console.log(`     - Metadata: ${JSON.stringify(row.metadata)}`);
        });
      } else {
        console.log("   No data found in table");
      }

      // Check collection names
      console.log("\n🏷️  Distinct collection names:");
      const collections = await client.query(`
        SELECT DISTINCT collection_name, COUNT(*) as count
        FROM ${tableName}
        GROUP BY collection_name
      `);

      if (collections.rows.length > 0) {
        collections.rows.forEach((row) => {
          console.log(`   - "${row.collection_name}": ${row.count} rows`);
        });
      } else {
        console.log("   No collections found");
      }

      // Configuration being used
      console.log("\n⚙️  Configuration:");
      console.log(`   - Table name: ${tableName}`);
      console.log(
        `   - Expected collection: "${config.database.vectorStore.collectionName}"`,
      );
      console.log(`   - Dimensions: ${config.database.vectorStore.dimensions}`);
    } finally {
      client.release();
    }

    console.log("\n✅ Debug completed");
  } catch (error) {
    console.error("❌ Debug failed:", error);
  } finally {
    if (databaseService.pool) {
      await databaseService.pool.end();
    }
  }
}

debugDatabase().catch(console.error);
