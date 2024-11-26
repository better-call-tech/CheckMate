import { ChatInputCommandInteraction, SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, PermissionFlagsBits } from 'discord.js'
import Command from '../templates/command.ts'

export default new Command({
    data: new SlashCommandBuilder()
        .setName('add-number')
        .setDescription('Admin: Add phone number to user')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option => 
            option.setName('user')
                .setDescription('User to add number to')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('phone')
                .setDescription('Phone number to add')
                .setRequired(true)) as SlashCommandBuilder,

    async execute(interaction: ChatInputCommandInteraction) {

        const targetUser = interaction.options.getUser('user', true);
        const phoneNumber = interaction.options.getString('phone', true);

        const modal = new ModalBuilder()
            .setCustomId(`confirmAddNumber_${targetUser.id}_${phoneNumber}`)
            .setTitle('Confirm Number Addition');

        const confirmInput = new TextInputBuilder()
            .setCustomId('confirmation')
            .setLabel(`Type "CONFIRM" to add number to ${targetUser.username}`)
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const actionRow = new ActionRowBuilder<TextInputBuilder>()
            .addComponents(confirmInput);

        modal.addComponents(actionRow);
        await interaction.showModal(modal);
    }
}); 