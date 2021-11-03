import {
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  StreamType,
} from "@discordjs/voice";
import scdl from "soundcloud-downloader";
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

  let stream: any;
  if (ytdl.validateURL(song.url)) {
    stream = ytdl(song.url, { filter: "audioonly" });
  } else {
    stream = await scdl.download(song.url);
  }

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
