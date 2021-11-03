import ytsr from "ytsr";
import { addVideoToQueue } from "./addVideoToQueue";

export const addSpotifySong = async (interaction: any, name: any) => {
  const resultSearch = (await ytsr(name, { limit: 1 })) as any;
  const video = resultSearch.items[0].url;
  await addVideoToQueue(interaction, video);
};

export const addSpotifyPlaylist = async (interaction: any, data: any) => {
  const names = data.tracks.items.map((item: any) => item.track.name);

  await Promise.allSettled(
    names.map(async (name: string) => {
      const result = await ytsr.getFilters(name);

      const videoFilter = result.get("Type")?.get("Video") as any;

      const resultSearch = (await ytsr(videoFilter.url, { limit: 1 })) as any;

      const song = {
        url: resultSearch.items[0].url,
        title: resultSearch.items[0].title,
      };
      await addVideoToQueue(interaction, song);
    }),
  );
  return names.length;
};
