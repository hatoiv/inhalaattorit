import { getTranslation } from "./lang.js";

export function getDosageLabel(value) {
    if (value === "" || value == null) return "";

    const dosage = Number(value);

    if (dosage === 0) return getTranslation("dosage.if-necessary");
    if (dosage === 1) return getTranslation("dosage.once-daily");
    if (dosage === 2) return getTranslation("dosage.twice-daily");
    if (dosage === 3) return getTranslation("dosage.once-or-twice-daily");

    return "";
}

export function getPublicDosageFilterValues(values) {
    const available = new Set((values || []).map(Number));

    if (available.has(3)) {
        available.add(2);
    }

    available.delete(3);

    return [...available].sort((a, b) => a - b);
}
