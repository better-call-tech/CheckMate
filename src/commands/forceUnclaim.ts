import { ChatInputCommandInteraction, SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, PermissionFlagsBits } from 'discord.js'
import Command from '../templates/command.ts'

export default new Command({
    data: new SlashCommandBuilder()
        .setName('force-unclaim')
        .setDescription('Admin: Force unclaim a user\'s phone number')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option => 
            option.setName('user')
                .setDescription('User to unclaim number from')
                .setRequired(true)) as SlashCommandBuilder,

    async execute(interaction: ChatInputCommandInteraction) {

        const targetUser = interaction.options.getUser('user', true);

        const modal = new ModalBuilder()
            .setCustomId(`forceUnclaim_${targetUser.id}`)
            .setTitle('Confirm Force Unclaim');

        const confirmInput = new TextInputBuilder()
            .setCustomId('confirmation')
            .setLabel(`Type "UNCLAIM" to confirm`)
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('UNCLAIM')
            .setRequired(true);

        const actionRow1 = new ActionRowBuilder<TextInputBuilder>()
            .addComponents(confirmInput);
        modal.addComponents(actionRow1);
        await interaction.showModal(modal);
    }
}); 