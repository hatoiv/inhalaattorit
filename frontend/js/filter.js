/**
 * Gets a set of inhaler ids from filters
 * @param {*} data JSON object containing inhalers
 * @param {*} filters JSON object containig filters
 * @returns 
 */
export function getFilteredIds(data, filters) {
    const idSet = new Set();
    const hasPatientSkillSelection =
        filters.good_intake_speed !== "" &&
        filters.good_intake_speed != null &&
        filters.good_coordination !== "" &&
        filters.good_coordination != null;
    
    data.forEach(item => {
        var addToSet = true;

        if (hasPatientSkillSelection && !matchesPatientSkills(item, filters)) {
            addToSet = false;
        }

        for (const [key, value] of Object.entries(filters)) {
            if (key === "good_intake_speed" || key === "good_coordination") continue;
            if (value === "" || value === null || (Array.isArray(value) && value.length === 0)) continue;
            if (!matchesFilter(item, key, value)) {
                addToSet = false;
                break;
            };
        }
        if (addToSet) idSet.add(item.id.toString());
    });

    return idSet;
}

function matchesPatientSkills(item, filters) {
    const intakeSpeed = Number(filters.good_intake_speed);
    const coordination = Number(filters.good_coordination);

    if (intakeSpeed === 1 && coordination === 1) {
        return true;
    }

    if (intakeSpeed === 1 && coordination === 0) {
        return (
            item.good_intake_speed === 1 &&
            item.good_coordination === 0
        ) || (
            item.good_intake_speed === 0 &&
            item.good_coordination === 0
        );
    }

    if (intakeSpeed === 0 && coordination === 1) {
        return (
            item.good_intake_speed === 0 &&
            item.good_coordination === 1
        ) || (
            item.good_intake_speed === 0 &&
            item.good_coordination === 0
        );
    }

    return (
        item.good_intake_speed === intakeSpeed &&
        item.good_coordination === coordination
    );
}

function matchesFilter(item, key, value) {
    const values = Array.isArray(value) ? value : [value];

    // Purpose maps to two separate boolean fields
    if (key === "purpose") {
        return values.every(selectedValue => {
            if (selectedValue === "treatment") return item.treatment_medicine === 1;
            if (selectedValue === "symptomatic") return item.symptomatic_medicine === 1;
            return true;
        });
    }

    // Drug class is nested inside active_ingredients
    if (key === "drug_class_name") {
        if (!item.active_ingredients) return false;
        const selectedDrugClasses = [...new Set(values)];
        const drugClassNames = [
            ...new Set(item.active_ingredients.map(ai => ai.drug_class_name)),
        ];

        return (
            drugClassNames.length === selectedDrugClasses.length &&
            selectedDrugClasses.every(selectedValue => drugClassNames.includes(selectedValue))
        );
    }

    // Number fields
    // After
    if (key === "recommended_min_age") {
        return item[key] <= Number(values[0]);
    }
    if (key === "times_a_day") {
        return values.some(selectedValue => {
            const selectedDosage = Number(selectedValue);

            if (selectedDosage === 2) {
                return item[key] === 2 || item[key] === 3;
            }

            return item[key] === selectedDosage;
        });
    }

    // Object with name (inhaler_brand: {id, name})
    if (key === "inhaler_brand") {
        return item.inhaler_brand && values.includes(item.inhaler_brand.name);
    }

    // Array of objects with name (intake_styles, active_ingredients, colors)
    if (Array.isArray(item[key])) {
        const itemNames = item[key].map(obj => obj.name);
        return values.every(selectedValue => itemNames.includes(selectedValue));
    }

    // Fallback: simple string match
    return values.includes(item[key]);
}
