const BusinessType = require('../models/BusinessType');
const Region = require('../models/Region');

const businessTypesData = [
  { name: "Fintech" },
  { name: "Healthcare" },
  { name: "E-commerce" },
  { name: "Logistics" },
  { name: "Education" },
];

const regionsData = [
  { name: "US East" },
  { name: "US West" },
  { name: "Europe Central" },
  { name: "Asia Pacific" },
  { name: "Middle East" },
];

async function seedStaticData() {

  // Seed Business Types
  for (const type of businessTypesData) {
    try {
      const exists = await BusinessType.findOne({ name: type.name });
      if (!exists) {
        await BusinessType.create(type);
        // console.log(`✅ Inserted BusinessType: ${type.name}`);
      } else {
        // console.log(`ℹ️ BusinessType already exists: ${type.name}`);
      }
    } catch (err) {
      console.error(`Error inserting BusinessType "${type.name}":`, err.message);
    }
  }

  // Seed Regions
  for (const region of regionsData) {
    try {
      const exists = await Region.findOne({ name: region.name });
      if (!exists) {
        await Region.create(region);
        // console.log(`✅ Inserted Region: ${region.name}`);
      } else {
        // console.log(`ℹ️ Region already exists: ${region.name}`);
      }
    } catch (err) {
      console.error(` Error inserting Region "${region.name}":`, err.message);
    }
  }
  console.log("Static data seeding finished.");
}

module.exports = seedStaticData;
