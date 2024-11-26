import { ModalSubmitInteraction } from 'discord.js'
import Modal from '../templates/modal.ts'
import { prisma } from '@/prisma/prismaClient.ts'
import { createEmbed } from '@/utils/embedBuilder.ts'

export default new Modal({
    customId: 'confirmRemoveNumber',
    async execute(interaction: ModalSubmitInteraction) {
        await interaction.deferReply({ ephemeral: true })
        
        const phoneNumber = interaction.customId.split('_')[1]
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
            const verifiedNumbers = await prisma.verifiedNumbers.findFirst({
                where: { id: 1 }
            })

            if (!verifiedNumbers?.numbers.includes(phoneNumber)) {
                await interaction.editReply({
                    embeds: [createEmbed({
                        title: '❌ Number Not Found',
                        description: 'This number is not in the verified numbers list.',
                        color: '#ff0000',
                        footer: 'Admin System',
                        timestamp: true
                    })]
                })
                return
            }

            await prisma.verifiedNumbers.update({
                where: { id: 1 },
                data: {
                    numbers: {
                        set: verifiedNumbers.numbers.filter(num => num !== phoneNumber)
                    }
                }
            })

            await interaction.editReply({
                embeds: [createEmbed({
                    title: '✅ Number Removed',
                    description: 'Successfully removed number from verified numbers list.',
                    fields: [
                        {
                            name: '📱 Phone Number',
                            value: phoneNumber,
                            inline: true
                        }
                    ],
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