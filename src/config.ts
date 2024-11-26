import dotenv from 'dotenv'

dotenv.config()

const { DISCORD_TOKEN, DISCORD_CLIENT_ID, UNVERIFIED_ROLE_ID, PLAN_ROLE_ID } = process.env

if (!DISCORD_TOKEN)
    throw new Error('Missing DISCORD_TOKEN environment variable')
if (!DISCORD_CLIENT_ID)
    throw new Error('Missing DISCORD_CLIENT_ID environment variable')
if (!UNVERIFIED_ROLE_ID)
    throw new Error('Missing UNVERIFIED_ROLE_ID environment variable')
if (!PLAN_ROLE_ID)
    throw new Error('Missing PLAN_ROLE_ID environment variable')

export const config = {
    DISCORD_TOKEN,
    DISCORD_CLIENT_ID,
    UNVERIFIED_ROLE_ID,
    PLAN_ROLE_ID
}
