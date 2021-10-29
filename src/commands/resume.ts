import { SlashCommandBuilder } from "@discordjs/builders";
import { serverQueueProps } from "../interfaces/Queue";

const resume = {
  data: new SlashCommandBuilder()
    .setName("resume")
    .setDescription("Undo pause command"),
  async execute(interaction: any) {
    const guildId = interaction.guild.id;

    const serverQueue = interaction.client.queue.get(
      guildId,
    ) as serverQueueProps;

    if (serverQueue && !serverQueue.playing) {
      serverQueue.playing = true;
      serverQueue.player?.unpause();
      return interaction.reply("Unpaused");
    } else {
      return interaction.reply("Playing again");
    }
  },
};

export default resume;
