const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { fetchMenu } = require('../functions/fetchMenu');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ruokalista')
		.setDescription('Palauttaa päivän ruokalistan.')
		.addStringOption((option) =>
			option
				.setName('päivä')
				.setDescription('Valitse päivä, jonka ruokalista haluat nähdä.')
				.setRequired(false)
				.addChoices(
					{ name: 'Maanantai', value: 'ma' },
					{ name: 'Tiistai', value: 'ti' },
					{ name: 'Keskiviikko', value: 'ke' },
					{ name: 'Torstai', value: 'to' },
					{ name: 'Perjantai', value: 'pe' },
				),
		),

	async execute(interaction) {
		const day = interaction.options.getString('päivä');

		const menu = (await fetchMenu(day)).restaurants_tay;
		const weekDaysShort = ['su', 'ma', 'ti', 'ke', 'to', 'pe', 'la'];
		const weekDays = ['Sunnuntai', 'Maanantai', 'Tiistai', 'Keskiviikko', 'Torstai', 'Perjantai', 'Lauantai'];
		const wantedRestaurants = [menu['res_yr'], menu['res_linna'], menu['res_minerva']];

		// TODO: Code below could be made way more cleaner, but
		// it works so I'm not gonna touch it for now.
		let yrStr = '';
		let linnaStr = '';
		let minervaStr = '';

		wantedRestaurants.forEach((restaurant) => {
			const mo = restaurant.meals.map((meal) => meal.mo);
			mo.forEach((meal, index) => {
				const foodObj = meal.map((food) => food.mpn);
				if (restaurant.restaurant === 'Yliopiston ravintola') {
					yrStr += `**${index + 1})** ${foodObj.join(', ')}\n`;
				} else if (restaurant.restaurant === 'Linna') {
					linnaStr += `**${index + 1})** ${foodObj.join(', ')}\n`;
				} else {
					minervaStr += `**${index + 1})** ${foodObj.join(', ')}\n`;
				}
			});
		});

		let dateStr = '';
		if (day) {
			dateStr += `${weekDays[weekDaysShort.indexOf(day)]} ${
				new Date().getDate() + weekDaysShort.indexOf(day) - new Date().getDay()
			}.${new Date().getMonth() + 1}.`;
		} else {
			dateStr = `${weekDays[new Date().getDay()]} ${new Date().getDate()}.${new Date().getMonth() + 1}.`;
		}

		const embed = new EmbedBuilder();
		embed.setTitle(`Ruokalistat ${dateStr}`);
		embed.setColor('#0099ff');
		embed.addFields({ name: 'Yliopiston ravintola', value: yrStr });
		embed.addFields({ name: 'Linna', value: linnaStr });
		embed.addFields({ name: 'Minerva', value: minervaStr });
		embed.setAuthor({ name: 'Unisafka', iconURL: 'https://unisafka.fi/static/logo.png', url: 'https://unisafka.fi/' });
		embed.setFooter({ text: 'Unisafka', iconURL: 'https://unisafka.fi/static/logo.png' });
		embed.setTimestamp();

		interaction.reply({ embeds: [embed] });
	},
};
