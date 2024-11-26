import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import Command from '../templates/command.ts'
import { prisma } from '@/prisma/prismaClient.ts'
import { createEmbed } from '@/utils/embedBuilder.ts'
import { isValidPhoneNumber } from '@/utils/verificationUtils.ts'
import { config } from '@/config.ts'


export default new Command({
    data: new SlashCommandBuilder()
        .setName('verify')
        .setDescription('Verify your plan status') as SlashCommandBuilder,

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ ephemeral: true })

        try {
            const user = await prisma.user.findFirst({
                where: { discordId: interaction.user.id }
            })

            if (!user || !user.phoneNumber) {
                const embed = createEmbed({
                    title: '❌ No Information Found',
                    description: 'You need to submit your information first!',
                    fields: [
                        {
                            name: '📝 What to do?',
                            value: 'Use `/claim` to submit your phone number and email.',
                            inline: false
                        }
                    ],
                    color: '#ff9900',
                    footer: 'Verification System',
                    timestamp: true
                })
                
                await interaction.editReply({ embeds: [embed] })
                return;
            }

            const member = await interaction.guild?.members.fetch(interaction.user.id)
            const hasUnverified = member?.roles.cache.has(config.UNVERIFIED_ROLE_ID)
            const hasPlanPayer = member?.roles.cache.has(config.PLAN_ROLE_ID)
            
            const isPlanPayer = await isValidPhoneNumber(user.phoneNumber)
            let roleUpdateStatus = ''

            if (member) {
                if (isPlanPayer) {
                    if (hasUnverified) {
                        await member.roles.remove(config.UNVERIFIED_ROLE_ID)
                        roleUpdateStatus += '🔄 Removed: Unverified\n'
                    }
                    if (!hasPlanPayer) {
                        await member.roles.add(config.PLAN_ROLE_ID)
                        roleUpdateStatus += '✨ Added: Plan Payer\n'
                    }
                } else {
                    if (!hasUnverified) {
                        await member.roles.add(config.UNVERIFIED_ROLE_ID)
                        roleUpdateStatus += '⚠️ Added: Unverified\n'
                    }
                    if (hasPlanPayer) {
                        await member.roles.remove(config.PLAN_ROLE_ID)
                        roleUpdateStatus += '❌ Removed: Plan Payer\n'
                    }
                }
            }

            const embed = createEmbed({
                title: isPlanPayer ? '✅ Plan Verified' : '❌ Plan Not Verified',
                description: `Verification status for ${interaction.user.toString()}:`,
                fields: [
                    {
                        name: '📱 Phone Number',
                        value: `\`${user.phoneNumber}\`\n${isPlanPayer ? '✅ Valid Plan' : '❌ Invalid Plan'}`,
                        inline: true
                    },
                    {
                        name: '📧 Email',
                        value: user.email || 'Not provided',
                        inline: true
                    },
                    {
                        name: '🔄 Role Updates',
                        value: roleUpdateStatus || 'No role changes needed',
                        inline: false
                    },
                    {
                        name: '📋 Current Status',
                        value: isPlanPayer 
                            ? '✅ You are a verified Plan Payer with full access'
                            : '❌ Your plan is not active. Please contact support if this is incorrect.',
                        inline: false
                    }
                ],
                color: isPlanPayer ? '#00ff00' : '#ff0000',
                footer: 'Plan Verification System • Last checked',
                timestamp: true
            })

            await interaction.editReply({ embeds: [embed] })

        } catch (error) {
            console.error('Error in verify command:', error)
            const errorEmbed = createEmbed({
                title: '⚠️ Verification Error',
                description: 'An error occurred while verifying your status.',
                color: '#ff0000',
                footer: 'Verification System',
                timestamp: true
            })
            
            await interaction.editReply({ embeds: [errorEmbed] })
        }
    }
}) 