const fs = require("fs");
const path = require("path");
const BackendError = require("../../classes/backendError");
const metaPath = path.join(__dirname, "../../../data/metaDate.json");

const readMeta = () => {
    if (!fs.existsSync(metaPath)) return {};
    return JSON.parse(fs.readFileSync(metaPath, "utf8"));
};

const writeMeta = (data) => {
    fs.writeFileSync(metaPath, JSON.stringify(data, null, 2), "utf8");
};

class logBook {
    static setNewDate = (req, res, next) => {

        const today = new Date();
        
        const date = [
            String(today.getDate()).padStart(2, "0"),
            String(today.getMonth() + 1).padStart(2, "0"),
            today.getFullYear()
        ].join(".");

        const meta = readMeta();
        meta.date = date;
        writeMeta(meta);

        res.status(200).json({
            message: "Date updated succesfully",
            ...meta
        });

    };

    static setInfo = (req, res, next) => {

        const body = req.body || {};
        const info = body.info ?? body.data ?? "";

        if (typeof info !== "string") {
            throw new BackendError(400, "Logbook text must be a string.");
        }

        if (info.length > 10000) {
            throw new BackendError(400, "Logbook text is too long.");
        }

        const meta = readMeta();
        meta.info = info;
        writeMeta(meta);

        res.status(200).json({
            message: "Logbook updated successfully",
            ...meta
        });

    }
}

module.exports = logBook;
