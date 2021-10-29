import { Collection } from "discord.js";
import { ServerQueueProps } from "./interfaces/Queue";

declare module "discord.js" {
  export interface Command {
    data: any;
    execute: (interaction: any) => Promise<any>; // Can be `Promise<SomeType>` if using async
  }
  export interface Client {
    commands: Collection<unknown, Command>;
    queue: Map<string, ServerQueueProps>;
  }
}
