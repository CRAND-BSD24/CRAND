"use server";

import { getMongoClientInstance } from "@/db/config/connection";
import { ObjectId } from "mongodb";

export async function getDistinctPositions(query?: string) {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");
  const positions = await db.collection("teachers").distinct("position");
  const list = (positions || []).filter((p) => typeof p === 'string' && p.trim().length > 0) as string[];
  const sorted = list.sort((a, b) => a.localeCompare(b));
  const q = (query || '').toLowerCase();
  const filtered = q ? sorted.filter((x) => x.toLowerCase().includes(q)) : sorted;
  return filtered;
}

const DEFAULT_POSITIONS = [
  "Pimpinan","Penasihat","Direktur Operasional","Direktur Pendidikan","Manajer Kepengasuhan","Manajer Tahfizh","Manajer Keuangan & Bisnis","Manajer Sekolah Menengah & Litbang","Manajer Sekolah Dasar","Manajer Sekretariat","Manajer Aset, Kerumahtanggaan & Infrastruktur","SPV Kedisiplinan, Kerapihan & Kesehatan","SPV Akhlak & Ibadah","SPV Tahfizh","SPV Kurikulum & Kedisiplinan","SPV Bahasa & Pengajaran","SPV BASAM","SPV CRM","SPV Media","SPV Keuangan","SPV PISMART","SPV Laundry","SPV Aset & Infrastruktur","SPV Kerumahtanggaan","Staff Tahfizh","Staff Kepengasuhan","Staff Bahasa & Pengajaran","Security","Office Boy","Staff HRD","Staff Dapur","Staff PISMART","Staff Keuangan"
];

export async function getPositionsFromDB(query?: string) {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");
  const col = db.collection("job_positions");
  const count = await col.countDocuments();
  if (count === 0) {
    await col.insertMany(DEFAULT_POSITIONS.map((name) => ({ name })));
  }
  const filter: any = {};
  const q = (query || '').trim();
  if (q) filter.name = { $regex: q, $options: 'i' };
  const rows = await col.find(filter).sort({ name: 1 }).toArray();
  return rows.map((r) => r.name as string);
}

export async function getBaseSalaryForPosition(position: string) {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");
  const doc = await db.collection("position_base_salaries").find({ position }).sort({ updated_at: -1 }).limit(1).toArray();
  return doc[0]?.amount || 0;
}

export async function saveBaseSalaryForPosition(position: string, amount: number) {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");
  await db.collection("position_base_salaries").insertOne({ position, amount, updated_at: new Date() });
  return { success: true };
}

export async function getBaseSalaryEntries(position: string) {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");
  const docs = await db
    .collection("position_base_salaries")
    .find({ position })
    .sort({ years_of_service: 1, updated_at: -1 })
    .toArray();
  return docs.map((d) => ({
    _id: d._id?.toString?.() || "",
    years_of_service: Number(d.years_of_service || 0),
    amount: Number(d.amount || 0),
  }));
}

export async function replaceBaseSalaryEntries(position: string, entries: { years_of_service: number; amount: number }[]) {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");
  await db.collection("position_base_salaries").deleteMany({ position });
  if (entries.length > 0) {
    await db.collection("position_base_salaries").insertMany(
      entries.map((e) => ({ position, years_of_service: Number(e.years_of_service || 0), amount: Number(e.amount || 0), updated_at: new Date() }))
    );
  }
  return { success: true };
}

export async function deleteBaseSalaryEntry(id: string) {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");
  await db.collection("position_base_salaries").deleteOne({ _id: new ObjectId(id) });
  return { success: true };
}

