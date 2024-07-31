require("dotenv").config({ path: __dirname + "/../config/.env" });
const { REST, Routes } = require("discord.js");

const commands = [
  {
    name: "start",
    description: "Starts tracking your activity",
  },
  {
    name: "stop",
    description: "Stops tracking your activity",
  },
];

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log("Registering slash commands...");
    await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        { body: commands }
    )
    console.log("Slash commands were registered successfully");
  } catch (err) {
    console.log(err);
  }
})();
