// Require the necessary discord.js classes
require('dotenv').config();
const path = require('path');
const fs = require('fs');

const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Register events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

// Register commands
const commands = new Collection();
client.commands = commands;
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command);
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

rest
	.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), {
		body: client.commands.map((command) => command.data.toJSON()),
	})
	.then((data) => console.log(`Successfully registered ${data.length} application commands.`))
	.catch(console.error);

// Login to Discord with your client's token
client.login(process.env.TOKEN);
