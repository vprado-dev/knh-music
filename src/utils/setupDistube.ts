import { Client } from "discord.js";
import { DisTube } from "distube";
import { SoundCloudPlugin } from "@distube/soundcloud";
import { SpotifyPlugin } from "@distube/spotify";
import { YtDlpPlugin } from "@distube/yt-dlp";

export const distube = (client: Client) =>
  new DisTube(client, {
    youtubeDL: false,
    leaveOnEmpty: true,
    emptyCooldown: 30,
    leaveOnFinish: false,
    emitNewSongOnly: true,
    updateYouTubeDL: true,
    nsfw: true,
    plugins: [new SoundCloudPlugin(), new SpotifyPlugin(), new YtDlpPlugin()],
  });
