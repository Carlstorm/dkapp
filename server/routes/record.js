import express from "express";

// This will help us connect to the database
import db from "../db/connection.js";

// This help convert the id from string to ObjectId for the _id.
import { ObjectId } from "mongodb";

const router = express.Router();

// // This section will help you create a new record.
router.post("/", async (req, res) => {
    try {
    const response = await fetch('https://oauth.battle.net/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `grant_type=client_credentials&client_id=${encodeURIComponent("d73f0a51ed8847cb9692c5a4d07666ca")}&client_secret=${encodeURIComponent("LJR6BqB06TSB7x9MuUq9OAWpQefGFm1x")}`
    });
    if (!response.ok) 
      throw new Error('Failed to fetch token');
    
    const data = await response.json();
    var token = data.access_token; 



    const rosterResponse = await fetch(`https://eu.api.blizzard.com/data/wow/guild/ghostlands/danish-knights/roster?namespace=profile-eu&locale=en_US&access_token=${token}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8'
      },
    });
    if (!rosterResponse.ok)
      throw new Error('Failed to fetch roster');

    const roster = await rosterResponse.json();

    const rosterData = roster.members.map(member => ({
      guild_rank: member.rank,
      name: member.character.name,
      id: member.character.id,
      level: member.character.level,
      realm: {
        slug: member.character.realm.slug,
      },
      image_url: `https://render.worldofwarcraft.com/eu/character/${member.character.realm.slug}/${member.character.id % 256}/${member.character.id}-main-raw.png`
    }))

function chunkArray(array, chunkSize) {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function processMembersChunk(chunk, token) {
  const promises = chunk.map(async member => {
      var name = member.name.toLowerCase();
      const memberResponse = await fetch(`https://eu.api.blizzard.com/profile/wow/character/${member.realm.slug}/${name}?namespace=profile-eu&locale=en_US&access_token=${token}`, {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json;charset=UTF-8'
          }
      });
      if (!memberResponse.ok) {
        if (memberResponse.status === 404) {
          console.warn(`No data found for ${name}, skipping...`);
          return member; // Return null or a similar placeholder to indicate skipping
        } else {
          const errorBody = await memberResponse.text();
          console.error(`Failed to fetch user data for ${name}: ${memberResponse.status} ${errorBody}`);
          throw new Error('Failed to fetch user data');
        }
      }
      const memberData = await memberResponse.json();
      return {
          ...member,
          gender: memberData.gender ? memberData.gender.name : "",
          faction: memberData.faction ? memberData.faction.name : "",
          race: memberData.race ? memberData.race.name : "",
          class: memberData.character_class ? memberData.character_class.name : "",
          spec: memberData.active_spec ? memberData.active_spec.name : "",
          xp: memberData.experience ? memberData.experience : 0,
          achievement_points: memberData.achievement_points ? memberData.achievement_points : "",
          last_login_timestamp: memberData.last_login_timestamp ? memberData.last_login_timestamp : "",
          average_item_level: memberData.average_item_level ? memberData.average_item_level : "",
          equipped_item_level: memberData.equipped_item_level ? memberData.equipped_item_level : "",
          title: memberData.active_title ? memberData.active_title.name : "",
          Display_name: memberData.active_title ? `${memberData.active_title.display_string.replace("{name}", member.name)}` : member.name
      };
  });
  return Promise.all(promises);
}

// Main function to process all members in batches with delay
async function processAllMembers(rosterData, token) {
  const chunks = chunkArray(rosterData, 80);
  let allResults = [];
  for (let i = 0; i < chunks.length; i++) {
      if (i > 0) {
          await delay(1000); // Wait for 1 second before processing the next chunk
      }
      console.log(`loaded ${i+1} out of ${chunks.length}`)
      const results = await processMembersChunk(chunks[i], token);
      allResults = allResults.concat(results);
  }
  return allResults;
}
  const allMembersData = await processAllMembers(rosterData, token);

    let newDocument = allMembersData
    let collection = await db.collection("roster");
    let result = await collection.insertMany(newDocument);
    res.send(result).status(204);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding record");
  }
});

export default router;
