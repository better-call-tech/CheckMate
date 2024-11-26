import { ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js'
import Command from '../templates/command.ts'
import { createEmbed } from '@/utils/embedBuilder.ts'
import { prisma } from '@/prisma/prismaClient.ts'
import { config } from '@/config.ts';

export function validNumberFormat(phoneNumber: string): boolean {
    const regex = /^\+?\d{9,15}$/;
    return regex.test(phoneNumber);
}

export default new Command({
    data: new SlashCommandBuilder()
        .setName('force-unclaim')
        .setDescription('Admin: Force unclaim a phone number and update associated information')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option.setName('phone')
                .setDescription('Phone number to unclaim')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('info')
                .setDescription('Associated information to update (e.g., "fullName::John Doe, email::john@example.com")')
                .setRequired(false))
        .addBooleanOption(option =>
            option.setName('overwrite')
                .setDescription('Overwrite existing details if number exists')
                .setRequired(false)) as SlashCommandBuilder,

    async execute(interaction: ChatInputCommandInteraction) {
        const phoneNumber = interaction.options.getString('phone', true);
        const info = interaction.options.getString('info') || '';
        const overwrite = interaction.options.getBoolean('overwrite') || false;

        if (!validNumberFormat(phoneNumber)) {
            await interaction.reply({
                embeds: [createEmbed({
                    title: '❌ Invalid Phone Number',
                    description: `Invalid phone number format for ${phoneNumber}. Please correct it and try again.`,
                    color: '#ff0000',
                    footer: 'Admin System',
                    timestamp: true
                })],
                ephemeral: true
            });
            return;
        }

        const validFields = ['fullName', 'email', 'address', 'planType'];
        const updates = info.split(',').reduce((acc, pair) => {
            const [field, value] = pair.split('::').map(s => s.trim());
            if (validFields.includes(field) && value) {
                acc[field] = value;
            }
            return acc;
        }, {} as Record<string, string>);

        try {
            const existingEntry = await prisma.user.findFirst({
                where: { phoneNumber }
            });

            if (existingEntry) {
                if (!overwrite) {
                    const confirmButton = new ButtonBuilder()
                        .setCustomId(`forceUnclaim_${phoneNumber}`)
                        .setLabel('Confirm Unclaim')
                        .setStyle(ButtonStyle.Danger);

                    const row = new ActionRowBuilder<ButtonBuilder>()
                        .addComponents(confirmButton);

                    await interaction.reply({
                        embeds: [createEmbed({
                            title: '⚠️ Confirmation Required',
                            description: `Number ${phoneNumber} already exists. Do you want to proceed with unclaiming it?`,
                            fields: [
                                {
                                    name: 'Updates to Apply',
                                    value: Object.entries(updates).map(([key, value]) => `${key}: ${value}`).join('\n') || 'No updates specified',
                                    inline: false
                                }
                            ],
                            color: '#ffcc00',
                            footer: 'Admin System',
                            timestamp: true
                        })],
                        components: [row],
                        ephemeral: true
                    });
                    return;
                }

                await prisma.user.update({
                    where: { id: existingEntry.id },
                    data: {
                        discordId: null,
                        username: null,
                        isVerified: false,
                        verifiedAt: null,
                        lastVerified: null,
                        ...updates
                    }
                });

                const member = existingEntry.discordId ? await interaction.guild?.members.fetch(existingEntry.discordId) : null;
                if (member) {
                    await member.roles.remove(config.PLAN_ROLE_ID);
                    await member.roles.add(config.UNVERIFIED_ROLE_ID);
                }

                await interaction.reply({
                    embeds: [createEmbed({
                        title: '✅ Number Unclaimed',
                        description: `Number ${phoneNumber} has been unclaimed and updated with new details.`,
                        color: '#00ff00',
                        footer: 'Admin System',
                        timestamp: true
                    })],
                    ephemeral: true
                });
            } else {
                await prisma.user.create({
                    data: {
                        phoneNumber: phoneNumber,
                        ownedNumbers: [],
                        isVerified: false,
                        ...updates
                    }
                });
                await prisma.verifiedNumbers.update({
                    where: { id: 1 },
                    data: {
                        numbers: {
                            push: phoneNumber
                        }
                    }
                })

                await interaction.reply({
                    embeds: [createEmbed({
                        title: '✅ Number Added',
                        description: `Number ${phoneNumber} has been added as unclaimed with the provided details.`,
                        color: '#00ff00',
                        footer: 'Admin System',
                        timestamp: true
                    })],
                    ephemeral: true
                });
            }
        } catch (error) {
            console.error('Error in force unclaim command:', error);
            await interaction.reply({
                embeds: [createEmbed({
                    title: '❌ Error',
                    description: 'Failed to process the unclaim request.',
                    color: '#ff0000',
                    footer: 'Admin System',
                    timestamp: true
                })],
                ephemeral: true
            });
        }
    }
}); 