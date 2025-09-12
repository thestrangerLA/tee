// Flows will be imported for their side effects in this file.
import { addTourTransaction } from '@/services/tourAccountancyService';
import { startOfDay } from 'date-fns';

const addTransactions = async () => {
    const year = new Date().getFullYear();
    const month = 5; // June (0-indexed)

    const transactionsToAdd = [
        { date: new Date(year, month, 17), type: 'expense' as const, description: 'ຄ່າຈ້າງ(ຊ່າງຕົບແຕ່ງ)', kip: 2500000, baht: 0, usd: 0, cny: 0, amount: 0 },
        { date: new Date(year, month, 17), type: 'expense' as const, description: 'ຄ່າອຸປະກອນຕົບແຕ່ງ(ຕະປູຖັງສີຂາວ)', kip: 700000, baht: 0, usd: 0, cny: 0, amount: 0 },
        { date: new Date(year, month, 17), type: 'expense' as const, description: 'ຄ່າອຸປະກອນຕົບແຕ່ງ(ຖັງສີຂາວ)', kip: 0, baht: 1025, usd: 0, cny: 0, amount: 0 },
        { date: new Date(year, month, 18), type: 'expense' as const, description: 'ຄ່າອຸປະກອນຕົບແຕ່ງ(ຜ້າກັ້ງດ້ານຫຼັງ ຕິດຕັ້ງ 120cm x 270cm)', kip: 400000, baht: 0, usd: 0, cny: 0, amount: 0 },
        { date: new Date(year, month, 19), type: 'expense' as const, description: 'ຄ່າອຸປະກອນຕົບແຕ່ງ(ຜ້າກັ້ງດ້ານໜ້າ 450cm x 270cm)', kip: 0, baht: 2000, usd: 0, cny: 0, amount: 0 },
        { date: new Date(year, month, 20), type: 'expense' as const, description: 'ຄ່າອຸປະກອນເຄື່ອງໃຊ້(ອານະໄມຫ້ອງການ)', kip: 401500, baht: 0, usd: 0, cny: 0, amount: 0 },
        { date: new Date(year, month, 20), type: 'expense' as const, description: 'ຄ່າອຸປະກອນເຄື່ອງໃຊ້(ກະແຈລ໋ອກປະຕູຫຼັງ ໜ້າ)', kip: 96000, baht: 0, usd: 0, cny: 0, amount: 0 },
        { date: new Date(year, month, 20), type: 'expense' as const, description: 'ຄ່າອຸປະກອນເຄື່ອງໃຊ້(ອານະໄມຫ້ອງການ)', kip: 1148000, baht: 0, usd: 0, cny: 0, amount: 0 },
        { date: new Date(year, month, 24), type: 'expense' as const, description: 'ຄ່າເຟີນິເຈີ້(ຕູ້ໄມ້3 ຕັ່ງ2 โตะ2 ຕູ້ເຫຼັກ1)', kip: 12200000, baht: 0, usd: 0, cny: 0, amount: 0 },
        { date: new Date(year, month, 24), type: 'expense' as const, description: 'ຄ່າຈ້າງ(ແມ່ບ້ານອານາໄມ)', kip: 550000, baht: 0, usd: 0, cny: 0, amount: 0 },
        { date: new Date(year, month, 30), type: 'expense' as const, description: 'ຄ່າເຄື່ອງໃຊ້ຫ້ອງການ(ວາຍຟາຍ 12ເດືອນ 4G)', kip: 1981000, baht: 0, usd: 0, cny: 0, amount: 0 },
        { date: new Date(year, month, 30), type: 'expense' as const, description: 'ຄ່າຈ້າງ(ຊ່າງລ້າງແອ)', kip: 250000, baht: 0, usd: 0, cny: 0, amount: 0 },
    ];

    for (const tx of transactionsToAdd) {
        await addTourTransaction({
            ...tx,
            date: startOfDay(tx.date)
        });
    }
    console.log('Finished adding transactions.');
};

addTransactions();
