// auth: login, get token, store in localStorage, send with every admin request

import { getLang } from './lang.js';

const apiTexts = {
    "Istunto vanhentunut, kirjaudu uudelleen.": "Sessionen har gått ut, logga in igen.",
    "Liian monta pyyntöä, odota hetki ja yritä uudelleen.": "För många förfrågningar, vänta en stund och försök igen.",
    "Kirjautuminen epäonnistui. Tarkista yhteys.": "Inloggningen misslyckades. Kontrollera anslutningen.",
    "Tuntematon virhe": "Okänt fel",
    "Tallennus epäonnistui: ": "Sparandet misslyckades: ",
    "Yhteysvirhe tallennuksessa.": "Anslutningsfel vid sparning.",
    "Muokkaus epäonnistui: ": "Redigeringen misslyckades: ",
    "Yhteysvirhe muokkauksessa.": "Anslutningsfel vid redigering.",
    "Poisto epäonnistui: ": "Raderingen misslyckades: ",
    "Yhteysvirhe poistossa.": "Anslutningsfel vid radering.",
    "Lääkeaineluokan lisäys epäonnistui: ": "Tillägg av läkemedelsgrupp misslyckades: ",
    "Yhteysvirhe lääkeaineluokan lisäyksessä.": "Anslutningsfel vid tillägg av läkemedelsgrupp.",
    "Lääkeaineluokan muokkaus epäonnistui: ": "Redigering av läkemedelsgrupp misslyckades: ",
    "Yhteysvirhe lääkeaineluokan muokkauksessa.": "Anslutningsfel vid redigering av läkemedelsgrupp.",
    "Lääkeaineluokan poisto epäonnistui: ": "Radering av läkemedelsgrupp misslyckades: ",
    "Yhteysvirhe lääkeaineluokan poistossa.": "Anslutningsfel vid radering av läkemedelsgrupp.",
    "Lääkeaineen lisäys epäonnistui: ": "Tillägg av aktiv substans misslyckades: ",
    "Yhteysvirhe lääkeaineen lisäyksessä.": "Anslutningsfel vid tillägg av aktiv substans.",
    "Lääkeaineen muokkaus epäonnistui: ": "Redigering av aktiv substans misslyckades: ",
    "Yhteysvirhe lääkeaineen muokkauksessa.": "Anslutningsfel vid redigering av aktiv substans.",
    "Lääkeaineen poisto epäonnistui: ": "Radering av aktiv substans misslyckades: ",
    "Yhteysvirhe lääkeaineen poistossa.": "Anslutningsfel vid radering av aktiv substans.",
    "Inhalaattorin lisäys epäonnistui: ": "Tillägg av inhalatormärke misslyckades: ",
    "Yhteysvirhe inhalaattorin lisäyksessä.": "Anslutningsfel vid tillägg av inhalatormärke.",
    "Inhalaattorin muokkaus epäonnistui: ": "Redigering av inhalatormärke misslyckades: ",
    "Yhteysvirhe inhalaattorin muokkauksessa.": "Anslutningsfel vid redigering av inhalatormärke.",
    "Inhalaattorin poisto epäonnistui: ": "Radering av inhalatormärke misslyckades: ",
    "Yhteysvirhe inhalaattorin poistossa.": "Anslutningsfel vid radering av inhalatormärke.",
    "Kuvan lataus epäonnistui: ": "Bilduppladdning misslyckades: ",
    "Yhteysvirhe kuvan latauksessa.": "Anslutningsfel vid bilduppladdning.",
    "Kuvan poisto epäonnistui: ": "Radering av bild misslyckades: ",
    "Yhteysvirhe kuvan poistossa.": "Anslutningsfel vid radering av bild.",
    "Varmuuskopion lataus epäonnistui: ": "Nedladdning av säkerhetskopia misslyckades: ",
    "Yhteysvirhe varmuuskopion latauksessa.": "Anslutningsfel vid nedladdning av säkerhetskopia."
};

function t(text) {
    if (getLang() === "sv" && apiTexts[text]) return apiTexts[text];
    return text;
}

function getAuthHeaders() {
    return {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + localStorage.getItem("admin-token")
    };
}

function getAuthOnly() {
    return { "Authorization": "Bearer " + localStorage.getItem("admin-token") };
}

// 401 = token expired or invalid, clear and reload to login
function checkExpiredToken(res) {
    if (res.status === 401) {
        localStorage.removeItem("admin-token");
        alert(t("Istunto vanhentunut, kirjaudu uudelleen."));
        location.reload();
        return true;
    }
    return false;
}

