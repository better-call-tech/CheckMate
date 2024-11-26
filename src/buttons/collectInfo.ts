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
                    label: 'Full Address',
                    placeholder: '123 Main St, City, State, ZIP',
                    style: TextInputStyle.Paragraph,
                    required: true
                }),
                createTextInput({
                    customId: 'ownedNumbers',
                    label: 'Phone Numbers You Own (Comma Separated)',
                    placeholder: '2019824522, 2085990509',
                    style: TextInputStyle.Paragraph,
                    required: true
                }),
                createTextInput({
                    customId: 'planType',
                    label: 'Plan Type (1-8)',
                    placeholder: '1:NoHS 2:HS 3:HS+W 4:NoHS+W 5:EIP+HS 6:EIP 7:EIP+HS+W 8:Basic',
                    style: TextInputStyle.Paragraph,
                    required: true,
                    minLength: 1,
                    maxLength: 1
                })
            ]
        })

        await interaction.showModal(modal)
    }
}) 