import { Collection } from "discord.js";
import DisTube from "distube";

declare module "discord.js" {
  export interface Command {
    data: any;
    execute: (interaction: any, client: Client) => Promise<any>; // Can be `Promise<SomeType>` if using async
  }
  export interface Client {
    commands: Collection<unknown, Command>;
    distube: DisTube;
  }
}
