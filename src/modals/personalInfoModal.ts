import { ModalSubmitInteraction } from 'discord.js'
import Modal from '../templates/modal.ts'
import { prisma } from '@/prisma/prismaClient.ts'
import { createEmbed } from '@/utils/embedBuilder.ts'

const PLAN_TYPES = {
    '1': 'NO_HOTSPOT',
    '2': 'HOTSPOT',
    '3': 'HOTSPOT_WATCH',
    '4': 'NO_HOTSPOT_WATCH',
    '5': 'EIP_HOTSPOT',
    '6': 'EIP_NO_HOTSPOT',
    '7': 'EIP_HOTSPOT_WATCH',
    '8': 'BASIC'
} as const;

export default new Modal({
    customId: 'personalInfoModal',
    async execute(interaction: ModalSubmitInteraction) {
        await interaction.deferReply({ ephemeral: true })
        
        try {
            const user = await prisma.user.findFirst({
                where: { discordId: interaction.user.id }
            })
            const fullName = interaction.fields.getTextInputValue('fullName')
            const address = interaction.fields.getTextInputValue('address')
            const ownedNumbers = interaction.fields.getTextInputValue('ownedNumbers')
                .split(',')
                .map(num => num.trim())
                .filter(num => num.length > 0)
            const planTypeInput = interaction.fields.getTextInputValue('planType')
            
            const planType = PLAN_TYPES[planTypeInput as keyof typeof PLAN_TYPES]
            if (!planType) {
                throw new Error('Invalid plan type selected')
            }

            await prisma.user.update({
                where: { id: user?.id },
                data: {
                    fullName,
                    address,
                    ownedNumbers,
                    planType
                }
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
                        name: '📍 Address',
                        value: address,
                        inline: false
                    },
                    {
                        name: '📱 Phone Numbers',
                        value: ownedNumbers.length > 0 ? ownedNumbers.join(', ') : 'None provided',
                        inline: false
                    },
                    {
                        name: '📋 Plan Type',
                        value: planType.replace(/_/g, ' '),
                        inline: true
                    }
                ],
                color: '#00ff00',
                footer: 'Personal Information System',
                timestamp: true
            })

            await interaction.editReply({ embeds: [embed] })
        } catch (error) {
            console.error('Error saving personal information:', error)
            const errorEmbed = createEmbed({
                title: '❌ Error',
                description: 'An error occurred while saving your information. Please try again.',
                color: '#ff0000',
                footer: 'Error',
                timestamp: true
            })
            await interaction.editReply({ embeds: [errorEmbed] })
        }
    }
}) 