import { CanvasButton } from "./CanvasUIComponents.js";

/**
 * @typedef {TU.CanvasLabelProperties} CanvasLabelProperties
 * @typedef {TU.CanvasButtonProperties} CanvasButtonProperties
 * @typedef {TU.CanvasContainerProperties} CanvasContainerProperties
 */

export {
    PRESETS
}

/**
 * 
 * Button Presets
 * @typedef {Object} ButtonPresets
 * @property {CanvasButtonProperties} Classic
 * @property {CanvasButtonProperties} Warn
 * 
 */

/**
 * 
 * Component Presets
 * @typedef {Object} ComponentPresets
 * @property {ButtonPresets} Button
 * @property {Array<CanvasContainer>} Container
 * 
 */

/**
 * @type {ComponentPresets}
 */
const PRESETS = {
    Button: {
        Classic: {
            fillColor: "#1d89ff|white|white",
            foreColor: "white|#1d89ff|#1d89ff",
            borderColor:"transparent|white|white",
            borderWidth: 3,
        },
        Warn: {
            fillColor: "#feab3a|#feab3a|#feab3a",
            foreColor: "white|white|white",
            borderColor:"transparent|white|white",
            borderWidth: 3,
        }
    }
}