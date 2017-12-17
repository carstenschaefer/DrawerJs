(function(global) {

    'use strict';

    var fabric = global.fabric || (global.fabric = {}),
        extend = fabric.util.object.extend;

    fabric.ErasablePath = fabric.util.createClass(fabric.Path, {

        type: 'ErasablePath',

        objectCaching : false,
        evented : false,
        selectable : false,


        initialize: function(pathData, options) {
            options = options || {};
            this.callSuper('initialize', pathData, options);
        },


        _render: function(ctx) {
            this.callSuper('_render', ctx);
        },


        toObject: function(propertiesToInclude) {
            return this.callSuper('toObject', propertiesToInclude);
        }

    });

    /**
     * Creates object from  serialized data
     * @param  {Object} object
     * @return {ErasablePath}
     */
    fabric.ErasablePath.fromObject = function(data) {
        // @todo: maybe use code from fabric.Path.fromObject
        return new fabric.ErasablePath(data.path, data);
    };


    fabric.ErasablePath.async = false;

    // make our object erasable via ErasableMixin.
    fabric.makeObjectErasable(fabric.ErasablePath);

})(typeof exports !== 'undefined' ? exports : this);
