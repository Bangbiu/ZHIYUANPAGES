import * as TU from "./TypeUtil.js";
import * as DU from "./DataUtil.js";

/**
 * @typedef {TU.Attribution} Attribution
 * @typedef {TU.Reference} Reference
 * @typedef {TU.TickFunction} TickFunction
 */


export class Animation {

    /**
     * @param {PropertyDescriptor} target
     * @param {Array<number|Attribution|Reference|PropertyDescriptor>} deltaArr 
     * @returns {TickFunction}
     */
    static derive = function DeriveAnimation(target,deltaArr) {
        if (target == undefined) return undefined;
        let deltaDpts = DU.getDescriptors(deltaArr);

        return function() {
            target.set(target.get() + deltaDpts[0].get());
            for (let i = deltaArr.length-1; i > 0; i--) {
                deltaDpts[i-1].set(deltaDpts[i-1].get() + deltaDpts[i].get());
            }
        }
    }

    /**
     * @param {PropertyDescriptor} target
     * @param {Array} seq 
     * @returns {TickFunction}
     */
    static toggle = function ToggleAnimation(target,seq) {
        if (target == undefined) return undefined;
        let index = 0;
        return function() {
            target.set(seq[index]);
            index = (index+1) % seq.length;
        }
    }

    

}