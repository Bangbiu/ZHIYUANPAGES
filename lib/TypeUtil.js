/*jshint esversion: 6 */
// @ts-check
import { Object2D, StageInteractive, ContextMouseEvent} from "./Object2D.js";
import { Vector2D } from "./Vector2D.js";
import { Rotation2D } from "./Rotation2D.js";
import { Color, ColorStates } from "./ColorLib.js";
import { ContextTransf } from "./Object2D.js";
import { Graphics2D } from "./Graphics2D.js";
import * as DU from "./DataUtil.js";
export {}

/**
 * @typedef {("mousedown"|"mouseup"|"mousemove"|"mouseenter"|"mouseleave"|"wheel")} MouseEventType
 * @typedef {("defaultColor"|"hoverColor"|"pressedColor")} InteractiveColorType
 * @typedef {(this: StageInteractive,event: ContextMouseEvent) => any} MouseDispatchedEvent
 * 
 * @typedef {("string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function")} JSDataType
 * @typedef {("warp"|"mirror"|"clamp")} CuttingFunctionType
 * 
 * @typedef {(this: DU.SObject,key: string, propName: string) => any} TraverseCallBack
 * @typedef {(propValue: any) => any} GetAttemptCallBack
 * @typedef {(attr: DU.Attribution) => any} AccessAttemptCallBack
 * 
 * 
 * @typedef { ("identical"|"copy"|"clone") } DataAssignType
 * @typedef { number | string | boolean | DU.Attribution } Referrable
 * @typedef { Vector2D | [number,number] | string } Vectorizable
 * @typedef { Color | string | [number,number,number,number] } Colorizable
 * @typedef { [Colorizable,Colorizable,Colorizable] } IntColorizable
 * 
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
 * @property {Vectorizable} [pos="0,0"] (alternative)
 * @property {Vectorizable} [scale="1,1"]
 * @property {Vectorizable} [stret="1,1"]
 * @property {Rotation2D | number} [rot=0]
 * @property {ContextTransf} [transf=undefined] (alternative)
 * @property {Graphics2D | string} [graphics="sqaure"]
 * 
 * @property {Colorizable} [fillColor="white"]
 * @property {Colorizable} [borderColor="black"]
 * @property {Colorizable} [emissiveColor=undefined]
 * 
 * @property {number} [emissive=0]
 * @property {number} [borderWidth=0]
 * @property {boolean} [visible=true]
 * 
 * @property {Array<TickEvent>} [tickEvents=[]]
 * 
 * @property {boolean} [copydef = true]
 * @property {boolean} [uninitialized = false]
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
 * @typedef {Object} StageObjectSubProperties
 * @property {boolean} [mainBody=true]
 * @property {ContextTransf | string} [innerTransf=DEF_TRANS]
 * 
 * @typedef {Object2DProperties & StageObjectSubProperties} StageObjectProperties
 * 
 * Components
 * 
 * CanvasLabelProperties
 * 
 * @typedef {Object} CanvasLabelSubProperties
 * @property {string} text
 * 
 * @typedef {StageObjectProperties & CanvasLabelSubProperties} CanvasLabelProperties
 * 
 * CanvasButtonProperties
 * 
 * @typedef {Object} CanvasButtonSubProperties
 * @property {string} [caption="Button"]
 * @property {Colorizable} [foreColor="black"]
 * 
 * @typedef {StageObjectProperties & CanvasButtonSubProperties} CanvasButtonProperties
 */