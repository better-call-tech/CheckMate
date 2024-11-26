import { ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js'
import Command from '../templates/command.ts'
import { prisma } from '@/prisma/prismaClient.ts'
import { createEmbed } from '@/utils/embedBuilder.ts'

export default new Command({
    data: new SlashCommandBuilder()
        .setName('list-info')
        .setDescription('Admin: List phone number information')
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
                        title: '❌ Not Found',
                        description: 'No information found for this phone number.',
                        color: '#ff0000',
                        footer: 'Admin System',
                        timestamp: true
                    })],
                    ephemeral: true
                });
                return;
            }

            let components: ActionRowBuilder<ButtonBuilder>[] = [];
            let fields = [
                {
                    name: '📱 Phone Number',
                    value: phoneNumber,
                    inline: true
                }
            ];

            // Add basic information fields
            if (userData.fullName) {
                fields.push({
                    name: '👤 Full Name',
                    value: userData.fullName,
                    inline: true
                });
            }
            if (userData.email) {
                fields.push({
                    name: '📧 Email',
                    value: userData.email,
                    inline: true
                });
            }
            if (userData.address) {
                fields.push({
                    name: '📍 Address',
                    value: userData.address,
                    inline: false
                });
            }
            if (userData.planType) {
                fields.push({
                    name: '📋 Plan Type',
                    value: userData.planType,
                    inline: true
                });
            }

            if (userData.discordId) {
                const member = await interaction.guild?.members.fetch(userData.discordId);
                const userTag = member ? `<@${userData.discordId}>` : 'Unknown User';

                fields.push(
                    {
                        name: '🎮 Discord Status',
                        value: 'Claimed',
                        inline: true
                    },
                    {
                        name: '👤 Claimed By',
                        value: userTag,
                        inline: true
                    },
                    {
                        name: '✅ Verification Status',
                        value: userData.isVerified ? 'Verified' : 'Unverified',
                        inline: true
                    }
                );

                const messageButton = new ButtonBuilder()
                    .setCustomId(`sendMessage_${userData.discordId}`)
                    .setLabel('Message User')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('✉️');

                const buttonRow = new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(messageButton);
                components.push(buttonRow);
            } else {
                fields.push({
                    name: '🎮 Discord Status',
                    value: 'Unclaimed',
                    inline: true
                });
            }

            const embed = createEmbed({
                title: `📱 Phone Number Information`,
                description: `Displaying information for ${phoneNumber}`,
                fields: fields,
                color: userData.discordId ? '#00ff00' : '#ffcc00',
                footer: 'Admin System',
                timestamp: true
            });

            await interaction.reply({ 
                embeds: [embed], 
                components: components,
                ephemeral: true 
            });

        } catch (error) {
            console.error('Error fetching phone information:', error);
            await interaction.reply({
                embeds: [createEmbed({
                    title: '❌ Error',
                    description: 'Failed to fetch phone information.',
                    color: '#ff0000',
                    footer: 'Admin System',
                    timestamp: true
                })],
                ephemeral: true
            });
        }
    }
}); 