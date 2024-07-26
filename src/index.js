const { Client, ActivityType, IntentsBitField } = require("discord.js");
const admin = require("firebase-admin");
require("dotenv").config({ path: __dirname + "/../config/.env" });

// Initialize the app with a service account, granting admin privileges
const serviceAccount = require(__dirname + "/../config/ServiceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://boodyscomputer.firebaseio.com",
});

// Get a reference to the Firestore service
const db = admin.firestore();

const TOKEN = process.env.TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const MEMBER_ID = process.env.USER_ID;

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildPresences,
    IntentsBitField.Flags.MessageContent,
  ],
});

client.on("ready", (c) => {
  console.log(`${c.user.username} is online`);

  getMemberActivity(GUILD_ID, MEMBER_ID);
  setInterval(() => getMemberActivity(GUILD_ID, MEMBER_ID), 60 * 1000);
});

async function getMemberActivity(guildId, memberId) {
  try {
    let activityTitle = "",
      activityState = "",
      activityType = "",
      activityImg = "";
    const guild = await client.guilds.fetch(guildId);
    const member = await guild.members.fetch(memberId);
    const presence = member.presence;

    if (presence) {
      const activities = presence.activities;
      if (activities.length > 0) {
        activities.forEach((activity) => {
          console.log(`Activity: ${activity.name}`);
          activityTitle = activity.name;
          console.log(`Type: ${activity.type}`);
          if (activity.state) {
            console.log(`State: ${activity.state}`);
            activityState = activity.state;
          }
          if (activity.details) {
            console.log(`Details: ${activity.details}`);
            activityType = activity.details;
          }
          if (activity.assets) {
            if (activity.assets.largeImage) {
              const largeImageURL = activity.assets.largeImageURL();
              console.log(`Large Image URL: ${largeImageURL}`);
              activityImg = largeImageURL;
            }
            else if (activity.assets.smallImage) {
              const smallImageURL = activity.assets.smallImageURL();
              console.log(`Small Image URL: ${smallImageURL}`);
              activityImg = smallImageURL;
            }
          }
          writeData(activityTitle, activityState, activityType, activityImg);
        });
      } else {
        console.log("No activities found.");
      }
    } else {
      console.log("No presence information available.");
    }
  } catch (error) {
    console.error("Error fetching guild or member:", error);
  }
}

async function writeData(title, state, details, img) {
  try {
    // Reference to a document
    const docRef = db.collection("activity").doc("activity");

    // Set data in the document
    await docRef.set({
      title: title,
      state: state,
      details: details,
      img: img,
    });

    console.log("Document successfully written!");
  } catch (error) {
    console.error("Error writing document", error);
  }
}

client.login(TOKEN);
