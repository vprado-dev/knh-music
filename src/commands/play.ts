import { SlashCommandBuilder } from "@discordjs/builders";
import { VoiceChannel } from "discord.js";
import ytdl from "ytdl-core";
import ytpl from "ytpl";

const queue = new Map();

const addVideoToQueue = async (
  url: string,
  serverQueue: any,
  textChannel: any,
  voiceChannel: any,
  guildId: string,
) => {
  const songInfo = await ytdl.getInfo(url);

  const song = {
    title: songInfo.videoDetails.title,
    url: songInfo.videoDetails.video_url,
  };

  if (!serverQueue) {
    const queueConstruct = {
      textChannel,
      voiceChannel,
      connection: null,
      songs: [] as Array<Record<string, any>>,
      volume: 5,
      playing: true,
    };

    queue.set(guildId, queueConstruct);

    queueConstruct.songs.push(song);

    try {
      const connection = await voiceChannel.join();
      queueConstruct.connection = connection;
    } catch (err) {
      console.error(err);
      queue.delete(guildId);
    }
  }
};

const ping = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Added new Song to queue")
    .addStringOption((string) =>
      string
        .setName("input")
        .setDescription("Play a given song name/URL in the voice channel"),
    ),
  async execute(interaction: any) {
    const voiceChannel = interaction.member.voice.channel as VoiceChannel;
    const guildId = interaction.guild.id;

    const serverQueue = queue.get(guildId);

    if (!voiceChannel) {
      return interaction.reply({
        content: "You need to be in a voice channel",
        ephemeral: true,
      });
    }

    const permissions = voiceChannel.permissionsFor(interaction.client.user);

    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
      return interaction.reply({
        content: "I need permission to speak in this channel",
        ephemeral: true,
      });
    }

    const input = interaction.options.getString("input") as string;
    const textChannel = interaction.channel;

    if (ytdl.validateURL(input)) {
      await addVideoToQueue(
        input,
        serverQueue,
        textChannel,
        voiceChannel,
        guildId,
      );
    }

    return interaction.reply("Pong!");
  },
};

export default ping;
