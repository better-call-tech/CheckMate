import { ModalSubmitInteraction, ButtonStyle } from 'discord.js'
import Modal from '../templates/modal.ts'
import { prisma } from '@/prisma/prismaClient.ts'
import { createEmbed } from '@/utils/embedBuilder.ts'
import { createButton } from '@/utils/buttonBuilder.ts'
import { createActionRows } from '@/utils/actionRowBuilder.ts'
import { isValidPhoneNumber } from '@/utils/verificationUtils.ts'

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
            const user = await prisma.user.findFirst({
                where: { phoneNumber }
            })
            if (user && user.discordId && user.discordId !== interaction.user.id) {
                await interaction.editReply({
                    embeds: [createEmbed({
                        title: '❌ Number Already Claimed',
                        description: 'This number is already claimed by another user on the server.',
                        color: '#ff0000',
                        footer: 'Claim System',
                        timestamp: true
                    })]
                })
                return
            }
            const oldNumbers = await prisma.user.findMany({
                where: { 
                    discordId: interaction.user.id,
                    NOT: { phoneNumber }
                }
            })

            if (oldNumbers.length > 0) {
                await prisma.user.deleteMany({
                    where: { id: { in: oldNumbers.map(number => number.id) } }
                })
            }
            if (!user) {
                await prisma.user.create({
                    data: {
                        phoneNumber,
                        email,
                        username: interaction.user.username,
                        discordId: interaction.user.id,
                        lastVerified: new Date()
                    }
                })
            } else {
                await prisma.user.update({
                    where: { id: user.id },
                data: {
                    email,
                        username: interaction.user.username,
                        discordId: interaction.user.id,
                        lastVerified: new Date()
                    }
                })
            }

            const isPlanPayer = await isValidPhoneNumber(phoneNumber)
            let roleUpdateStatus = ''
            
            if (member) {
                if (isPlanPayer) {
                    if (hasUnverified) {
                        await member.roles.remove('1310751635235934288')
                        roleUpdateStatus += '🔄 Removed: Unverified\n'
                    }
                    if (!hasPlanPayer) {
                        await member.roles.add('1310751749023207454')
                        roleUpdateStatus += '✨ Added: Plan Payer\n'
                    }
                } else {
                    if (!hasUnverified) {
                        await member.roles.add('1310751635235934288')
                        roleUpdateStatus += '⚠️ Added: Unverified\n'
                    }
                    if (hasPlanPayer) {
                        await member.roles.remove('1310751749023207454')
                        roleUpdateStatus += '❌ Removed: Plan Payer\n'
                    }
                }
            }

            const collectInfoButton = createButton({
                customId: 'collectInfo',
                label: '📝 Add Personal Information',
                style: ButtonStyle.Primary
            })

            const rows = createActionRows([collectInfoButton])

            const embed = createEmbed({
                title: `${isPlanPayer ? '✅ Plan Verification Status' : '❌ Verification Failed'}`,
                description: `Hey ${interaction.user.toString()}, here's your membership status:`,
                fields: [
                    {
                        name: '📱 Phone Number',
                        value: `\`${phoneNumber}\`\n${isPlanPayer ? '✅ Active Plan Found' : '❌ No Active Plan Found'}`,
                        inline: true
                    },
                    {
                        name: '📧 Contact Email',
                        value: email,
                        inline: true
                    },
                    {
                        name: '🎭 Role Updates',
                        value: roleUpdateStatus || 'No role changes needed',
                        inline: false
                    },
                    {
                        name: '📋 Current Status',
                        value: isPlanPayer 
                            ? '✅ Verified Plan Payer - Full Access Granted'
                            : '❌ Unverified - Limited Access',
                        inline: false
                    }
                ],
                color: isPlanPayer ? '#00ff00' : '#ff0000',
                footer: 'Plan Verification System',
                timestamp: true
            })

            await interaction.editReply({
                embeds: [embed],
                components: isPlanPayer ? rows : []
            })

        } catch (error) {
            console.error('Error processing verification:', error)
            const errorEmbed = createEmbed({
                title: '⚠️ Verification Error',
                description: 'An error occurred while verifying your status.',
                color: '#ff0000',
                footer: 'Verification System',
                timestamp: true
            })

            await interaction.editReply({
                embeds: [errorEmbed]
            })
        }
    }
}) 