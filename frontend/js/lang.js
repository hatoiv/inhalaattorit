// Language toggle (fi/sv)
// Add data-i18n="key" to elements for static text translation.
// Add data-i18n-placeholder="key" for input placeholders.
// Dynamic content (inhaler data) comes translated from the backend via ?lang= param.

var DEFAULT_LANG = "fi";

// Swedish translations. Finnish is the default in HTML, no need to list here.
// Add more keys as needed, matching the data-i18n attributes in HTML.
var sv = {
    "nav.guide": "Anvisning",
    "nav.front-page": "Ingångssida",
    "nav.about": "Om denna webbplats",
    "nav.feedback": "Kontakt",
    "nav.admin": "Admin",
    "nav.lang-label": "SV - Byt språk",
    "site.title": "Inhalaattorit.fi",
    "search.heading": "Sök efter ett läkemedel / en inhalator med namn",
    "search.clear": "Rensa",
    "search.label": "Namn",
    "search.counter": "Visar {current}/{total}",
    "filters.heading": "Filter",
    "filters.form": "Läkemedelsform",
    "filters.form-option": "Välj läkemedelsform",
    "filters.age": "Patientens ålder (om under 18 år)",
    "filters.age-option": "Ange ålder",
    "filters.dosage": "Dosering",
    "filters.dosage-option": "Välj dosering",
    "filters.velocity": "Inandningstakt +",
    "filters.velocity-option": "Välj inandningstakt",
    "filters.coordination": "Koordinationsförmåga",
    "filters.coordination-option": "Välj koordinationsförmåga",
    "filters.type": "Inhalator",
    "filters.type-option": "Välj inhalator",
    "filters.purpose": "Användning",
    "filters.purpose-option": "Välj användning",
    "filters.drug-group": "Läkemedelsgrupp",
    "filters.drug-group-option": "Välj läkemedelsgrupp",
    "filters.substance": "Aktiv substans",
    "filters.substance-option": "Välj aktiv substans",
    "filters.color": "Färg",
    "filters.color-option": "Välj färg",
    "filters.clear": "Rensa filter",
    "filter.dosage-suffix": " gånger/dag",
    "filter.if-necessary": "Vid behov",
    "filter.speed-good": "Bra (>30 l/min)",
    "filter.speed-poor": "Dålig (≤30 l/min)",
    "filter.coord-good": "Bra",
    "filter.coord-poor": "Dålig",
    "filter.treatment": "Behandlingsläkemedel",
    "filter.symptomatic": "Symtomläkemedel",
    "results.heading": "Inhalatorer",
    "privacy.link": "Dataskyddsbeskrivning",
    "accessibility.link": "Tillgänglighetsutlåtande",
    "search.placeholder": "Sök efter namn...",
    "velocity-coordination.hint": "Obs! Markera båda alternativen",
    "date.tracker": "Utbudet av inhalatorer på marknaden har uppdaterats: {date}",

    // Admin
    "admin.login-heading": "Logga in",
    "admin.username": "Användarnamn",
    "admin.password": "Lösenord",
    "admin.login-btn": "Logga in",
    "admin.forgot-pw": "Glömt lösenordet? Kontakta administratören.",
    "admin.panel-heading": "Kontrollpanel",
    "admin.add-inhaler": "+ Lägg till inhalator",
    "admin.update-date": "Uppdatera datum",
    "admin.logout": "Logga ut",
    "admin.form-heading": "Lägg till ny inhalator",
    "admin.name": "Namn",
    "admin.desc-fi": "Beskrivning (finska)",
    "admin.desc-fi-ph": "Beskrivning på finska",
    "admin.desc-sv": "Beskrivning (svenska)",
    "admin.min-age": "Officiell åldergräns (år)",
    "admin.rec-age": "Rekommenderad åldergräns (år)",
    "admin.times-day": "Dosering (gånger per dag)",
    "admin.intake-speed": "Inandningshastighet",
    "admin.unknown": "Okänt",
    "admin.speed-good": "Bra (> 30 l/min)",
    "admin.speed-poor": "Dålig (< 30 l/min)",
    "admin.coordination": "Koordination",
    "admin.good": "Bra",
    "admin.poor": "Dålig",
    "admin.treatment": "Behandlingsläkemedel",
    "admin.symptomatic": "Symtomläkemedel",
    "admin.yes": "Ja",
    "admin.no": "Nej",
    "admin.brand": "Inhalator",
    "admin.select": "Välj...",
    "admin.intake-styles": "Läkemedelsform",
    "admin.colors": "Färg",
    "admin.ingredients": "Aktiv substans",
    "admin.link-db": "Databaslänk",
    "admin.link-tutorial": "Instruktionslänk",
    "admin.image": "Bild",
    "admin.current-image": "Nuvarande bild",
    "admin.delete-image": "Radera bild",
    "admin.save": "Spara",
    "admin.cancel": "Avbryt",
    "admin.th-age": "Åldergräns",
    "admin.th-dosage": "Ggr/dag",
    "admin.th-purpose": "Användning",
    "admin.th-actions": "Åtgärder",
    "admin.brands-heading": "Inhalatormärken (Ellipta, Turbuhaler...)",
    "admin.brand-add": "Lägg till inhalatormärke",
    "admin.brand-ph": "Namn (t.ex. Ellipta)",
    "admin.dc-heading": "Läkemedelsgrupper (ICS, LABA...)",
    "admin.dc-add": "Lägg till läkemedelsgrupp",
    "admin.dc-ph": "Namn (t.ex. ICS)",
    "admin.ai-heading": "Aktiva substanser",
    "admin.ai-add": "Lägg till aktiv substans",
    "admin.ai-fi-ph": "Namn (finska)",
    "admin.ai-sv-ph": "Namn (svenska)",
    "admin.class": "Grupp",
    "admin.class-select": "Grupp...",
    "admin.name-primary": "Namn (sv)",
    "admin.name-secondary": "Namn (fi)",
    "admin.btn-add": "Lägg till",
    "admin.btn-edit": "Redigera",
    "admin.btn-delete": "Radera",
    "admin.scroll-hint": "Tips: under inhalatorlistan finns även hanteringen av inhalatormärken, läkemedelsgrupper och aktiva substanser.",
    "admin.ingredient-class-note": "Läkemedelsgrupp (ICS, LABA…) anges per aktiv substans nedan i sektionen \"Aktiva substanser\".",
    "admin.dc-plus-note": "Kombinationsnamn kan skrivas med +-tecknet (t.ex. ICS+LABA, LAMA+LABA).",

    // Card and detail page
    "card.extension-badge": " + Spacer",

    "card.recommended-age": "Rekommenderad åldergräns: ",
    "card.active-ingredients": "Aktiva substanser:\n",
    "detail.extension-badge": " + Spacer",
    "detail.inhaler": "Inhalator:",
    "detail.form": "Läkemedelsform:",
    "detail.age-dosage": "Ålder och dosering",
    "detail.official-age": "Officiell åldergräns:",
    "detail.recommended-age": "Rekommenderad åldergräns:",
    "detail.dosage": "Dosering:",
    "detail.years": " år",
    "detail.times-day": " gånger om dagen",
    "detail.requirements": "Krav",
    "detail.intake-speed": "Inandningshastighet:",
    "detail.speed-high": "Bra (>30 l/min)",
    "detail.speed-low": "Dålig (≤30 l/min)",
    "detail.coordination": "Koordinationsförmåga:",
    "detail.coord-good": "Bra",
    "detail.coord-normal": "Dålig",
    "detail.purpose": "Användningsändamål",
    "detail.treatment": "Behandlingsläkemedel:",
    "detail.symptomatic": "Symtomläkemedel:",
    "detail.yes": "Ja",
    "detail.no": "Nej",
    "detail.ingredients": "Aktiva substanser",
    "detail.colors": "Färger: ",
    "detail.database-link": "Databaslänk",
    "detail.tutorial-link": "Instruktionsvideo",
    "detail.if-necessary": "Vid behov",
    "detail.back-to-results": "Tillbaka"
};

