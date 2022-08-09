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
     * @param {Test} parameters 
     */
    constructor( parameters ) {
        this.setValue(parameters)
    }
    /**
     * 
     * @param {TestProperties} parameters 
     */
    setValue (parameters) {
        for (const key in this) {
            if (key in parameters) {
                this[key] = parameters[key];
            }
        }
        console.log(this);
    }
    
}