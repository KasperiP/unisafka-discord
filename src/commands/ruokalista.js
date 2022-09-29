const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { fetchMenu } = require('../functions/fetchMenu');

module.exports = {
	data: new SlashCommandBuilder().setName('ruokalista').setDescription('Palauttaa päivän ruokalistan.'),
	async execute(interaction) {
		const menu = (await fetchMenu()).restaurants_tay;
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

		const dateStr = `${weekDays[new Date().getDay()]} ${new Date().getDate()}.${new Date().getMonth() + 1}.`;

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
