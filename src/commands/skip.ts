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

    // const inSameChannel = client.voice.connections.some(
    //   (connection) => connection.channel.id === msg.member.voice.channelID
    // )

    const userChannelId = interaction.member.voice.channelId;
    const botChannelId = serverQueue.connection.joinConfig.channelId;

    if (userChannelId !== botChannelId) {
      return interaction.reply("You must be on the same channel as the bot.");
    }

    if (serverQueue && serverQueue.playing) {
      switch (serverQueue.songs.length) {
        case 1:
          serverQueue.player?.stop();
          interaction.client.queue.delete(guildId);
          serverQueue.connection.destroy();
          return interaction.reply(`Nothing ot skip, end of queue`);
        default:
          serverQueue.player?.stop();
          return interaction.reply(
            `Skipped! Now playing **${serverQueue.songs[1].title}**`,
          );
      }
    } else {
      return interaction.reply("Nothing to skip");
    }
  },
};

export default skip;
