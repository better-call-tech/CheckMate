import { ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js'
import Command from '../templates/command.ts'
import { prisma } from '@/prisma/prismaClient.ts'
import { createEmbed } from '@/utils/embedBuilder.ts'
import { isValidPhoneNumber } from '@/utils/verificationUtils.ts';
export default new Command({
    data: new SlashCommandBuilder()
        .setName('verify-all')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDescription('Admin: Verify all users\' phone numbers and update roles'),

    async execute(interaction: ChatInputCommandInteraction) {

        await interaction.deferReply({ ephemeral: true });

        try {
            const users = await prisma.user.findMany({
                where: {
                    phoneNumber: {
                        not: null
                    }
                }
            });

            const results = {
                verified: 0,
                unverified: 0,
                roleUpdates: 0,
                errors: 0
            };

            const statusUpdates = [];

            for (const user of users) {
                try {
                    const member = await interaction.guild?.members.fetch(user.discordId);
                    if (!member) continue;

                    const hasUnverified = member.roles.cache.has('1310751635235934288');
                    const hasPlanPayer = member.roles.cache.has('1310751749023207454');
                    
                    const isValid = user.phoneNumber && await isValidPhoneNumber(user.phoneNumber);
                    
                    if (isValid) {
                        results.verified++;
                        if (hasUnverified) {
                            await member.roles.remove('1310751635235934288');
                            results.roleUpdates++;
                        }
                        if (!hasPlanPayer) {
                            await member.roles.add('1310751749023207454');
                            results.roleUpdates++;
                        }
                        await prisma.user.update({
                            where: { discordId: user.discordId },
                            data: {
                                isVerified: true,
                                lastVerified: new Date()
                            }
                        });
                    } else {
                        results.unverified++;
                        if (!hasUnverified) {
                            await member.roles.add('1310751635235934288');
                            results.roleUpdates++;
                        }
                        if (hasPlanPayer) {
                            await member.roles.remove('1310751749023207454');
                            results.roleUpdates++;
                        }
                        await prisma.user.update({
                            where: { discordId: user.discordId },
                            data: {
                                isVerified: false,
                                verifiedAt: null
                            }
                        });
                    }

                    statusUpdates.push(`<@${user.discordId}>: ${isValid ? '✅ Verified' : '❌ Unverified'}`);

                } catch (error) {
                    console.error(`Error processing user ${user.discordId}:`, error);
                    results.errors++;
                    statusUpdates.push(`<@${user.discordId}>: ⚠️ Error processing`);
                }
            }

            const resultEmbed = createEmbed({
                title: '🔄 Mass Verification Complete',
                description: 'Completed verification check for all users.',
                fields: [
                    {
                        name: '📊 Statistics',
                        value: `✅ Verified: ${results.verified}\n❌ Unverified: ${results.unverified}\n🔄 Role Updates: ${results.roleUpdates}\n⚠️ Errors: ${results.errors}`,
                        inline: false
                    },
                    {
                        name: '📝 Detailed Status',
                        value: statusUpdates.slice(0, 10).join('\n') + 
                               (statusUpdates.length > 10 ? '\n... and more' : ''),
                        inline: false
                    }
                ],
                color: '#00ff00',
                footer: 'Admin System • Mass Verification',
                timestamp: true
            });

            await interaction.editReply({
                embeds: [resultEmbed]
            });

        } catch (error) {
            console.error('Error in mass verification:', error);
            await interaction.editReply({
                embeds: [createEmbed({
                    title: '❌ Error',
                    description: 'An error occurred during mass verification.',
                    color: '#ff0000',
                    footer: 'Admin System',
                    timestamp: true
                })]
            });
        }
    }
}); 