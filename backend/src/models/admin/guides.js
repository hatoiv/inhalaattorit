const db = require('../../db/database');

const LANGUAGES = ["fi", "sv"];

// groups of the inhaler usage page (inhalaattorien-kaytto.html), labels live in the frontend
const CATEGORIES = ["dpi", "capsule", "pmdi-smi", "spacer", "spacer-mask", "breath-actuated"];

const guideUrl = (id, language, version) => `/guides/${id}-${language}.pdf?v=${version}`;

// all guides as [{id, category, used_by, fi: {name, url}, sv: {name, url}}], url is null when that language has no PDF
const getAll = () => {
    const guides = db.prepare(`
        SELECT g.id, g.category, COUNT(mg.medicine_id) AS used_by
        FROM guide g
        LEFT JOIN medicine_guide mg ON mg.guide_id = g.id
        GROUP BY g.id
    `).all();

    const translations = db.prepare("SELECT guide_id, language, name, file_version FROM guide_translation").all();

    return guides.map(guide => {
        for (const language of LANGUAGES) {
            const row = translations.find(t => t.guide_id === guide.id && t.language === language);
            guide[language] = {
                name: row ? row.name : "",
                url: row && row.file_version ? guideUrl(guide.id, language, row.file_version) : null
            };
        }
        return guide;
    });
};

// guides of one medicine in one language as [{id, name, url}]
const getForMedicine = (medicine_id, language) => {
    return db.prepare(`
        SELECT g.id, gt.name, gt.file_version
        FROM medicine_guide mg
        JOIN guide g ON g.id = mg.guide_id
        LEFT JOIN guide_translation gt ON gt.guide_id = g.id AND gt.language = ?
        WHERE mg.medicine_id = ?
        ORDER BY gt.name
    `).all(language, medicine_id).map(row => ({
        id: row.id,
        name: row.name || "",
        url: row.file_version ? guideUrl(row.id, language, row.file_version) : null
    }));
};

const exists = (id) => !!db.prepare("SELECT 1 FROM guide WHERE id = ?").get(id);

const stmtName = db.prepare(
    "INSERT INTO guide_translation (guide_id, language, name) VALUES (@id, @language, @name) " +
    "ON CONFLICT(guide_id, language) DO UPDATE SET name = excluded.name"
);

const create = db.transaction(({ category, names }) => {
    const id = db.prepare("INSERT INTO guide (category) VALUES (?)").run(category ?? null).lastInsertRowid;
    for (const language of LANGUAGES) {
        stmtName.run({ id, language, name: names[language] });
    }
    return Number(id);
});

// fields: {category?, names?: {fi?, sv?}}
const edit = db.transaction((id, { category, names }) => {
    if (category !== undefined) {
        db.prepare("UPDATE guide SET category = ? WHERE id = ?").run(category, id);
    }
    for (const language of LANGUAGES) {
        if (names && names[language]) stmtName.run({ id, language, name: names[language] });
    }
});

// version = null removes the file reference
const setFileVersion = (id, language, version) => {
    db.prepare("UPDATE guide_translation SET file_version = ? WHERE guide_id = ? AND language = ?")
      .run(version, id, language);
};

// returns "NOT_FOUND", "IN_USE" or true
const remove = (id) => {
    if (!exists(id)) return "NOT_FOUND";
    const used = db.prepare("SELECT 1 FROM medicine_guide WHERE guide_id = ? LIMIT 1").get(id);
    if (used) return "IN_USE";
    db.prepare("DELETE FROM guide WHERE id = ?").run(id);
    return true;
};

// replaces all guides of a medicine (an empty array removes them all)
const setForMedicine = (medicine_id, guide_ids) => {
    db.prepare("DELETE FROM medicine_guide WHERE medicine_id = ?").run(medicine_id);
    const insert = db.prepare("INSERT INTO medicine_guide (medicine_id, guide_id) VALUES (?, ?)");
    for (const guide_id of new Set(guide_ids)) {
        insert.run(medicine_id, guide_id);
    }
};

module.exports = {
    LANGUAGES, CATEGORIES,
    getAll, getForMedicine, exists, create, edit, setFileVersion, remove, setForMedicine
};
