const fs = require("fs");
const path = require("path");
const metaPath = path.join(__dirname, "../../../data/metaDate.json");

class newDate {
    static setNewDate = (req, res, next) => {

        const today = new Date();
        
        const date = [
            String(today.getDate()).padStart(2, "0"),
            String(today.getMonth() + 1).padStart(2, "0"),
            today.getFullYear()
        ].join(".");

        fs.writeFileSync(metaPath, JSON.stringify( { date }, null, 2 ), "utf8");

        res.status(200).json({
            message: "Date updated succesfully",
            date
        });

    };
}

module.exports = newDate;