import { ChatInputCommandInteraction, SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, PermissionFlagsBits } from 'discord.js'
import Command from '../templates/command.ts'

export default new Command({
    data: new SlashCommandBuilder()
        .setName('add-number')
        .setDescription('Admin: Add phone number to verified numbers')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option.setName('phone')
                .setDescription('Phone number to add')
                .setRequired(true)) as SlashCommandBuilder,

    async execute(interaction: ChatInputCommandInteraction) {
        const phoneNumber = interaction.options.getString('phone', true);

        const modal = new ModalBuilder()
            .setCustomId(`confirmAddNumber_${phoneNumber}`)
            .setTitle('Confirm Number Addition');

        const confirmInput = new TextInputBuilder()
            .setCustomId('confirmation')
            .setLabel(`Add ${phoneNumber} to verified list?`)
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setPlaceholder('Type CONFIRM to proceed');

        const actionRow = new ActionRowBuilder<TextInputBuilder>()
            .addComponents(confirmInput);

        modal.addComponents(actionRow);
        await interaction.showModal(modal);
    }
}); 