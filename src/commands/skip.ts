import { SlashCommandBuilder } from "@discordjs/builders";
import { ServerQueueProps } from "../interfaces/Queue";

const skip = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skips to the next song"),
  async execute(interaction: any) {
    const guildId = interaction.guild.id;

    const serverQueue = interaction.client.queue.get(
      guildId,
    ) as ServerQueueProps;

    if (serverQueue && serverQueue.playing) {
      serverQueue.player?.stop();
      return interaction.reply("Skipped");
    } else {
      return interaction.reply("Nothing to skip");
    }
  },
};

export default skip;
