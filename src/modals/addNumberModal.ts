import { ModalSubmitInteraction } from 'discord.js'
import Modal from '../templates/modal.ts'
import { prisma } from '@/prisma/prismaClient.ts'
import { createEmbed } from '@/utils/embedBuilder.ts'

export default new Modal({
    customId: 'confirmAddNumber',
    async execute(interaction: ModalSubmitInteraction) {
        await interaction.deferReply({ ephemeral: true })
        
        const phoneNumber = interaction.customId.split('_')[1]
        const confirmation = interaction.fields.getTextInputValue('confirmation')

        if (confirmation.toUpperCase() !== 'CONFIRM') {
            await interaction.editReply({
                embeds: [createEmbed({
                    title: '❌ Operation Cancelled',
                    description: 'Number addition was cancelled.',
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

            if (verifiedNumbers?.numbers.includes(phoneNumber)) {
                await interaction.editReply({
                    embeds: [createEmbed({
                        title: '❌ Number Already Exists',
                        description: 'This number is already in the verified numbers list.',
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
                        push: phoneNumber
                    }
                }
            })

            await interaction.editReply({
                embeds: [createEmbed({
                    title: '✅ Number Added',
                    description: 'Successfully added number to verified numbers list.',
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
            console.error('Error adding number:', error)
            await interaction.editReply({
                embeds: [createEmbed({
                    title: '❌ Error',
                    description: 'Failed to add the phone number.',
                    color: '#ff0000',
                    footer: 'Admin System',
                    timestamp: true
                })]
            })
        }
    }
}) 