import { ModalSubmitInteraction, ButtonStyle } from 'discord.js'
import Modal from '../templates/modal.ts'
import { prisma } from '@/prisma/prismaClient.ts'
import { createEmbed } from '@/utils/embedBuilder.ts'
import { createButton } from '@/utils/buttonBuilder.ts'
import { createActionRows } from '@/utils/actionRowBuilder.ts'

function isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^(\+\d{1,3}[- ]?)?\d{10}$/
    return phoneRegex.test(phone)
}

export default new Modal({
    customId: 'claimModal',
    async execute(interaction: ModalSubmitInteraction) {
        await interaction.deferReply({ ephemeral: true })
        
        const phoneNumber = interaction.fields.getTextInputValue('phoneNumber')
        const email = interaction.fields.getTextInputValue('email')
        const member = await interaction.guild?.members.fetch(interaction.user.id)
        
        const hasUnverified = member?.roles.cache.has('1310751635235934288')
        const hasPlanPayer = member?.roles.cache.has('1310751749023207454')
        
        try {
            await prisma.user.update({
                where: { discordId: interaction.user.id },
                data: {
                    phoneNumber,
                    email,
                    lastVerified: new Date()
                }
            })

            const isPlanPayer = isValidPhoneNumber(phoneNumber)
            let roleUpdateStatus = ''
            
            if (member && isPlanPayer) {
                if (hasUnverified) {
                    await member.roles.remove('1310751635235934288')
                    roleUpdateStatus += '🔄 Access Granted: Removed Unverified Status\n'
                }
                if (!hasPlanPayer) {
                    await member.roles.add('1310751749023207454')
                    roleUpdateStatus += '✨ Access Granted: Plan Payer Status Added\n'
                }
            }

            const collectInfoButton = createButton({
                customId: 'collectInfo',
                label: '📝 Add Personal Information',
                style: ButtonStyle.Primary
            })

            const rows = createActionRows([collectInfoButton])

            const embed = createEmbed({
                title: `${isPlanPayer ? '✅ Plan Verification Status' : '⏳ Pending Verification'}`,
                description: `Hey ${interaction.user.toString()}, here's your membership status:`,
                fields: [
                    {
                        name: '📱 Phone Number',
                        value: `\`${phoneNumber}\`\n${isPlanPayer ? '✅ Active Plan Found' : '⏳ No Active Plan Found'}`,
                        inline: true
                    },
                    {
                        name: '📧 Contact Email',
                        value: email,
                        inline: true
                    },
                    {
                        name: '🎭 Role Updates',
                        value: roleUpdateStatus || 'No changes to access levels',
                        inline: false
                    },
                    {
                        name: '🔍 Membership Status',
                        value: isPlanPayer 
                            ? '✅ Verified Plan Payer - Full Access Granted'
                            : '⚠️ Unverified Payer - Limited Access',
                        inline: false
                    },
                    {
                        name: '📋 Required Next Steps',
                        value: isPlanPayer 
                            ? '**Important:** Please click the button below to complete your verification by adding:\n' +
                              '• Full Name\n' +
                              '• Date of Birth\n' +
                              '• Address\n\n' +
                              '⚠️ Your verification process is not complete until you provide this information!'
                            : '❌ Your phone number is not associated with an active plan.\n' +
                              'If you believe this is an error, please contact support with proof of your active subscription.',
                        inline: false
                    }
                ],
                color: isPlanPayer ? '#00ff00' : '#ff9900',
                footer: 'Plan Verification System • Contact support for assistance',
                timestamp: true
            })

            await interaction.editReply({
                embeds: [embed],
                components: isPlanPayer ? rows : []
            })

        } catch (error) {
            console.error('Error processing verification:', error)
            const errorEmbed = createEmbed({
                title: '⚠️ Verification System Error',
                description: 'We encountered an issue while verifying your plan status.',
                color: '#ff0000',
                fields: [
                    {
                        name: '🔄 What to do?',
                        value: 'Please try again or contact support if the issue persists.',
                        inline: false
                    }
                ],
                footer: 'Plan Verification System',
                timestamp: true
            })

            await interaction.editReply({
                embeds: [errorEmbed]
            })
        }
    }
}) 