/*jshint esversion: ES2020 */
// @ts-check

import { Graphics2D } from "../tslib/Graphics2D.js";
import { Color, Vector2D } from "../tslib/Struct.js";
import { Animation } from "../tslib/Animation.js";
import { ContextTransf, Object2D } from "../tslib/Object2D.js";
/**
 * 
 * @param {CanvasRenderingContext2D} ctx 
 */

export function run_Graphics2D(ctx) {
    
    let g = new Graphics2D([[100,100],[200,200],[100,200]]);
    g.log();
    ctx.fillStyle = new Color(255,0,0).value;
    g.render(ctx,false,true);
    
}

export function run_ContextTransf() {
    
    
    let ctxtf = new ContextTransf("1,1|2|3,3");
    
    ctxtf.print();
    console.log(ctxtf.clone().trans == ctxtf.trans);

    ctxtf.add(ctxtf).print();
    //ctxtf.traverse(function(k,v){console.log(v);});
}

/**
 * 
 * @param {CanvasRenderingContext2D} ctx 
 */
export function run_Object2D(ctx) {

    let obj1 = new Object2D({
        pos: [100,100], 
        fillColor: "black", 
        borderColor: "red", 
        borderWidth: 1
    });
    let obj2 = obj1.clone();

    console.log(obj1.pos == obj1.transf.trans);
    console.log(obj2.pos == obj1.pos);

    //obj2.moveTo(200,200);
    obj2.updateValues({transf: "200,200|200|2,1"});

    obj1.render(ctx);
    obj1.log();

    obj2.render(ctx);
    obj2.log();



}