// 429 = rate limited
function checkRateLimit(res) {
    if (res.status === 429) {
        alert(t("Liian monta pyyntöä, odota hetki ja yritä uudelleen."));
        return true;
    }
    return false;
}

// try to get error message from response body
async function getErrorMsg(res) {
    try {
        const body = await res.json();
        return body.message || t("Tuntematon virhe");
    } catch (e) {
        return t("Tuntematon virhe");
    }
}

// POST /api/admin/login - returns token or null
export async function adminLogin(username, password) {
    try {
        const res = await fetch("/api/admin/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data.token || null;
    } catch (e) {
        alert(t("Kirjautuminen epäonnistui. Tarkista yhteys."));
        return null;
    }
}

// GET /api/inhalers - returns array of inhalers
// Passes current language so backend can return translated data
export async function getInhalers() {
    try {
        const lang = localStorage.getItem("lang") || "fi";
        const res = await fetch("/api/inhalers?lang=" + lang);
        if (!res.ok) return [];
        return await res.json();
    } catch (e) {
        console.error("Failed to fetch inhalers:", e);
        return [];
    }
}

// GET /api/inhalers/last-updated - returns latest update date
export async function getLastUpdated() {
    try {
        const res = await fetch("/api/inhalers/last-updated");
        if (!res.ok) return null;
        return await res.json();
    } catch (e) {
        console.error("Failed to fetch last updated date:", e);
        return null;
    }
}

// PUT /api/admin/set-last-update - updates latest update date
export async function setLastUpdate() {
    try {
        const res = await fetch("/api/admin/set-last-update", {
            method: "PUT",
            headers: getAuthHeaders()
        });
        if (checkExpiredToken(res)) return null;
        if (checkRateLimit(res)) return null;
        if (!res.ok) {
            alert(t("Muokkaus epäonnistui: ") + await getErrorMsg(res));
            return null;
        }
        return await res.json();
    } catch (e) {
        alert(t("Yhteysvirhe muokkauksessa."));
        return null;
    }
}

// PUT /api/admin/update-logbook - updates front page change log text
export async function updateLogBook(info) {
    try {
        const res = await fetch("/api/admin/update-logbook", {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify({ info })
        });
        if (checkExpiredToken(res)) return null;
        if (checkRateLimit(res)) return null;
        if (!res.ok) {
            alert(t("Muokkaus epäonnistui: ") + await getErrorMsg(res));
            return null;
        }
        return await res.json();
    } catch (e) {
        alert(t("Yhteysvirhe muokkauksessa."));
        return null;
    }
}

// GET /api/admin/backup/download - downloads database backup
export async function downloadDatabaseBackup() {
    try {
        const res = await fetch("/api/admin/backup/download", {
            headers: getAuthOnly()
        });
        if (checkExpiredToken(res)) return false;
        if (checkRateLimit(res)) return false;
        if (!res.ok) {
            alert(t("Varmuuskopion lataus epäonnistui: ") + await getErrorMsg(res));
            return false;
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "inhalers.db";
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        return true;
    } catch (e) {
        alert(t("Yhteysvirhe varmuuskopion latauksessa."));
        return false;
    }
}

// fetch inhalers in both languages and merge descriptions into {fi, sv}
export async function getInhalersBothLangs() {
    try {
        const [resFi, resSv] = await Promise.all([
            fetch("/api/inhalers?lang=fi"),
            fetch("/api/inhalers?lang=sv")
        ]);
        if (!resFi.ok || !resSv.ok) return [];
        const [dataFi, dataSv] = await Promise.all([resFi.json(), resSv.json()]);

        const svMap = new Map(dataSv.map(i => [i.id, i.description]));
        return dataFi.map(inh => ({
            ...inh,
            description: { fi: inh.description || "", sv: svMap.get(inh.id) || "" }
        }));
    } catch (e) {
        console.error("Failed to fetch inhalers:", e);
        return [];
    }
}

// POST /api/admin/inhalers - returns created id or null
export async function createInhaler(data) {
    try {
        const res = await fetch("/api/admin/inhalers", {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        if (checkExpiredToken(res)) return null;
        if (checkRateLimit(res)) return null;
        if (!res.ok) {
            alert(t("Tallennus epäonnistui: ") + await getErrorMsg(res));
            return null;
        }
        const body = await res.json();
        return body.id || true;
    } catch (e) {
        alert(t("Yhteysvirhe tallennuksessa."));
        return null;
    }
}

// PUT /api/admin/inhalers/:id - returns true/false
export async function updateInhaler(id, data) {
    try {
        const res = await fetch("/api/admin/inhalers/" + id, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        if (checkExpiredToken(res)) return false;
        if (checkRateLimit(res)) return false;
        if (!res.ok) {
            alert(t("Muokkaus epäonnistui: ") + await getErrorMsg(res));
            return false;
        }
        return true;
    } catch (e) {
        alert(t("Yhteysvirhe muokkauksessa."));
        return false;
    }
}

// GET /api/inhalers/filters - returns available filter values
export async function getFilters() {
    try {
        const lang = localStorage.getItem("lang") || "fi";
        const res = await fetch("/api/inhalers/filters?lang=" + lang);
        if (!res.ok) return null;
        return await res.json();
    } catch (e) {
        console.error("Failed to fetch filters:", e);
        return null;
    }
}

// GET /api/admin/drug-class
export async function getDrugClasses() {
    try {
        const res = await fetch("/api/admin/drug-class", {
            headers: getAuthOnly()
        });
        if (checkExpiredToken(res)) return [];
        if (checkRateLimit(res)) return [];
        if (!res.ok) return [];
        return await res.json();
    } catch (e) {
        console.error("Failed to fetch drug classes:", e);
        return [];
    }
}

// POST /api/admin/drug-class
export async function createDrugClass(name) {
    try {
        const res = await fetch("/api/admin/drug-class", {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ name })
        });
        if (checkExpiredToken(res)) return null;
        if (checkRateLimit(res)) return null;
        if (!res.ok) {
            alert(t("Lääkeaineluokan lisäys epäonnistui: ") + await getErrorMsg(res));
            return null;
        }
        const body = await res.json();
        return body.id || true;
    } catch (e) {
        alert(t("Yhteysvirhe lääkeaineluokan lisäyksessä."));
        return null;
    }
}

// PUT /api/admin/drug-class/:id
export async function updateDrugClass(id, name) {
    try {
        const res = await fetch("/api/admin/drug-class/" + id, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify({ name })
        });
        if (checkExpiredToken(res)) return false;
        if (checkRateLimit(res)) return false;
        if (!res.ok) {
            alert(t("Lääkeaineluokan muokkaus epäonnistui: ") + await getErrorMsg(res));
            return false;
        }
        return true;
    } catch (e) {
        alert(t("Yhteysvirhe lääkeaineluokan muokkauksessa."));
        return false;
    }
}

// DELETE /api/admin/drug-class/:id
export async function deleteDrugClass(id) {
    try {
        const res = await fetch("/api/admin/drug-class/" + id, {
            method: "DELETE",
            headers: getAuthHeaders()
        });
        if (checkExpiredToken(res)) return false;
        if (checkRateLimit(res)) return false;
        if (!res.ok) {
            alert(t("Lääkeaineluokan poisto epäonnistui: ") + await getErrorMsg(res));
            return false;
        }
        return true;
    } catch (e) {
        alert(t("Yhteysvirhe lääkeaineluokan poistossa."));
        return false;
    }
}

// GET /api/admin/active-ingredient
export async function getActiveIngredients() {
    try {
        const res = await fetch("/api/admin/active-ingredient", {
            headers: getAuthOnly()
        });
        if (checkExpiredToken(res)) return [];
        if (checkRateLimit(res)) return [];
        if (!res.ok) return [];
        return await res.json();
    } catch (e) {
        console.error("Failed to fetch active ingredients:", e);
        return [];
    }
}

// POST /api/admin/active-ingredient
export async function createActiveIngredient(fi, sv, drugClassId) {
    try {
        const res = await fetch("/api/admin/active-ingredient", {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ fi, sv, drug_class_id: drugClassId })
        });
        if (checkExpiredToken(res)) return null;
        if (checkRateLimit(res)) return null;
        if (!res.ok) {
            alert(t("Lääkeaineen lisäys epäonnistui: ") + await getErrorMsg(res));
            return null;
        }
        const body = await res.json();
        return body.id || true;
    } catch (e) {
        alert(t("Yhteysvirhe lääkeaineen lisäyksessä."));
        return null;
    }
}

