const { expect } = require("chai");
const db = require("../src/db/database");
const guides = require("../src/models/admin/guides");
const inhalers = require("../src/models/admin/inhalers");
const { getAllInhalers } = require("../src/models/inhalersModel");

const createGuide = (suffix, category = "dpi") => guides.create({
    category,
    names: { fi: `Ohje ${suffix}`, sv: `Anvisning ${suffix}` }
});

const createInhaler = (suffix, extra = {}) => inhalers.create({ name: `Guide Test Inhaler ${suffix}`, ...extra });

const guideIdsOf = (medicineId) => db.prepare(
    "SELECT guide_id FROM medicine_guide WHERE medicine_id = ? ORDER BY guide_id"
).all(medicineId).map(r => r.guide_id);

describe("guides", () => {

    it("should create a guide with names in both languages and no PDFs", () => {
        const id = createGuide("create");
        const guide = guides.getAll().find(g => g.id === id);

        expect(guide.category).to.equal("dpi");
        expect(guide.used_by).to.equal(0);
        expect(guide.fi).to.deep.equal({ name: "Ohje create", url: null });
        expect(guide.sv).to.deep.equal({ name: "Anvisning create", url: null });
    });

    it("should give a versioned url only for languages that have a PDF", () => {
        const id = createGuide("file");
        guides.setFileVersion(id, "fi", 123);

        const guide = guides.getAll().find(g => g.id === id);
        expect(guide.fi.url).to.equal(`/guides/${id}-fi.pdf?v=123`);
        expect(guide.sv.url).to.equal(null);

        guides.setFileVersion(id, "fi", null);
        expect(guides.getAll().find(g => g.id === id).fi.url).to.equal(null);
    });

    it("should edit only the given fields", () => {
        const id = createGuide("edit");
        guides.edit(id, { category: null, names: { sv: "Ny anvisning" } });

        const guide = guides.getAll().find(g => g.id === id);
        expect(guide.category).to.equal(null);
        expect(guide.fi.name).to.equal("Ohje edit");
        expect(guide.sv.name).to.equal("Ny anvisning");
    });

    it("should connect guides to a new inhaler and return them in the public data", () => {
        const guideId = createGuide("public");
        guides.setFileVersion(guideId, "sv", 5);
        const medId = createInhaler("public", { guides: [guideId] });

        const fi = getAllInhalers("fi").find(m => m.id === medId);
        const sv = getAllInhalers("sv").find(m => m.id === medId);

        expect(fi.guides).to.deep.equal([{ id: guideId, name: "Ohje public", url: null }]);
        expect(sv.guides).to.deep.equal([{ id: guideId, name: "Anvisning public", url: `/guides/${guideId}-sv.pdf?v=5` }]);
    });

    it("should replace guides on edit and allow removing all of them", () => {
        const a = createGuide("replace-a");
        const b = createGuide("replace-b");
        const medId = createInhaler("replace", { guides: [a] });

        inhalers.edit(medId, { guides: [b, b] });
        expect(guideIdsOf(medId)).to.deep.equal([b]);

        inhalers.edit(medId, { guides: [] });
        expect(guideIdsOf(medId)).to.deep.equal([]);
    });

    it("should keep guides when an edit doesn't mention them", () => {
        const a = createGuide("keep");
        const medId = createInhaler("keep", { guides: [a] });

        inhalers.edit(medId, { name: "Guide Test Inhaler keep renamed" });
        expect(guideIdsOf(medId)).to.deep.equal([a]);
    });

    it("should not delete a guide that is in use", () => {
        const id = createGuide("in-use");
        const medId = createInhaler("in-use", { guides: [id] });

        expect(guides.remove(id)).to.equal("IN_USE");
        expect(guides.getAll().find(g => g.id === id).used_by).to.equal(1);

        inhalers.delete(medId);
        expect(guides.remove(id)).to.equal(true);
        expect(guides.getAll().find(g => g.id === id)).to.equal(undefined);
        expect(db.prepare("SELECT COUNT(*) AS c FROM guide_translation WHERE guide_id = ?").get(id).c).to.equal(0);
    });

    it("should report a missing guide on delete", () => {
        expect(guides.remove(999999)).to.equal("NOT_FOUND");
    });

    it("should reject unknown guide ids on an inhaler", () => {
        expect(() => createInhaler("bad-guide", { guides: [999999] })).to.throw();
    });

    it("should be safe to run the guide table setup again", () => {
        const fs = require("fs");
        const path = require("path");
        const sql = fs.readFileSync(path.join(__dirname, "../src/db/guides.sql"), "utf-8");
        expect(() => db.exec(sql)).to.not.throw();
    });
});
