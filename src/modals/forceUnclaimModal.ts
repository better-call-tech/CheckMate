import { ModalSubmitInteraction } from 'discord.js'
import Modal from '../templates/modal.ts'
import { prisma } from '@/prisma/prismaClient.ts'
import { createEmbed } from '@/utils/embedBuilder.ts'

export default new Modal({
    customId: 'forceUnclaim',
    async execute(interaction: ModalSubmitInteraction) {
        await interaction.deferReply({ ephemeral: true })

        const userId = interaction.customId.split('_')[1]
        const confirmation =
            interaction.fields.getTextInputValue('confirmation')

        if (confirmation.toUpperCase() !== 'UNCLAIM') {
            await interaction.editReply({
                embeds: [
                    createEmbed({
                        title: '❌ Operation Cancelled',
                        description:
                            'Force unclaim was cancelled - confirmation text did not match.',
                        color: '#ff0000',
                        footer: 'Admin System',
                        timestamp: true
                    })
                ]
            })
            return
        }

        try {
            const userData = await prisma.user.findFirst({
                where: { discordId: userId }
            })

            const oldPhoneNumber = userData?.phoneNumber

            if (userData) {
                await prisma.user.update({
                    where: { id: userData.id },
                    data: {
                        phoneNumber: null,
                        isVerified: false,
                        verifiedAt: null,
                        lastVerified: null
                    }
                })
            }

            const member = userId ? await interaction.guild?.members.fetch(userId) : null;
            if (member) {
                try {
                    await member.roles.remove('1310751749023207454')
                    await member.roles.add('1310751635235934288')
                } catch (roleError) {
                    console.error('Error updating roles:', roleError)
                }
            }

            await interaction.editReply({
                embeds: [
                    createEmbed({
                        title: '✅ Force Unclaim Successful',
                        description: `Successfully unclaimed phone number from <@${userId}>`,
                        fields: [
                            {
                                name: '📱 Previous Number',
                                value: oldPhoneNumber || 'No number was set',
                                inline: true
                            },
                            {
                                name: '🔄 Status',
                                value: 'User has been unverified and roles have been updated.',
                                inline: false
                            }
                        ],
                        color: '#00ff00',
                        footer: 'Admin System',
                        timestamp: true
                    })
                ]
            })
        } catch (error) {
            console.error('Error in force unclaim:', error)
            await interaction.editReply({
                embeds: [
                    createEmbed({
                        title: '❌ Error',
                        description: 'Failed to force unclaim the user.',
                        color: '#ff0000',
                        footer: 'Admin System',
                        timestamp: true
                    })
                ]
            })
        }
    }
})

