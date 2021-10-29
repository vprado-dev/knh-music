import { SlashCommandBuilder } from "@discordjs/builders";
import { VoiceChannel } from "discord.js";
import ytdl from "ytdl-core";
import {
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  StreamType,
} from "@discordjs/voice";

const queue = new Map();

const play = async (guildId: string, song: { title: string; url: string }) => {
  const songQueue = queue.get(guildId);

  if (!song) {
    songQueue.connection.disconnect();
    queue.delete(guildId);
    return;
  }

  const stream = ytdl(song.url, { filter: "audioonly" });

  const audioResource = createAudioResource(stream, {
    inputType: StreamType.Arbitrary,
  });

  const audioPlayer = createAudioPlayer();

  audioPlayer.play(audioResource);

  songQueue.connection.subscribe(audioPlayer);

  audioPlayer.on(AudioPlayerStatus.Idle, async () => {
    songQueue.songs.shift();
    await play(guildId, songQueue.songs[0]);
  });

  songQueue.textChannel.send(`Tocando... **${song.title}**`);
};

const addVideoToQueue = async (
  interaction: any,
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
      connection: {},
      songs: [] as Array<{ title: string; url: string }>,
      volume: 5,
      playing: true,
    } as any;

    queue.set(guildId, queueConstruct);

    queueConstruct.songs.push(song);

    try {
      const connection = joinVoiceChannel({
        channelId: interaction.member.voice.channel.id,
        guildId: interaction.guild.id,
        adapterCreator:
          interaction.member.voice.channel.guild.voiceAdapterCreator,
      });

      queueConstruct.connection = connection;
      await play(guildId, queueConstruct.songs[0]);
    } catch (err) {
      console.error(err);
      queue.delete(guildId);
    }
  } else {
    serverQueue.songs.push(song);
  }

  return song.title;
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
      const song = await addVideoToQueue(
        interaction,
        input,
        serverQueue,
        textChannel,
        voiceChannel,
        guildId,
      );

      return interaction.reply(`Queued ${song}`);
    }

    return interaction.reply("Pong!");
  },
};

export default ping;
