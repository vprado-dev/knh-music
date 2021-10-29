import { SlashCommandBuilder } from "@discordjs/builders";
import { serverQueueProps } from "../interfaces/Queue";

const clear = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Clear queue"),
  async execute(interaction: any) {
    const guildId = interaction.guild.id;

    const serverQueue = interaction.client.queue.get(
      guildId,
    ) as serverQueueProps;

    if (serverQueue) {
      serverQueue.songs = [];
      serverQueue.player?.stop();
      serverQueue.connection.destroy();

      return interaction.reply("Cleaned queue succefully");
    } else {
      return interaction.reply("There are no musics playing");
    }
  },
};

export default clear;
