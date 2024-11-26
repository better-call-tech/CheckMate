import { prisma } from '@/prisma/prismaClient.ts'

export async function getVerifiedNumbers(): Promise<string[]> {
    const record = await prisma.verifiedNumbers.findFirst()
    return record?.numbers || []
}

export async function addVerifiedNumber(number: string): Promise<void> {
    const record = await prisma.verifiedNumbers.findFirst()
    if (record) {
        await prisma.verifiedNumbers.update({
            where: { id: record.id },
            data: {
                numbers: [...record.numbers, number]
            }
        })
    } else {
        await prisma.verifiedNumbers.create({
            data: {
                numbers: [number]
            }
        })
    }
}

export async function removeVerifiedNumber(number: string): Promise<void> {
    const record = await prisma.verifiedNumbers.findFirst()
    if (record) {
        await prisma.verifiedNumbers.update({
            where: { id: record.id },
            data: {
                numbers: record.numbers.filter(n => n !== number)
            }
        })
    }
}

export async function isVerifiedNumber(number: string): Promise<boolean> {
    const numbers = await getVerifiedNumbers()
    return numbers.includes(number)
}

export async function isValidPhoneNumber(phone: string | null): Promise<boolean> {
    if (!phone) return false
    
    const cleanNumber = phone.replace(/\D/g, '')
    
    const verifiedNumbers = await prisma.verifiedNumbers.findFirst()
    if (!verifiedNumbers) return false

    return verifiedNumbers.numbers.includes(cleanNumber)
} 