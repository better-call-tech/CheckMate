import { ModalSubmitInteraction } from 'discord.js'
import Modal from '../templates/modal.ts'
import { prisma } from '@/prisma/prismaClient.ts'
import { createEmbed } from '@/utils/embedBuilder.ts'

export default new Modal({
    customId: 'personalInfoModal',
    async execute(interaction: ModalSubmitInteraction) {
        await interaction.deferReply({ ephemeral: true })
        
        try {
            const fullName = interaction.fields.getTextInputValue('fullName')
            const address = interaction.fields.getTextInputValue('address')
            const dateOfBirth = interaction.fields.getTextInputValue('dateOfBirth')

            await prisma.user.update({
                where: { discordId: interaction.user.id },
                data: { fullName, address, dateOfBirth }
            })

            const embed = createEmbed({
                title: '✅ Personal Information Updated',
                description: `Thank you ${interaction.user.toString()}, your information has been saved.`,
                fields: [
                    {
                        name: '👤 Full Name',
                        value: fullName,
                        inline: true
                    },
                    {
                        name: '📅 Date of Birth',
                        value: dateOfBirth,
                        inline: true
                    },
                    {
                        name: '📍 Address',
                        value: address,
                        inline: false
                    }
                ],
                color: '#00ff00',
                footer: 'Personal Information System',
                timestamp: true
            })

            await interaction.editReply({ embeds: [embed] })
        } catch (error) {
            console.error('Error saving personal information:', error)
            await interaction.editReply({
                content: 'An error occurred while saving your information. Please try again.'
            })
        }
    }
}) 