// PUT /api/admin/active-ingredient/:id
export async function updateActiveIngredient(id, fi, sv, drugClassId) {
    try {
        const res = await fetch("/api/admin/active-ingredient/" + id, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify({ fi, sv, drug_class_id: drugClassId })
        });
        if (checkExpiredToken(res)) return false;
        if (checkRateLimit(res)) return false;
        if (!res.ok) {
            alert(t("Lääkeaineen muokkaus epäonnistui: ") + await getErrorMsg(res));
            return false;
        }
        return true;
    } catch (e) {
        alert(t("Yhteysvirhe lääkeaineen muokkauksessa."));
        return false;
    }
}

// DELETE /api/admin/active-ingredient/:id
export async function deleteActiveIngredient(id) {
    try {
        const res = await fetch("/api/admin/active-ingredient/" + id, {
            method: "DELETE",
            headers: getAuthHeaders()
        });
        if (checkExpiredToken(res)) return false;
        if (checkRateLimit(res)) return false;
        if (!res.ok) {
            alert(t("Lääkeaineen poisto epäonnistui: ") + await getErrorMsg(res));
            return false;
        }
        return true;
    } catch (e) {
        alert(t("Yhteysvirhe lääkeaineen poistossa."));
        return false;
    }
}

// GET /api/admin/brand
export async function getBrands() {
    try {
        const res = await fetch("/api/admin/brand", {
            headers: getAuthOnly()
        });
        if (checkExpiredToken(res)) return [];
        if (checkRateLimit(res)) return [];
        if (!res.ok) return [];
        return await res.json();
    } catch (e) {
        console.error("Failed to fetch brands:", e);
        return [];
    }
}

