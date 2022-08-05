
import { SObject , Attribution} from "./DataUtil";
import { Vector2D, Color, Rect2D, Rotation2D,  } from "./Struct";
import { Graphics2D } from "./Graphics2D";
import { Object2D, StageInteractive, ContextTransf, ContextMouseEvent } from "./Object2D";

// Types
declare type MouseEventType =  "mousedown"|"mouseup"|"mousemove"|"mouseenter"|"mouseleave"|"wheel";
declare type InteractiveState = "idle"|"hover"|"pressed";
declare type JSDataType = "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function"
declare type CuttingFunctionType = "warp"|"mirror"|"clamp";

declare type HorizontalPosition = "left"|"centerH"|"right";
declare type VerticalPosition = "top"|"centerV"|"bottom";
declare type PivotSetting = [HorizontalPosition,VerticalPosition] | "center";

declare type AnimationType = "derive"|"toggle";

declare type TraverseCallBack = (this: SObject, key: string, propName: string) => any;
declare type GetAttemptCallBack = (propValue: any) => any;
declare type AccessAttemptCallBack = (attr: Attribution) => any;
declare type Getter = () => any;
declare type Setter = (v) => boolean;

declare type DataAssignType = "identical"|"clone"|"uninit";

declare type Rotationizable = Rotation2D | number | string;
declare type Vectorizable =  Vector2D | [number,number] | string | number;
declare type Rectizable =  Rect2D | Array<number> | string | number;
declare type Colorizable = Color | string | number | Array<number>;
declare type Graphizable = string | Graphics2D | Polygon;
declare type Numerizable = number | string;
declare type Transfizable = string | ContextTransfProperties | ContextTransf | Object2D;

declare type ParsedPath = [string,number[]][];
declare type Polygon = [number, number][];
declare type EclipseParam = [number, number, number, number, number, number, number, boolean];

declare type TickCallBack = (this: Object2D, ev: TickEvent) => any;
declare type TickEvent = TickEventProperty & TickCallBack;

declare type MouseEventInfo = MouseEvent | WheelEvent;
declare type MouseDispatchedEvent = (this: StageInteractive, event: ContextMouseEvent) => any;

declare const s = 0;
//Interface

declare interface Renderable {
    update(delta: number): void;
    render(ctx: CanvasRenderingContext2D): void
}

declare interface TickEventProperty {
    eventName?: string;
    repeat?: number;
    interval?: number;
    prog?: number;
}

declare interface ContextTransfProperties {
    trans?: Vectorizable;
    rot?: Rotationizable;
    scale?: Vectorizable;
}

declare interface MouseEventBehavior {
    name: string;
    mousedown?: MouseDispatchedEvent;
    mouseup?: MouseDispatchedEvent;
    mousemove?: MouseDispatchedEvent;
    mouseenter?: MouseDispatchedEvent;
    mouseleave?: MouseDispatchedEvent;
    mousewheel?: MouseDispatchedEvent;
}

declare interface Object2DProperties {
    name?: string;
    x?: Numerizable;
    y?: Numerizable;
    width?: Numerizable;
    height?: Numerizable;
    frame?: Rectizable;
    pos?: Vectorizable;
    scale?: Vectorizable;
    stret?: Vectorizable;
    rot?: Rotationizable;
    transf?: Transfizable;
    graphics?: Graphizable;
    fillColor?: Colorizable;
    borderColor?: Colorizable;
    emissiveColor?: Colorizable;

    emissive?: Numerizable;
    borderWidth?: Numerizable;
    visible?: boolean;
    tickEvents?: TickEvent[];
}

declare interface StageObjectSubProperties {
    mainBody?: boolean;
    innerTransf?: ContextTransf | string;
}

declare type StageObjectProperties = Object2DProperties & StageObjectSubProperties;

declare interface StageInteractiveSubProperties {
    draggable?: boolean;
}

declare type StageInteractiveProperties = StageInteractiveSubProperties & StageObjectProperties;




/**
//Components

/**
 * IntColorProperties
 * 
 * @typedef {Object} IntColorProperties
 * @property {Colorizable} [defalutColor="white"]
 * @property {Colorizable} [hoverColor="white"]
 * @property {Colorizable} [pressedColor="white"]
 * 
 */

/**
 * CanvasLabelProperties
 * 
 * @typedef {Object} CanvasLabelSubProperties
 * @property {string} [text="Label"]
 * @property {Colorizable} [fontColor="black"]
 * @property {number} [fontSize=1]
 * 
 * @typedef {Object2DProperties & CanvasLabelSubProperties} CanvasLabelProperties
 */

/**
 * CanvasInterativeComponentProperites
 * 
 * @typedef {Object} CanvasIntCompSubProperites
 * @property {string} [preset="Classic"]
 * 
 * @typedef {StageInteractiveProperties & CanvasIntCompSubProperites} CanvasIntCompProperites
 * 
 */

/**
 * CanvasButtonProperties
 * 
 * @typedef {Object} CanvasButtonSubProperties
 * @property {string} [caption="Button"]
 * @property {Colorizable} [foreColor="black"]
 * @property {number} [fontSize = 1]
 * 
 * @typedef {CanvasIntCompProperites & CanvasButtonSubProperties} CanvasButtonProperties
 */

/**
 * ButtonStyle
 * 
 * @typedef {Object} ButtonStyle
 * @property {IntColorizable} [fillColor="black|black|black"]
 * @property {IntColorizable} [foreColor="black|black|black"]
 * @property {IntColorizable} [borderColor="black|black|black"]
 * @property {Graphics2D | string} [graphics="sqaure"]
 * @property {number} [fontSize = 1]
 * @property {Vectorizable} [scale="1,1"]
 * @property {Vectorizable} [stret="1,1"]

 */

/**
 * 
 * CanvasContainerProperties
 * @typedef {Object} CanvasContainerSubProperties
 * @property {string} [title="Container"]
 * @property {Array<Object2D>} [components=[]]
 * @property {Vectorizable} [Grid=undefined]
 * 
 * @typedef {CanvasIntCompProperites & CanvasContainerSubProperties} CanvasContainerProperties
 * 
 * 
 */


//Stages
/**
 * 
 * StageProperties
 * 
 * @typedef {Object} StageProperties
 * @property {HTMLCanvasElement} canvas
 * @property {Colorizable} [backColor="black"]
 * 
 * 
 */
