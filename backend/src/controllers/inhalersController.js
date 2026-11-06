const inhalersModel = require('../models/inhalersModel');
const guidesModel = require('../models/admin/guides');
const fs = require("fs");
const path = require("path");
const metaPath = path.join(__dirname, "../../data/metaDate.json");

// list of supported languages
const supportedLanguages = ["fi", "sv"];

class InhalersController {

    static getInhalers(req, res) {
        try {
            const lang = getLanguage(req.query.lang);
            const data = inhalersModel.getAllInhalers(lang);

            res.json(data);
            
        } catch (e) {
            res.status(500).json({message: e.message});
        }
    };

    static getFilters = (req, res) => {
        try {
            const lang = getLanguage(req.query.lang);
            const data = inhalersModel.getUsedFilters(lang);

            res.json(data);

        } catch (e) {
            res.status(500).json({message: e.message});
        }
    };

    // all patient guides with names and PDF urls in both languages (for the inhaler usage page)
    static getGuides = (req, res) => {
        try {
            const data = guidesModel.getAll().map(({ used_by, ...guide }) => guide);
            res.json(data);

        } catch (e) {
            res.status(500).json({message: e.message});
        }
    };

    static getLastUpdated = (req, res) => {
        const data = JSON.parse(fs.readFileSync(metaPath, "utf8"));
        res.json(data);
    };
}

const getLanguage = (lang) => {
    // if language isn't supported default to finnish
    if (!supportedLanguages.includes(lang)) {
        return "fi";
    }
    return lang;
}

module.exports = InhalersController;
