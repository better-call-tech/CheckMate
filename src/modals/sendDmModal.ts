import { ModalSubmitInteraction } from 'discord.js'
import Modal from '../templates/modal.ts'
import { createEmbed } from '@/utils/embedBuilder.ts'

export default new Modal({
    customId: 'sendDm',
    async execute(interaction: ModalSubmitInteraction) {
        await interaction.deferReply({ ephemeral: true })
        
        const userId = interaction.customId.split('_')[1]
        const messageContent = interaction.fields.getTextInputValue('messageContent')

        try {
            const targetUser = await interaction.client.users.fetch(userId!)
            
            await targetUser.send({
                embeds: [createEmbed({
                    title: '📬 Message from Administrator',
                    description: messageContent,
                    color: '#0099ff',
                    footer: `Sent from ${interaction.guild?.name}`,
                    timestamp: true
                })]
            })

            await interaction.editReply({
                embeds: [createEmbed({
                    title: '✅ Message Sent',
                    description: `Successfully sent message to ${targetUser.toString()}`,
                    fields: [
                        {
                            name: '📝 Message Content',
                            value: messageContent,
                            inline: false
                        }
                    ],
                    color: '#00ff00',
                    footer: 'Admin System',
                    timestamp: true
                })]
            })
        } catch (error) {
            console.error('Error sending DM:', error)
            await interaction.editReply({
                embeds: [createEmbed({
                    title: '❌ Error',
                    description: 'Failed to send the direct message. The user might have DMs disabled.',
                    color: '#ff0000',
                    footer: 'Admin System',
                    timestamp: true
                })]
            })
        }
    }
}) 