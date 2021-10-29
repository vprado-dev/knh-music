import { SlashCommandBuilder } from "@discordjs/builders";
import { serverQueueProps } from "../interfaces/Queue";

const pause = {
  data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Pause music queue!"),
  async execute(interaction: any) {
    const guildId = interaction.guild.id;

    const serverQueue = interaction.client.queue.get(
      guildId,
    ) as serverQueueProps;

    if (serverQueue && serverQueue.playing) {
      serverQueue.playing = false;
      serverQueue.player?.pause();
      return interaction.reply("Paused");
    } else {
      return interaction.reply("There are no musics playing");
    }
  },
};

export default pause;
