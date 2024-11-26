import { ModalSubmitInteraction } from 'discord.js'
import Modal from '../templates/modal.ts'
import { prisma } from '@/prisma/prismaClient.ts'
import { createEmbed } from '@/utils/embedBuilder.ts'

export default new Modal({
    customId: 'confirmAddNumber',
    async execute(interaction: ModalSubmitInteraction) {
        await interaction.deferReply({ ephemeral: true })
        
        // eslint-disable-next-line no-unused-vars
        const [_, userId, phoneNumber] = interaction.customId.split('_')
        const confirmation = interaction.fields.getTextInputValue('confirmation')

        if (confirmation !== 'CONFIRM') {
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
            await prisma.user.upsert({
                where: { discordId: userId },
                update: { phoneNumber },
                create: { discordId: userId, phoneNumber, username: userId }
            })

            await interaction.editReply({
                embeds: [createEmbed({
                    title: '✅ Number Added',
                    description: `Successfully added phone number to <@${userId}>.`,
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