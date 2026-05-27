import { getFilteredIds } from "./filter.js";
import { getInhalers, getFilters, getLastUpdated } from "./api.js";
import {
  gridID,
  detailID,
  backButtonID,
  resultCountID,
  updateDateID,
  renderInhalerGrid,
  refreshInhalerCardImageBadges,
  setSelectedPatientAge,
  setElementVisibility,
  getLastFocusedCard,
} from "./render.js";
import { getCounterString, getTranslation } from "./lang.js";
import { openButtonId, closeButtonId, toggleGuidePanel } from "./guide.js";
import {
  getSearchName,
  autoCompleteSearch,
  clearSuggestions,
  getCombinedFilteredIds,
  renderAutoCompleteResults,
  getSearchDisplayName,
} from "./search.js";
import { sortIntakeStylesForDropdown } from "./intake-order.js";
import { getDosageLabel, getPublicDosageFilterValues } from "./dosage.js";

const nameClearID = "search-name-clear";
const filterClearID = "search-filter-clear";

var currentInhalers = 0;
var totalInhalers = 0;
var savedScrollPosition = 0;
const multiSelectClass = "inhaler-multiselect";
const multiSelectFilterIds = new Set([
  "inhaler-form-select",
  "inhaler-purpose-select",
  "inhaler-drug-group-select",
  "inhaler-active-substance-select",
  "inhaler-color-select",
]);

function updateCounter() {
  const counterStr = getCounterString()
    .replace("{current}", currentInhalers)
    .replace("{total}", totalInhalers);
  const counterEl = document.getElementById("result-count");

  counterEl.textContent = counterStr;
}

async function updateLastUpdatedDate() {
  const dateEl = document.getElementById("update-date");
  if (!dateEl) return;

  const data = await getLastUpdated();
  if (!data || !data.date) return;

  dateEl.textContent = dateEl.textContent.replace("{date}", data.date);
}

function getFilterObject() {
  const filters = {};

  document.querySelectorAll("input.inhaler-filter").forEach((input) => {
    filters[input.name] = input.value;
  });

  document
    .querySelectorAll(
      ".search-filter select.inhaler-filter:not(.inhaler-filter-native)",
    )
    .forEach((select) => {
      filters[select.name] = select.value;
    });

  document.querySelectorAll(`.${multiSelectClass}`).forEach((multiSelect) => {
    const selectedValues = getSelectedMultiSelectValues(multiSelect);
    filters[multiSelect.dataset.name] =
      selectedValues.length > 0 ? selectedValues : "";
  });

  return filters;
}

function updateResults() {
  const searchInput = document.getElementById("inhaler-name");

  const name = getSearchName(searchInput);
  const filters = getFilterObject();
  setSelectedPatientAge(filters.recommended_min_age);
  const filterIds = getCombinedFilteredIds(inhalers, filters, name);
  //const filterIds = getFilteredIds(inhalers, filters);
  const renderTarget = document.getElementById(gridID);

  currentInhalers = filterIds.size;
  updateCounter();

  [...renderTarget.children].forEach((card) => {
    setElementVisibility(card.id, filterIds.has(card.id));
  });

  refreshInhalerCardImageBadges();
}

// Add <option> elements to a <select>
function addOptions(selectId, values, labelFn) {
  const select = document.getElementById(selectId);
  if (!select || !values) return;

  for (const val of values) {
    const opt = document.createElement("option");
    opt.value = String(val);
    opt.textContent = labelFn ? labelFn(val) : String(val);
    select.appendChild(opt);
  }
}

function initializeMultiSelectFilters() {
  const selects = document.querySelectorAll(
    ".search-filter select.inhaler-filter",
  );

  selects.forEach((select) => {
    if (!multiSelectFilterIds.has(select.id)) return;
    if (select.dataset.multiselectReady === "true") return;

    const placeholder =
      select.options.length > 0 ? select.options[0].textContent : "";
    const options = [...select.options]
      .filter((option) => option.value !== "")
      .map((option) => ({
        label: option.textContent,
        value: option.value,
      }));

    const multiSelect = buildMultiSelect(select.name, placeholder, options);
    select.insertAdjacentElement("afterend", multiSelect);
    select.classList.add("inhaler-filter-native");
    select.dataset.multiselectReady = "true";
  });
}

function buildMultiSelect(name, placeholder, options) {
  const wrapper = document.createElement("div");
  wrapper.classList.add(multiSelectClass);
  wrapper.dataset.name = name;
  wrapper.dataset.placeholder = placeholder;

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.classList.add("inhaler-multiselect-trigger");
  trigger.setAttribute("aria-expanded", "false");
  trigger.textContent = placeholder;
  trigger.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleMultiSelect(wrapper);
  });

  const panel = document.createElement("div");
  panel.classList.add("inhaler-multiselect-panel");
  panel.hidden = true;

  options.forEach((option) => {
    const optionLabel = document.createElement("label");
    optionLabel.classList.add("inhaler-multiselect-option");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = option.value;
    checkbox.addEventListener("change", () => {
      updateMultiSelectTrigger(wrapper);
      updateResults();
    });

    const text = document.createElement("span");
    text.textContent = option.label;

    optionLabel.appendChild(checkbox);
    optionLabel.appendChild(text);
    panel.appendChild(optionLabel);
  });

  wrapper.appendChild(trigger);
  wrapper.appendChild(panel);

  return wrapper;
}

function toggleMultiSelect(targetMultiSelect) {
  document.querySelectorAll(`.${multiSelectClass}`).forEach((multiSelect) => {
    const isTarget = multiSelect === targetMultiSelect;
    setMultiSelectOpen(
      multiSelect,
      isTarget ? !isMultiSelectOpen(multiSelect) : false,
    );
  });
}

function setMultiSelectOpen(multiSelect, isOpen) {
  const trigger = multiSelect.querySelector(".inhaler-multiselect-trigger");
  const panel = multiSelect.querySelector(".inhaler-multiselect-panel");

  if (!trigger || !panel) return;

  trigger.setAttribute("aria-expanded", String(isOpen));
  panel.hidden = !isOpen;
  multiSelect.classList.toggle("open", isOpen);
}

function isMultiSelectOpen(multiSelect) {
  return multiSelect.classList.contains("open");
}

function getSelectedMultiSelectValues(multiSelect) {
  return [
    ...multiSelect.querySelectorAll('input[type="checkbox"]:checked'),
  ].map((checkbox) => checkbox.value);
}

function updateMultiSelectTrigger(multiSelect) {
  const trigger = multiSelect.querySelector(".inhaler-multiselect-trigger");
  if (!trigger) return;

  const checkedOptions = [
    ...multiSelect.querySelectorAll('input[type="checkbox"]:checked'),
  ];

  if (checkedOptions.length === 0) {
    trigger.textContent = multiSelect.dataset.placeholder || "";
    return;
  }

  const selectedLabels = checkedOptions.map(
    (checkbox) => checkbox.nextElementSibling?.textContent || checkbox.value,
  );

  trigger.textContent =
    selectedLabels.length <= 2
      ? selectedLabels.join(", ")
      : `${selectedLabels.slice(0, 2).join(", ")} +${selectedLabels.length - 2}`;
}

function resetMultiSelectFilters() {
  document.querySelectorAll(`.${multiSelectClass}`).forEach((multiSelect) => {
    multiSelect
      .querySelectorAll('input[type="checkbox"]')
      .forEach((checkbox) => (checkbox.checked = false));
    updateMultiSelectTrigger(multiSelect);
    setMultiSelectOpen(multiSelect, false);
  });
}

function closeAllMultiSelects() {
  document.querySelectorAll(`.${multiSelectClass}`).forEach((multiSelect) => {
    setMultiSelectOpen(multiSelect, false);
  });
}

// Populate all filter dropdowns from backend data
function populateFilters(filters) {
  if (!filters) return;

  const intakeStyles = sortIntakeStylesForDropdown(filters.intake_styles);
  addOptions("inhaler-form-select", intakeStyles);

  // No longer an select form
  //const ages = filters.recommended_min_age.slice().sort((a, b) => a - b);
  //addOptions("inhaler-age-select", ages, (v) => v + " v");

  const times = getPublicDosageFilterValues(filters.times_a_day);
  addOptions(
    "inhaler-dosage-select",
    times,
    getDosageLabel,
  );

  // Boolean: intake speed
  addOptions("inhaler-velocity-select", ["1", "0"], (v) =>
    v === "1"
      ? getTranslation("filter.speed-good")
      : getTranslation("filter.speed-poor"),
  );

  // Boolean: coordination
  addOptions("inhaler-coordination-select", ["1", "0"], (v) =>
    v === "1"
      ? getTranslation("filter.coord-good")
      : getTranslation("filter.coord-poor"),
  );

  // Sort inhaler brands alphabetically
  addOptions("inhaler-type-select", filters.inhaler_brand.sort());

  // Purpose maps to two boolean fields, hardcoded options
  addOptions("inhaler-purpose-select", ["treatment", "symptomatic"], (v) =>
    v === "treatment"
      ? getTranslation("filter.treatment")
      : getTranslation("filter.symptomatic"),
  );

  addOptions("inhaler-drug-group-select", filters.drug_class_name);
  addOptions(
    "inhaler-active-substance-select",
    filters.active_ingredients.sort(),
  );
  addOptions("inhaler-color-select", filters.colors.sort());
}

// Update autocomplete suggestions based on current input
function updateAutoComplete() {
  const searchInput = document.getElementById("inhaler-name");
  const resultBox = document.querySelector(".result-box");

  const name = getSearchName(searchInput);
  const results = autoCompleteSearch(inhalers, name, 5);
  renderAutoCompleteResults(resultBox, results, (item) => {
    searchInput.value = getSearchDisplayName(item);
    clearSuggestions(resultBox);
    updateResults();
  });
}

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
  const filterToggle = document.querySelector(".filter-toggle");
  const filterSection = document.querySelector(".search-filter");
  if (filterToggle && filterSection) {
    filterToggle.addEventListener("click", () => {
      if (window.innerWidth <= 768) {
        filterSection.classList.toggle("collapsed");
      }
    });
  }

  // Age filter
  document
    .getElementById("inhaler-age-select")
    .addEventListener("input", updateResults);

  // Name search
  const clearNameBtn = document.getElementById(nameClearID);
  const searchInput = document.getElementById("inhaler-name");
  const resultsBox = document.querySelector(".result-box");
  if (clearNameBtn && searchInput && resultsBox) {
    clearNameBtn.addEventListener("click", () => {
      searchInput.value = "";
      searchInput.focus();
      clearSuggestions(resultsBox);
      updateResults();
    });
    // Update search suggestions on input
    searchInput.addEventListener("input", () => {
      updateResults();
      updateAutoComplete();
    });
    // Click outside to close resultbox
    document.addEventListener("click", (event) => {
      if (event.target !== searchInput && event.target !== resultsBox) {
        clearSuggestions(resultsBox);
      }

      if (!event.target.closest(`.${multiSelectClass}`)) {
        closeAllMultiSelects();
      }
    });
  }

  // Clear dropdown filters
  const clearFiltersBtn = document.getElementById(filterClearID);
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener("click", () => {
      resetMultiSelectFilters();
      document
        .querySelectorAll(
          ".search-filter select.inhaler-filter:not(.inhaler-filter-native)",
        )
        .forEach((select) => (select.selectedIndex = 0));
      document.getElementById("inhaler-age-select").value = "";
      updateResults();
    });
  }

  const singleSelectFilters = document.querySelectorAll(
    ".search-filter select.inhaler-filter:not(.inhaler-filter-native)",
  );
  singleSelectFilters.forEach((select) => {
    select.addEventListener("change", updateResults);
  });

  // Back to grid view button
  const backButton = document.getElementById(backButtonID);
  backButton.addEventListener("click", () => {
    setElementVisibility(gridID, true);
    setElementVisibility(resultCountID, true);
    setElementVisibility(updateDateID, true);
    setElementVisibility(backButtonID, false);
    setElementVisibility(detailID, false);
    updateResults();
    // Restore scroll position after making grid visible
    setTimeout(() => {
      window.scrollTo(0, savedScrollPosition);
      document.getElementById(getLastFocusedCard()).focus();
    }, 0);
    // Retain search results after going back from detail view
    updateResults();
  });

  // Language button
  const langBtn = document.querySelector(".lang-toggle");
  if (langBtn) {
    langBtn.addEventListener("click", function () {
      setTimeout(() => location.reload(), 50);
      updateCounter();
      renderInhalerGrid(inhalers);
    });
  }

  // Guide panel
  const guideButtonOpen = document.getElementById(openButtonId);
  guideButtonOpen.addEventListener("click", function () {
    toggleGuidePanel(true);
  });

  const guideButtonClose = document.getElementById(closeButtonId);
  guideButtonClose.addEventListener("click", function () {
    toggleGuidePanel(false);
  });
});

// Load data
const [inhalers, filters] = await Promise.all([getInhalers(), getFilters()]);
inhalers.sort((a, b) => a.name.localeCompare(b.name));
currentInhalers = totalInhalers = inhalers.length;

populateFilters(filters);
initializeMultiSelectFilters();
renderInhalerGrid(inhalers);
updateCounter();
updateLastUpdatedDate();

// Save scroll position before navigating to detail view
document.getElementById(gridID).addEventListener("click", (event) => {
  if (event.target.closest("." + "card")) {
    savedScrollPosition = window.scrollY;
  }
  window.scrollTo(0, 0);
});
