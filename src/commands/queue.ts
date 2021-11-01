import { SlashCommandBuilder } from "@discordjs/builders";
import { ServerQueueProps } from "../interfaces/Queue";

const queue = {
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Shows music queue"),
  async execute(interaction: any) {
    const guildId = interaction.guild.id;

    const serverQueue = interaction.client.queue.get(
      guildId,
    ) as ServerQueueProps;

    if (serverQueue && serverQueue.playing && serverQueue.songs.length) {
      const firstMusics = serverQueue.songs.slice(0, 10);

      let msg = ``;

      for (const music of firstMusics) {
        msg += `- **${music.title}**\n`;
      }

      return interaction.reply(msg);
    } else {
      return interaction.reply("Nothing in the queue or queue does not exists");
    }
  },
};

export default queue;
