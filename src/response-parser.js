/**
 * Get the range for a response status returns 400 for 404s.
 *
 * @param {Number} status
 *
 * @returns {Number}
 */
export const getStatusRange = status => `${ Math.floor(status / 100) }XX`;

/**
 * Get the response function for a status
 *
 * @param {String|Number} status
 *
 * @returns {String}
 */
export const getErrorsFunctionName = status => `getErrorsFor${ status }`;

/**
 * Parse responses to extract usable and meaningful error messages
 */
export default class ResponseParser {
    /**
     * Instantiate the class
     *
     * @param {Object} config
     * @param {String} [config.fallbackErrorMessage]
     */
    constructor({
        fallbackErrorMessage = 'Something went wrong, sorry about that',
    } = {}) {
        this.fallbackErrorMessage = fallbackErrorMessage;
    }

    /**
     * Get errors for 2XX statuses
     *
     * @returns {Object}
     */
    getErrorsFor2XX() {
        // None!

        return {};
    }

    /**
     * Get errors for 5XX statuses
     *
     * @returns {Object}
     */
    getErrorsFor5XX() {
        return this.generateFallbackError();
    }

    /**
     * Get errors for 4XX statuses
     *
     * @param {Object} data
     *
     * @returns {Object}
     */
    getErrorsFor4XX(data) {
        if (data.errors) {
            if (Array.isArray(data.errors)) {
                return this.generateGenericError(
                    data.errors.reduce((a, b) => [...a, ...b]).join(', ')
                );
            }

            const errors = {};

            Object.keys(data.errors).forEach(field => {
                errors[field] = Array.isArray(data.errors[field])
                    ? data.errors[field].join(', ')
                    : data.errors[field];
            });

            return errors;
        }

        if (data.message) {
            return this.generateGenericError(data.message);
        }

        return this.generateFallbackError();
    }

    /**
     * Generate a generic error message
     *
     * @param {String} message
     *
     * @returns {Object}
     */
    generateGenericError(message) {
        return {
            [null]: message,
        };
    }

    /**
     * Generate a fallback error message
     *
     * @param {Object} response
     *
     * @returns {Object}
     */
    generateFallbackError() {
        return this.generateGenericError(this.fallbackErrorMessage);
    }

    /**
     * Get errors for a response
     *
     * @param {Object} response
     *
     * @returns {Object}
     */
    getErrors(response) {
        const parseExactFuncName = getErrorsFunctionName(response.status);

        if (this[parseExactFuncName]) {
            return this[parseExactFuncName](response.data);
        }

        const range = getStatusRange(response.status);
        const parseFuncName = getErrorsFunctionName(range);

        if (this[parseFuncName]) {
            return this[parseFuncName](response.data);
        }

        return this.generateFallbackError();
    }
}
