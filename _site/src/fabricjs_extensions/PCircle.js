(function (global) {

  'use strict';

  var fabric = global.fabric || (global.fabric = {}),
    extend = fabric.util.object.extend,
    min = fabric.util.array.min,
    max = fabric.util.array.max,
    toFixed = fabric.util.toFixed;

  fabric.PCircle = fabric.util.createClass(fabric.SegmentablePolygon, {

    radius: 0,
    type: 'PCircle',
    initialize: function (options) {
      var _this = this;
      options = options || {};
      this.radius = options.radius || 0;

      var points = this.makeCircle(this.radius);

      this.width = this.radius * 2;
      this.height = this.radius * 2;

      this.callSuper('initialize', points, options);
    },
    makeCircle: function (radius) {
      var points = [];

      var centerX = 0;
      var centerY = 0;

      for (var degree = 0; degree < 360; degree++) {
        var radians = degree * Math.PI / 180;
        var x = centerX + radius * Math.cos(radians);
        var y = centerY + radius * Math.sin(radians);
        points.push({x: x, y: y});
      }

      return [points];
    },
    _render: function (ctx) {
      this.callSuper('_render', ctx);
    },
    _set: function (key, value) {
      if (key === 'radius') {
        this.points = this.makeCircle(value);
        this.width = value * 2;
        this.height = value * 2;
        this.callSuper('_set', 'points', this.points);
      }

      this.callSuper('_set', key, value);
    },
    isPointInside: function (x, y) {
      var center = this.getCenterPoint();
      return Math.sqrt(
          (x - center.x) * (x - center.x) + (y - center.y) * (y - center.y)
        ) < this.radius;
    },
    getPerimeterPoints: function (deltaX, deltaY, useEntireCircle) {
      var result;
      var sectorAngleOffset = 0,
          sectorAngle = 360;

      var deltaIsValid = typeof deltaX == 'number' && typeof deltaY == 'number',
          getPointsFromSector = deltaIsValid && !useEntireCircle;
      if (getPointsFromSector) {
        // Check if eraser tool position is changed
        if (deltaX || deltaY) {
          sectorAngle = deltaX !== 0 && deltaY !== 0 ? 90 : 180;
          if (deltaY < 0) {
            sectorAngleOffset = 180;
            if (deltaX > 0) {
              sectorAngleOffset = 270;
            }
          } else {
            if (deltaX < 0) {
              sectorAngleOffset = 90;
            }
          }
        }
      }

      result = this.getSectorPoints(sectorAngleOffset, sectorAngle);
      return result;
    },
    getSectorPoints: function (sectorAngleOffset, sectorAngle) {
      var result = [],
          sizeOfStepInDeg = 15,
          randomDiff = Math.round(Math.random() * sizeOfStepInDeg / 2),
          endPoint = sectorAngleOffset + sectorAngle + sizeOfStepInDeg - randomDiff,
          currPointAngle = sectorAngleOffset - randomDiff;

      for (currPointAngle; currPointAngle <= endPoint; currPointAngle += sizeOfStepInDeg) {
        var currPointCoords = {},
            currPointAngleRad = fabric.util.degreesToRadians(currPointAngle % 360),
            pointOffsetX = (this.radius * Math.cos(currPointAngleRad)),
            pointOffsetY = (this.radius * Math.sin(currPointAngleRad));

        currPointCoords.x = this.left  + Math.round(pointOffsetX);
        currPointCoords.y = this.top + Math.round(pointOffsetY);
        result.push(currPointCoords);
      }
      return result;
    },
    toObject: function (propertiesToInclude) {
      return extend(this.callSuper('toObject', propertiesToInclude), {
        radius: this.radius
      });
    }
  });

  fabric.PCircle.fromObject = function (object) {
    return new fabric.PCircle(object, true);
  };

  fabric.PCircle.async = false;

})(typeof exports !== 'undefined' ? exports : this);