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
                                        { name: 'Lauantai', value: 'la'},
				),
		),

	async execute(interaction) {
		const day = interaction.options.getString('päivä');

		const menu = (await fetchMenu(day)).restaurants_tay;
		const weekDaysShort = ['su', 'ma', 'ti', 'ke', 'to', 'pe', 'la'];
		const weekDays = ['Sunnuntai', 'Maanantai', 'Tiistai', 'Keskiviikko', 'Torstai', 'Perjantai', 'Lauantai'];
                const wantedRestaurants = ["res_yr","res_linna","res_minerva"];

                var outputs = new Object();

		wantedRestaurants.forEach((restaurant) => {
                    const resMenu = menu[restaurant]
                    outputs[resMenu.restaurant] = "";
                    
                    if (resMenu.meals.length === 0) {
                        outputs[resMenu.restaurant] = "Ravintola kiinni"; 
                    } else {
                        const mo = resMenu.meals.map((meal) => meal.mo)
                        mo.forEach((meal, index) => {
                            const foodObj = meal.map((food) => food.mpn)
                            outputs[resMenu.restaurant] += `**${index + 1})** ${foodObj.join(', ')}\n`
                        })
                    }                
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

                Object.entries(outputs).forEach(([res,list]) => {
                    embed.addFields( { name: res, value: list });
                }); 

		embed.setAuthor({ name: 'Unisafka', iconURL: 'https://unisafka.fi/static/logo.png', url: 'https://unisafka.fi/' });
		embed.setFooter({ text: 'Unisafka', iconURL: 'https://unisafka.fi/static/logo.png' });
		embed.setTimestamp();

		interaction.reply({ embeds: [embed] });
	},
};
