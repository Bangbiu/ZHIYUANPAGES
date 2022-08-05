/*jshint esversion: ES2020 */
// @ts-check
import { SObject } from "../tslib/DataUtil.js";

import { Color, Rect2D, Rotation2D, Vector2D } from "../tslib/Struct.js";
import { Graphics2D } from "../tslib/Graphics2D.js";

export function run_SObject() {
    let testObj1 = new SObject();
    let testObj2 = new SObject({val: 32331});

    testObj1.setValues({embeded_clone: testObj2});
    testObj1.setValues({embeded_iden: testObj2}, "identical");

    testObj1.tryGet("embeded_clone",(v)=>(console.log("is identi: " + (v == testObj2))));
    testObj1.tryGet("embeded_iden",(v)=>(console.log("is identi: " + (v == testObj2))));

    testObj1.tryGet("embeded_clone.value",(v)=>(console.log("cloned_value: " + v)));

    testObj1.trySet("embeded_clone.value", 123123);
    testObj1.tryGet("embeded_clone.value",(v)=>(console.log("set_value: " + v)));


    console.log("Traversing...");
    testObj1.traverse(function(k,v){console.log(v + "," + this[k])});

    console.log("Traversing Object...");
    SObject.traverse({val: 123, emb: {val: testObj1}}, (k,n)=>(console.log(n)), "", ["boolean","number","object"]);

    console.log(SObject.equals(testObj1.clone(),testObj2));
}

export function run_Rotation() {
    
    let rot1 = new Rotation2D(9);
    const degreeGet = rot1.getter("deg");
    const radSet = rot1.setter("rad");
    const print = rot1.printer("rad");

    console.log(degreeGet());
    rot1.negate();
    print();
    rot1.rotate90();
    print();
    radSet(6.1);
    print();
    rot1.add(new Rotation2D(1.1));
    print();
    rot1.add(-1.1);
    print();
    rot1.sub(-1);
    print();
}

export function run_Vector2D() {
    let vec1 = new Vector2D();
    
    vec1.add([1,1]).print();
    vec1.moveBy(-3,3).print();
    vec1.to(new Vector2D(1,1)).print();
    vec1.moveTo(3,4).print();
    vec1.print("distTo", new Vector2D(0,0));
    vec1.normalize().print();
    vec1.scaleXY(2,2).print();
    vec1.clone().print();
    vec1.print("equals", new Vector2D(1.2,1.6));
    vec1.traverse(function(key){this.print(key)});
}

export function run_Rect2D() {
    let rect1 = new Rect2D();
    rect1.print("toString");
    rect1.print("equals",[0,0,1,1]);
    rect1.moveBy(2,2);
    rect1.print("center");
    rect1.set([0,0,2,2]);
    rect1.print("centerH");
}

export function run_Color() {
    let color1 = new Color();
    color1.print("value");
    color1.set(255,111,255,255).print("value");
    for (let i = -10; i < 300; i+=100) {
        color1.set(i).print("value");
    }
}

export function run_Resolve() {
    new Rotation2D(new Rotation2D(29)).print();

    new Vector2D(4,5).print();
    new Vector2D("4,5").print();
    new Vector2D([4,5]).print();

    new Rect2D(3,0,2,2).print();
    new Rect2D("3,0,2,2").print();
    new Rect2D([3,0,2,2]).print();
    
    new Color("#ffffffff").print();
    new Color(255,255,255).print();

}