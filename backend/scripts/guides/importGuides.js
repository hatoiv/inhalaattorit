// One-time import of the client's patient guide PDFs, done through the normal admin API.
// Creates the guides (with PDFs) and connects them to inhalers as listed in productGuides.json,
// which was made from the client's Word list "Tuotekohtaiset potilasohjeet lueteltuna.docx".
//
// Dry run (default, changes nothing):
//   node scripts/guides/importGuides.js url=https://inhalaattorit.fi username=NAME password=PASS dir=../../guide_pdfs
// Apply:
//   ... apply=1
//
// Safe to run again: guides that already exist (same Finnish name) are reused without re-uploading,
// and inhalers that already have guides are left alone.

const fs = require('fs');
const path = require('path');
const args = require('args-parser')(process.argv);

// Swedish names are drafts based on the PDF titles, the client can edit them in the admin panel.
const GUIDES = [
    { key: "diskus", category: "dpi", fi: "Diskus", sv: "Diskus", fiFile: "Diskus.pdf", svFile: "Diskus RU.pdf" },
    { key: "easyhaler", category: "dpi", fi: "Easyhaler", sv: "Easyhaler", fiFile: "DPI Easyhaler2.pdf", svFile: "Easyhaler RU.pdf" },
    { key: "ellipta", category: "dpi", fi: "Ellipta", sv: "Ellipta", fiFile: "Ellipta.pdf", svFile: "Ellipta RU.pdf" },
    { key: "genuair", category: "dpi", fi: "Genuair", sv: "Genuair", fiFile: "Genuair.pdf", svFile: "Genuair RU.pdf" },
    { key: "nexthaler", category: "dpi", fi: "Nexthaler", sv: "Nexthaler", fiFile: "Nexthaler.pdf", svFile: "Nexthaler RU.pdf" },
    { key: "turbuhaler", category: "dpi", fi: "Turbuhaler", sv: "Turbuhaler", fiFile: "Turbuhaler.pdf", svFile: "Turbuhaler RU.pdf" },
    { key: "twisthaler", category: "dpi", fi: "Twisthaler", sv: "Twisthaler", fiFile: "Twisthaler.pdf", svFile: null },
    { key: "breezhaler", category: "capsule", fi: "Breezhaler", sv: "Breezhaler", fiFile: "Breezhaler.pdf", svFile: "Breezhaler RU.pdf" },
    { key: "handihaler", category: "capsule", fi: "Handihaler, Tiogiva", sv: "Handihaler, Tiogiva", fiFile: "Handihaler, Tiogiva.pdf", svFile: "Handihaler, Tiogiva RU.pdf" },
    { key: "tiotropium-stada", category: "capsule", fi: "Tiotropium Stada", sv: "Tiotropium Stada", fiFile: "Tiotropium Stada.pdf", svFile: "Tiotropium Stada RU.pdf" },
    { key: "pmdi", category: "pmdi-smi", fi: "Ponnekaasusumutin (pMDI)", sv: "Drivgasaerosol (pMDI)", fiFile: "Ponnekaasusumutin.pdf", svFile: "pMDI RU.pdf" },
    { key: "smi", category: "pmdi-smi", fi: "Soft mist inhaler (SMI)", sv: "Soft mist inhaler (SMI)", fiFile: "Soft mist inhaler.pdf", svFile: "SMI RU.pdf" },
    { key: "pmdi-spacer", category: "spacer", fi: "Ponnekaasusumutin tilanjatkeen kanssa", sv: "Drivgasaerosol (pMDI) och spacer", fiFile: "Ponnekaasusumutin tilanjatkeen kanssa.pdf", svFile: "pMDI och spacer RU.pdf" },
    { key: "smi-spacer", category: "spacer", fi: "Soft mist inhaler tilanjatkeen kanssa", sv: "Soft mist inhaler (SMI) och spacer", fiFile: "Soft mist inhaler tilanjatkeen kanssa.pdf", svFile: "SMI och spacer RU.pdf" },
    { key: "pmdi-mask-children", category: "spacer-mask", fi: "Ponnekaasusumutin tilanjatkeen ja maskin kanssa, lapset", sv: "Drivgasaerosol (pMDI), spacer och ansiktsmask, barn", fiFile: "Ponnekaasusumutin tilanjatkeen ja maskin kanssa lapset2.pdf", svFile: "pMDI spacer och ansiktsmask lapset RU.pdf" },
    { key: "pmdi-mask-adults", category: "spacer-mask", fi: "Ponnekaasusumutin tilanjatkeen ja maskin kanssa, aikuiset", sv: "Drivgasaerosol (pMDI), spacer och ansiktsmask, vuxna", fiFile: "Ponnekaasusumutin tilanjatkeen ja maskin kanssa aikuiset2.pdf", svFile: "pMDI spacer och ansiktsmask aikuiset RU.pdf" },
    { key: "smi-mask", category: "spacer-mask", fi: "Soft mist inhaler tilanjatkeen ja maskin kanssa", sv: "Soft mist inhaler (SMI), spacer och ansiktsmask", fiFile: "Soft mist inhaler tilanjatkeen ja maskin kanssa.pdf", svFile: "SMI spacer och ansiktsmask RU.pdf" },
    { key: "breath-actuated", category: "breath-actuated", fi: "Sisäänhengityksen laukaisema ponnekaasusumutin", sv: "Drivgasaerosol som utlöses vid inandning", fiFile: "Sisäänhengityksen laukaisema ponnekaasusumutin.pdf", svFile: "Drivgasaerosol som utlöses vid inhandning.pdf" }
];

