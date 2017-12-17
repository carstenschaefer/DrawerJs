if (!this.DrawerJs) {
  this.DrawerJs = {};
}

this.DrawerJs.clipping = {};

(function (namespace) {
  "use strict";

  namespace.runClippingOperation = function (params) {
    var firstShape = params.firstShape;
    var secondShape = params.secondShape;

    var polyPoints = prepareForClipper(
      firstShape.width, firstShape.currentWidth,
      firstShape.height, firstShape.currentHeight,
      firstShape.center, firstShape.angleInRadians, firstShape.points);

    // TODO: another shape angle and scaling needed
    var anotherShapePointsGlobal =
      localToGlobal(secondShape.center, secondShape.points);

    var solution = processShape(params.cmd, polyPoints,
      uppercaseCoords(anotherShapePointsGlobal));

    if (secondShape.centersQueue) {
      for (var i = 0; i < secondShape.centersQueue.length; i++) {

        anotherShapePointsGlobal = localToGlobal(
          secondShape.centersQueue[i], secondShape.points
        );

        solution = processShape(
          params.cmd, solution, uppercaseCoords(anotherShapePointsGlobal)
        );
      }
    }

    solution = ClipperLib.JS.Lighten(solution, 0.1);

    var result = null;

    if (solution.length > 0) {
      result = restoreAfterClipper(
        firstShape.currentWidth, firstShape.width,
        firstShape.currentHeight, firstShape.height,
        firstShape.center, firstShape.angleInRadians * -1, solution);
    }

    return result;
  };


  var processShape = function (cmd, firstShapePoints, secondShapePoints) {
    var solution = new ClipperLib.Paths();
    var c = new ClipperLib.Clipper();

    c.AddPaths(firstShapePoints,
      ClipperLib.PolyType.ptSubject, true
    );

    c.AddPaths(secondShapePoints,
      ClipperLib.PolyType.ptClip, true
    );
    c.Execute(cmd, solution);

    return solution;
  };

  var localToGlobal = function (center, pointsSegments) {
    var result = [];
    for (var s = 0; s < pointsSegments.length; s++) {
      var segmentResult = [];
      for (var p = 0; p < pointsSegments[s].length; p++) {
        segmentResult.push({
          x: center.x + pointsSegments[s][p].x,
          y: center.y + pointsSegments[s][p].y
        });
      }
      result.push(segmentResult);
    }
    return result;
  };

  var globalToLocal = function (center, pointsSegments) {
    var result = [];
    for (var s = 0; s < pointsSegments.length; s++) {
      var segmentResult = [];
      for (var p = 0; p < pointsSegments[s].length; p++) {
        segmentResult.push({
          x: pointsSegments[s][p].x - center.x,
          y: pointsSegments[s][p].y - center.y
        });
      }
      result.push(segmentResult);
    }
    return result;
  };

  var rotatePoints = function (pointsSegments, center, angle) {
    var result = [];
    for (var s = 0; s < pointsSegments.length; s++) {
      var segmentResult = [];
      for (var p = 0; p < pointsSegments[s].length; p++) {
        var point = new fabric.Point(pointsSegments[s][p].x,
          pointsSegments[s][p].y
        );
        var rotatedPoint = fabric.util.rotatePoint(point, center, angle);
        segmentResult.push({
          x: rotatedPoint.x,
          y: rotatedPoint.y
        });
      }
      result.push(segmentResult);
    }
    return result;
  };

  var uppercaseCoords = function (pointsSegments) {
    var result = [];
    for (var s = 0; s < pointsSegments.length; s++) {
      var segmentResult = [];
      for (var p = 0; p < pointsSegments[s].length; p++) {
        segmentResult.push({
          X: pointsSegments[s][p].x,
          Y: pointsSegments[s][p].y
        });
      }
      result.push(segmentResult);
    }
    return result;
  };

  var lowercaseCoords = function (pointsSegments) {
    var result = [];
    for (var s = 0; s < pointsSegments.length; s++) {
      var segmentResult = [];
      for (var p = 0; p < pointsSegments[s].length; p++) {
        segmentResult.push({
          x: pointsSegments[s][p].X,
          y: pointsSegments[s][p].Y
        });
      }
      result.push(segmentResult);
    }
    return result;
  };

  var scaleCoords = function (originalWidth, scaledWidth,
                              originalHeight, scaledHeight, pointsSegments) {
    var result = [];
    for (var s = 0; s < pointsSegments.length; s++) {
      var segmentResult = [];
      for (var p = 0; p < pointsSegments[s].length; p++) {
        var x = pointsSegments[s][p].x;
        var y = pointsSegments[s][p].y;

        var originalWidthPercent = x * 100 / originalWidth;
        var newX = originalWidthPercent * scaledWidth / 100;

        var originalHeightPercent = y * 100 / originalHeight;
        var newY = originalHeightPercent * scaledHeight / 100;

        segmentResult.push({
          x: newX,
          y: newY
        });
      }
      result.push(segmentResult);
    }
    return result;
  };

  var prepareForClipper = function (originalWidth, scaledWidth,
                                    originalHeight, scaledHeight,
                                    centerPoint, rotationAngleInRadians,
                                    pointsSegments) {
    var result = [];
    var sin = Math.sin(rotationAngleInRadians),
      cos = Math.cos(rotationAngleInRadians);

    for (var s = 0; s < pointsSegments.length; s++) {
      var segmentResult = [];
      for (var p = 0; p < pointsSegments[s].length; p++) {
        var x = pointsSegments[s][p].x;
        var y = pointsSegments[s][p].y;

        // --- scale ---
        var originalWidthPercent = x * 100 / originalWidth;
        var newX = originalWidthPercent * scaledWidth / 100;

        var originalHeightPercent = y * 100 / originalHeight;
        var newY = originalHeightPercent * scaledHeight / 100;
        // --- /scale ---

        // ---- local to global ----
        newX = centerPoint.x + newX;
        newY = centerPoint.y + newY;
        // ---- /local to global ----


        // ---- rotation angle ----
        // we could not use fabric point here because it's needed to be constructed
        // with memory allocation but that is bad idea for large data processing
        newX -= centerPoint.x;
        newY -= centerPoint.y;

        var rx = newX * cos - newY * sin,
          ry = newX * sin + newY * cos;

        newX = rx += centerPoint.x;
        newY = ry += centerPoint.y;
        // ---- /rotation angle ----

        segmentResult.push({
          X: newX,
          Y: newY
        });
      }
      result.push(segmentResult);
    }
    return result;
  };

  var restoreAfterClipper = function (originalWidth, scaledWidth,
                                      originalHeight, scaledHeight,
                                      centerPoint, rotationAngleInRadians,
                                      pointsSegments) {
    var result = [];
    var sin = Math.sin(rotationAngleInRadians),
      cos = Math.cos(rotationAngleInRadians);

    for (var s = 0; s < pointsSegments.length; s++) {
      var segmentResult = [];
      for (var p = 0; p < pointsSegments[s].length; p++) {
        var x = pointsSegments[s][p].X;
        var y = pointsSegments[s][p].Y;

        // ---- rotation angle ----
        // we could not use fabric point here because it's needed to be constructed
        // with memory allocation but that is bad idea for large data processing
        x -= centerPoint.x;
        y -= centerPoint.y;

        var rx = x * cos - y * sin,
          ry = x * sin + y * cos;

        x = rx += centerPoint.x;
        y = ry += centerPoint.y;
        // ---- /rotation angle ----

        // ---- local to global ----
        x = x - centerPoint.x;
        y = y - centerPoint.y;
        // ---- /local to global ----

        // --- scale ---
        var originalWidthPercent = x * 100 / originalWidth;
        x = originalWidthPercent * scaledWidth / 100;

        var originalHeightPercent = y * 100 / originalHeight;
        y = originalHeightPercent * scaledHeight / 100;
        // --- /scale ---

        segmentResult.push({
          x: x,
          y: y
        });
      }
      result.push(segmentResult);
    }
    return result;
  };

})(DrawerJs.clipping);