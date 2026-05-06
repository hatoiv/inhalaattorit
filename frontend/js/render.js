export const gridID = "results-grid";
export const detailID = "detail-view";
export const backButtonID = "return-to-gridview";
export const resultCountID = "result-count";
export const updateDateID = "update-date";
import { getLang, getTranslation } from './lang.js';

const missingImg = "img/missing.png";
const spacerIconImg = "img/tilanjatkeUusi.png";
const maskIconImg = "img/tilanjatkemaskillaUusi.png";
export const extensionIntakeStyleId = 5;

const inhalerInputTag = "button";
const inhalerCardTag = "article";
const inhalerSection = "section";
const imageTag = "img";
const nameTag = "h3";
const lineTag = "p";

const detailClass = "detail-view";
const detailImgClass = "detail-view-img";
const detailInfoClass = "detail-view-info";
const cardClass = "card";
const cardInputClass = "card-button";
const cardImgClass = "card-img";
const cardInfoClass = "card-info";

const arraySeparator = ", ";
const spacerMaskMaxAge = 3;

let lastFocusedCard = "";
let selectedPatientAge = null;

/**
 * Renders given inhalers
 * @param {*} data JSON data containing (filtered) inhalers
 */
export function renderInhalerGrid(data) {
    const renderTarget = document.getElementById(gridID);
    const inhalerList = document.createDocumentFragment();
    
    // Build cards for each inhaler
    for (const inhaler of data ) {
        if (inhaler === null) {
            continue;
        }

        const inhalerCard = buildCard(inhaler);
        if (inhalerCard !== null) {
            inhalerCard.id = inhaler.id;
            inhalerCard.addEventListener("click", (event) => {
                renderInhalerDetails(inhaler);
                lastFocusedCard = inhalerCard.id;
            });
            inhalerList.appendChild(inhalerCard);
        }
    }

    renderTarget.replaceChildren(inhalerList);
    
    setElementVisibility(backButtonID, false);
    setElementVisibility(detailID, false);
    setTimeout(() => {
        setElementVisibility(resultCountID, true);
        setElementVisibility(updateDateID, true);
        setElementVisibility(gridID, true);
    }, 0);
}

/**
 * Sets element visibility
 * @param {*} elementId HTML id of the element
 * @param {*} visible Sets element visible if true, hides if false
 */
export function setElementVisibility(elementId, visible) {
    const element = document.getElementById(elementId);
    element.hidden = !visible;
}

/**
 * Returns the id of last focused card
 * @returns id of last focused card
 */
export function getLastFocusedCard() {
    return lastFocusedCard;
}

export function setSelectedPatientAge(age) {
    const normalizedAge = age === "" || age == null ? NaN : Number(age);
    selectedPatientAge = Number.isNaN(normalizedAge) ? null : normalizedAge;
}

/**
 * Refreshes extension icons on already rendered inhaler cards.
 */
export function refreshInhalerCardImageBadges() {
    const cardImages = document.querySelectorAll(`.${cardImgClass}[data-has-extension="true"]`);

    cardImages.forEach((cardImage) => {
        const existingBadge = cardImage.querySelector(".inhaler-image-badge");
        const recommendedAgeValue = cardImage.dataset.recommendedAge;
        const badgeSrc = getExtensionIconSrc(recommendedAgeValue);

        if (existingBadge && badgeSrc) {
            existingBadge.src = badgeSrc;
        }
    });
}

/**
 * Renders detailed view of given inhaler
 * @param {*} inhaler JSON object containing the inhaler
 */
function renderInhalerDetails(inhaler) {
    const renderTarget = document.getElementById(detailID);
    const inhalerDetails = document.createDocumentFragment();

    // Create detailed view
    const inhalerView = buildDetailView(inhaler);
    if (typeof inhalerView !== "undefined") {
        inhalerDetails.appendChild(inhalerView);
        renderTarget.replaceChildren(inhalerDetails);
    }
   
    setElementVisibility(backButtonID, true);
    setElementVisibility(detailID, true);
    setTimeout(() => {
        setElementVisibility(resultCountID, false);
        setElementVisibility(updateDateID, false);
        setElementVisibility(gridID, false);    
        document.getElementById(backButtonID).focus();
    }, 0);
}

/**
 * Builds single inhaler card for grid
 * @param {*} inhaler JSON object containing the inhaler information
 * @returns HTML element containing the inhaler card
 */
function buildCard(inhaler) {
    // Button for the card
    const inhalerButton = document.createElement(inhalerInputTag);
    inhalerButton.classList.add(cardInputClass);

    // Article for the card
    const inhalerCard = document.createElement(inhalerCardTag);
    inhalerCard.classList.add(cardClass);

    // Create card sections
    const cardImage = buildImageSection(inhaler, true);
    inhalerCard.appendChild(cardImage);

    const cardInfo = buildCardInfoSection(inhaler);
    inhalerCard.appendChild(cardInfo);

    inhalerButton.appendChild(inhalerCard);

    return inhalerButton;
}

/**
 * Builds the info section for the inhaler card
 * @param {*} inhaler JSON object containing the inhaler information
 * @returns HTML element containing the info section
 */
function buildCardInfoSection(inhaler) {
    const cardInfoSection = document.createElement(inhalerSection);
    cardInfoSection.classList.add(cardInfoClass);

    // Header from inhaler name
    const infoHeader = document.createElement(nameTag);
    infoHeader.textContent = inhaler.name;
    cardInfoSection.appendChild(infoHeader);
    // If the inhaler is with extention, add a badge to the header
    for (const style of inhaler.intake_styles) {
        if (style.intake_style_id === 5) {
            const extBadge = document.createElement("span");
            extBadge.classList.add("inhaler-extension-badge");
            extBadge.textContent = getTranslation("card.extension-badge");
            infoHeader.appendChild(extBadge);
            break;
        }
    }
    
    // Relevant info
    if ("inhaler_brand" in inhaler) {
        const infoBrand = document.createElement(lineTag);
        infoBrand.textContent = inhaler.inhaler_brand.name;
        cardInfoSection.appendChild(infoBrand);
    }    

    // If null do not show age
    if (inhaler.recommended_min_age !== null) {
        const infoRecommendedAge = document.createElement(lineTag);
        infoRecommendedAge.appendChild(
            document.createTextNode(getTranslation("card.recommended-age"))
        );

        const ageValue = document.createElement("strong");
        ageValue.textContent = inhaler.recommended_min_age;
        infoRecommendedAge.appendChild(ageValue);

        cardInfoSection.appendChild(infoRecommendedAge);
    }

    const infoActiveIngrediend = document.createElement(lineTag);
    infoActiveIngrediend.style.whiteSpace = "pre-line";
    infoActiveIngrediend.appendChild(
        document.createTextNode(getTranslation("card.active-ingredients"))
    );

    const ingredientValue = document.createElement("strong");
    ingredientValue.textContent = inhaler.active_ingredients.map((ing) => ing.drug_class_name ? `${ing.name} (${ing.drug_class_name})` : ing.name).join(', ')
    infoActiveIngrediend.appendChild(ingredientValue);

    cardInfoSection.appendChild(infoActiveIngrediend);

    // TODO: Intake and coordination
    return cardInfoSection;
}

/**
 * Build detailed information view for inhaler
 * @param {*} inhaler JSON object containing the inhaler information
 * @returns HTML element containing the inhaler information
 */
function buildDetailView(inhaler) {
    const detailView = document.createElement(inhalerCardTag);
    detailView.classList.add(detailClass);

    // Create detail view sections
    const detailInfo = buildDetailInfoSection(inhaler);
    detailView.appendChild(detailInfo);

    const detailImage = buildImageSection(inhaler, false);
    detailView.appendChild(detailImage);

    return detailView;
}

/**
 * Builds the info section for the inhaler detail view
 * @param {*} inhaler JSON object containing the inhaler information
 * @returns HTML element containing the info section
 */
function buildDetailInfoSection(inhaler) {
    const detailInfoSection = document.createElement(inhalerSection);
    detailInfoSection.classList.add(detailInfoClass);

    const appendInfoItem = (section, labelText, valueText) => {
        const item = document.createElement("div");
        item.classList.add("detail-info-item");

        if (labelText) {
            const label = document.createElement("span");
            label.classList.add("detail-info-item-label");
            label.textContent = labelText;
            item.appendChild(label);
        }

        const value = document.createElement("span");
        value.classList.add("detail-info-item-value");
        value.textContent = valueText;
        item.appendChild(value);

        section.appendChild(item);
    };

    const appendSectionHeading = (section, headingText) => {
        const heading = document.createElement("h3");
        heading.textContent = headingText;
        section.appendChild(heading);
    };

    // Header from inhaler name
    const infoHeader = document.createElement("h1");
    infoHeader.textContent = inhaler.name;
    
    for (const style of inhaler.intake_styles) {
        if (style.intake_style_id === 5) {
            const extBadge = document.createElement("span");
            extBadge.classList.add("inhaler-extension-badge");
            extBadge.textContent = getTranslation("detail.extension-badge");
            infoHeader.appendChild(extBadge);
            break;
        }
    }
    detailInfoSection.appendChild(infoHeader);

    // Active ingredients section
    const ingredientsSection = document.createElement("div");
    ingredientsSection.classList.add("detail-info-section");
    appendSectionHeading(ingredientsSection, getTranslation("detail.ingredients"));

    appendInfoItem(
        ingredientsSection,
        "",
        inhaler.active_ingredients
            .map((ing) => ing.drug_class_name ? `${ing.name} (${ing.drug_class_name})` : ing.name)
            .join(', ')
    );

    detailInfoSection.appendChild(ingredientsSection);

    // Basic info section
    const basicSection = document.createElement("div");
    basicSection.classList.add("detail-info-section");

    if ("inhaler_brand" in inhaler) {
        appendInfoItem(basicSection, getTranslation("detail.inhaler"), inhaler.inhaler_brand.name);
    }

    appendInfoItem(
        basicSection,
        getTranslation("detail.form"),
        inhaler.intake_styles.map(s => s.name).join(', ')
    );

    detailInfoSection.appendChild(basicSection);

    // Age and dosage section
    const ageSection = document.createElement("div");
    ageSection.classList.add("detail-info-section");
    appendSectionHeading(ageSection, getTranslation("detail.age-dosage"));

    appendInfoItem(
        ageSection,
        getTranslation("detail.official-age"), 
        inhaler.official_min_age !== null ? inhaler.official_min_age + getTranslation("detail.years") : ""
    );

    appendInfoItem(
        ageSection,
        getTranslation("detail.recommended-age"),
        inhaler.recommended_min_age !== null ? inhaler.recommended_min_age + getTranslation("detail.years") : ""
    );

    appendInfoItem(
        ageSection,
        getTranslation("detail.dosage"),
        inhaler.times_a_day === 0 ? getTranslation("detail.if-necessary") : inhaler.times_a_day + getTranslation("detail.times-day")
    );

    detailInfoSection.appendChild(ageSection);

    // Requirements section !!Removed because of confusion!!
    /* const requirementsSection = document.createElement("div");
    requirementsSection.classList.add("detail-info-section");
    appendSectionHeading(requirementsSection, getTranslation("detail.requirements"));

    const intakeSpeedText = inhaler.good_intake_speed === 1 ? getTranslation("detail.speed-high") : getTranslation("detail.speed-low");
    appendInfoItem(requirementsSection, getTranslation("detail.intake-speed"), intakeSpeedText);

    const coordinationText = inhaler.good_coordination === 1 ? getTranslation("detail.coord-good") : getTranslation("detail.coord-normal");
    appendInfoItem(requirementsSection, getTranslation("detail.coordination"), coordinationText);

    detailInfoSection.appendChild(requirementsSection); */

    // Purpose section
    const purposeSection = document.createElement("div");
    purposeSection.classList.add("detail-info-section");
    appendSectionHeading(purposeSection, getTranslation("detail.purpose"));

    appendInfoItem(
        purposeSection,
        getTranslation("detail.treatment"),
        inhaler.treatment_medicine ? getTranslation("detail.yes") : getTranslation("detail.no")
    );

    appendInfoItem(
        purposeSection,
        getTranslation("detail.symptomatic"),
        inhaler.symptomatic_medicine ? getTranslation("detail.yes") : getTranslation("detail.no")
    );

    detailInfoSection.appendChild(purposeSection);

    // Description section
    if (inhaler.description != null) {
        const descSection = document.createElement("div");
        descSection.classList.add("detail-info-section");
        const descContent = document.createElement("p");
        descContent.classList.add("detail-description");
        descContent.textContent = inhaler.description;
        descSection.appendChild(descContent);
        detailInfoSection.appendChild(descSection);
    }


    


    // Links section
    if (inhaler.links != null) {
        const linksSection = document.createElement("div");
        linksSection.classList.add("detail-action-buttons");

        if (inhaler.links.database != null) {
            const linkDatabase = document.createElement("a");
            linkDatabase.href = inhaler.links.database;
            linkDatabase.textContent = getTranslation("detail.database-link");
            linkDatabase.target = "_blank";
            linkDatabase.classList.add("btn-primary");
            linksSection.appendChild(linkDatabase);
        }

        if (inhaler.links.tutorial != null) {
            const linkTutorial = document.createElement("a");
            linkTutorial.href = inhaler.links.tutorial;
            linkTutorial.textContent = getTranslation("detail.tutorial-link");
            linkTutorial.target = "_blank";
            linkTutorial.classList.add("btn-primary");
            linksSection.appendChild(linkTutorial);
        }

        detailInfoSection.appendChild(linksSection);
    }

    // Color badge
    if (inhaler.colors && inhaler.colors.length > 0) {
        const colorBadge = document.createElement("span");
        colorBadge.classList.add("inhaler-color-badge");

        const colorLabel = document.createElement("strong");
        colorLabel.textContent = getTranslation("detail.colors");
        colorBadge.appendChild(colorLabel);

        const colorValue = document.createElement("span");
        colorValue.textContent = inhaler.colors.map(c => c.name).join(", ");
        colorBadge.appendChild(colorValue);

        detailInfoSection.appendChild(colorBadge);
    }

        return detailInfoSection;
    }


/**
 * Builds the image section for inhaler cards and detail view
 * @param {*} inhaler Inhaler JSON object
 * @param {*} isGridView If true, render card thumbnail, else full image
 * @returns 
 */
function buildImageSection(inhaler, isGridView) {
    const imageSection = document.createElement(inhalerSection);
    imageSection.classList.add(isGridView ? cardImgClass : detailImgClass);
    buildImage(inhaler, imageSection, isGridView);

    if (hasExtensionBadge(inhaler)) {
        imageSection.dataset.hasExtension = "true";
        imageSection.dataset.recommendedAge = inhaler.recommended_min_age ?? "";
        buildExtensionImageBadge(imageSection, inhaler);
    }

    return imageSection;
}

/**
 * Builds the image element, and adds it to a parent
 * @param {*} inhaler Inhaler JSON object
 * @param {*} parent The parent element to add the image to
 * @param {*} isThumbnail Is the image a thumbnail
 */
function buildImage(inhaler, parent, isThumbnail) {
    const image = document.createElement(imageTag);
    image.src = isThumbnail
        ? "/uploads/thumb/" + inhaler.id + ".jpeg"
        : "/uploads/full/" + inhaler.id + ".jpeg";

    image.onerror = function () {
        this.onerror = null;
        this.src = missingImg;
    };

    image.alt = generateAltText(inhaler);

    parent.appendChild(image);
}

/**
 * Adds the extension icon badge to the card image.
 * @param {*} parent The parent image section
 * @param {*} inhaler Inhaler JSON object
 */
function buildExtensionImageBadge(parent, inhaler) {
    const badge = document.createElement(imageTag);
    badge.classList.add("inhaler-image-badge");
    badge.src = getExtensionIconSrc(inhaler);
    badge.alt = "";
    badge.setAttribute("aria-hidden", "true");

    parent.appendChild(badge);
}

/**
 * Returns true when the inhaler uses an extension.
 * @param {*} inhaler Inhaler JSON object
 * @returns boolean
 */
function hasExtensionBadge(inhaler) {
    return inhaler.intake_styles.some((style) => style.intake_style_id === extensionIntakeStyleId);
}

/**
 * Returns the correct extension icon path based on recommended age.
 * @param {*} inhaler Inhaler JSON object
 * @returns string
 */
function getExtensionIconSrc(inhaler) {
    const recommendedAgeValue = typeof inhaler === "object"
        ? inhaler.recommended_min_age
        : inhaler;
    const recommendedAge = recommendedAgeValue == null ? NaN : Number(recommendedAgeValue);

    if (
        selectedPatientAge != null &&
        selectedPatientAge <= spacerMaskMaxAge &&
        !Number.isNaN(recommendedAge) &&
        recommendedAge <= spacerMaskMaxAge
    ) {
        return maskIconImg;
    }

    return spacerIconImg;
}

/**
 * Generates localized alt text for images for accessibility
 * @param {*} inhaler Inhaler JSON object 
 * @returns Localized alt text string
 */
function generateAltText(inhaler) {
    var altText = "";
    var intakeStyles = [];
    var colors = [];

    // Intake styles
    for (const intakeStyle of inhaler.intake_styles) { intakeStyles.push(intakeStyle.name); }

    // Colors
    for (const color of inhaler.colors) { colors.push(color.name); }

    if (getLang() === "fi") { // Finnish string
        altText = `${inhaler.name} inhalaattori, ${intakeStyles.join(arraySeparator)}, ${colors.join(arraySeparator)}`;
    } else if (getLang() === "sv") { // Swedish string
        altText = `${inhaler.name} inhalator, ${intakeStyles.join(arraySeparator)}, ${colors.join(arraySeparator)}`;
    }

    return altText;
}
