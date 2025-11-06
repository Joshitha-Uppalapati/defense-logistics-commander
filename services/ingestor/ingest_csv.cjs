const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const filePath = path.resolve(__dirname, "../../data/rfq_sample.csv");

function normalizeRow(row) {
  const o = {};
  for (const [k, v] of Object.entries(row)) {
    const key = String(k).trim();
    const val = typeof v === "string" ? v.trim() : v;
    o[key] = val;
  }
  const pick = (...keys) => keys.map(k => o[k]).find(x => x != null && String(x).trim() !== "");

  return {
    rfqNumber: pick("rfqNumber", "RFQ", "rfq_id"),
    nsn:       pick("nsn", "NSN", "stockNumber"),
    buyer:     pick("buyer", "Buyer", "customer"),
    supplierId:pick("supplierId", "supplier_id", "vendorId"),
    dueDate:   pick("dueDate", "DueDate", "due_date"),
    status:    pick("status", "Status") || "OPEN",
    source:    pick("source", "Source") || "ERP",
    item:      pick("item", "Item", "partName", "description"),
    quantity:  pick("quantity", "Quantity", "qty"),
    unitPrice: pick("unitPrice", "UnitPrice", "price"),
    currency:  pick("currency", "Currency") || "USD",
    priority:  pick("priority", "Priority"),
    createdAt: pick("createdAt", "CreatedAt"),
    updatedAt: pick("updatedAt", "UpdatedAt"),
  };
}

async function readCsv(fp) {
  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(fp)
      .pipe(csv())
      .on("data", (r) => rows.push(r))
      .on("end", () => resolve(rows))
      .on("error", reject);
  });
}

async function main() {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ CSV not found at ${filePath}`);
    process.exit(1);
  }

  const raw = await readCsv(filePath);
  if (!raw.length) {
    console.error("❌ CSV has no rows.");
    process.exit(1);
  }

  let rfqCreated = 0, rfqItemsCreated = 0, partsUpserted = 0;

  for (const r0 of raw) {
    const r = normalizeRow(r0);

    if (!r.nsn || !r.item || !r.rfqNumber) {
      console.warn("⚠️ Skipping row with missing fields:", r0);
      continue;
    }

    const part = await prisma.part.upsert({
      where: { nsn: r.nsn },
      update: { name: r.item, spec: r.priority ? `priority:${r.priority}` : null },
      create: { nsn: r.nsn, name: r.item, spec: r.priority ? `priority:${r.priority}` : null }
    });
    partsUpserted++;

    let rfq = await prisma.rFQ.findUnique({ where: { rfqNumber: r.rfqNumber } });
    if (!rfq) {
      rfq = await prisma.rFQ.create({
        data: {
          rfqNumber: r.rfqNumber,
          buyer: r.buyer || "Unknown",
          dueDate: r.dueDate ? new Date(r.dueDate) : new Date(),
          status: r.status,
          source: r.source
        }
      });
      rfqCreated++;
    }

    const qty = parseInt(r.quantity, 10) || 0;
    const priceStr = r.unitPrice != null ? String(r.unitPrice) : "0";
    await prisma.rFQItem.create({
      data: {
        rfqId: rfq.id,
        partId: part.id,
        quantity: qty,
        notes: `${r.currency} @ ${priceStr}`
      }
    });
    rfqItemsCreated++;
  }

  console.log(`✅ Ingest complete: RFQs ${rfqCreated}, RFQ items ${rfqItemsCreated}, parts ${partsUpserted}. Source: ${filePath}`);
}

main()
  .catch((e) => { console.error("❌ Ingest error:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });

