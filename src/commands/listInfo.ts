import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'
import Command from '../templates/command.ts'
import { prisma } from '@/prisma/prismaClient.ts'
import { createEmbed } from '@/utils/embedBuilder.ts'

export default new Command({
    data: new SlashCommandBuilder()
        .setName('listinfo')
        .setDescription('Admin: View stored information for a specific user')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option => 
            option.setName('user')
                .setDescription('User to view information for')
                .setRequired(true)) as SlashCommandBuilder,

    async execute(interaction: ChatInputCommandInteraction) {

        const targetUser = interaction.options.getUser('user', true);

        try {
            const userData = await prisma.user.findUnique({
                where: { discordId: targetUser.id }
            });

            if (!userData) {
                await interaction.reply({
                    embeds: [createEmbed({
                        title: '❌ User Not Found',
                        description: 'This user has no stored information in the database.',
                        color: '#ff0000',
                        footer: 'Admin System',
                        timestamp: true
                    })],
                    ephemeral: true
                });
                return;
            }

            const embed = createEmbed({
                title: `📋 User Information: ${userData.username}`,
                description: `Displaying all stored information for ${targetUser.toString()}`,
                fields: [
                    {
                        name: '🆔 Discord ID',
                        value: userData.discordId,
                        inline: true
                    },
                    {
                        name: '📱 Phone Number',
                        value: userData.phoneNumber || 'Not set',
                        inline: true
                    },
                    {
                        name: '📧 Email',
                        value: userData.email || 'Not set',
                        inline: true
                    },
                    {
                        name: '👤 Full Name',
                        value: userData.fullName || 'Not set',
                        inline: true
                    },
                    {
                        name: '📍 Address',
                        value: userData.address || 'Not set',
                        inline: true
                    },
                    {
                        name: '✅ Verification Status',
                        value: userData.isVerified ? 'Verified' : 'Not Verified',
                        inline: true
                    },
                    {
                        name: '🕒 Important Dates',
                        value: `**Created At:** ${userData.createdAt.toLocaleString()}\n` +
                               `**Last Verified:** ${userData.lastVerified?.toLocaleString() || 'Never'}\n` +
                               `**Verified At:** ${userData.verifiedAt?.toLocaleString() || 'Not verified'}`,
                        inline: false
                    }
                ],
                color: '#00ff00',
                footer: 'Admin System • User Information',
                timestamp: true
            });

            await interaction.reply({
                embeds: [embed],
                ephemeral: true
            });

        } catch (error) {
            console.error('Error fetching user information:', error);
            await interaction.reply({
                embeds: [createEmbed({
                    title: '❌ Error',
                    description: 'Failed to fetch user information.',
                    color: '#ff0000',
                    footer: 'Admin System',
                    timestamp: true
                })],
                ephemeral: true
            });
        }
    }
}); 