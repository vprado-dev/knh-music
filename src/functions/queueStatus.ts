import { Queue } from "distube";

export const queueStatus = (queue: Queue) =>
  `Volume: \`${queue.volume}%\` | Loop: \`${
    queue.repeatMode
      ? queue.repeatMode === 2
        ? "All Queue"
        : "This Song"
      : "Off"
  }\` | Autoplay: \`${queue.autoplay ? "On" : "Off"}\` | Filter: \`${
    queue.filters.join(", ") || "Off"
  }\``;
