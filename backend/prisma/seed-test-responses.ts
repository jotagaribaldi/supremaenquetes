import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Survey ID for Tocantins
const SURVEY_ID = 'c53bb52b-8dda-4161-aaab-9fdc91607de8';

// Cities in Tocantins with approximate coordinates
const tocantinsCities = [
  { city: 'Palmas', lat: -10.1844, lng: -48.3336 },
  { city: 'Araguaína', lat: -7.1939, lng: -48.2039 },
  { city: 'Gurupi', lat: -11.7297, lng: -49.0689 },
  { city: 'Porto Nacional', lat: -10.7072, lng: -48.4172 },
  { city: 'Paraíso do Tocantins', lat: -10.1769, lng: -48.8808 },
  { city: 'Araguatins', lat: -5.6489, lng: -48.1225 },
  { city: 'Colinas do Tocantins', lat: -8.0556, lng: -48.4739 },
  { city: 'Guaraí', lat: -8.8278, lng: -48.5119 },
  { city: 'Miracema do Tocantins', lat: -9.5756, lng: -48.3878 },
  { city: 'Tocantinópolis', lat: -6.3286, lng: -47.4236 },
  { city: 'Xambioá', lat: -6.4639, lng: -48.5289 },
  { city: 'Pedro Afonso', lat: -8.9825, lng: -48.1756 },
  { city: 'Miranda do Tocantins', lat: -11.0669, lng: -48.5156 },
  { city: 'Taguatinga', lat: -11.2758, lng: -48.5619 },
  { city: 'Dianópolis', lat: -11.6289, lng: -46.8194 },
  { city: 'Natividade', lat: -11.6778, lng: -47.7167 },
  { city: 'Alvorada', lat: -12.4617, lng: -47.3606 },
  { city: 'Ponte Alta do Tocantins', lat: -10.8233, lng: -47.6508 },
  { city: 'Mateiros', lat: -10.3867, lng: -46.6150 },
  { city: 'São Félix do Tocantins', lat: -9.6925, lng: -46.8683 },
];

const genders = ['Masculino', 'Feminino'];
const ageRanges = ['16-24', '25-34', '35-44', '45-59', '60+'];
const educations = ['Ensino Fundamental', 'Ensino Médio', 'Ensino Superior'];
const tocantinsVotes = ['Sim', 'Não'];

const evaluationOptions = ['PÉSSIMA', 'RUIM', 'REGULAR', 'BOA', 'EXCELENTE'];

async function getRandomCandidates(prisma: PrismaClient) {
  const candidates = await prisma.candidates.findMany({
    where: { state: 'TO' },
    select: { id: true, urnName: true, candidateNumber: true, cargoCode: true, reelection: true }
  });

  const byCargo: Record<number, any[]> = {};
  candidates.forEach(c => {
    if (!byCargo[c.cargoCode]) byCargo[c.cargoCode] = [];
    byCargo[c.cargoCode].push(c);
  });

  return {
    president: byCargo[1] || [],
    governor: byCargo[3] || [],
    senator: byCargo[5] || [],
    federalDeputy: byCargo[6] || [],
    stateDeputy: byCargo[7] || [],
    stateDeputyReelection: (byCargo[7] || []).filter(c => c.reelection === true),
  };
}

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomLatLng(baseLat: number, baseLng: number, radiusKm: number = 50) {
  // Add random offset within radiusKm
  const latOffset = (Math.random() - 0.5) * (radiusKm / 111);
  const lngOffset = (Math.random() - 0.5) * (radiusKm / (111 * Math.cos(baseLat * Math.PI / 180)));
  return {
    lat: baseLat + latOffset,
    lng: baseLng + lngOffset,
  };
}

function generateIP(): string {
  return `177.${getRandomInt(0, 255)}.${getRandomInt(0, 255)}.${getRandomInt(0, 255)}`;
}

async function main() {
  console.log('Fetching candidates...');
  const candidates = await getRandomCandidates(prisma);
  
  console.log('Candidate counts:', {
    president: candidates.president.length,
    governor: candidates.governor.length,
    senator: candidates.senator.length,
    federalDeputy: candidates.federalDeputy.length,
    stateDeputy: candidates.stateDeputy.length,
    stateDeputyReelection: candidates.stateDeputyReelection.length,
  });

  // Verify we have candidates for all cargos
  if (!candidates.president.length || !candidates.governor.length || !candidates.senator.length) {
    console.error('Missing candidates for required cargos!');
    return;
  }

  console.log('Inserting 50 test responses...');

  for (let i = 0; i < 50; i++) {
    const cityData = getRandomElement(tocantinsCities);
    const coords = randomLatLng(cityData.lat, cityData.lng, 30);
    
    // Select random candidates
    const governorVote = getRandomElement(candidates.governor);
    const presidentVote = getRandomElement(candidates.president);
    const senatorVote1 = getRandomElement(candidates.senator);
    let senatorVote2: typeof senatorVote1 | null = null;
    if (candidates.senator.length > 1) {
      const remaining = candidates.senator.filter(c => c.urnName !== senatorVote1.urnName);
      if (remaining.length > 0) senatorVote2 = getRandomElement(remaining);
    }
    const federalDeputyVote = getRandomElement(candidates.federalDeputy);
    const stateDeputyVote = getRandomElement(candidates.stateDeputy);
    
    let stateDeputyReelectionRejection: typeof stateDeputyVote | null = null;
    if (candidates.stateDeputyReelection.length > 0) {
      stateDeputyReelectionRejection = getRandomElement(candidates.stateDeputyReelection);
    }

    // Rejection votes (different from vote)
    const governorRejectionOptions = candidates.governor.filter(c => c.urnName !== governorVote.urnName);
    const governorRejection = governorRejectionOptions.length > 0 ? getRandomElement(governorRejectionOptions) : governorVote;
    
    const presidentRejectionOptions = candidates.president.filter(c => c.urnName !== presidentVote.urnName);
    const presidentRejection = presidentRejectionOptions.length > 0 ? getRandomElement(presidentRejectionOptions) : presidentVote;

    const tocantinsVote = getRandomElement(tocantinsVotes);
    const gender = getRandomElement(genders);
    const ageRange = getRandomElement(ageRanges);
    const education = getRandomElement(educations);
    const presidentEvaluation = getRandomElement(evaluationOptions);
    const governorEvaluation = getRandomElement(evaluationOptions);

    await prisma.responses.create({
      data: {
        surveyId: SURVEY_ID,
        city: cityData.city,
        tocantinsVote,
        gender,
        ageRange,
        education,
        governorVote: governorVote.urnName,
        governorRejection: governorRejection.urnName,
        governorEvaluation: governorEvaluation,
        presidentVote: presidentVote.urnName,
        presidentRejection: presidentRejection.urnName,
        presidentEvaluation: presidentEvaluation,
        senatorVote: senatorVote1.urnName,
        senatorVote2: senatorVote2?.urnName || null,
        stateDeputyVote: stateDeputyVote.urnName,
        stateDeputyReelectionRejection: stateDeputyReelectionRejection?.urnName || null,
        federalDeputyVote: federalDeputyVote.urnName,
        ipAddress: generateIP(),
        latitude: coords.lat,
        longitude: coords.lng,
        isValid: true,
      },
    });

    if ((i + 1) % 10 === 0) {
      console.log(`Inserted ${i + 1}/50 responses...`);
    }
  }

  console.log('Done! Inserted 50 test responses.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });