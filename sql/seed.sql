
-- Minimal seed for demo
INSERT INTO "Supplier"(id, name, email, phone, "createdAt", "updatedAt")
VALUES 
  ('sup_1','AeroParts West','sales@aeroparts.example','+1-555-1000', now(), now()),
  ('sup_2','Patriot Components','quotes@patriotco.example','+1-555-2000', now(), now())
ON CONFLICT DO NOTHING;

-- Parts
INSERT INTO "Part"(id, nsn, name, spec, "createdAt", "updatedAt")
VALUES
  ('part_1','3110-00-100-1234','F-35 Bearing','MIL-S-123', now(), now()),
  ('part_2','1620-00-200-5678','Blackhawk Rotor Hub','MIL-R-456', now(), now())
ON CONFLICT DO NOTHING;

-- RFQs
INSERT INTO "RFQ"(id, "rfqNumber", buyer, "dueDate", status, source, "createdAt", "updatedAt")
VALUES
  ('rfq_1','RFQ-2025-0001','DLA Aviation','2025-11-15','OPEN','ERP', now(), now());

-- RFQ Items
INSERT INTO "RFQItem"(id, "rfqId", "partId", quantity, notes)
VALUES
  ('rfqi_1','rfq_1','part_1', 20, 'Urgent'),
  ('rfqi_2','rfq_1','part_2', 5,  'Standard');
