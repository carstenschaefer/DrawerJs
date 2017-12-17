(function (global) {

  'use strict';

  var fabric = global.fabric || (global.fabric = {});

  fabric.ErasableLine = fabric.util.createClass(fabric.Line, {
    /**
     * Type of an object
     * @type String
     * @default
     */
    type: 'ErasableLine',
    originX: 'center',
    originY: 'center',

    /**
     * List of options to show when object is selected
     * @type {String[]}
     */
    objectOptionsList : ['border', 'opacity', 'lineWidth', 'strokeWidth'],

    /**
     * Constructor
     * @param {Array} points Array of points
     * @param {Object} [options] Options object
     * @return {fabric.ErasableLine}
     */
    initialize: function (points, options) {
      options = options || {};
      this.callSuper('initialize', points, options);
    },


    /**
     * Returns object representation of an instance
     * @param {Array} [propertiesToInclude] Any properties that you might want to additionally include in the output
     * @return {Object} Objectr representation of an instance
     */
    toObject: function (propertiesToInclude) {
      return this.callSuper('toObject', propertiesToInclude);
    },

    /**
     * @private
     * @param {CanvasRenderingContext2D} ctx Context to render on
     */
    _render: function (ctx) {
        this.callSuper('_render', ctx);
    }

  });

  /**
   * Returns fabric.Polygon instance from an object representation
   * @static
   * @memberOf fabric.Polygon
   * @param {Object} object Object to create an instance from
   * @return {fabric.Polygon} Instance of fabric.Polygon
   */
  fabric.ErasableLine.fromObject = function (object) {
      // form 'points' array, for first parameter in fabric.ErasableLine c-tor
      var points = [object.x1, object.y1, object.x2, object.y2];
      return new fabric.ErasableLine(points, object);
  };


  // make our object erasable via ErasableMixin.
  fabric.makeObjectErasable(fabric.ErasableLine);
})(typeof exports !== 'undefined' ? exports : this);
