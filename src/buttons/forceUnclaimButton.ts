import { ButtonInteraction } from 'discord.js';
import { prisma } from '@/prisma/prismaClient.ts';
import { createEmbed } from '@/utils/embedBuilder.ts';
import Button from '@/templates/button.ts';
import { config } from '@/config.ts';

export default new Button({
    customId: 'forceUnclaim',
    async execute(interaction: ButtonInteraction) {
    const phoneNumber = interaction.customId.split('_')[1];
    
    try {
        const existingEntry = await prisma.user.findFirst({
            where: { phoneNumber }
        });

        if (!existingEntry) {
            await interaction.reply({
                embeds: [createEmbed({
                    title: '❌ Error',
                    description: 'User no longer exists.',
                    color: '#ff0000',
                    footer: 'Admin System',
                    timestamp: true
                })],
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
                lastVerified: null
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

    } catch (error) {
        console.error('Error in force unclaim button:', error);
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
})