import { SlashCommandBuilder } from "@discordjs/builders";
import {
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  StreamType,
} from "@discordjs/voice";
import { VoiceChannel } from "discord.js";
import { getData } from "spotify-url-info";
import ytdl from "ytdl-core";
import ytpl from "ytpl";
import ytsr from "ytsr";
import { ServerQueueProps } from "../interfaces/Queue";

const playSong = async (
  interaction: any,
  song: { title: string; url: string },
) => {
  const queue = interaction.client.queue as Map<string, ServerQueueProps>;
  const guildId = interaction.guild.id;
  const serverQueue = queue.get(guildId) as ServerQueueProps;

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
};

const addPlaylistToQueue = async (interaction: any, input: string) => {
  const guildId = interaction.guild.id;

  const serverQueue = interaction.client.queue.get(guildId);

  const playlistData = await ytpl(input, { limit: 500 });

  const playlistVideos = playlistData.items;

  const songs = playlistVideos.map((video) => ({
    url: video.url,
    title: video.title,
  }));

  if (!serverQueue) {
    const queueConstruct = await createQueue(interaction, guildId);

    if (!queueConstruct) {
      throw new Error("Unable to create queue");
    }

    for (const song of songs) {
      queueConstruct.songs.push(song);
    }

    if (queueConstruct.songs?.length) {
      await playSong(interaction, queueConstruct.songs[0]);
    }
  } else {
    for (const song of songs) {
      serverQueue.songs.push(song);
    }
  }

  return songs.length;
};

const createQueue = async (interaction: any, guildId: string) => {
  const queue = interaction.client.queue as Map<string, ServerQueueProps>;

  try {
    const textChannel = interaction.channel;
    const queueConstruct: ServerQueueProps = {
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

    return queueConstruct;
  } catch (err) {
    console.error(err);
    queue.delete(guildId);
    return;
  }
};

const addVideoToQueue = async (
  interaction: any,
  song: { title: string; url: string },
) => {
  const guildId = interaction.guild.id;

  const serverQueue = interaction.client.queue.get(guildId);

  if (!serverQueue) {
    const queueConstruct = await createQueue(interaction, guildId);

    if (!queueConstruct) {
      throw new Error("Unable to create queue");
    }

    queueConstruct.songs.push(song);

    if (queueConstruct.songs?.length) {
      await playSong(interaction, queueConstruct.songs[0]);
    }
  } else {
    serverQueue.songs.push(song);
  }

  return song.title;
};

const addSpotifySong = async (interaction: any, name: any) => {
  const resultSearch = (await ytsr(name, { limit: 1 })) as any;
  const video = resultSearch.items[0].url;
  await addVideoToQueue(interaction, video);
};

const addSpotifyPlaylist = async (interaction: any, data: any) => {
  const names = data.tracks.items.map((item: any) => item.track.name);

  await Promise.allSettled(
    names.map(async (name: string) => {
      const result = await ytsr.getFilters(name);

      const videoFilter = result.get("Type")?.get("Video") as any;

      const resultSearch = (await ytsr(videoFilter.url, { limit: 1 })) as any;

      const song = {
        url: resultSearch.items[0].url,
        title: resultSearch.items[0].title,
      };
      await addVideoToQueue(interaction, song);
    }),
  );
  return names.length;
};

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
      await interaction.reply("Working on it");

      const songInfo = await ytdl.getInfo(input);
      const song = {
        title: songInfo.videoDetails.title,
        url: songInfo.videoDetails.video_url,
      };

      const songName = await addVideoToQueue(interaction, song);

      return interaction.editReply(`Queued **${songName}**`);
    }

    if (input.includes("youtube.com/playlist")) {
      await interaction.reply("Working on it");

      const items = await addPlaylistToQueue(interaction, input);

      return interaction.editReply(`Queued **${items} songs**`);
    }

    if (input.includes("spotify.com")) {
      const data = await getData(input);

      switch (data.type) {
        case "playlist":
          await interaction.reply("Working on it");

          const items = await addSpotifyPlaylist(interaction, data);

          return interaction.editReply(`Queued **${items} songs**`);
        case "track":
          await interaction.reply("Working on it");

          await addSpotifySong(interaction, data.name);

          return interaction.editReply(`Queued **${data.name}**`);
        default:
          break;
      }
    }

    if (!input.includes("http")) {
      await interaction.reply("Working on it");

      const resultSearch = (await ytsr(input, { limit: 1 })) as any;
      const song = {
        url: resultSearch.items[0].url,
        title: resultSearch.items[0].title,
      };

      const songName = await addVideoToQueue(interaction, song);

      return interaction.editReply(`Queued **${songName}**`);
    }
  },
};

export default play;
