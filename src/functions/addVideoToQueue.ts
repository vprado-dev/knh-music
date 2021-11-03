import { createQueue } from "./createQueue";
import { playSong } from "./playSong";

export const addVideoToQueue = async (
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
      playSong(interaction, queueConstruct.songs[0]);
    }
  } else {
    serverQueue.songs.push(song);
  }

  return song.title;
};
