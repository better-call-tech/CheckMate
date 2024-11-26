import { ChatInputCommandInteraction, SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, PermissionFlagsBits } from 'discord.js'
import Command from '../templates/command.ts'

export default new Command({
    data: new SlashCommandBuilder()
        .setName('remove-number')
        .setDescription('Admin: Remove phone number from user')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option => 
            option.setName('user')
                .setDescription('User to remove number from')
                .setRequired(true)) as SlashCommandBuilder,

    async execute(interaction: ChatInputCommandInteraction) {

        const targetUser = interaction.options.getUser('user', true);

        const modal = new ModalBuilder()
            .setCustomId(`confirmRemoveNumber_${targetUser.id}`)
            .setTitle('Confirm Number Removal');

        const confirmInput = new TextInputBuilder()
            .setCustomId('confirmation')
            .setLabel(`Type "CONFIRM" to remove number from ${targetUser.username}`)
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const actionRow = new ActionRowBuilder<TextInputBuilder>()
            .addComponents(confirmInput);

        modal.addComponents(actionRow);
        await interaction.showModal(modal);
    }
}); 