(function (global) {

  'use strict';

  var fabric = global.fabric || (global.fabric = {}),
    extend = fabric.util.object.extend,
    min = fabric.util.array.min,
    max = fabric.util.array.max,
    toFixed = fabric.util.toFixed;

  fabric.SegmentableLine = fabric.util.createClass(fabric.Object, {
    /**
     * Type of an object
     * @type String
     * @default
     */
    type: 'SegmentableLine',

    /**
     * List of options to show when object is selected
     * @type {String[]}
     */
    objectOptionsList : ['border', 'opacity', 'lineWidth', 'strokeWidth'],

    /**
     * Points array
     * @type Array[]
     * @default
     */
    points: null,

    /**
     * Minimum X from points values, necessary to offset points
     * @type Number
     * @default
     */
    minX: 0,

    /**
     * Minimum Y from points values, necessary to offset points
     * @type Number
     * @default
     */
    minY: 0,

    /**
     * Constructor
     * @param {Array} points Array of points
     * @param {Object} [options] Options object
     * @return {fabric.Polygon} thisArg
     */
    initialize: function (points, options) {
      options = options || {};
      this.points = points;
      this.callSuper('initialize', options);
      this._calcDimensions();
      if (!('top' in options)) {
        this.top = this.minY;
      }
      if (!('left' in options)) {
        this.left = this.minX;
      }
    },
    /**
     * @private
     */
    _calcDimensions: function () {

      var points = this.points;

      var minX = null;
      var minY = null;
      var maxX = null;
      var maxY = null;

      for (var i = 0; i < this.points.length; i++) {
        var _minX = min(this.points[i], 'x');
        if (minX === null || _minX < minX) {
          minX = _minX;
        }

        var _minY = min(this.points[i], 'y');
        if (minY === null || _minY < minY) {
          minY = _minY;
        }

        var _maxX = max(this.points[i], 'x');
        if (maxX === null || _maxX > maxX) {
          maxX = _maxX;
        }

        var _maxY = max(this.points[i], 'y');
        if (maxY === null || _maxY > maxY) {
          maxY = _maxY;
        }
      }

      this.width = (maxX - minX) || 1;
      this.height = (maxY - minY) || 1;

      this.minX = minX;
      this.minY = minY;
    },

    /**
     * @private
     */
    _applyPointOffset: function () {
      // change points to offset polygon into a bounding box
      // executed one time
      this.points.forEach(function (pointSegment) {
        pointSegment.forEach(function (p) {
          p.x -= (this.minX + this.width / 2);
          p.y -= (this.minY + this.height / 2);
        }, this);
      }, this);
    },

    /**
     * Returns object representation of an instance
     * @param {Array} [propertiesToInclude] Any properties that you might want to additionally include in the output
     * @return {Object} Object representation of an instance
     */
    toObject: function (propertiesToInclude) {
      return extend(this.callSuper('toObject', propertiesToInclude), {
        points: this.points.concat(),
        type: this.type
      });
    },

    /* _TO_SVG_START_ */
    /**
     * Returns svg representation of an instance
     * @param {Function} [reviver] Method for further parsing of svg representation.
     * @return {String} svg representation of an instance
     */
    toSVG: function (reviver) {
      var points = [],
        markup = this._createBaseSVGMarkup();

      for (var i = 0, len = this.points.length; i < len; i++) {
        points.push(toFixed(this.points[i].x, 2), ',', toFixed(this.points[i].y, 2), ' ');
      }

      markup.push(
        '<', this.type, ' ',
        'points="', points.join(''),
        '" style="', this.getSvgStyles(),
        '" transform="', this.getSvgTransform(),
        ' ', this.getSvgTransformMatrix(),
        '"/>\n'
      );

      return reviver ? reviver(markup.join('')) : markup.join('');
    },
    /* _TO_SVG_END_ */

    /**
     * @private
     * @param {CanvasRenderingContext2D} ctx Context to render on
     */
    _render: function (ctx) {
      this.commonRender(ctx);
      this._renderFill(ctx);
      if (this.stroke || this.strokeDashArray) {
        //ctx.closePath();
        this._renderStroke(ctx);
      }
    },

    /**
     * @private
     * @param {CanvasRenderingContext2D} ctx Context to render on
     */
    commonRender: function (ctx) {
      var point;
      ctx.beginPath();

      if (this._applyPointOffset) {
        if (!(this.group && this.group.type === 'path-group')) {
          this._applyPointOffset();
        }
        this._applyPointOffset = null;
      }

      var firstSegment = this.points[0];

      ctx.moveTo(firstSegment[0].x, firstSegment[0].y);
      for (var i = 0, len = firstSegment.length; i < len; i++) {
        point = firstSegment[i];
        ctx.lineTo(point.x, point.y);
      }

      //ctx.closePath();

      if (this.points.length > 1) {
        for (var s = 1; s < this.points.length; s++) {
          var segmentPoints = this.points[s];
          ctx.moveTo(segmentPoints[0].x, segmentPoints[0].y);

          for (var sp = 0; sp < segmentPoints.length; sp++) {
            ctx.lineTo(segmentPoints[sp].x, segmentPoints[sp].y);
          }

        }
      }
    },

    /**
     * Returns complexity of an instance
     * @return {Number} complexity of this instance
     */
    complexity: function () {
      return this.points.length;
    }

  });

  /**
   * Returns fabric.Polygon instance from an object representation
   * @static
   * @memberOf fabric.Polygon
   * @param {Object} object Object to create an instance from
   * @return {fabric.Polygon} Instance of fabric.Polygon
   */
  fabric.SegmentableLine.fromObject = function (object) {
    return new fabric.SegmentableLine(object.points, object, true);
  };

})(typeof exports !== 'undefined' ? exports : this);