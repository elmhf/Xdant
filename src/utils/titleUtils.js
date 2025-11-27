/**
 * Utility function to temporarily change the page title
 * @param {string} newTitle - The new title to display temporarily
 * @param {number} duration - Duration in milliseconds (default: 3000ms = 3 seconds)
 * @returns {void}
 */
let titleTimeout = null;
let originalTitle = null;

export const changeTitle = (newTitle, duration = 3000) => {
    // Clear any existing timeout to prevent conflicts
    console.log("titleTimeout", titleTimeout);
    if (titleTimeout) {
        clearTimeout(titleTimeout);
        titleTimeout = null;
    }

    // Save the original title if not already saved
    if (originalTitle === null) {
        originalTitle = document.title;
    }

    // Change to the new title
    document.title = newTitle;

    // Set a timeout to restore the original title
    titleTimeout = setTimeout(() => {
        document.title = originalTitle;
        titleTimeout = null;
        originalTitle = null;
    }, duration);
};

/**
 * Restore the original title immediately
 * @returns {void}
 */
export const restoreTitle = () => {
    if (titleTimeout) {
        clearTimeout(titleTimeout);
        titleTimeout = null;
    }

    if (originalTitle !== null) {
        document.title = originalTitle;
        originalTitle = null;
    }
};