export async function importBaseSalariesFromXLS(html: string) {
  try {
    const rowMatches = html.match(/<tr[\s\S]*?<\/tr>/gi) || [];
    if (rowMatches.length <= 1) {
      return { success: false, entriesProcessed: 0, positionsAdded: 0, inserted: 0, errors: ["Tidak ada baris data"] };
    }

    const stripTags = (s: string) => s.replace(/<[^>]*>/g, "").trim();
    const decodeEntities = (s: string) =>
      s
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&#(\d+);/g, (_m, code) => {
          const n = Number(code);
          return Number.isFinite(n) ? String.fromCharCode(n) : _m;
        });
    const normalizeSpace = (s: string) => s.replace(/[\t\r\n]+/g, " ").replace(/\s{2,}/g, " ");
    const cleanPosition = (s: string) => {
      const decoded = normalizeSpace(decodeEntities(stripTags(s))).replace(/[\u200B-\u200D\uFEFF]/g, "");
      const trimmedEdges = decoded.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, "");
      return trimmedEdges.trim();
    };
    const normalizeKey = (s: string) => s.toLowerCase().replace(/[^a-zA-Z0-9]+/g, " ").trim().replace(/\s{2,}/g, " ");
    const isValidPositionName = (s: string) => {
      if (!s) return false;
      const hasLetter = /[a-zA-Z]/.test(s);
      if (!hasLetter) return false;
      const cleaned = s.replace(/[^a-zA-Z0-9 ]/g, "").trim();
      if (cleaned.length < 2) return false;
      const lower = cleaned.toLowerCase();
      if (["jabatan", "masa bakti", "nominal gaji pokok", "nama jabatan"].includes(lower)) return false;
      return true;
    };
    const items: { position: string; years_of_service: number; amount: number }[] = [];
    const errors: string[] = [];

    for (let i = 1; i < rowMatches.length; i++) {
      const row = rowMatches[i];
      const cellMatches = row.match(/<t[dh][^>]*>[\s\S]*?<\/t[dh]>/gi) || [];
      if (cellMatches.length < 3) {
        errors.push(`Baris ${i + 1} tidak valid`);
        continue;
      }
      const position = cleanPosition(cellMatches[0] || "");
      const yearsStr = normalizeSpace(decodeEntities(stripTags(cellMatches[1] || "")));
      const amountStr = normalizeSpace(decodeEntities(stripTags(cellMatches[2] || "")));

      const years = Number((yearsStr || "").replace(/\D/g, "")) || 0;
      const amount = Number((amountStr || "").replace(/\D/g, "")) || 0;
      if (!isValidPositionName(position)) {
        errors.push(`Baris ${i + 1}: jabatan tidak valid`);
        continue;
      }
      items.push({ position, years_of_service: years, amount });
    }

    const client = await getMongoClientInstance();
    const db = client.db("pesantren_db");

    // Bangun peta normalisasi dari job_positions agar nama impor dipetakan ke nama kanonik yang sudah ada
    const existingPositionsList = await getPositionsFromDB();
    const existingMap = new Map<string, string>();
    for (const p of existingPositionsList) existingMap.set(normalizeKey(p), p);

    // Petakan setiap item ke nama kanonik jika tersedia
    const canonicalItems: { position: string; years_of_service: number; amount: number }[] = [];
    for (const it of items) {
      const key = normalizeKey(it.position);
      const canonical = existingMap.get(key) || it.position;
      canonicalItems.push({ position: canonical, years_of_service: it.years_of_service, amount: it.amount });
    }

    const positions = Array.from(new Set(canonicalItems.map((x) => x.position)));
    let positionsAdded = 0;
    if (positions.length > 0) {
      const col = db.collection("job_positions");
      const existing = await col.find({ name: { $in: positions } }).toArray();
      const existingNames = new Set<string>(existing.map((r: any) => r.name));
      const missing = positions.filter((p) => !existingNames.has(p) && isValidPositionName(p));
      if (missing.length > 0) {
        await col.insertMany(missing.map((name) => ({ name })));
        positionsAdded = missing.length;
      }
    }

    const byPosition = new Map<string, { years_of_service: number; amount: number }[]>();
    for (const it of canonicalItems) {
      const arr = byPosition.get(it.position) || [];
      arr.push({ years_of_service: it.years_of_service, amount: it.amount });
      byPosition.set(it.position, arr);
    }

    let inserted = 0;
    for (const [position, entries] of Array.from(byPosition.entries())) {
      await replaceBaseSalaryEntries(position, entries);
      inserted += entries.length;
    }

    return { success: true, entriesProcessed: items.length, positionsAdded, inserted, errors };
  } catch (e: any) {
    return { success: false, entriesProcessed: 0, positionsAdded: 0, inserted: 0, errors: [String(e?.message || e)] };
  }
}

