(function (global) {

    'use strict';

    var fabric = global.fabric || (global.fabric = {}),
        extend = fabric.util.object.extend;

    fabric.ErasableObject = fabric.util.createClass(fabric.Object, {
        /**
         * Type of an object
         * @type String
         * @default
         */
        type: 'erasableObject',

        /**
         * Constructor
         * @param {Object} objData object
         * @return {fabric.ErasableObject}
         */
        initialize: function (objData) {
            objData = objData || {};

            // call super[fabric.Object].initialize()
            this.callSuper('initialize', objData);
        }
    });


    /**
     * Creates fabric object from data.
     *
     * @param objData
     * @param {function} callback
     * @return {fabric.ErasableObject} Instance of fabric.ErasableObject
     */
    fabric.ErasableObject.fromObject = function (objData) {
        return new fabric.ErasableObject(objData);
    };

    // make our object erasable via ErasableMixin.
    fabric.makeObjectErasable(fabric.ErasableObject);

})(typeof exports !== 'undefined' ? exports : this);