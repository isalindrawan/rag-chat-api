require("dotenv").config();
const databaseService = require("./src/services/databaseService");
const config = require("./src/config/config");

async function debug() {
  try {
    console.log("🔍 Debugging Neon DB...");
    await databaseService.initialize();
    if (!databaseService.isReady) {
      console.log("❌ Database not ready");
      return;
    }
    const client = await databaseService.getClient();
    try {
      const result = await client.query("SELECT * FROM langchain_pg_embedding");
      console.log("📊 Total rows:", result.rows.length);
      result.rows.forEach((row, i) => {
        console.log(
          `Row ${i + 1} - Collection: "${row.collection_name}" - Custom ID: "${row.custom_id}"`,
        );
      });
      const collections = await client.query(
        "SELECT DISTINCT collection_name, COUNT(*) as count FROM langchain_pg_embedding GROUP BY collection_name",
      );
      console.log("🏷️ Collections:");
      collections.rows.forEach((row) =>
        console.log(`  - "${row.collection_name}": ${row.count} rows`),
      );
      console.log(
        "⚙️ Expected collection:",
        config.database.vectorStore.collectionName,
      );
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    if (databaseService.pool) await databaseService.pool.end();
  }
}
debug();
