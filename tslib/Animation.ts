
/*jshint esversion: ES2020 */
// @ts-check
import { Attribution } from "./DataUtil.js";
import { TickCallBack } from "./TypeUtil.js";

export class Animation {
    static derive: (target: Attribution, deltaArr: any[]) => TickCallBack;
    static toggle: (target: Attribution, seq: any[]) => TickCallBack;
    static transition: (target: Attribution, stops: any[]) => TickCallBack;
}

Animation.derive = function DeriveAnimation(target: Attribution, deltaArr: any[]): TickCallBack {
    if (target == undefined)
        return undefined;
    let deltaDpts = Attribution.attributize(deltaArr);
    return function () {
        target.add(deltaDpts[0].get());
        //target.set(target.get() + deltaDpts[0].get());
        for (let i = deltaArr.length - 1; i > 0; i--) {
            deltaDpts[i - 1].add(deltaDpts[i].get());
        }
    };
};

Animation.toggle = function ToggleAnimation(target: Attribution, seq: any[]): TickCallBack {
    if (target == undefined)
        return undefined;
    let index = 0;
    return function () {
        target.set(seq[index]);
        index = (index + 1) % seq.length;
    };
};

Animation.transition = function TransitionAnimation(target: Attribution, stops: any[]): TickCallBack {
    if (target == undefined)
        return undefined;
};
