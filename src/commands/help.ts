import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";

const help = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Replies with a list of commands!"),
  async execute(interaction: any) {
    if (!interaction.isCommand()) {
      return;
    }

    await interaction.deferReply();
    const client = interaction.client;

    const helpArray = client.commands.map((cmd: any) => ({
      name: cmd.data.name,
      description: cmd.data.description,
    }));

    const embed = new MessageEmbed()
      .setColor("WHITE")
      .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
      .setAuthor("Help Command!");

    embed.setDescription(`**${helpArray[0].name}**`).addFields(
      helpArray.map(({ name, description }: any) => {
        return { name: `\`${name}\``, value: `${description}`, inline: true };
      }),
    );

    return await interaction.editReply({
      embeds: [embed],
    });
  },
};

export default help;
