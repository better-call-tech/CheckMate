import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const rawNumbers = [
    '201.982.4522', '208.599.0509', '214.310.6036', '214.326.3396',
    '316.737.3733', '317.922.6973', '317.922.7079', '321.375.0832',
    '321.588.6869', '336.666.0099', '336.970.8154', '347.588.8006',
    '347.681.9923', '347.705.3644', '415.629.7313', '469.534.9597',
    '469.534.9810', '516.643.6058', '602.575.1514', '612.447.2575',
    '646.701.1891', '650.750.4265', '702.328.1671', '708.669.8968',
    '845.375.7564', '845.543.1147', '917.833.2848', '929.712.0898',
    '954.990.3919'
]

async function main() {
    const formattedNumbers = rawNumbers.map(num => num.replace(/\./g, ''))

    await prisma.verifiedNumbers.upsert({
        where: { id: 1 },
        create: {
            numbers: formattedNumbers
        },
        update: {
            numbers: formattedNumbers
        }
    })

    console.log('✅ Successfully seeded verified numbers')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    }) 