import { SlashCommandBuilder } from "@discordjs/builders";
import { Client, VoiceChannel } from "discord.js";

const play = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Add a songs to queue")
    .addStringOption((string) =>
      string
        .setName("input")
        .setDescription("Play a given song name/URL in the voice channel")
        .setRequired(true),
    ),
  async execute(interaction: any, client: Client) {
    const voiceChannel = interaction.member.voice.channel as VoiceChannel;
    if (!voiceChannel) {
      return interaction.reply({
        content: "You need to be in a voice channel",
        ephemeral: true,
      });
    }

    const queue = client.distube.getQueue(interaction);
    const query = interaction.options.get("input").value;

    if (queue) {
      if (
        interaction.member.guild.me.voice.channelId !==
        interaction.member.voice.channelId
      ) {
        return interaction.reply({
          content: "You are not on the same voice channel as me!",
          ephemeral: true,
        });
      }
    }

    await interaction.reply("🔍 **Searching and attempting...**");
    await interaction.editReply("Searching done :ok_hand: ");
    client.distube.play(voiceChannel, query, {
      textChannel: interaction.channel,
      member: interaction.member,
    });
  },
};

export default play;
