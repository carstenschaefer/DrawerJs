(function (global) {

  'use strict';

  var fabric = global.fabric || (global.fabric = {});

  fabric.ErasableArrow = fabric.util.createClass(fabric.Arrow, {
    /**
     * Type of an object
     * @type String
     * @default
     */
    type: 'ErasableArrow',
    originX: 'center',
    originY: 'center',


    /**
     * Constructor
     * @param {Array} points Array of points
     * @param {Object} [options] Options object
     * @return {fabric.ErasableArrow}
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
  fabric.ErasableArrow.fromObject = function (object) {
      // form 'points' array, for first parameter in fabric.ErasableArrow c-tor
      var points = [object.x1, object.y1, object.x2, object.y2];
      return new fabric.ErasableArrow(points, object);
  };


  // make our object erasable via ErasableMixin.
  fabric.makeObjectErasable(fabric.ErasableArrow);
})(typeof exports !== 'undefined' ? exports : this);