var fi = {
    "card.extension-badge": " + Tilanjatke",
    "card.recommended-age": "Suositeltu ikäraja: ",
    "card.active-ingredients": "Vaikuttavat lääkeaineet:\n",
    "detail.extension-badge": " + Tilanjatke",
    "detail.inhaler": "Inhalaattori:",
    "detail.form": "Lääkemuoto:",
    "detail.age-dosage": "Ikä ja annostelu",
    "detail.official-age": "Virallinen ikäraja:",
    "detail.recommended-age": "Suositeltu ikäraja:",
    "detail.dosage": "Annostelu:",
    "detail.years": " vuotta",
    "detail.times-day": "x päivässä",
    "detail.requirements": "Vaatimukset",
    "detail.intake-speed": "Sisäänhengitysnopeus:",
    "detail.speed-high": "Hyvä (>30 l/min)",
    "detail.speed-low": "Huono (≤30 l/min)",
    "detail.coordination": "Koordinaatiokyky:",
    "detail.coord-good": "Hyvä",
    "detail.coord-normal": "Huono",
    "detail.purpose": "Käyttötarkoitus",
    "detail.treatment": "Hoitava lääke:",
    "detail.symptomatic": "Oirelääke:",
    "detail.yes": "Kyllä",
    "detail.no": "Ei",
    "detail.ingredients": "Vaikuttavat lääkeaineet",
    "detail.colors": "Värit: ",
    "detail.database-link": "Tietokanta-linkki",
    "detail.tutorial-link": "Opetusvideo",
    "detail.if-necessary": "Tarvittaessa",
    "detail.back-to-results": "Takaisin",
    "filter.dosage-suffix": " krt/pv",
    "filter.if-necessary": "Tarvittaessa",
    "filter.speed-good": "Hyvä (>30 l/min)",
    "filter.speed-poor": "Huono (≤30 l/min)",
    "filter.coord-good": "Hyvä",
    "filter.coord-poor": "Huono",
    "filter.treatment": "Hoitava lääke",
    "filter.symptomatic": "Oirelääke",
    "filters.form-option": "Valitse lääkemuoto",
    "filters.dosage-option": "Valitse annostelu",
    "filters.velocity-option": "Valitse sisäänhengitysnopeus",
    "filters.coordination-option": "Valitse koordinaatiokyky",
    "filters.type-option": "Valitse inhalaattori",
    "filters.purpose-option": "Valitse käyttötarkoitus",
    "filters.drug-group-option": "Valitse lääkeaineryhmä",
    "filters.substance-option": "Valitse vaikuttava lääkeaine",
    "filters.color-option": "Valitse väri",
};

