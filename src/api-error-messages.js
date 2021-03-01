/**
 * Immutable object for errors.
 */
export default class APIErrorMessages {
    /**
     * Constructor.
     *
     * @param {object} obj
     */
    constructor(obj) {
        Object.defineProperty(this, 'toJSON', {
            /**
             * Get the default object.
             *
             * @returns {object}
             */
            get() {
                return () => Object.freeze(obj);
            },
        });

        Object.keys(obj).forEach(key => {
            Object.defineProperty(this, key, {
                /**
                 * Get the value of this error.
                 *
                 * @returns {any}
                 */
                get() {
                    return this.toJSON()[key];
                },

                enumerable: true,
            });
        });

        Object.freeze(this);
    }
}
