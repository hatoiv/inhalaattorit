import { getFilteredIds } from "./filter.js";
import { getTranslation } from "./lang.js";
import { extensionIntakeStyleId } from "./render.js";

/**
 * Intersects two sets and returns a new set containing only the common elements
 * @param {*} setA A set of IDs as strings
 * @param {*} setB A set of IDs as strings
 * @returns A new set containing the intersection of setA and setB
 */
function intersectSets(setA, setB) {
  const result = new Set();
  for (const id of setA) {
    if (setB.has(id)) result.add(id);
  }
  return result;
}

/**
 * Converts an array of objects to a set of their IDs as strings
 * @param {*} array JSON array of objects containing IDs
 * @returns A set of IDs as strings extracted from the input array of objects
 */
function toIdSet(array) {
  return new Set(array.map((item) => item.id.toString()));
}

/**
 * Normalizes the search name by removing the extension badge if present and trimming whitespace
 * @param {*} name The search name to normalize
 * @returns The normalized search name without the extension badge and with trimmed whitespace
 */
function normalizeSearchName(name) {
  if (!name) return "";

  const badge = getTranslation("card.extension-badge");
  const lowerName = name.toLowerCase();
  const lowerBadge = badge.toLowerCase();

  if (lowerName.endsWith(lowerBadge)) {
    return name.slice(0, name.length - badge.length).trim();
  }

  return name.trim();
}

/**
 * Gets the search name from the input element, normalizes it, and returns it
 * @param {*} inputElement The input element containing the search name
 * @returns The normalized search name extracted from the input element
 */
export function getSearchName(inputElement) {
  const raw = inputElement ? inputElement.value.trim() : "";
  return normalizeSearchName(raw);
}

// words that only join search terms, e.g. "beklometasoni ja formoteroli"
const joinWords = new Set(["ja", "och", "and", "+", "&"]);

/**
 * Checks if an inhaler matches the search text. The whole text matching the name is enough.
 * Otherwise every word must be found in the name or in an active ingredient, so
 * "beklometasoni formoteroli" finds only the products that contain both and nothing else.
 * @param {*} item The inhaler object
 * @param {*} name The search text
 * @returns true if the inhaler matches
 */
function matchesSearch(item, name) {
  const search = name.toLowerCase();
  const itemName = item.name.toLowerCase();
  if (itemName.includes(search)) return true;

  const words = search
    .split(/[\s,;/]+/)
    .filter((word) => word && !joinWords.has(word));
  if (words.length === 0) return false;

  const ingredients = (item.active_ingredients || []).map((ai) =>
    (ai.name || "").toLowerCase(),
  );
  const allWordsFound = words.every(
    (word) =>
      itemName.includes(word) ||
      ingredients.some((ingredient) => ingredient.includes(word)),
  );
  if (!allWordsFound) return false;

  // with two or more ingredients searched, the product must have exactly those ingredients
  // (client's request), so "beklometasoni formoteroli" doesn't show products with a third one
  const ingredientWords = words.filter((word) =>
    ingredients.some((ingredient) => ingredient.includes(word)),
  );
  if (ingredientWords.length < 2) return true;
  return ingredients.every((ingredient) =>
    ingredientWords.some((word) => ingredient.includes(word)),
  );
}

/**
 * Filters inhalers by name or active ingredients
 * @param {*} data JSON data containing inhalers
 * @param {*} name The search text to filter by
 * @returns A set of IDs for inhalers matching the search
 */
export function getNameFilteredIds(data, name) {
  if (!name) return toIdSet(data);

  const idSet = new Set();
  for (const item of data) {
    if (matchesSearch(item, name)) {
      idSet.add(item.id.toString());
    }
  }
  return idSet;
}

/**
 * Gets the combined filtered IDs for inhalers based on filters and name
 * @param {*} data JSON data containing inhalers
 * @param {*} filters JSON object containing filter criteria
 * @param {*} name The search name to filter by
 * @returns A set of IDs for inhalers matching both the filters and the name
 */
export function getCombinedFilteredIds(data, filters, name) {
  const byFilter = getFilteredIds(data, filters);
  const byName = getNameFilteredIds(data, name);
  return intersectSets(byFilter, byName);
}

/**
 * Gets the display name for an inhaler based on whether it has an extension
 * @param {*} item The inhaler object
 * @returns The display name for the inhaler
 */
export function getSearchDisplayName(item) {
  const hasExtension = item.intake_styles.some(
    (style) => style.intake_style_id === extensionIntakeStyleId,
  );
  return hasExtension
    ? item.name + getTranslation("card.extension-badge")
    : item.name;
}

/**
 * Performs auto-complete search for inhalers based on name
 * @param {*} data JSON data containing inhalers
 * @param {*} name The search name to filter by
 * @param {*} max Maximum number of results to return (default is 5)
 * @returns An array of inhaler objects matching the name, limited to the specified maximum
 */
export function autoCompleteSearch(data, name, max = 5) {
  if (!name) return [];

  return data
    .filter((item) => item.name.toLowerCase().includes(name.toLowerCase()))
    .slice(0, max);
}

/**
 * Renders auto-complete results in the specified container
 * @param {*} resultBox The container element to render results in
 * @param {*} results The array of inhaler objects to display
 * @param {*} onSelect The function to call when an item is selected
 */
export function renderAutoCompleteResults(resultBox, results, onSelect) {
  if (!resultBox) return;

  // Clear previous results
  if (results.length === 0) {
    resultBox.replaceChildren();
    return;
  }

  const ul = document.createElement("ul");

  // Create a list item for each result
  results.forEach((item) => {
    const li = document.createElement("li");
    li.dataset.id = item.id;
    li.textContent = getSearchDisplayName(item);
    li.addEventListener("click", () => onSelect(item));
    ul.appendChild(li);
  });

  resultBox.replaceChildren(ul);
}

/**
 * Clears the auto-complete suggestions from the specified container
 * @param {*} resultBox The container element to clear suggestions from
 */
export function clearSuggestions(resultBox) {
  if (resultBox) resultBox.replaceChildren();
}
