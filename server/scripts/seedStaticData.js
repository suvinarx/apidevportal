const BusinessType = require('../models/BusinessType');
const Region = require('../models/Region');

const businessTypesData = [
  { name: "Business Type1" },
  { name: "Business Type2" },
  { name: "Business Type3" },
  { name: "Business Type4" },
  { name: "Business Type5" },
];

const regionsData = [
  { name: "US East" },
  { name: "US West" },
  
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
