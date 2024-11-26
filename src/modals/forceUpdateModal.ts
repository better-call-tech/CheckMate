import { ModalSubmitInteraction } from 'discord.js'
import Modal from '../templates/modal.ts'
import { prisma } from '@/prisma/prismaClient.ts'
import { createEmbed } from '@/utils/embedBuilder.ts'

export default new Modal({
    customId: 'forceUpdateInfo',
    async execute(interaction: ModalSubmitInteraction) {
        await interaction.deferReply({ ephemeral: true })
        
        const userId = interaction.customId.split('_')[1]
        
        const updateData: Record<string, string | null> = {
            phoneNumber: interaction.fields.getTextInputValue('phoneNumber') || null,
            email: interaction.fields.getTextInputValue('email') || null,
            fullName: interaction.fields.getTextInputValue('fullName') || null,
            address: interaction.fields.getTextInputValue('address') || null,
            dateOfBirth: interaction.fields.getTextInputValue('dateOfBirth') || null
        }

        Object.keys(updateData).forEach(key => 
            updateData[key] === null && delete updateData[key]
        )

        try {
            const updatedUser = await prisma.user.update({
                where: { discordId: userId },
                data: {
                    ...updateData,
                    updatedAt: new Date()
                }
            })

            const fields = Object.entries(updateData).map(([key, value]) => ({
                name: key.charAt(0).toUpperCase() + key.slice(1),
                value: value || 'Not set',
                inline: true
            }))

            await interaction.editReply({
                embeds: [createEmbed({
                    title: '✅ User Information Updated',
                    description: `Successfully updated information for <@${userId}>`,
                    fields: [
                        ...fields,
                        {
                            name: 'Last Updated',
                            value: updatedUser.updatedAt.toLocaleString(),
                            inline: false
                        }
                    ],
                    color: '#00ff00',
                    footer: 'Admin System',
                    timestamp: true
                })]
            })

        } catch (error) {
            console.error('Error updating user information:', error)
            await interaction.editReply({
                embeds: [createEmbed({
                    title: '❌ Error',
                    description: 'Failed to update user information.',
                    color: '#ff0000',
                    footer: 'Admin System',
                    timestamp: true
                })]
            })
        }
    }
}) 