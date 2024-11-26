import { ButtonInteraction, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js'
import Button from '../templates/button.ts'

export default new Button({
    customId: 'sendMessage',
    async execute(interaction: ButtonInteraction) {
        const userId = interaction.customId.split('_')[1];
        const user = await interaction.client.users.fetch(userId);

        const modal = new ModalBuilder()
            .setCustomId(`sendDm_${userId}`)
            .setTitle(`Message to ${user.username}`);

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