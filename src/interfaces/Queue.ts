import { AudioPlayer, VoiceConnection } from "@discordjs/voice";
import { TextChannel } from "discord.js";

export interface QueueConstructProps {
  textChannel: TextChannel | null;
  connection: VoiceConnection;
  player: AudioPlayer | null;
  songs: any[];
  playing: boolean;
}
