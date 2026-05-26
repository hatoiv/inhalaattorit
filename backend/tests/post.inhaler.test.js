const { expect } = require("chai");
const db = require("../src/db/database");
const inhalers = require("../src/models/admin/inhalers");
const dbAdd = inhalers.create;

describe("inhalers.create()", () => {

    it("should add a new inhaler to the medicine table", () => {

        const item = {
            name: "Test Inhaler"
        };

        dbAdd(item);

        const row = db.prepare("SELECT * FROM medicine WHERE name = ?").get("Test Inhaler");

        expect(row).to.exist;
        expect(row.name).to.equal("Test Inhaler");
    });


    it("should add translations when description is provided", () => {

        const item = {
            name: "Translation Test",
            description: {
                fi: "Suomenkielinen kuvaus",
                sv: "Svensk beskrivning"
            }
        };

        const id = dbAdd(item);

        const desc = db.prepare(
            "SELECT language, description FROM medicine_translation WHERE medicine_id = ?"
        ).all(id);

        expect(desc).to.have.lengthOf(2);
        expect(desc.map(d => d.language)).to.include("fi");
        expect(desc.map(d => d.language)).to.include("sv");
    });


    it("should add relations to intake_styles", () => {

        const item = {
            name: "Style Test",
            intake_styles: [1, 3]
        };

        const id = dbAdd(item);

        const styles = db.prepare(
            "SELECT intake_style_id FROM medicine_intake_style WHERE medicine_id = ?"
        ).all(id);

        expect(styles).to.have.lengthOf(2);
    });


    it("should add relations to active ingredients", () => {

        const item = {
            name: "Ingredient Test",
            active_ingredients: [1]
        };

        const id = dbAdd(item);

        const ingredients = db.prepare(
            "SELECT active_ingredient_id FROM medicine_active_ingredient WHERE medicine_id = ?"
        ).all(id);

        expect(ingredients).to.have.lengthOf(1);
    });


    it("should add relations to colors", () => {

        const item = {
            name: "Color Test",
            colors: [1, 2]
        };

        const id = dbAdd(item);

        const colors = db.prepare(
            "SELECT color_id FROM medicine_color WHERE medicine_id = ?"
        ).all(id);

        expect(colors).to.have.lengthOf(2);
    });


    it("should allow empty optional fields except name", () => {

        const item = {
            name: "Minimal Inhaler",
            image_path: null,
            links: null,
            intake_styles: [],
            active_ingredients: [],
            colors: []
        };

        const id = dbAdd(item);

        const row = db.prepare("SELECT * FROM medicine WHERE name = ?").get("Minimal Inhaler");

        expect(row).to.exist;
    });


    it("should fail when name is missing", () => {

        const item = {
            official_min_age: 5
        };

        expect(() => dbAdd(item)).to.throw();
    });


    it("should preserve description whitespace and delete empty ones", () => {

        const item = {
            name: "Trim Test",
            description: {
                fi: "Test description\n\nAnother line",
                sv: "   "
            }
        };

        const id = dbAdd(item);

        const desc = db.prepare(
            "SELECT language, description FROM medicine_translation WHERE medicine_id = ?"
        ).all(id);

        expect(desc).to.have.lengthOf(1);
        expect(desc[0].description).to.equal("Test description\n\nAnother line");
    });


    
    it("should insert and retrieve all fields correctly using testMedicine object via getAllInhalers", () => {
        const { getAllInhalers } = require("../src/models/inhalersModel");
        const testMedicine = {
            name: "Testilääke",
            image_path: "/on",
            links: {
                database: "https://pharmacafennica.fi/spc/2011594",
                tutorial: "https://www.youtube.com/watch?v=kZ1UXkbvpqo&list=PLNhllJNrG-R__DjSxaxbltf635aJGmadl&index=28"
            },

            official_min_age: 5,
            recommended_min_age: 7,
            times_a_day: 1,
            good_intake_speed: 1,
            good_coordination: 0,
            treatment_medicine: 1,
            symptomatic_medicine: 0,
            inhaler_brand_id: 1,

            description: {
                fi: "moi",
                sv: "hej"
            },

            intake_styles: [1, 2],
            active_ingredients: [1],
            colors: [2]
        };

        const id = dbAdd(testMedicine);

        // Retrieve using the real getAllInhalers function
        const inhalers = getAllInhalers("fi");
        const med = inhalers.find(m => m.name === "Testilääke");
        
        expect(med).to.exist;
        expect(med.image_path).to.equal("/on");
        expect(med.links.database).to.equal("https://pharmacafennica.fi/spc/2011594");
        expect(med.links.tutorial).to.equal("https://www.youtube.com/watch?v=kZ1UXkbvpqo&list=PLNhllJNrG-R__DjSxaxbltf635aJGmadl&index=28");
        expect(med.official_min_age).to.equal(5);
        expect(med.recommended_min_age).to.equal(7);
        expect(med.times_a_day).to.equal(1);
        expect(med.good_intake_speed).to.equal(1);
        expect(med.good_coordination).to.equal(0);
        expect(med.treatment_medicine).to.equal(1);
        expect(med.symptomatic_medicine).to.equal(0);
        expect(med.inhaler_brand.id).to.equal(1);

        // Relations
        expect(med.intake_styles.map(s => s.intake_style_id)).to.have.members([1, 2]);
        expect(med.active_ingredients.map(a => a.active_ingredient_id)).to.have.members([1]);
        expect(med.colors.map(c => c.color_id)).to.have.members([2]);
        // Descriptions
        expect(med.description).to.equal("moi");
    });
});
