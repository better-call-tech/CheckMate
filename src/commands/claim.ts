import {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    TextInputStyle
} from 'discord.js'
import Command from '../templates/command.ts'
import { createCustomModal, createTextInput } from '@/utils/modalBuilder.ts'

export default new Command({
    data: new SlashCommandBuilder()
        .setName('claim')
        .setDescription('Start the verification process'),

    async execute(interaction: ChatInputCommandInteraction) {
        try {

            const modal = createCustomModal({
                customId: 'claimModal',
                title: 'Verify Your Information',
                components: [
                    createTextInput({
                        customId: 'phoneNumber',
                        label: 'Phone Number',
                        placeholder: '2019824588',
                        style: TextInputStyle.Short,
                        required: true,
                        maxLength: 15
                    }),
                    createTextInput({
                        customId: 'email',
                        label: 'Email Address',
                        placeholder: 'your@email.com',
                        style: TextInputStyle.Short,
                        required: true
                    }),
                ]
            })

            await interaction.showModal(modal)
        } catch (error) {
            console.error('Error in claim command:', error)
            if (!interaction.replied) {
                await interaction.reply({
                    content: 'An error occurred while processing your request. Please try again.',
                    ephemeral: true
                })
            }
        }
    }
}) 