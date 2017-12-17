(function(global) {
    'use strict';

    var fabric = global.fabric || (global.fabric = {});

    fabric.ErasablePencilBrush = fabric.util.createClass(fabric.PencilBrush, {

        type: 'ErasablePencilBrush',

        /**
         * List of tool options to show when object is selected
         * @type {String[]}
         */
        objectOptionsList : ['color', 'opacity', 'brush'],


      /**
       * Overriding fabric.PencilBrush.onMouseMove
       * Method code is exactly copy of fabric.PencilBrush.onMouseMove,
       * only change is trigger events
       *
       * @param {Object} pointer - object with "x" and "y" values
       * @see {fabric.PencilBrush.onMouseMove}
       */
      onMouseMove: function(pointer) {
        this._captureDrawingPath(pointer);
        // redraw curve
        // clear top canvas

        this.canvas.clearContext(this.canvas.contextTop);
        // this.canvas.fire('pencil:move:before');
        this._render();
        // this.canvas.fire('pencil:move:after');
        this.canvas.renderAll();
      },

      /**
       * Overriding fabric.PencilBrush._render
       * Method code is exactly copy of fabric.PencilBrush._render,
       * only change is trigger events
       *
       * @see {fabric.PencilBrush._render}
       * @private
       */
      _render: function () {
        this.canvas.fire('pencil:move:before');
        this.callSuper('_render');
        this.canvas.fire('pencil:move:after');
      },

        initialize: function(canvas, options) {
            options = options || {};
            // parent c-tor has no options argument, so adding them here
            this.options = options;
            // call parent c-tor
            this.callSuper('initialize', canvas);
        },


        /**
         * Overriding fabric.PencilBrush.createPath
         * Method code is exactly copy of fabric.PencilBrush.createPath,
         * only change is creating fabric.ErasablePath instead of fabric.Path
         *
         * Creates fabric.ErasablePath object to add on canvas
         * @param {String} pathData Path data
         * @return {fabric.Path} Path to add on canvas
         * @see {fabric.PencilBrush.createPath}
         */
        createPath: function(pathData) {
            var path = new fabric.ErasablePath(pathData, {
                fill: null,
                stroke: this.color,
                opacity: this.opacity,
                strokeWidth: this.width,
                strokeLineCap: this.strokeLineCap,
                strokeLineJoin: this.strokeLineJoin,
                strokeDashArray: this.strokeDashArray,
                originX: 'center',
                originY: 'center'
            });

            if (this.shadow) {
                this.shadow.affectStroke = true;
                path.setShadow(this.shadow);
            }

            return path;
        }

    });

})(typeof exports !== 'undefined' ? exports : this);
