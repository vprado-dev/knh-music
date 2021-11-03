import { SlashCommandBuilder } from "@discordjs/builders";
import { ServerQueueProps } from "../interfaces/Queue";

const shuffleMusics = (array: any[]) => {
  let currentIndex = array.length,
    randomIndex;

  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
};
const shuffle = {
  data: new SlashCommandBuilder()
    .setName("shuffle")
    .setDescription("Shuffles the queue"),
  async execute(interaction: any) {
    const guildId = interaction.guild.id;

    const serverQueue = interaction.client.queue.get(
      guildId,
    ) as ServerQueueProps;

    if (serverQueue && serverQueue.playing && serverQueue.songs.length) {
      const musicPlaying = serverQueue.songs[0];

      const musics = serverQueue.songs.slice(1, serverQueue.songs.length);

      const shuffled = shuffleMusics(musics);

      serverQueue.songs = shuffled;

      serverQueue.songs.unshift(musicPlaying);

      return interaction.reply("Queue shuffled successfully");
    }
    return interaction.reply("Pong!");
  },
};

export default shuffle;
