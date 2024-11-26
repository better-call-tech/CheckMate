import { ChatInputCommandInteraction, SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, PermissionFlagsBits } from 'discord.js'
import Command from '../templates/command.ts'

export default new Command({
    data: new SlashCommandBuilder()
        .setName('remove-number')
        .setDescription('Admin: Remove phone number from verified numbers')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option.setName('phone')
                .setDescription('Phone number to remove')
                .setRequired(true)) as SlashCommandBuilder,

    async execute(interaction: ChatInputCommandInteraction) {
        const phoneNumber = interaction.options.getString('phone', true);

        const modal = new ModalBuilder()
            .setCustomId(`confirmRemoveNumber_${phoneNumber}`)
            .setTitle('Confirm Number Removal');

        const confirmInput = new TextInputBuilder()
            .setCustomId('confirmation')
            .setLabel(`Type "CONFIRM" to proceed`)
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const actionRow = new ActionRowBuilder<TextInputBuilder>()
            .addComponents(confirmInput);

        modal.addComponents(actionRow);
        await interaction.showModal(modal);
    }
}); 