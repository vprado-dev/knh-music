import { SlashCommandBuilder } from "@discordjs/builders";
import { VoiceChannel } from "discord.js";
import { getData } from "spotify-url-info";
import ytdl from "ytdl-core";
import ytsr from "ytsr";
import { addPlaylistToQueue } from "../functions/addPlaylistToQueue";
import { addVideoToQueue } from "../functions/addVideoToQueue";
import { addSpotifyPlaylist, addSpotifySong } from "../functions/spotify";

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
