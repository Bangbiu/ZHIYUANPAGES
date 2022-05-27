/*jshint esversion: 6 */
// @ts-check
import { Attribution } from "./DataUtil.js";
import * as TU from "./TypeUtil.js";
import * as DU from "./DataUtil.js";

/**
 * @typedef {TU.TickCallBack} TickCallBack
 */


export class Animation {

    /**
     * @param {Attribution} target
     * @param {Array<TU.Referrable>} deltaArr 
     * @returns {TickCallBack}
     */
    static derive = function DeriveAnimation(target,deltaArr) {
        if (target == undefined) return undefined;
        let deltaDpts = Attribution.attributize(deltaArr);

        return function() {
            target.add(deltaDpts[0].get());
            //target.set(target.get() + deltaDpts[0].get());
            for (let i = deltaArr.length-1; i > 0; i--) {
                deltaDpts[i-1].add(deltaDpts[i].get());
            }
        }
    }

    /**
     * @param {Attribution} target
     * @param {Array<TU.Referrable>} seq 
     * @returns {TickCallBack}
     */
    static toggle = function ToggleAnimation(target,seq) {
        if (target == undefined) return undefined;
        let index = 0;
        return function() {
            target.set(seq[index]);
            index = (index+1) % seq.length;
        }
    }

    /**
     * @param {Attribution} target
     * @param {Array<TU.Referrable>} stops 
     * @returns {TickCallBack}
     */
    static transition = function TransitionAnimation(target,stops) {
        if (target == undefined) return undefined;
        
    }

}