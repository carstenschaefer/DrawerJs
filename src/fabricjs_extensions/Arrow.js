(function (global) {

  'use strict';

  var fabric = global.fabric || (global.fabric = {}),
    extend = fabric.util.object.extend;


  fabric.Arrow = fabric.util.createClass(fabric.Line, {

    type: 'arrow',

    objectCaching : false,

    /**
     * List of options to show when object is selected
     * @type {String[]}
     */
    objectOptionsList : ['border', 'opacity', 'lineWidth', 'strokeWidth'],


    initialize: function (points, options) {
      this.callSuper('initialize', points, options);
      if (options) {
        this.set('oneSided', options.oneSided);
      }
    },


    // _getNonTransformedDimensions :function(argument) {
    //     var strokeWidth = this.strokeWidth,
    //     w = this.width + strokeWidth + 30,
    //     h = this.height + strokeWidth + 30;

    //     return { x: w, y: h };
    // },

    _render: function (ctx, noTransform) {
      if (
        (this.width < 20 && this.height < 20) ||
        (this.scaleX < 0.3 && this.scaleY < 0.3)
      ) {
        this.set('padding', 20);
      } else {
        this.set('padding', 10);
      }

      this.canvas.calcOffset();

      this.callSuper('_render', ctx, noTransform);
      var points = this.callSuper('calcLinePoints');

      var angle = this._calcArrowAngle(points.x1, points.y1, points.x2, points.y2);

      if (!this.oneSided) {
        this._drawArrow(ctx, {x: points.x1, y: points.y1}, angle + 90);
      }
      this._drawArrow(ctx, {x: points.x2, y: points.y2}, angle - 90);
    },

    _drawArrow: function (ctx, point, angle) {
      var arrowSize = 0.5;

      if(this.get('strokeWidth') > 1){
        arrowSize = arrowSize * (this.get('strokeWidth') / 2);
      }

      var arrowPointOffsetX = 10;
      var arrowPointOffsetY = 20;

      var frontCenterPoint = {
        x: point.x,
        y: point.y + (arrowPointOffsetX * arrowSize)
      };
      var leftPoint = {
        x: point.x - (arrowPointOffsetX * arrowSize),
        y: point.y - (arrowPointOffsetY * arrowSize)
      };
      var backCenterPoint = {
        x: point.x,
        y: point.y - (arrowPointOffsetX * arrowSize)
      };
      var rightPoint = {
        x: point.x + (arrowPointOffsetX * arrowSize),
        y: point.y - (arrowPointOffsetY * arrowSize)
      };

      ctx.save();

      ctx.translate(point.x, point.y);
      ctx.rotate(angle * Math.PI / 180);
      ctx.translate(point.x * -1, point.y * -1);

      ctx.beginPath();
      ctx.moveTo(frontCenterPoint.x, frontCenterPoint.y);
      ctx.lineTo(leftPoint.x, leftPoint.y);
      ctx.lineTo(backCenterPoint.x, backCenterPoint.y);
      ctx.lineTo(rightPoint.x, rightPoint.y);
      ctx.fillStyle = this.stroke;
      ctx.fill();

      ctx.restore();
    },

    _calcArrowAngle: function (x1, y1, x2, y2) {
      var angle = 0,
        x, y;

      x = (x2 - x1);
      y = (y2 - y1);

      if (x === 0) {
        angle = (y === 0) ? 0 :
          (y > 0) ? Math.PI / 2 : Math.PI * 3 / 2;
      }
      else if (y === 0) {
        angle = (x > 0) ? 0 : Math.PI;
      }
      else {
        angle = (x < 0) ? Math.atan(y / x) + Math.PI :
          (y < 0) ? Math.atan(y / x) + (2 * Math.PI) : Math.atan(y / x);
      }

      return (angle * 180 / Math.PI);
    },

    /**
     * Returns object representation of an instance
     */
    toObject: function (propertiesToInclude) {
      if (!propertiesToInclude) {
        propertiesToInclude = [];
      }

      propertiesToInclude.push('oneSided', 'padding');

      return fabric.util.object.extend(
        this.callSuper('toObject', propertiesToInclude),
        this.calcLinePoints()
      );
    }
  });


  /**
   * Returns fabric.Arrow instance from an object representation
   */
  fabric.Arrow.fromObject = function (object) {
    var points = [object.x1, object.y1, object.x2, object.y2];
    return new fabric.Arrow(points, object);
  };

})(typeof exports !== 'undefined' ? exports : this);