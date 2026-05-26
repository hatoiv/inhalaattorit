const db = require('../../db/database');
const uploads = require('../../controllers/admin/uploads')

const stmtRemoveDesc = db.prepare(
    "DELETE FROM medicine_translation " +
    "WHERE medicine_id = @medicine_id AND language = @language"
);

const stmtDesc = db.prepare(
    "INSERT INTO medicine_translation (medicine_id, language, description) " +
    "VALUES (@medicine_id, @language, @desc) " +
    "ON CONFLICT(medicine_id, language) " +
    "DO UPDATE SET description = excluded.description"
);

const stmtRemoveIntake = db.prepare(
    "DELETE FROM medicine_intake_style WHERE medicine_id = @medicine_id"
);
const stmtIntake = db.prepare(
    "INSERT INTO medicine_intake_style (medicine_id, intake_style_id) " +
    "VALUES (@medicine_id, @intake_style_id)"
);

const stmtRemoveActive = db.prepare(
    "DELETE FROM medicine_active_ingredient WHERE medicine_id = @medicine_id"
);
const stmtActive = db.prepare(
    "INSERT INTO medicine_active_ingredient (medicine_id, active_ingredient_id) " +
    "VALUES (@medicine_id, @active_ingredient_id)"
);

const stmtRemoveColor = db.prepare(
    "DELETE FROM medicine_color WHERE medicine_id = @medicine_id"
);
const stmtColor = db.prepare(
    "INSERT INTO medicine_color (medicine_id, color_id) " +
    "VALUES (@medicine_id, @color_id)"
);

const medicineFields = [
    "name",
    "image_path",
    "links",
    "official_min_age",
    "recommended_min_age",
    "times_a_day",
    "good_intake_speed",
    "good_coordination",
    "treatment_medicine",
    "symptomatic_medicine",
    "inhaler_brand_id"
];

class inhalers {
    static create = db.transaction((itemdata) => {
        const dataToInsert = { ...itemdata };

        // Serialize objects that SQLite can't store directly
        if (dataToInsert.links && typeof dataToInsert.links === "object") {
            dataToInsert.links = JSON.stringify(dataToInsert.links);
        }

        const givenFields = Object.keys(dataToInsert).filter(f => medicineFields.includes(f));
        const stmtAddMedicine = db.prepare(
            `INSERT INTO medicine (${givenFields.join(", ")})
             VALUES (${givenFields.map(f => "@" + f).join(", ")})`
        );

        const res = stmtAddMedicine.run(dataToInsert);

        // get medicine_id
        const medicine_id = res.lastInsertRowid;

        // add relations to other tables
        if (itemdata.description) {
            insertDesc(medicine_id, itemdata.description);
        }
        if (itemdata.intake_styles) {
            insertStyle(medicine_id, itemdata.intake_styles);
        }
        if (itemdata.active_ingredients) {
            insertActive(medicine_id, itemdata.active_ingredients);
        }
        if (itemdata.colors) {
            insertColor(medicine_id, itemdata.colors);
        }

        // print for testing
        console.log("Added row (id:", medicine_id, ")");
        return medicine_id;
    });

    static edit = db.transaction((id, updates) => {
        let updated = false;

        // add dynamicly all fields needed to update
        const updatedMedicineFields = Object.keys(updates).filter(f => medicineFields.includes(f));

        if (updatedMedicineFields.length > 0) {
            const setClause = updatedMedicineFields.map(f => `${f} = @${f}`).join(", ");
            db.prepare(`UPDATE medicine SET ${setClause} WHERE id = @id`).run({...updates, id});
            updated = true;
        }

        if ("description" in updates && Object.keys(updates.description).length > 0) {
            insertDesc(id, updates.description);
            updated = true;
        }

        if ("intake_styles" in updates && Object.keys(updates.intake_styles).length > 0) {
            insertStyle(id, updates.intake_styles);
            updated = true;
        }

        if ("active_ingredients" in updates && Object.keys(updates.active_ingredients).length > 0) {
            insertActive(id, updates.active_ingredients);
            updated = true;
        }

        if ("colors" in updates && Object.keys(updates.colors).length > 0) {
            insertColor(id, updates.colors);
            updated = true;
        }

        if (!updated) {
            console.log("Nothing to update");
            return;
        }

        // print for testing
        console.log("Updated row");
        return id;
    
    });

    static delete = db.transaction((id) => {
        const res = db.prepare("DELETE FROM medicine WHERE id = @id").run({id});

        if (res.changes === 0) {
            console.log("No row with that id")
            return null;
        }

        // delete pictures
        uploads.deleteWithId(id);

        // print for testing
        console.log("Deleted row");
        return id;
    });

};

const insertDesc = (medicine_id, descriptions) => {
    // adds all description languages if already exists overrides the description with new one
    // otherwise create new one
    for (const [language, desc] of Object.entries(descriptions)) {
        const description = String(desc);
        if (description.trim() === ''){
            stmtRemoveDesc.run({medicine_id, language});
        } else {
            stmtDesc.run({medicine_id, language, desc: description});
        }
    }
};

const insertStyle = (medicine_id, intake_styles) => {
    // removes old relations of the medicine
    stmtRemoveIntake.run({medicine_id});

    // creates new relations
    for (const intake_style_id of intake_styles) {
        stmtIntake.run({medicine_id, intake_style_id});
    }
};

const insertActive = (medicine_id, active_ingredients) => {
    stmtRemoveActive.run({medicine_id});

    for (const active_ingredient_id of active_ingredients) {
        stmtActive.run({medicine_id, active_ingredient_id});
    }
};

const insertColor = (medicine_id, colors) => {
    stmtRemoveColor.run({medicine_id});

    for (const color_id of colors) {
        stmtColor.run({medicine_id, color_id});
    }
}

module.exports = inhalers;
