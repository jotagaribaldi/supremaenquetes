import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CARGO_CODES = {
  1: 'PRESIDENTE',
  3: 'GOVERNADOR',
  5: 'SENADOR',
  6: 'DEPUTADO FEDERAL',
  7: 'DEPUTADO ESTADUAL',
};

const STATES = ['TO', 'SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'CE', 'PE', 'PB', 'RN', 'AL', 'SE', 'MA', 'PI', 'PA', 'AM', 'RR', 'AP', 'RO', 'AC', 'MT', 'MS', 'GO', 'DF', 'ES'];

const specialCandidates = [
  {
    candidateNumber: 0,
    name: 'Voto Nulo / Branco',
    urnName: 'VOTO NULO / BRANCO',
    partyNumber: null,
    partyAcronym: 'NULO',
    partyName: 'Voto Nulo / Branco',
    coalitionName: null,
    federationName: null,
    situation: 'DEFERIDO',
    email: null,
  },
  {
    candidateNumber: -1,
    name: 'Não sei / Não respondeu',
    urnName: 'NÃO SEI / NÃO RESPONDEU',
    partyNumber: null,
    partyAcronym: 'NS/NR',
    partyName: 'Não sei / Não respondeu',
    coalitionName: null,
    federationName: null,
    situation: 'DEFERIDO',
    email: null,
  },
];

async function main() {
  console.log('Adding special candidates...');

  for (const state of STATES) {
    for (const [cargoCodeStr, cargoName] of Object.entries(CARGO_CODES)) {
      const cargoCode = parseInt(cargoCodeStr);
      for (const special of specialCandidates) {
        const existing = await prisma.candidates.findFirst({
          where: {
            state: state,
            cargoCode: cargoCode,
            candidateNumber: special.candidateNumber,
          },
        });

        if (!existing) {
          await prisma.candidates.create({
            data: {
              state: state,
              cargoCode: cargoCode,
              cargoName: cargoName,
              ...special,
            },
          });
          console.log(`Added: ${state} - ${cargoName} - ${special.urnName}`);
        } else {
          console.log(`Already exists: ${state} - ${cargoName} - ${special.urnName}`);
        }
      }
    }
  }

  console.log('Special candidates processed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });