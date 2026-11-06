const db = require("../db/database"); 
const guidesModel = require("./admin/guides");

const getAllInhalers = (lang) => {
    const query = 'SELECT m.* FROM medicine m';
    const medicines = db.prepare(query).all();

    medicines.forEach(med => {

        const row = db.prepare(`
            SELECT mt.description
            FROM medicine_translation mt
            WHERE mt.medicine_id = ? AND mt.language = ?
        `).get(med.id, lang);
        
        // description descrpition --> description
        med.description = row?.description ?? null;

        med.inhaler_brand = db.prepare(`
            SELECT ib.id, ib.name
            FROM inhaler_brand ib
            WHERE ib.id = ?
        `).get(med.inhaler_brand_id);

        delete med.inhaler_brand_id; // Remove duplicate brand_id

        med.intake_styles = db.prepare(`
            SELECT ist.intake_style_id, ist.name
            FROM intake_style_translation ist
            JOIN intake_style i_s ON ist.intake_style_id = i_s.id
            JOIN medicine_intake_style mis ON i_s.id = mis.intake_style_id
            WHERE mis.medicine_id = ? AND ist.language = ?
        `).all(med.id, lang);


        med.active_ingredients = db.prepare(`
            SELECT ait.active_ingredient_id, ait.name, dc.id as drug_class_id, dc.name as drug_class_name
            FROM active_ingredient_translation ait
            JOIN active_ingredient ai ON ait.active_ingredient_id = ai.id
            JOIN drug_class dc ON ai.drug_class_id = dc.id
            JOIN medicine_active_ingredient mai ON ai.id = mai.active_ingredient_id
            WHERE mai.medicine_id = ? AND ait.language = ?
        `).all(med.id, lang);

        med.colors = db.prepare(`
            SELECT ct.color_id, ct.name
            FROM color_translation ct
            JOIN color c ON ct.color_id = c.id
            JOIN medicine_color mc ON c.id = mc.color_id
            WHERE mc.medicine_id = ? AND ct.language = ?
        `).all(med.id, lang);
        
        med.links = med.links ? JSON.parse(med.links) : null;

        // url is null when the guide has no PDF in this language
        med.guides = guidesModel.getForMedicine(med.id, lang);
    });
    
    return medicines;
};

const getUsedFilters = (lang) => {

    // using arrays to add data so we don't get duplicates
    const data = {
        official_min_age: new Set(),
        recommended_min_age: new Set(), 
        times_a_day: new Set(),
        inhaler_brand: new Set(),
        intake_styles: new Set(),
        active_ingredients: new Set(),
        drug_class_name: new Set(),
        colors: new Set()
    };

    // get all medicine and add all fields to data
    const medicine = getAllInhalers(lang);
    medicine.forEach(med => {
        if (med.official_min_age != null) data.official_min_age.add(med.official_min_age);
        if (med.recommended_min_age != null) data.recommended_min_age.add(med.recommended_min_age);
        if (med.times_a_day != null) data.times_a_day.add(med.times_a_day);
        if (med.inhaler_brand) data.inhaler_brand.add(med.inhaler_brand.name);

        med.intake_styles.forEach(style => data.intake_styles.add(style.name));
        med.active_ingredients.forEach(ingredient => {
            data.active_ingredients.add(ingredient.name);
            data.drug_class_name.add(ingredient.drug_class_name);
        });

        med.colors.forEach(color => data.colors.add(color.name));
    });

    // sets to arrays
    const res = {
        official_min_age: [...data.official_min_age],
        recommended_min_age: [...data.recommended_min_age],
        times_a_day: [...data.times_a_day],

        good_intake_speed: "boolean",
        good_coordination: "boolean",
        treatment_medicine: "boolean",
        symptomatic_medicine: "boolean",

        inhaler_brand: [...data.inhaler_brand],
        intake_styles: [...data.intake_styles],
        active_ingredients: [...data.active_ingredients],
        drug_class_name: [...data.drug_class_name],
        colors: [...data.colors]
    }

    return res;
};

module.exports = { getAllInhalers, getUsedFilters };
