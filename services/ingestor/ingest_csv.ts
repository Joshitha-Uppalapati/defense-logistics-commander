import fs from "fs";
import path from "path";
import csv from "csv-parser";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const filePath = path.resolve(__dirname, "../../data/rfq_sample.csv");

type Row = {
  rfqNumber: string;
  nsn: string;
  buyer: string;
  supplierId: string;
  dueDate: string; 
  status: string;
  source: string;  
  item: string;
  quantity: string;
  unitPrice: string;
  currency: string;
  priority: string;
  createdAt?: string;
  updatedAt?: string;
};

async function main() {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ CSV not found at ${filePath}`);
    process.exit(1);
  }

  const rows: Row[] = await new Promise((resolve, reject) => {
    const acc: Row[] = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => acc.push(row))
      .on("end", () => resolve(acc))
      .on("error", reject);
  });

  let rfqCreated = 0;
  let rfqItemsCreated = 0;
  let partsUpserted = 0;

  for (const r of rows) {
    const part = await prisma.part.upsert({
      where: { nsn: r.nsn },
      update: {
        name: r.item,
        spec: r.priority ? `priority:${r.priority}` : null,
      },
      create: {
        nsn: r.nsn,
        name: r.item,
        spec: r.priority ? `priority:${r.priority}` : null,
      },
    });
    partsUpserted++;

    let rfq = await prisma.rFQ.findUnique({ where: { rfqNumber: r.rfqNumber } });
    if (!rfq) {
      rfq = await prisma.rFQ.create({
        data: {
          rfqNumber: r.rfqNumber,
          buyer: r.buyer,
          dueDate: new Date(r.dueDate),
          status: r.status || "OPEN",
          source: r.source || "ERP",
        },
      });
      rfqCreated++;
    }

    await prisma.rFQItem.create({
      data: {
        rfqId: rfq.id,
        partId: part.id,
        quantity: parseInt(r.quantity, 10) || 0,
        notes: `${r.currency || "USD"} @ ${r.unitPrice}`,
      },
    });
    rfqItemsCreated++;
  }

  console.log(
    `✅ Ingest complete: RFQs created ${rfqCreated}, RFQ items ${rfqItemsCreated}, parts upserted ${partsUpserted}. Source: ${filePath}`
  );
}

main()
  .catch((e) => {
    console.error("❌ Ingest error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

