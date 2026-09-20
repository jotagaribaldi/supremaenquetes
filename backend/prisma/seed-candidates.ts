import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as iconv from 'iconv-lite';

const prisma = new PrismaClient();

const CARGO_MAP: Record<number, string> = {
  3: 'GOVERNADOR',
  4: 'VICE-GOVERNADOR',
  5: 'SENADOR',
  6: 'DEPUTADO FEDERAL',
  7: 'DEPUTADO ESTADUAL',
  9: '1º SUPLENTE',
  10: '2º SUPLENTE',
};

async function main() {
  const csvPath = path.resolve(__dirname, '../../consulta_cand_2026_TO.csv');
  const buffer = fs.readFileSync(csvPath);
  const content = iconv.decode(buffer, 'iso-8859-1');
  const lines = content.trim().split('\n');

  const header = lines[0].split(';').map(h => h.replace(/"/g, ''));
  const dataLines = lines.slice(1);

  console.log(`Found ${dataLines.length} candidates to import`);

  let imported = 0;
  let skipped = 0;

  for (const line of dataLines) {
    const values = line.split(';').map(v => v.replace(/"/g, ''));

    if (values.length < header.length) {
      continue;
    }

    const row: Record<string, string> = {};
    header.forEach((h, i) => {
      row[h] = values[i] || '';
    });

    const state = row['SG_UF'];
    const cargoCode = parseInt(row['CD_CARGO'], 10);
    const cargoName = CARGO_MAP[cargoCode] || row['DS_CARGO'];

    if (!state || !cargoCode) {
      skipped++;
      continue;
    }

    const candidateNumber = parseInt(row['NR_CANDIDATO'], 10) || 0;
    const partyNumber = row['NR_PARTIDO'] ? parseInt(row['NR_PARTIDO'], 10) : null;
    const partyAcronym = row['SG_PARTIDO'] || null;
    const partyName = row['NM_PARTIDO'] || null;
    const coalitionName = row['NM_COLIGACAO'] || null;
    const federationName = row['NM_FEDERACAO'] || null;
    const situation = row['DS_SITUACAO_CANDIDATURA'] || null;
    const rawEmail = row['DS_EMAIL'] !== 'NÃO DIVULGÁVEL' ? row['DS_EMAIL'] : null;
    const email = rawEmail && rawEmail.length > 500 ? rawEmail.substring(0, 500) : rawEmail;

    try {
      await prisma.candidates.create({
        data: {
          state: state.toUpperCase(),
          cargoCode,
          cargoName,
          candidateNumber,
          name: row['NM_CANDIDATO'],
          urnName: row['NM_URNA_CANDIDATO'],
          partyNumber,
          partyAcronym,
          partyName,
          coalitionName,
          federationName,
          situation,
          email,
        },
      });
      imported++;
    } catch (error: any) {
      if (error.code === 'P2002') {
        skipped++;
      } else {
        console.error('Error importing candidate:', row['NM_URNA_CANDIDATO'], error.message);
        skipped++;
      }
    }
  }

  console.log(`Imported: ${imported}, Skipped: ${skipped}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });