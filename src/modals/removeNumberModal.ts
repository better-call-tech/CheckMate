import { ModalSubmitInteraction } from 'discord.js'
import Modal from '../templates/modal.ts'
import { prisma } from '@/prisma/prismaClient.ts'
import { createEmbed } from '@/utils/embedBuilder.ts'

export default new Modal({
    customId: 'confirmRemoveNumber',
    async execute(interaction: ModalSubmitInteraction) {
        await interaction.deferReply({ ephemeral: true })
        
        const userId = interaction.customId.split('_')[1]
        const confirmation = interaction.fields.getTextInputValue('confirmation')

        if (confirmation.toUpperCase() !== 'CONFIRM') {
            await interaction.editReply({
                embeds: [createEmbed({
                    title: '❌ Operation Cancelled',
                    description: 'Number removal was cancelled.',
                    color: '#ff0000',
                    footer: 'Admin System',
                    timestamp: true
                })]
            })
            return
        }

        try {
            const user = await prisma.user.findUnique({ where: { discordId: userId } })
            if (user?.phoneNumber) {
                await prisma.user.update({
                    where: { discordId: userId },
                    data: { phoneNumber: null }
                })
            }
            await interaction.editReply({
                embeds: [createEmbed({
                    title: '✅ Number Removed',
                    description: `Successfully removed phone number from <@${userId}>.`,
                    color: '#00ff00',
                    footer: 'Admin System',
                    timestamp: true
                })]
            })
        } catch (error) {
            console.error('Error removing number:', error)
            await interaction.editReply({
                embeds: [createEmbed({
                    title: '❌ Error',
                    description: 'Failed to remove the phone number.',
                    color: '#ff0000',
                    footer: 'Admin System',
                    timestamp: true
                })]
            })
        }
    }
}) 