// spelling differences between the Word list and the site's data
const NAME_ALIASES = { "bevespi aeropshere": "bevespi aerosphere" };

const SPACER_INTAKE_STYLE_ID = 5;

const normalize = (name) => {
    const n = String(name).replace(/®/g, "").replace(/\s+/g, " ").trim().toLowerCase();
    return NAME_ALIASES[n] || n;
};

// the client's filenames may use decomposed characters (a + combining umlaut), so compare normalized names
const findFile = (dir, name) => {
    const match = fs.readdirSync(dir).find(f => f.normalize("NFC") === name.normalize("NFC"));
    if (!match) throw new Error("Missing PDF: " + path.join(dir, name));
    return path.join(dir, match);
};

const main = async () => {
    const { url, username, password, dir } = args;
    const apply = args.apply === 1 || args.apply === "1" || args.apply === true;
    if (!url || !username || !password || !dir) {
        console.log("Use: node scripts/guides/importGuides.js url={site url} username={admin} password={password} dir={folder with the PDFs} [apply=1]");
        process.exit(1);
    }
    if (!/^https?:\/\//.test(String(url))) {
        console.log("url must start with http:// or https://, for example url=http://localhost:3000");
        process.exit(1);
    }
    const base = String(url).replace(/\/$/, "");
    console.log(apply ? "APPLYING changes to " + base : "DRY RUN against " + base + " (add apply=1 to make changes)");

    // every PDF must exist before anything is changed
    for (const guide of GUIDES) {
        for (const file of [guide.fiFile, guide.svFile].filter(Boolean)) findFile(dir, file);
    }

    const loginRes = await fetch(base + "/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });
    if (!loginRes.ok) throw new Error("Login failed: " + loginRes.status);
    const { token } = await loginRes.json();
    const auth = { Authorization: "Bearer " + token };

    const request = async (method, apiPath, body, isForm = false) => {
        const res = await fetch(base + apiPath, {
            method,
            headers: isForm ? auth : { ...auth, "Content-Type": "application/json" },
            body: isForm ? body : JSON.stringify(body)
        });
        if (!res.ok) throw new Error(`${method} ${apiPath} failed: ${res.status} ${await res.text()}`);
        return res.json();
    };

    // 1. guides
    const existing = await (await fetch(base + "/api/admin/guides", { headers: auth })).json();
    const guideIds = {};
    for (const guide of GUIDES) {
        const found = existing.find(g => g.fi.name === guide.fi);
        if (found) {
            guideIds[guide.key] = found.id;
            console.log(`guide exists, reused: ${guide.fi} (id ${found.id})`);
            continue;
        }
        if (!apply) {
            guideIds[guide.key] = "new:" + guide.key;
            console.log(`would create guide: ${guide.fi} [${guide.fiFile}${guide.svFile ? ", " + guide.svFile : ", no Swedish PDF"}]`);
            continue;
        }
        const form = new FormData();
        form.append("name_fi", guide.fi);
        form.append("name_sv", guide.sv);
        form.append("category", guide.category);
        form.append("file_fi", await fs.openAsBlob(findFile(dir, guide.fiFile), { type: "application/pdf" }), guide.fiFile);
        if (guide.svFile) {
            form.append("file_sv", await fs.openAsBlob(findFile(dir, guide.svFile), { type: "application/pdf" }), guide.svFile);
        }
        const { id } = await request("POST", "/api/admin/guides", form, true);
        guideIds[guide.key] = id;
        console.log(`created guide: ${guide.fi} (id ${id})`);
    }

    // 2. inhalers
    const inhalers = await (await fetch(base + "/api/inhalers?lang=fi")).json();
    const mapping = JSON.parse(fs.readFileSync(path.join(__dirname, "productGuides.json"), "utf-8"));
    const forClient = [];
    const used = new Set();

    for (const entry of mapping) {
        const label = entry.name + (entry.spacer ? " + tilanjatke" : "");
        if (entry.note) forClient.push(`${label}: ${entry.note}`);

        const matches = inhalers.filter(i =>
            normalize(i.name) === normalize(entry.name) &&
            i.intake_styles.some(s => s.intake_style_id === SPACER_INTAKE_STYLE_ID) === entry.spacer
        );
        if (matches.length !== 1) {
            forClient.push(`${label}: found ${matches.length} matching inhalers on the site, not set.`);
            continue;
        }
        const inhaler = matches[0];
        used.add(inhaler.id);
        if (entry.skip) { console.log(`skipped: ${label}`); continue; }

        if (inhaler.guides && inhaler.guides.length > 0) {
            console.log(`already has guides, left alone: ${inhaler.name} (id ${inhaler.id})`);
            continue;
        }
        const ids = entry.guides.map(k => guideIds[k]);
        if (!apply) {
            console.log(`would set: ${inhaler.name} (id ${inhaler.id}) <- ${entry.guides.join(", ")}`);
            continue;
        }
        await request("PUT", "/api/admin/inhalers/" + inhaler.id, { guides: ids });
        console.log(`set: ${inhaler.name} (id ${inhaler.id}) <- ${entry.guides.join(", ")}`);
    }

    for (const inhaler of inhalers) {
        if (!used.has(inhaler.id)) forClient.push(`${inhaler.name} (id ${inhaler.id}): not in the Word list, not set.`);
    }

    console.log("\nFor the client to check and set by hand in the admin panel:");
    forClient.forEach(line => console.log(" - " + line));
};

main().catch(err => {
    console.error(err.message);
    process.exit(1);
});
