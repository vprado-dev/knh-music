import ytpl from "ytpl";
import { createQueue } from "./createQueue";
import { playSong } from "./playSong";

export const addPlaylistToQueue = async (interaction: any, input: string) => {
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
      playSong(interaction, queueConstruct.songs[0]);
    }
  } else {
    for (const song of songs) {
      serverQueue.songs.push(song);
    }
  }

  return songs.length;
};
