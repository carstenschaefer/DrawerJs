(function (namespace, util) {

  'use strict';

  var getPointer = fabric.util.getPointer,
    degreesToRadians = fabric.util.degreesToRadians,
    radiansToDegrees = fabric.util.radiansToDegrees,
    atan2 = Math.atan2,
    abs = Math.abs;

  /**
   * Fabricjs canvas class with customizations to allow
   * eraser paths, fixed rotations etc.
   *
   * @constructor
   * @memberof DrawerJs
   */
  namespace.Canvas = fabric.util.createClass(fabric.Canvas, /** @lends fabric.Canvas.prototype */ {

    /**
     * Constructor
     * @param {HTMLElement | String} el &lt;canvas> element to initialize instance on
     * @param {Object} [options] Options object
     * @return {Object} thisArg
     */
    initialize: function (el, options) {
      options = options ? options : {};
      this.preserveObjectStacking = true;

      this.callSuper('initialize', el, options);
    },


    disableSelection: function () {
      var obj = null;
      var objects = this.getObjects();
      this.deactivateAll();

      for (var i = 0; i < objects.length; i++) {
        obj = objects[i];
        if (obj.__evented === undefined) {
          obj.__evented = obj.get('evented');
          obj.set('evented', false);
        }

        if (obj.__selectable === undefined) {
          obj.__selectable = obj.get('selectable');
          obj.set('selectable', false);
        }
      }
    },

    restoreSelection: function () {
      var obj = null;
      var objects = this.getObjects();

      for (var i = 0; i < objects.length; i++) {
        obj = objects[i];

        if (obj.__evented !== undefined) {
          obj.set('evented', obj.__evented);
          delete obj.__evented;
        }

        if (obj.__selectable !== undefined) {
          obj.set('selectable', obj.__selectable);
          delete obj.__selectable;
        }
      }
    },

    /**
     * @private
     * @param {CanvasRenderingContext2D} ctx Context to render on
     * @param {Array} objectsToRender
     */
    _renderObjects: function (ctx, objectsToRender) {
      var i, length, obj;

      var tempCanvas = util.getTemporaryCanvas(this);
      var tempContext = tempCanvas.getContext('2d');
      tempContext.clearRect(0, 0, this.width, this.height);

      this.eraserPaths = [];

      for (i = 0, length = objectsToRender.length; i < length; ++i) {
          obj = objectsToRender[i];

          // we do not render eraser paths
          if (obj instanceof fabric.EraserPath)
              continue;

          // obj.render(tempContext);
          obj.render(ctx);
      }

        // ctx.drawImage(tempCanvas, 0, 0);
        // tempContext.clearRect(0, 0, this.width, this.height);

    },


    _applyEraserPath: function (pathObject, ctx) {
      pathObject.visible = true;
      pathObject.globalCompositeOperation = 'destination-out';
      pathObject.render(ctx);
      pathObject.visible = false;
    },

    /**
     * @private
     */
    _findNewLowerIndex: function (object, idx, intersecting) {
      var newIdx;

      if (intersecting) {
        newIdx = idx;

        // traverse down the stack looking for the nearest intersecting object
        for (var i = idx - 1; i >= 0; --i) {

          if (this._objects[i] instanceof fabric.EraserPath) {
            continue;
          }

          var isIntersecting = object.intersectsWithObject(this._objects[i]) ||
            object.isContainedWithinObject(this._objects[i]) ||
            this._objects[i].isContainedWithinObject(object);

          if (isIntersecting) {
            newIdx = i;
            break;
          }
        }
      }
      else {
        newIdx = idx - 1;
      }

      return newIdx;
    },
    /**
     * @private
     */
    _findNewUpperIndex: function (object, idx, intersecting) {
      var newIdx;

      if (intersecting) {
        newIdx = idx;

        // traverse up the stack looking for the nearest intersecting object
        for (var i = idx + 1; i < this._objects.length; ++i) {

          if (this._objects[i] instanceof fabric.EraserPath) {
            continue;
          }

          var isIntersecting = object.intersectsWithObject(this._objects[i]) ||
            object.isContainedWithinObject(this._objects[i]) ||
            this._objects[i].isContainedWithinObject(object);

          if (isIntersecting) {
            newIdx = i;
            break;
          }
        }
      }
      else {
        newIdx = idx + 1;
      }

      return newIdx;
    },

    /**
     * This override is needed to properly call object.set() method
     * instead of simple assigment.
     *
     * @private
     * @param {Number} x pointer's x coordinate
     * @param {Number} y pointer's y coordinate
     *
     * @return {boolean} always returns true, except case when _currentTransform.get('lockRotation') returns true
     */
    _rotateObject: function (x, y) {
      var t = this._currentTransform;

      if (t.target.get('lockRotation')) {
        return;
      }

      var lastAngle = atan2(t.ey - t.top, t.ex - t.left),
        curAngle = atan2(y - t.top, x - t.left),
        angle = radiansToDegrees(curAngle - lastAngle + t.theta);

      // normalize angle to positive value
      if (angle < 0) {
        angle = 360 + angle;
      }

      t.target.set('angle', angle % 360);
      return true;
    }
  });
})(DrawerJs, DrawerJs.util);