import { ChatInputCommandInteraction, SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, PermissionFlagsBits } from 'discord.js'
import Command from '../templates/command.ts'
import { createEmbed } from '@/utils/embedBuilder.ts'
import { prisma } from '@/prisma/prismaClient.ts'

export default new Command({
    data: new SlashCommandBuilder()
        .setName('force-update-info')
        .setDescription('Admin: Force update user information')
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

            const modal = new ModalBuilder()
                .setCustomId(`forceUpdateInfo_${userData.discordId}`)
                .setTitle(`Update Info: ${userData.username}`);

            const phoneInput = new TextInputBuilder()
                .setCustomId('phoneNumber')
                .setLabel('Phone Number')
                .setStyle(TextInputStyle.Short)
                .setRequired(false)
                .setValue(userData.phoneNumber || '')
                .setPlaceholder('Enter phone number');

            const emailInput = new TextInputBuilder()
                .setCustomId('email')
                .setLabel('Email')
                .setStyle(TextInputStyle.Short)
                .setRequired(false)
                .setValue(userData.email || '')
                .setPlaceholder('Enter email');

            const fullNameInput = new TextInputBuilder()
                .setCustomId('fullName')
                .setLabel('Full Name')
                .setStyle(TextInputStyle.Short)
                .setRequired(false)
                .setValue(userData.fullName || '')
                .setPlaceholder('Enter full name');

            const addressInput = new TextInputBuilder()
                .setCustomId('address')
                .setLabel('Address')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(false)
                .setValue(userData.address || '')
                .setPlaceholder('Enter address');

            const ownedNumbersInput = new TextInputBuilder()
                .setCustomId('ownedNumbers')
                .setLabel('Owned Numbers (comma-separated)')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(false)
                .setValue(userData.ownedNumbers.join(', ') || '')
                .setPlaceholder('Enter owned numbers, separated by commas');

            const rows = [
                new ActionRowBuilder<TextInputBuilder>().addComponents(phoneInput),
                new ActionRowBuilder<TextInputBuilder>().addComponents(emailInput),
                new ActionRowBuilder<TextInputBuilder>().addComponents(fullNameInput),
                new ActionRowBuilder<TextInputBuilder>().addComponents(addressInput),
                new ActionRowBuilder<TextInputBuilder>().addComponents(ownedNumbersInput)
            ];

            modal.addComponents(rows);
            await interaction.showModal(modal);

        } catch (error) {
            console.error('Error preparing update modal:', error);
            await interaction.reply({
                embeds: [createEmbed({
                    title: '❌ Error',
                    description: 'Failed to prepare the update form.',
                    color: '#ff0000',
                    footer: 'Admin System',
                    timestamp: true
                })],
                ephemeral: true
            });
        }
    }
}); 