export async function importBaseSalariesRows(items: { position: string; years_of_service: number; amount: number }[]) {
  try {
    const normalizeSpace = (s: string) => s.replace(/[\t\r\n]+/g, " ").replace(/\s{2,}/g, " ");
    const cleanPosition = (s: string) => {
      const decoded = normalizeSpace(String(s || "")).replace(/[\u200B-\u200D\uFEFF]/g, "");
      const trimmedEdges = decoded.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, "");
      return trimmedEdges.trim();
    };
    const isValidPositionName = (s: string) => {
      if (!s) return false;
      const hasLetter = /[a-zA-Z]/.test(s);
      if (!hasLetter) return false;
      const cleaned = s.replace(/[^a-zA-Z0-9 ]/g, "").trim();
      if (cleaned.length < 2) return false;
      const lower = cleaned.toLowerCase();
      if (["jabatan", "masa bakti", "nominal gaji pokok", "nama jabatan", "nominal", "nominal gaji"].includes(lower)) return false;
      return true;
    };
    const normalizeKey = (s: string) => s.toLowerCase().replace(/[^a-zA-Z0-9]+/g, " ").trim().replace(/\s{2,}/g, " ");

    const client = await getMongoClientInstance();
    const db = client.db("pesantren_db");

    const existingPositionsList = await getPositionsFromDB();
    const existingMap = new Map<string, string>();
    for (const p of existingPositionsList) existingMap.set(normalizeKey(p), p);

    const canonicalItems: { position: string; years_of_service: number; amount: number }[] = [];
    for (const it of items) {
      const pos = cleanPosition(it.position);
      if (!isValidPositionName(pos)) continue;
      const key = normalizeKey(pos);
      const canonical = existingMap.get(key) || pos;
      const years = Number(it.years_of_service || 0) || 0;
      const amount = Number(it.amount || 0) || 0;
      canonicalItems.push({ position: canonical, years_of_service: years, amount });
    }

    const positions = Array.from(new Set(canonicalItems.map((x) => x.position)));
    let positionsAdded = 0;
    if (positions.length > 0) {
      const col = db.collection("job_positions");
      const existing = await col.find({ name: { $in: positions } }).toArray();
      const existingNames = new Set<string>(existing.map((r: any) => r.name));
      const missing = positions.filter((p) => !existingNames.has(p) && isValidPositionName(p));
      if (missing.length > 0) {
        await col.insertMany(missing.map((name) => ({ name })));
        positionsAdded = missing.length;
      }
    }

    const byPosition = new Map<string, { years_of_service: number; amount: number }[]>();
    for (const it of canonicalItems) {
      const arr = byPosition.get(it.position) || [];
      arr.push({ years_of_service: it.years_of_service, amount: it.amount });
      byPosition.set(it.position, arr);
    }

    let inserted = 0;
    for (const [position, entries] of Array.from(byPosition.entries())) {
      await replaceBaseSalaryEntries(position, entries);
      inserted += entries.length;
    }

    return { success: true, entriesProcessed: canonicalItems.length, positionsAdded, inserted, errors: [] };
  } catch (e: any) {
    return { success: false, entriesProcessed: 0, positionsAdded: 0, inserted: 0, errors: [String(e?.message || e)] };
  }
}

export async function generateBaseSalaryImportTemplate() {
  const positions = await getPositionsFromDB();
  const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
  const formatAmount = (n: number) => {
    if (!Number.isFinite(n)) return "";
    if (n <= 0) return "0";
    const s = String(Math.floor(n));
    return s.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };
  const rows: string[] = [];
  const entriesList = await Promise.all(positions.map((p) => getBaseSalaryEntries(p)));
  for (let i = 0; i < positions.length; i++) {
    const p = positions[i];
    const entries = entriesList[i] || [];
    if (entries.length === 0) {
      rows.push(`<tr><td>${escapeHtml(p)}</td><td></td><td></td></tr>`);
      continue;
    }
    for (const e of entries) {
      rows.push(`<tr><td>${escapeHtml(p)}</td><td>${Number(e.years_of_service || 0)}</td><td>${formatAmount(Number(e.amount || 0))}</td></tr>`);
    }
  }
  const table = `<table border="1"><tr><th>Jabatan</th><th>Masa Bakti (tahun)</th><th>Nominal Gaji Pokok</th></tr>${rows.join("")}</table>`;
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>${table}</body></html>`;
  return html;
}