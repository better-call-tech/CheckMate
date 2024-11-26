import { ButtonInteraction, TextInputStyle } from 'discord.js'
import Button from '../templates/button.ts'
import { createCustomModal, createTextInput } from '@/utils/modalBuilder.ts'

export default new Button({
    customId: 'collectInfo',
    async execute(interaction: ButtonInteraction) {
        const modal = createCustomModal({
            customId: 'personalInfoModal',
            title: 'Personal Information',
            components: [
                createTextInput({
                    customId: 'fullName',
                    label: 'Full Name',
                    placeholder: 'John Doe',
                    style: TextInputStyle.Short,
                    required: true
                }),
                createTextInput({
                    customId: 'address',
                    label: 'Address',
                    placeholder: '123 Main St, City, State, ZIP',
                    style: TextInputStyle.Paragraph,
                    required: true
                }),
                createTextInput({
                    customId: 'dateOfBirth',
                    label: 'Date of Birth',
                    placeholder: 'MM/DD/YYYY',
                    style: TextInputStyle.Short,
                    required: true
                })
            ]
        })

        await interaction.showModal(modal)
    }
}) 