// POST /api/admin/brand
export async function createBrand(name) {
    try {
        const res = await fetch("/api/admin/brand", {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ name })
        });
        if (checkExpiredToken(res)) return null;
        if (checkRateLimit(res)) return null;
        if (!res.ok) {
            alert(t("Inhalaattorin lisäys epäonnistui: ") + await getErrorMsg(res));
            return null;
        }
        const body = await res.json();
        return body.id || true;
    } catch (e) {
        alert(t("Yhteysvirhe inhalaattorin lisäyksessä."));
        return null;
    }
}

// PUT /api/admin/brand/:id
export async function updateBrand(id, name) {
    try {
        const res = await fetch("/api/admin/brand/" + id, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify({ name })
        });
        if (checkExpiredToken(res)) return false;
        if (checkRateLimit(res)) return false;
        if (!res.ok) {
            alert(t("Inhalaattorin muokkaus epäonnistui: ") + await getErrorMsg(res));
            return false;
        }
        return true;
    } catch (e) {
        alert(t("Yhteysvirhe inhalaattorin muokkauksessa."));
        return false;
    }
}

// DELETE /api/admin/brand/:id
export async function deleteBrand(id) {
    try {
        const res = await fetch("/api/admin/brand/" + id, {
            method: "DELETE",
            headers: getAuthOnly()
        });
        if (checkExpiredToken(res)) return false;
        if (checkRateLimit(res)) return false;
        if (!res.ok) {
            alert(t("Inhalaattorin poisto epäonnistui: ") + await getErrorMsg(res));
            return false;
        }
        return true;
    } catch (e) {
        alert(t("Yhteysvirhe inhalaattorin poistossa."));
        return false;
    }
}

// GET /api/admin/filters - all filter values for admin
export async function getAdminFilters() {
    try {
        const res = await fetch("/api/admin/filters", {
            headers: getAuthOnly()
        });
        if (!res.ok) return null;
        return await res.json();
    } catch (e) {
        return null;
    }
}

// POST /api/admin/uploads/:id - upload image for inhaler
export async function uploadImage(id, file) {
    try {
        const formData = new FormData();
        formData.append("image", file);
        const res = await fetch("/api/admin/uploads/" + id, {
            method: "POST",
            headers: getAuthOnly(),
            body: formData
        });
        if (checkExpiredToken(res)) return false;
        if (checkRateLimit(res)) return false;
        if (!res.ok) {
            alert(t("Kuvan lataus epäonnistui: ") + await getErrorMsg(res));
            return false;
        }
        return true;
    } catch (e) {
        alert(t("Yhteysvirhe kuvan latauksessa."));
        return false;
    }
}

// DELETE /api/admin/uploads/:id - delete inhaler image
export async function deleteImage(id) {
    try {
        const res = await fetch("/api/admin/uploads/" + id, {
            method: "DELETE",
            headers: getAuthOnly()
        });
        if (checkExpiredToken(res)) return false;
        if (checkRateLimit(res)) return false;
        if (!res.ok) {
            alert(t("Kuvan poisto epäonnistui: ") + await getErrorMsg(res));
            return false;
        }
        return true;
    } catch (e) {
        alert(t("Yhteysvirhe kuvan poistossa."));
        return false;
    }
}

// DELETE /api/admin/inhalers/:id - returns true/false
export async function deleteInhaler(id) {
    try {
        const res = await fetch("/api/admin/inhalers/" + id, {
            method: "DELETE",
            headers: getAuthHeaders()
        });
        if (checkExpiredToken(res)) return false;
        if (checkRateLimit(res)) return false;
        if (!res.ok) {
            alert(t("Poisto epäonnistui: ") + await getErrorMsg(res));
            return false;
        }
        return true;
    } catch (e) {
        alert(t("Yhteysvirhe poistossa."));
        return false;
    }
}
