const fs = require('fs/promises');
const path = require('path');
const BackendError = require('../../classes/backendError');
const guidesModel = require('../../models/admin/guides');

const GUIDES_FOLDER = path.join(__dirname, '../../../data/guides');

const filePath = (id, language) => path.join(GUIDES_FOLDER, `${id}-${language}.pdf`);

// uploaded files by language: {fi: multerFile, sv: multerFile}
const uploadedFiles = (req) => {
    const files = {};
    for (const language of guidesModel.LANGUAGES) {
        const file = req.files && req.files["file_" + language];
        if (file && file[0]) files[language] = file[0];
    }
    return files;
};

const removeTmpFiles = async (files) => {
    for (const file of Object.values(files)) {
        await fs.unlink(file.path).catch(() => {});
    }
};

// a real PDF starts with "%PDF-"
const isPdf = async (file) => {
    const handle = await fs.open(file.path, "r");
    try {
        const buffer = Buffer.alloc(5);
        await handle.read(buffer, 0, 5, 0);
        return buffer.toString("latin1") === "%PDF-";
    } finally {
        await handle.close();
    }
};

const checkFiles = async (files) => {
    for (const file of Object.values(files)) {
        if (!await isPdf(file)) throw new BackendError(400, "File is not a valid PDF.");
    }
};

// moves checked tmp files to data/guides and records the new version
const storeFiles = async (id, files) => {
    for (const [language, file] of Object.entries(files)) {
        await fs.rename(file.path, filePath(id, language));
        guidesModel.setFileVersion(id, language, Date.now());
    }
};

const parseCategory = (value) => {
    if (value === undefined) return undefined;
    if (value === "" || value === null) return null;
    if (!guidesModel.CATEGORIES.includes(value)) throw new BackendError(400, "Unknown guide category.");
    return value;
};

const parseNames = (body) => ({
    fi: typeof body.name_fi === "string" ? body.name_fi.trim() : undefined,
    sv: typeof body.name_sv === "string" ? body.name_sv.trim() : undefined
});

class guides {

    static get = (req, res) => {
        res.status(200).json(guidesModel.getAll());
    };

    // multipart/form-data: name_fi, name_sv, category (optional), file_fi, file_sv (optional PDFs)
    static create = async (req, res) => {
        const files = uploadedFiles(req);
        let id = null;
        try {
            const body = req.body || {};
            const names = parseNames(body);
            if (!names.fi || !names.sv) throw new BackendError(400, "Guide must have a Finnish and a Swedish name.");
            const category = parseCategory(body.category);
            await checkFiles(files);

            id = guidesModel.create({ category, names });
            await storeFiles(id, files);

            res.status(201).json({ id, message: 'Guide created successfully' });
        } catch (err) {
            await removeTmpFiles(files);
            // don't leave a half-created guide behind if storing a file failed
            if (id !== null) {
                guidesModel.remove(id);
                for (const language of guidesModel.LANGUAGES) await fs.unlink(filePath(id, language)).catch(() => {});
            }
            throw err;
        }
    };

    // multipart/form-data, every field optional: name_fi, name_sv, category, file_fi, file_sv,
    // remove_fi / remove_sv = "1" removes that language's PDF
    static edit = async (req, res) => {
        const files = uploadedFiles(req);
        try {
            const id = parseInt(req.params.id);
            if (!guidesModel.exists(id)) throw new BackendError(404, "Non valid guide ID!");

            const body = req.body || {};
            const names = parseNames(body);
            if (names.fi === "" || names.sv === "") throw new BackendError(400, "Guide name can't be empty.");
            const category = parseCategory(body.category);
            await checkFiles(files);

            guidesModel.edit(id, { category, names });

            for (const language of guidesModel.LANGUAGES) {
                if (body["remove_" + language] === "1" && !files[language]) {
                    await fs.unlink(filePath(id, language)).catch(() => {});
                    guidesModel.setFileVersion(id, language, null);
                }
            }
            await storeFiles(id, files);

            res.status(200).json({ message: 'Guide edited successfully' });
        } catch (err) {
            await removeTmpFiles(files);
            throw err;
        }
    };

    static delete = async (req, res) => {
        const id = parseInt(req.params.id);
        const result = guidesModel.remove(id);

        if (result === "NOT_FOUND") throw new BackendError(404, "Non valid guide ID!");
        if (result === "IN_USE") throw new BackendError(409, "Guide is in use by inhalers, remove it from them first.");

        for (const language of guidesModel.LANGUAGES) {
            await fs.unlink(filePath(id, language)).catch(() => {});
        }
        res.status(200).json({ message: 'Guide removed successfully' });
    };
}

module.exports = guides;
