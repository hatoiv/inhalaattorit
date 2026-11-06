// Patient guides (printable PDFs). Shared by the admin panel and the inhaler usage page.

// groups of the inhaler usage page, keys must match CATEGORIES in backend/src/models/admin/guides.js
export const guideCategories = [
    { key: "dpi", fi: "Jauheinhalaattori (DPI)", sv: "Pulverinhalator (DPI)" },
    { key: "capsule", fi: "Jauhekapseli-inhalaattori", sv: "Inhalator för pulverkapsel" },
    { key: "pmdi-smi", fi: "Ponnekaasusumutin (pMDI) ja Soft mist -inhalaattori (SMI)", sv: "Drivgasaerosol (pMDI) och Soft Mist-inhalator (SMI)" },
    { key: "spacer", fi: "Ponnekaasusumutin (pMDI) tai Soft mist -inhalaattori ja tilanjatke", sv: "Drivgasaerosol (pMDI) eller Soft Mist-inhalator och spacer" },
    { key: "spacer-mask", fi: "Ponnekaasusumutin tai Soft mist -inhalaattori, tilanjatke ja maski (pienet lapset ja vanhukset)", sv: "Drivgasaerosol eller Soft Mist-inhalator, spacer och ansiktsmask (små barn och äldre)" },
    { key: "breath-actuated", fi: "Ponnekaasusumutin sisäänhengityksen laukaisemana", sv: "Drivgasaerosol som utlöses vid inandning" }
];

const headings = {
    fi: "Potilasohjeet (PDF)",
    sv: "Patientanvisningar (PDF)"
};

// GET /api/inhalers/guides - all guides with names and urls in both languages
export async function getGuides() {
    try {
        const res = await fetch("/api/inhalers/guides");
        if (!res.ok) return [];
        return await res.json();
    } catch (e) {
        console.error("Failed to fetch guides:", e);
        return [];
    }
}

// builds a list of guide buttons, or null when none of the guides has a PDF in this language
// guides: [{name, url}]
export function buildGuideButtons(guides, lang) {
    const withFile = guides.filter(g => g.url);
    if (withFile.length === 0) return null;

    const wrap = document.createElement("div");
    wrap.classList.add("guide-links");

    const heading = document.createElement("h3");
    heading.classList.add("guide-links-heading");
    heading.textContent = headings[lang] || headings.fi;
    wrap.appendChild(heading);

    const buttons = document.createElement("div");
    buttons.classList.add("detail-action-buttons");
    withFile
        .sort((a, b) => a.name.localeCompare(b.name, lang))
        .forEach(guide => {
            const link = document.createElement("a");
            link.href = guide.url;
            link.textContent = guide.name;
            link.target = "_blank";
            link.rel = "noopener";
            link.classList.add("btn-primary");
            buttons.appendChild(link);
        });
    wrap.appendChild(buttons);

    return wrap;
}

// fills every <div data-guide-category="..." data-guide-lang="..."> on the page
export async function renderGuideSections() {
    const targets = document.querySelectorAll("[data-guide-category]");
    if (targets.length === 0) return;

    const guides = await getGuides();
    targets.forEach(target => {
        const lang = target.dataset.guideLang || "fi";
        const inCategory = guides
            .filter(g => g.category === target.dataset.guideCategory)
            .map(g => ({ name: g[lang].name, url: g[lang].url }));
        const buttons = buildGuideButtons(inCategory, lang);
        target.replaceChildren(...(buttons ? [buttons] : []));
    });
}
