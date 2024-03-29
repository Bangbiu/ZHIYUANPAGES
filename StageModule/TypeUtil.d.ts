
import { SObject , Attribution, StateMap} from "./DataUtil";
import { Vector2D, Color, Rect2D, Rotation2D,  } from "./Struct";
import { Graphics2D, PATHCMD } from "./Graphics2D";
import { Object2D, StageInteractive, ContextTransf, ContextMouseEvent, PassiveListeners, InteractiveListeners, StageObject} from "./Object2D";
import COLORS from './Presets/Colors.json' assert {type: 'json'}

// Types
declare type PassiveEventType = "tick" | "resize";
declare type MouseEventType =  "mousedown"|"mouseup"|"mousemove"|"mouseenter"|"mouseleave"|"wheel";
declare type KeyBoardEventType = "keydown"|"keypress"|"keyup";

declare type StageIntEventType = PassiveEventType | MouseEventType | KeyBoardEventType;

declare type InteractiveState = "idle"|"hover"|"pressed";
declare type JSDataType = "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function"
declare type ClipFunction = (value: number, ...argArray: any[]) => number;

declare type HorizontalPosition = "left"|"centerH"|"right";
declare type VerticalPosition = "top"|"centerV"|"bottom";
declare type PivotSetting = [HorizontalPosition,VerticalPosition] | "center";

declare type AnimationType = "derive"|"toggle";

declare type TraverseCallBack = (this: SObject, key: string, propName: string) => any;
declare type GetAttemptCallBack = (propValue: any) => any;
declare type AccessAttemptCallBack = (attr: Attribution) => any;
declare type Getter = () => any;
declare type Setter = (v) => boolean;

declare type ColorText = keyof typeof COLORS;
declare type ColorTuple = [number, number, number, number];

declare type DataAssignType = "identical"|"clone"|"uninit";

declare type Rotationizable = Rotation2D | number | string;
declare type Vectorizable =  Vector2D | [number,number] | string | number;
declare type Rectizable =  Rect2D | Array<number> | string | number;
declare type Colorizable = Color | string | number | Array<number>;
declare type Graphizable = string | Graphics2D | Polygon;
declare type Numerizable = number | string;
declare type Transfizable = string | ContextTransfProperties | ContextTransf | Object2D;

declare type ResizeCallBack<T> = (this: T, parent: Vector2D, ev: UIEvent) => any;

declare type TickEvent<T> = TickCallBack<T> & TickEventProperties;
declare type TickCallBack<T> = (this: T, ev: TickEvent<T>) => any;

declare type MouseEventInfo = MouseEvent | WheelEvent;
declare type MouseCallBack<T extends StageInteractive> = (this: T, ev: ContextMouseEvent) => any;

declare type KBCallBack<T extends StageInteractive> = (this: T, ev: KeyboardEvent) => any;

declare type Polygon = [number, number][];
declare type ParsedPath = PathCommand[];

//Interface

declare interface Renderable {
    update(...params: any[]): void;
    render(ctx: CanvasRenderingContext2D): void
}

declare interface Reproducable {
    clone(): Reproducable;
    copy(other: Reproducable): Reproducable;
}

declare interface EventHandler {
    target: Object2D
    callback: Function
}

declare interface TickEventProperties {
    eventName?: string;
    repeat?: number;
    interval?: number;
    prog?: number;
    enable?: boolean;
}

declare interface ContextTransfProperties {
    trans?: Vectorizable;
    rot?: Rotationizable;
    scale?: Vectorizable;
}

declare interface MouseEventBehavior<T extends StageInteractive> {
    bhvname: string;
    mousedown?: MouseCallBack<T>;
    mouseup?: MouseCallBack<T>;
    mousemove?: MouseCallBack<T>;
    mouseenter?: MouseCallBack<T>;
    mouseleave?: MouseCallBack<T>;
    wheel?: MouseCallBack<T>;
}

declare interface Polymorphistic {
    states: StateMap<Object> | undefined
    addState(stateOrKey: Object | Numerizable, state?: Object): void;
}

declare interface PathCommand {
    type: PATHCMD;
    args: number[];
}

declare interface RenderableProperties {
    graphics?: Graphizable;
    fillColor?: Colorizable;
    borderColor?: Colorizable;
    emissiveColor?: Colorizable;
    emissive?: Numerizable;
    borderWidth?: Numerizable;
    visible?: boolean;
}

declare interface Object2DSubProperties {
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

    listeners?: PassiveListeners<Object2D>;
    states?: Object;

    debug?: boolean;

    [props: string]: any;
}

declare type Object2DProperties = RenderableProperties & Object2DSubProperties;

declare interface StageObjectSubProperties {
    mainBody?: boolean;
    clipWithin?: boolean;
    innerTransf?: ContextTransf | string;
    listeners?: PassiveListeners<StageObjectSubProperties>;
    states?: Object;
}

declare type StageObjectProperties = Object2DProperties & StageObjectSubProperties;

declare interface StageInteractiveSubProperties {
    draggable?: boolean;
    listeners?: InteractiveListeners<StageInteractive>;
    states?: Object
}

declare type StageInteractiveProperties = StageObjectProperties & StageInteractiveSubProperties;

declare interface CanvasLabelSubProperties {
    text?: string;
    fontColor?: Colorizable;
    fontSize?: number;
}

declare type CanvasLabelProperties = Object2DProperties & CanvasLabelSubProperties;

declare interface CanvasIntCompSubProperites {
    preset?: string;
}

declare type CanvasIntCompProperites = StageInteractiveProperties & CanvasIntCompSubProperites;

declare interface CanvasButtonSubProperties {
    caption?: string;
    avatar?: Graphizable;
    foreColor?: Colorizable;
    fontSize?: number;
}

declare type CanvasButtonProperties = CanvasIntCompProperites & CanvasButtonSubProperties;

declare interface CanvasContainerSubProperties {
    title?: string;
    grid?: Vectorizable;
}

declare type CanvasContainerProperties = CanvasIntCompProperites & CanvasContainerSubProperties;

declare interface StageSubProperties {
    canvas: HTMLCanvasElement
    backColor?: Colorizable
}

declare type StageProperties = CanvasContainerProperties & StageSubProperties;

/**
//Components
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
