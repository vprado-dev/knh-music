import Soundcloud, { SoundcloudTrackV2 } from "soundcloud.ts";
import { createQueue } from "./createQueue";
import { playSong } from "./playSong";

export const addSoundcloudPlaylist = async (
  interaction: any,
  soundcloud: Soundcloud,
  tracks: SoundcloudTrackV2[],
) => {
  const guildId = interaction.guild.id;

  const serverQueue = interaction.client.queue.get(guildId);

  const songs = tracks.map((track) => ({
    title: track.title,
    url: track.permalink_url,
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
