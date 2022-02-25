import { SlashCommandBuilder } from "@discordjs/builders";
import { Client, MessageEmbed } from "discord.js";

const pause = {
  data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Pause music queue!"),
  async execute(interaction: any, client: Client) {
    const queue = await client.distube.getQueue(interaction);
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      return interaction.reply({
        content: "Please join a voice channel!",
        ephemeral: true,
      });
    }
    if (!queue) {
      const queueError = new MessageEmbed()
        .setDescription("There is Nothing Playing")
        .setColor("RANDOM");
      return interaction.reply({ embeds: [queueError] });
    }
    if (
      interaction.member.guild.me.voice.channelId !==
      interaction.member.voice.channelId
    ) {
      return interaction.reply({
        content: "You are not on the same voice channel as me!",
        ephemeral: true,
      });
    }
    try {
      await client.distube.pause(interaction);
      await interaction.reply("***Paused the current track***");
      const message = await interaction.fetchReply();
      await message.react("⏸");
    } catch {
      interaction.reply({
        content: " The queue has been paused already",
        ephemeral: true,
      });
    }
  },
};

export default pause;
