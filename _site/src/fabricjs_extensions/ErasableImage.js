(function (global) {

    'use strict';

    var fabric = global.fabric || (global.fabric = {}),
        extend = fabric.util.object.extend;

    /**
     * @class
     * @extends fabric.Image
     */
    fabric.ErasableImage = fabric.util.createClass(fabric.Image, {
        type: 'ErasableImage',
        async: true,

        /**
         * List of options to show when object is selected
         * @type {String[]}
         */
        objectOptionsList : ['opacity', 'border'],

        /**
         * Initializes ErasableImage with fabric.Image
         *
         * @param {fabric.Image} fabricImage
         * @param options
         */
        initialize: function (fabricImage, options) {
            var _this = this;
            options = options || {};

            // set width and height
            this.width = options.width || 10;
            this.height = options.height || 10;

            this.callSuper('initialize', fabricImage, options);
        },

        _render: function (ctx) {
            this.callSuper('_render', ctx);
        },

        _set: function (key, value) {
            this.callSuper('_set', key, value);
        },

        toObject: function (propertiesToInclude) {
            return extend(this.callSuper('toObject', propertiesToInclude), {
                width: this.width,
                height: this.height
            });
        }

    });


    /**
     * Creates fabric object from data.
     * Is async, so always use callback param.
     *
     * @param objData
     * @param {function} callback
     */
    fabric.ErasableImage.fromObject = function (objData, callback) {
        fabric.util.loadImage(objData.src, function(createdImage) {
            var erasableImage = new fabric.ErasableImage(createdImage, objData);
            // call callback with instance of our erasableImage
            if (callback)
                callback(erasableImage);
        });
    };

    // important! set 'ErasableImage.async'
    // It is already set for the prototype, but if do not set here - it WILL CRASH on image load from object;
    // idiotic stuff...
    fabric.ErasableImage.async = true;

    // make our object erasable via ErasableMixin.
    fabric.makeObjectErasable(fabric.ErasableImage);

})(typeof exports !== 'undefined' ? exports : this);