/**
 * Sorts an object by its keys
 * @param {any} obj - The object to sort
 * @returns {any} - The sorted object
 */
export function sortObjectByKey(obj) {
    if (typeof obj !== "object" || obj === null) {
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map(sortObjectByKey);
    }
    const sortedKeys = Object.keys(obj).sort();
    const result = {};
    sortedKeys.forEach((key) => {
        result[key] = sortObjectByKey(obj[key]);
    });
    return result;
}

/**
 * Sorts an object by its keys and returns a JSON string
 * @param {any} obj - The object to sort
 * @returns {string} - The sorted JSON string
 */
export function sortedJsonByKeyStringify(obj) {
    return JSON.stringify(sortObjectByKey(obj));
}
