/*jshint esversion: 6 */
// @ts-check
import * as DU from "./DataUtil.js";
import * as TU from "./TypeUtil.js";
import { SObject } from "./DataUtil.js";
import { StageInteractive } from "./Object2D";

/**
 * Data Type
 * @typedef {TU.DataAssignType} DataAssignType
 * 
 * Class Instance Property Type
 * @typedef {TU.StageProperties} StageProperties
 * 
 */

class Stage extends StageInteractive {

    /**
     * 
     * @param {StageProperties} parameters 
     * @param {DataAssignType} assign
     */
    constructor( parameters = {}, assign = SObject.DATA_COPY) {
        super({},SObject.DATA_UNINIT);
        this.initialize(parameters,Stage.DEF_PROP);
    }

    static DEF_PROP = SObject.insertValues(
        {
            fillColor: "black",
            graphics: "raster"
        },
    StageInteractive.DEF_PROP)
}

