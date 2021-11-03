import { joinVoiceChannel } from "@discordjs/voice";
import { ServerQueueProps } from "../interfaces/Queue";

export const createQueue = async (interaction: any, guildId: string) => {
  const queue = interaction.client.queue as Map<string, ServerQueueProps>;

  try {
    const textChannel = interaction.channel;
    const queueConstruct: ServerQueueProps = {
      connection: joinVoiceChannel({
        channelId: interaction.member.voice.channel.id,
        guildId: interaction.guild.id,
        adapterCreator:
          interaction.member.voice.channel.guild.voiceAdapterCreator,
      }),
      playing: true,
      player: null,
      songs: [],
      textChannel,
    };

    queue.set(guildId, queueConstruct);

    return queueConstruct;
  } catch (err) {
    console.error(err);
    queue.delete(guildId);
    return;
  }
};
