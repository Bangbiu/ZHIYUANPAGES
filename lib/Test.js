/**
 * @typedef TestProperties
 * @type {object}
 * @property {number} [x=22]
 * @property {number} [y=3]
 * @property {number} [z=4]
 * @property {number} [size=1]
 */


export class Test {
    x;y;z;size;
    /**
     * 
     * @param {TestProperties} parameters 
     */
    constructor( parameters ) {
        for (let key in parameters) {
            if (key in this) {
                this[key] = parameters[key];
            }
        }
        console.log(this);
    }
}