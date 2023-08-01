const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { fetchMenu } = require('../functions/fetchMenu');
const { getNextDateOfTheDay } = require('../functions/getNextDate');

const weekDaysShort = ['su', 'ma', 'ti', 'ke', 'to', 'pe', 'la'];
const weekDays = [
  'Sunnuntai',
  'Maanantai',
  'Tiistai',
  'Keskiviikko',
  'Torstai',
  'Perjantai',
  'Lauantai',
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ruokalista')
    .setDescription('Palauttaa päivän ruokalistan.')
    .addStringOption((option) =>
      option
        .setName('kampus')
        .setDescription('Valitse kampus, jonka ravintolat haluat nähdä.')
        .setRequired(true)
        .addChoices(
          { name: 'Hervannan kampus', value: 'tty' },
          { name: 'Kaupin kampus', value: 'tays' },
          { name: 'Keskustakampus', value: 'tay' },
          { name: 'Tampereen ammattikorkeakoulu', value: 'tamk' },
        ),
    )
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
          { name: 'Lauantai', value: 'la' },
        ),
    ),

  async execute(interaction) {
    const campus = interaction.options.getString('kampus');
    const day =
      interaction.options.getString('päivä') ||
      weekDaysShort[new Date().getDay()];

    const menu = await fetchMenu(day);
    const wantedRestaurants = menu?.restaurants?.[campus];
    const availableMeals = menu?.[`restaurants_${campus}`];

    if (!wantedRestaurants || !availableMeals) {
      return interaction.reply('Ruokalistoja ei saatavilla.');
    }

    if (!campus) {
      return interaction.reply('Valitse kampus.');
    }

    if (
      weekDaysShort.indexOf(day) < new Date().getDay() &&
      weekDaysShort.indexOf(day) !== 0
    ) {
      return interaction.reply(
        `Päivä ${
          weekDays[weekDaysShort.indexOf(day)]
        } on jo mennyt, eikä seuraavan viikon ruokalistoja ole vielä saatavilla! 😢`,
      );
    }

    const outputs = {};

    wantedRestaurants.forEach((restaurant) => {
      const resMenu = availableMeals?.[restaurant];
      if (!resMenu) return;
      outputs[restaurant] =
        resMenu.meals.length === 0
          ? 'Ravintola kiinni'
          : resMenu.meals
              .map((meal, index) => {
                const foodObj = meal.mo
                  .map((menuItem) => menuItem.mpn.replace(/[^a-zåäö\s]/gi, ''))
                  .join(', ');
                return `*(${index + 1})* ${foodObj}\n`;
              })
              .join('');
    });

    const dateStr = `${
      weekDays[weekDaysShort.indexOf(day)]
    } ${getNextDateOfTheDay(day)}.`;

    const embed = new EmbedBuilder();
    embed.setTitle(`Ruokalistat ${dateStr}`);
    embed.setColor('#9867fb');

    Object.entries(outputs).forEach(([res, list]) => {
      embed.addFields({
        name: `*${availableMeals[res].restaurant}*${
          availableMeals[res].eating_hours !== '' &&
          availableMeals[res].meals.length !== 0
            ? ` *(${availableMeals[res].eating_hours})*`
            : ''
        }`,
        value: list,
      });
    });

    embed.setAuthor({
      name: 'Unisafka',
      iconURL: 'https://i.imgur.com/FckqkLu.png',
      url: 'https://unisafka.fi/',
    });
    embed.setFooter({
      text: 'Unisafka',
      iconURL: 'https://i.imgur.com/FckqkLu.png',
    });
    embed.setTimestamp();

    interaction.reply({ embeds: [embed] });
  },
};
