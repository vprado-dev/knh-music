import {
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  StreamType,
} from "@discordjs/voice";
import ytdl from "ytdl-core";
import { ServerQueueProps } from "../interfaces/Queue";

export const playSong = async (
  interaction: any,
  song: { title: string; url: string },
) => {
  const queue = interaction.client.queue as Map<string, ServerQueueProps>;
  const guildId = interaction.guild.id;
  const serverQueue = queue.get(guildId) as ServerQueueProps;

  if (!song) {
    serverQueue.connection.destroy();
    queue.delete(guildId);
    return;
  }

  const stream = ytdl(song.url, { filter: "audioonly" });

  const audioResource = createAudioResource(stream, {
    inputType: StreamType.Arbitrary,
  });

  const audioPlayer = createAudioPlayer();

  serverQueue.player = audioPlayer;

  serverQueue.player.play(audioResource);

  serverQueue.connection.subscribe(audioPlayer);

  audioPlayer.on(AudioPlayerStatus.Idle, async () => {
    serverQueue.songs.shift();
    playSong(interaction, serverQueue.songs[0]);
  });
};
