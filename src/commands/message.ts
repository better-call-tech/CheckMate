import { ChatInputCommandInteraction, SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, PermissionFlagsBits } from 'discord.js'
import Command from '../templates/command.ts'

export default new Command({
    data: new SlashCommandBuilder()
        .setName('message')
        .setDescription('Admin: Send a direct message to a user')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option => 
            option.setName('user')
                .setDescription('User to message')
                .setRequired(true)) as SlashCommandBuilder,

    async execute(interaction: ChatInputCommandInteraction) {

        const targetUser = interaction.options.getUser('user', true);

        const modal = new ModalBuilder()
            .setCustomId(`sendDm_${targetUser.id}`)
            .setTitle(`Message to ${targetUser.username}`);

        const messageInput = new TextInputBuilder()
            .setCustomId('messageContent')
            .setLabel('Message Content')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Enter your message here...')
            .setRequired(true)
            .setMaxLength(2000);

        const actionRow = new ActionRowBuilder<TextInputBuilder>()
            .addComponents(messageInput);

        modal.addComponents(actionRow);
        await interaction.showModal(modal);
    }
}); 