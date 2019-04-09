export default class ResponseParser {
    constructor({
        fallbackErrorMessage = 'Something went wrong, sorry about that',
    } = {}) {
        this.fallbackErrorMessage = fallbackErrorMessage;
    }

    /**
     * Get the response status range, e.g. returns 400 for 404s.
     *
     * @param {Object} response
     *
     * @returns {Number}
     */
    range({ status }) {
        return `${ Math.floor(status / 100) }XX`;
    }

    /**
     * Get the response function for a status
     *
     * @param {String|Number} status
     *
     * @returns {String}
     */
    getErrorsFunctionName(status) {
        return `getErrorsFor${status}`
    }

    /**
     * Get errors for 2XX statuses
     *
     * @param {Object} response
     *
     * @returns {Object}
     */
    getErrorsFor2XX(response) {
        // None!

        return {};
    }

    /**
     * Get errors for 5XX statuses
     *
     * @param {Object} response
     *
     * @returns {Object}
     */
    getErrorsFor5XX(response) {
        return this.generateFallbackError();
    }

    /**
     * Get errors for 4XX statuses
     *
     * @param {Object} response
     *
     * @returns {Object}
     */
    getErrorsFor4XX(response) {
        const { data } = response;

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
     * @param {Object} response
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
        const parseExactFuncName = this.getErrorsFunctionName(response.status);

        if (this[parseExactFuncName]) {
            return this[parseExactFuncName];
        }

        const range = this.range(response);
        const parseFuncName = this.getErrorsFunctionName(range);

        if (this[parseFuncName]) {
            return this[parseFuncName];
        }

        return this.generateFallbackError();
    }
}
