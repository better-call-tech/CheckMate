import { ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js'
import Command from '../templates/command.ts'
import { prisma } from '@/prisma/prismaClient.ts'
import { createEmbed } from '@/utils/embedBuilder.ts'

export default new Command({
    data: new SlashCommandBuilder()
        .setName('list-info')
        .setDescription('Admin: List user information by phone number')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option.setName('phone')
                .setDescription('Phone number to search for')
                .setRequired(true)) as SlashCommandBuilder,

    async execute(interaction: ChatInputCommandInteraction) {
        const phoneNumber = interaction.options.getString('phone', true);

        try {
            const userData = await prisma.user.findFirst({
                where: { phoneNumber }
            });

            if (!userData) {
                await interaction.reply({
                    embeds: [createEmbed({
                        title: '❌ User Not Found',
                        description: 'No user found with this phone number.',
                        color: '#ff0000',
                        footer: 'Admin System',
                        timestamp: true
                    })],
                    ephemeral: true
                });
                return;
            }

            const member = await interaction.guild?.members.fetch(userData.discordId);
            const userTag = member ? `<@${userData.discordId}>` : userData.username;

            const messageButton = new ButtonBuilder()
                .setCustomId(`sendMessage_${userData.discordId}`)
                .setLabel('Send Message')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('✉️');

            const buttonRow = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(messageButton);

            const embed = createEmbed({
                title: `📋 User Information: ${userData.username}`,
                description: `Displaying all stored information for ${userTag}`,
                fields: [
                    {
                        name: '👤 Discord User',
                        value: userTag,
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
                        inline: false
                    },
                    {
                        name: '📱 Owned Numbers',
                        value: userData.ownedNumbers.length > 0 
                            ? userData.ownedNumbers.join(', ')
                            : 'None',
                        inline: false
                    },
                    {
                        name: '📋 Plan Type',
                        value: userData.planType || 'Not set',
                        inline: true
                    },
                    {
                        name: '✅ Verification Status',
                        value: userData.isVerified ? 'Verified' : 'Unverified',
                        inline: true
                    },
                    {
                        name: '🕒 Last Verified',
                        value: userData.lastVerified 
                            ? new Date(userData.lastVerified).toLocaleString()
                            : 'Never',
                        inline: true
                    },
                    {
                        name: '📅 Account Created',
                        value: new Date(userData.createdAt).toLocaleString(),
                        inline: true
                    }
                ],
                color: '#00ff00',
                footer: 'Admin System',
                timestamp: true
            });

            await interaction.reply({ 
                embeds: [embed], 
                components: [buttonRow],
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