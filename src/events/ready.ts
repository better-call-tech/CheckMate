import { Client, Events } from 'discord.js'
import Event from '../templates/event.js'
import { deployCommands } from '../deploy-commands.js'

export default new Event({
    name: Events.ClientReady,
    once: true,
    async execute(client: Client) {
        console.log('Discord bot is ready! 🤖')

        const guilds = client.guilds.cache

        for (const [guildId, guild] of guilds) {

            try {
                await deployCommands({ guildId })
            } catch (error) {
                console.error(
                    `Error fetching members or deploying commands for guild ${guild.name}:`,
                    error
                )
            }
        }
    }
})

