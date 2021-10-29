import { SlashCommandBuilder } from "@discordjs/builders";
import {
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  StreamType,
} from "@discordjs/voice";
import { VoiceChannel } from "discord.js";
import ytdl from "ytdl-core";
import { serverQueueProps } from "../interfaces/Queue";

const playSong = async (
  interaction: any,
  song: { title: string; url: string },
) => {
  const queue = interaction.client.queue as Map<string, serverQueueProps>;
  const guildId = interaction.guild.id;
  const serverQueue = queue.get(guildId) as serverQueueProps;

  if (!song) {
    serverQueue.connection.destroy();
    queue.delete(guildId);
    return;
  }

  const stream = ytdl(song.url, { filter: "audioonly" });

  const audioResource = createAudioResource(stream, {
    inputType: StreamType.Arbitrary,
  });

  const audioPlayer = createAudioPlayer();

  serverQueue.player = audioPlayer;

  serverQueue.player.play(audioResource);

  serverQueue.connection.subscribe(audioPlayer);

  audioPlayer.on(AudioPlayerStatus.Idle, async () => {
    serverQueue.songs.shift();
    await playSong(interaction, serverQueue.songs[0]);
  });

  serverQueue.textChannel?.send(`Tocando... **${song.title}**`);
};

const addVideoToQueue = async (interaction: any, input: string) => {
  const guildId = interaction.guild.id;

  const queue = interaction.client.queue as Map<string, serverQueueProps>;
  const serverQueue = interaction.client.queue.get(guildId);

  const textChannel = interaction.channel;

  const songInfo = await ytdl.getInfo(input);
  const song = {
    title: songInfo.videoDetails.title,
    url: songInfo.videoDetails.video_url,
  };

  if (!serverQueue) {
    try {
      const queueConstruct: serverQueueProps = {
        connection: joinVoiceChannel({
          channelId: interaction.member.voice.channel.id,
          guildId: interaction.guild.id,
          adapterCreator:
            interaction.member.voice.channel.guild.voiceAdapterCreator,
        }),
        playing: true,
        player: null,
        songs: [],
        textChannel,
      };

      queue.set(guildId, queueConstruct);

      queueConstruct.songs.push(song);

      if (queueConstruct.songs?.length) {
        await playSong(interaction, queueConstruct.songs[0]);
      }
    } catch (err) {
      console.error(err);
      queue.delete(guildId);
    }
  } else {
    serverQueue.songs.push(song);
  }

  return song.title;
};

const play = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Add a songs to queue")
    .addStringOption((string) =>
      string
        .setName("input")
        .setDescription("Play a given song name/URL in the voice channel"),
    ),
  async execute(interaction: any) {
    const voiceChannel = interaction.member.voice.channel as VoiceChannel;

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

    if (ytdl.validateURL(input)) {
      const song = await addVideoToQueue(interaction, input);

      return interaction.reply(`Queued ${song}`);
    }
  },
};

export default play;
