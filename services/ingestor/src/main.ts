
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { XMLParser } from 'fast-xml-parser';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), '../../sample_data');

async function ingestERPCSV(filePath: string) {
  const input = fs.readFileSync(filePath, 'utf-8');
  const rows = parse(input, { columns: true, skip_empty_lines: true });
  const rfqMap = new Map<string, any>();

  for (const r of rows) {
    const rfqNumber = r['RFQ_NUMBER'];
    const nsn = r['NSN'];
    const partName = r['PART_NAME'];
    const qty = parseInt(r['QTY'], 10);
    const dueDate = new Date(r['DUE_DATE']);

    let rfq = rfqMap.get(rfqNumber);
    if (!rfq) {
      rfq = { rfqNumber, buyer: r['BUYER'] || 'Unknown', dueDate, items: [] };
      rfqMap.set(rfqNumber, rfq);
    }
    rfq.items.push({ nsn, partName, quantity: qty });
  }

  for (const [, rfq] of rfqMap) {
    const created = await prisma.rFQ.upsert({
      where: { rfqNumber: rfq.rfqNumber },
      update: {},
      create: {
        rfqNumber: rfq.rfqNumber,
        buyer: rfq.buyer,
        dueDate: rfq.dueDate,
        source: 'ERP',
      }
    });

    for (const it of rfq.items) {
      const part = await prisma.part.upsert({
        where: { nsn: it.nsn },
        update: { name: it.partName },
        create: { nsn: it.nsn, name: it.partName }
      });
      await prisma.rFQItem.create({
        data: { rfqId: created.id, partId: part.id, quantity: it.quantity }
      });
    }
  }

  console.log(`Ingested ${rfqMap.size} RFQs from ${path.basename(filePath)}`);
}

async function ingestGovXML(filePath: string) {
  const xml = fs.readFileSync(filePath, 'utf-8');
  const parser = new XMLParser();
  const obj = parser.parse(xml);

  const rfqs = Array.isArray(obj.Solicitations?.RFQ) ? obj.Solicitations.RFQ : [obj.Solicitations?.RFQ].filter(Boolean);
  for (const r of rfqs) {
    const rfqNumber = r.Number;
    const buyer = r.Buyer || 'Gov';
    const dueDate = new Date(r.DueDate);
    const created = await prisma.rFQ.upsert({
      where: { rfqNumber },
      update: {},
      create: { rfqNumber, buyer, dueDate, source: 'GOV' }
    });
    const lines = Array.isArray(r.Lines?.Line) ? r.Lines.Line : [r.Lines?.Line].filter(Boolean);
    for (const l of lines) {
      const nsn = l.NSN;
      const name = l.Description || 'Unknown';
      const qty = parseInt(l.Quantity, 10);
      const part = await prisma.part.upsert({
        where: { nsn },
        update: { name },
        create: { nsn, name }
      });
      await prisma.rFQItem.create({
        data: { rfqId: created.id, partId: part.id, quantity: qty }
      });
    }
  }
  console.log(`Ingested GOV XML: ${path.basename(filePath)}`);
}

async function main() {
  const csvPath = path.join(DATA_DIR, 'erp_export.csv');
  const xmlPath = path.join(DATA_DIR, 'gov_solicitations.xml');
  if (fs.existsSync(csvPath)) await ingestERPCSV(csvPath);
  if (fs.existsSync(xmlPath)) await ingestGovXML(xmlPath);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
