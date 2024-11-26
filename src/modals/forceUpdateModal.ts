import { ModalSubmitInteraction } from 'discord.js'
import Modal from '../templates/modal.ts'
import { prisma } from '@/prisma/prismaClient.ts'
import { createEmbed } from '@/utils/embedBuilder.ts'

export default new Modal({
    customId: 'forceUpdateInfo',
    async execute(interaction: ModalSubmitInteraction) {
        await interaction.deferReply({ ephemeral: true })
        
        const phoneNumber = interaction.customId.split('_')[1]
        
        const updateData: Record<string, any> = {
            phoneNumber: interaction.fields.getTextInputValue('phoneNumber') || null,
            email: interaction.fields.getTextInputValue('email') || null,
            fullName: interaction.fields.getTextInputValue('fullName') || null,
            address: interaction.fields.getTextInputValue('address') || null,
        }

        const ownedNumbersInput = interaction.fields.getTextInputValue('ownedNumbers')
        if (ownedNumbersInput) {
            updateData.ownedNumbers = ownedNumbersInput
                .split(',')
                .map(num => num.trim())
                .filter(num => num.length > 0)
        }

        Object.keys(updateData).forEach(key => 
            updateData[key] === null && delete updateData[key]
        )
        const user = await prisma.user.findFirst({
            where: { phoneNumber }
        })

        try {
            const updatedUser = await prisma.user.update({
                where: { id: user?.id },
                data: updateData
            })

            const fields = [
                {
                    name: 'Phone Number',
                    value: updatedUser.phoneNumber || 'Not set',
                    inline: true
                },
                {
                    name: 'Email',
                    value: updatedUser.email || 'Not set',
                    inline: true
                },
                {
                    name: 'Full Name',
                    value: updatedUser.fullName || 'Not set',
                    inline: true
                },
                {
                    name: 'Address',
                    value: updatedUser.address || 'Not set',
                    inline: false
                },
                {
                    name: 'Owned Numbers',
                    value: updatedUser.ownedNumbers.length > 0 
                        ? updatedUser.ownedNumbers.join(', ')
                        : 'None',
                    inline: false
                },
                {
                    name: 'Verification Status',
                    value: `${updatedUser.isVerified ? '✅ Verified' : '❌ Unverified'}`,
                    inline: true
                },
                {
                    name: 'Last Updated',
                    value: updatedUser.updatedAt.toLocaleString(),
                    inline: true
                }
            ]

            await interaction.editReply({
                embeds: [createEmbed({
                    title: '✅ Phone Number Information Updated',
                    description: `Successfully updated information for ${phoneNumber}`,
                    fields,
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