(function (global) {

    'use strict';

    var fabric = global.fabric || (global.fabric = {}),
        extend = fabric.util.object.extend;

    /**
     * @class
     * @extends fabric.Image
     */
    fabric.ErasableText = fabric.util.createClass(fabric.PText, {
        type: 'ErasableText',
        isErasable : true,

        /**
         */
        initialize: function (text, options) {
            this.callSuper('initialize', text, options);
        },
    });


    /**
     * Creates fabric object from data.
     * Is async, so always use callback param.
     *
     * @param objData
     * @param {function} callback
     */
    fabric.ErasableText.fromObject = function (objData/*, callback*/) {
        return new fabric.ErasableText(objData.text, objData);
    };

    // important! set 'ErasableText.async'
    // It is already set for the prototype, but if do not set here - it WILL CRASH on image load from object;
    // idiotic stuff...
    // fabric.ErasableText.async = true;

    // make our object erasable via ErasableMixin.
    fabric.makeObjectErasable(fabric.ErasableText);

})(typeof exports !== 'undefined' ? exports : this);