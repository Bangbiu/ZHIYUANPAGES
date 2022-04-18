import { Object2D } from "./Object2D.js"
export {}

/**
 * @typedef {("string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function")} JSDataType
 * @typedef {(key: string, value: any) => any} TraverseCallBack
 * 
 * @typedef {object} Attribution
 * @property {any} owner
 * @property {any} name
 * 
 * @typedef {object} Reference
 * @property {any} value
 */

/**
 * 
 * TickEvent
 * 
 * 
 * @typedef {object} TickEventProperty
 * @property {string} [eventName="unknow"]
 * @property {number} [repeat=0]
 * @property {number} [interval=100]
 * @property {number} [prog=0]
 * 
 * @typedef {(this: Object2D, ev: TickEvent) => any} TickCallBack
 * 
 * @typedef {TickCallBack & TickEventProperty} TickEvent
 * 
 * Animation
 * 
 * @typedef {("derive"|"toggle")} AnimationType
 * 
 * Object2DProperties
 * 
 * @typedef {object} Object2DProperties
 * @property {string} [name=undefined]
 * @property {number} [x=0]
 * @property {number} [y=0]
 * @property {Vector2D} [pos="0,0"] (alternative)
 * @property {Vector2D | [number,number] | string} [scale="1,1"]
 * @property {Vector2D | [number,number] | string} [stret="1,1"]
 * @property {Rotation2D | number} [rot=0]
 * @property {ContextTransf} [transf=undefined] (alternative)
 * @property {Graphics2D | string} [graphics="sqaure"]
 * 
 * @property {Color | string} [fillColor="white"]
 * @property {Color | string} [borderColor="black"]
 * @property {Color | string} [emissiveColor=undefined]
 * 
 * @property {number} [emissive=0]
 * @property {number} [borderWidth=0]
 * @property {boolean} [visible=true]
 * 
 * @property {Array<TickEvent>} [tickEvents=[]]
 * 
 * ContextTransformationProperties
 * 
 * @typedef {object} ContextTransformationProperties
 * @property {Vector2D} [trans="0,0"]
 * @property {Rotation2D} [rot=0]
 * @property {Vector2D} [scale="0,0"]
 * 
 * StageObjectProperties
 * 
 * @typedef {Object} StageObjectChildProperties
 * @property {boolean} [mainBody=true]
 * @property {ContextTransf | string} [innerTransf=DEF_TRANS]
 * 
 * @typedef {Object2DProperties & StageObjectChildProperties} StageObjectProperties
 * 
 * 
 */