/*jshint esversion: ES2020 */
// @ts-check
import { Attribution } from "./DataUtil.js";
export class Animation {
}
Animation.derive = function DeriveAnimation(target, deltaArr) {
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
Animation.toggle = function ToggleAnimation(target, seq) {
    if (target == undefined)
        return undefined;
    let index = 0;
    return function () {
        target.set(seq[index]);
        index = (index + 1) % seq.length;
    };
};
Animation.transition = function TransitionAnimation(target, stops) {
    if (target == undefined)
        return undefined;
};
