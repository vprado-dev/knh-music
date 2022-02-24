import dotenv from "dotenv-safe";
dotenv.config();

import { Client, Collection, Intents, MessageEmbed } from "discord.js";
import fs from "fs";
import path from "path";
import { setupDistube } from "./utils/setupDistube";
import { Queue } from "distube";
import { queueStatus } from "./functions/queueStatus";

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_VOICE_STATES,
  ],
});

client.commands = new Collection();

const pathCommands = path.join(__dirname, "commands");

const pathEvents = path.join(__dirname, "events");

const setup = async () => {
  const cmdFiles = await fs.promises.readdir(pathCommands);
  console.log("[#LOG]", `Carregando o total de ${cmdFiles.length} comandos.`);

  cmdFiles.forEach((file) => {
    try {
      const command = require(path.join(pathCommands, file)).default;
      client.commands.set(command.data.name, command);
    } catch (err) {
      console.error(`[#ERROR] Impossivel executar comando ${file}: ${err}`);
    }
  });

  const evntFiles = await fs.promises.readdir(pathEvents);

  console.log("[#LOG]", `Carregando o total de ${evntFiles.length} eventos.`);

  evntFiles.forEach((file) => {
    const eventName = file.split(".")[0];

    const event = require(path.join(pathEvents, file)).default;

    client.on(eventName, event.bind(null, client));
  });

  client.distube = setupDistube(client);

  client.distube
    .on("playSong", (queue: Queue, song: any) => {
      const embed = new MessageEmbed()
        .setColor("RANDOM")
        .setAuthor(
          "Started Playing",
          "https://raw.githubusercontent.com/HELLSNAKES/Music-Slash-Bot/main/assets/music.gif",
        )
        .setThumbnail(song.thumbnail)
        .setDescription(`[${song.name}](${song.url})`)
        .addField("**Views:**", song.views.toString(), true)
        .addField("**Like:**", song.likes.toString(), true)
        .addField("**Duration:**", song.formattedDuration.toString(), true)
        .addField("**Status**", queueStatus(queue).toString())
        .setFooter(`Requested by ${song.user.username}`, song.user.avatarURL())
        .setTimestamp();
      queue.textChannel.send({ embeds: [embed] });
    })
    .on("addSong", (queue, song) => {
      console.log("addSong");
      const embed = new MessageEmbed()
        .setTitle(":ballot_box_with_check: | Added song to queue")
        .setDescription(
          `\`${song.name}\` - \`${song.formattedDuration}\` - Requested by ${song.user}`,
        )
        .setColor("RANDOM")
        .setTimestamp();
      queue.textChannel.send({ embeds: [embed] });
    })
    .on("addList", (queue, playlist) => {
      console.log("addList");
      const embed = new MessageEmbed()
        .setTitle(":ballot_box_with_check: | Add list")
        .setDescription(
          `Added \`${playlist.name}\` playlist (${
            playlist.songs.length
          } songs) to queue\n${queueStatus(queue)}`,
        )
        .setColor("RANDOM")
        .setTimestamp();
      queue.textChannel.send({ embeds: [embed] });
    })
    .on("error", (textChannel, e) => {
      console.log("error");
      console.error(e);
      textChannel.send(`An error encountered: ${e}`);
    })
    .on("finishSong", (queue) => {
      console.log("finishSong");
      const embed = new MessageEmbed().setDescription(
        `:white_check_mark: | Finished playing \`${queue.songs[0].name}\``,
      );
      queue.textChannel.send({ embeds: [embed] });
    })
    .on("disconnect", (queue) => {
      console.log("disconnect");
      const embed = new MessageEmbed().setDescription(
        ":x: | Disconnected from voice channel",
      );
      queue.textChannel.send({ embeds: [embed] });
    })
    .on("empty", (queue) => {
      console.log("empty");
      const embed = new MessageEmbed().setDescription(
        ":x: | Channel is empty. Leaving the channel!",
      );
      queue.textChannel.send({ embeds: [embed] });
    })
    .on("initQueue", (queue) => {
      console.log("initQueue");
      queue.autoplay = false;
      queue.volume = 50;
    });

  client.on("error", (err) => console.error("[#ERROR]", err));
  client.login(process.env.AUTH_TOKEN);
};
setup();