const fiCounter = "Näytetään {current}/{total}";
const fiLangLabel = "FI - Vaihda kieli";

export function getCounterString() {
    const el = document.getElementById("result-count");
    const key = el.dataset.i18n;

    if (getLang() === "fi") {
        return fiCounter;
    } else if (sv[key]) {
        return sv[key];
    }
}

export function getLang() {
    return localStorage.getItem("lang") || DEFAULT_LANG;
}

function applyTranslations(lang) {
    // text content
    document.querySelectorAll("[data-i18n]").forEach(function(el) {
        var key = el.dataset.i18n;
        if (lang === "fi") {
            if (el.dataset.i18nOriginal) el.textContent = el.dataset.i18nOriginal;
        } else if (sv[key]) {
            if (!el.dataset.i18nOriginal) el.dataset.i18nOriginal = el.textContent;
            el.textContent = sv[key];
        }
    });

    // placeholders
    document.querySelectorAll("[data-i18n-placeholder]").forEach(function(el) {
        var key = el.dataset.i18nPlaceholder;
        if (lang === "fi") {
            if (el.dataset.i18nOrigPh) el.placeholder = el.dataset.i18nOrigPh;
        } else if (sv[key]) {
            if (!el.dataset.i18nOrigPh) el.dataset.i18nOrigPh = el.placeholder;
            el.placeholder = sv[key];
        }
    });

    document.documentElement.lang = lang;
}

// Inline SVG flags as data URIs (small, decorative — no external files needed)
const flagFi = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 18 11'><rect width='18' height='11' fill='%23fff'/><rect y='4' width='18' height='3' fill='%23003580'/><rect x='5' width='3' height='11' fill='%23003580'/></svg>";
const flagSv = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 10'><rect width='16' height='10' fill='%23006AA7'/><rect y='4' width='16' height='2' fill='%23FECC00'/><rect x='5' width='2' height='10' fill='%23FECC00'/></svg>";

function updateToggle(lang) {
    var btn = document.querySelector(".lang-toggle");
    if (!btn) return;
    var img = document.createElement("img");
    img.className = "lang-flag";
    img.alt = "";
    img.src = lang === "fi" ? flagFi : flagSv;
    var label = document.createTextNode(lang === "fi" ? "FI" : "SV");
    btn.replaceChildren(img, label);
    btn.ariaLabel = lang === "fi" ? fiLangLabel : sv["nav.lang-label"];
}

document.addEventListener("DOMContentLoaded", function() {
    var lang = getLang();
    var btn = document.querySelector(".lang-toggle");

    if (btn) {
        btn.addEventListener("click", function() {
            var next = getLang() === "fi" ? "sv" : "fi";
            localStorage.setItem("lang", next);
            applyTranslations(next);
            updateToggle(next);
        });
    }

    updateToggle(lang);
    if (lang !== DEFAULT_LANG) applyTranslations(lang);
});


export function getTranslation(key) {
    const lang = getLang();
    if (lang === "fi") {
        return fi[key] || key;
    } else if (lang === "sv") {
        return sv[key] || key;
    }
    return key;
}
