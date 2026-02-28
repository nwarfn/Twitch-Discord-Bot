const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const config = require('../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('followers')
        .setDescription('Get Twitch follower count')
        .addStringOption(option => option.setName('username').setDescription('Twitch Username').setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply();
        const username = interaction.options.getString('username');

        try {
            const auth = await axios.post(`https://id.twitch.tv/oauth2/token?client_id=${config.twitchClientId}&client_secret=${config.twitchClientSecret}&grant_type=client_credentials`);
            const token = auth.data.access_token;

            const userRes = await axios.get(`https://api.twitch.tv/helix/users?login=${username}`, {
                headers: { 'Client-ID': config.twitchClientId, 'Authorization': `Bearer ${token}` }
            });

            if (!userRes.data.data.length) return interaction.editReply('❌ User not found.');
            const user = userRes.data.data[0];

            const followRes = await axios.get(`https://api.twitch.tv/helix/channels/followers?broadcaster_id=${user.id}`, {
                headers: { 'Client-ID': config.twitchClientId, 'Authorization': `Bearer ${token}` }
            });

            const embed = new EmbedBuilder()
                .setTitle(`${user.display_name}'s Twitch Stats`)
                .setThumbnail(user.profile_image_url)
                .addFields({ name: 'Total Followers', value: `👤 **${followRes.data.total.toLocaleString()}**` })
                .setURL(`https://twitch.tv/${username}`)
                .setColor('#9146FF');

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.editReply('❌ Error connecting to Twitch API.');
        }
    },
};
