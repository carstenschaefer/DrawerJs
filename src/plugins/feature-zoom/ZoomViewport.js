;(function (global, $, pluginsNamespace) {
  'use strict';

  var fabric = global.fabric || (global.fabric = {});

  /**
   * @param {DrawerJs.Drawer} drawer
   * @param {Object} [options]
   * @memberof DrawerJs.plugins
   * @constructor
   */
  var ZoomViewport = function ZoomViewportConstr(drawer, options) {
    this.drawer = drawer;
    this.i = 0;
    this.position = new fabric.Point(0, 0);

    this.zoom = 1;
    return this;
  };

  /**
   * Set zoom depending on last settings
   * @param {Number} newZoom - zoom value
   * @param {Number} x - x coordinate of zoom center point
   * @param {Number} y - y coordinate of zoom center point
   * @param {Boolean} [strict] - do not change given coords
   * @returns {Object}
   */
  ZoomViewport.prototype.setViewport = function (newZoom, x, y, strict) {
    this._adjustPosition(newZoom, x, y, strict);
    this._render();
    return this.getData();
  };

  /**
   * Get current viewport data
   * @returns {Object}
   */
  ZoomViewport.prototype.getData = function () {
    var data = {},
        zoomCenter = this.getZoomCenter();
    data.zoom = this.zoom;
    data.position = {
      x: this.position.x,
      y: this.position.y
    };
    data.zoomCenterX = zoomCenter.x;
    data.zoomCenterY = zoomCenter.y;
    return data;
  };

  /**
   * Get zoom center coords
   * @returns {Object}
   */
  ZoomViewport.prototype.getZoomCenter = function () {
    var result = {},
        width = this.drawer.width,
        height = this.drawer.height,
        availableX = width / this.zoom,
        availableY = height / this.zoom,
        zoomCenterX = availableX / 2 - this.position.x,
        zoomCenterY = availableY / 2 - this.position.y;

    result.x = zoomCenterX;
    result.y = zoomCenterY;
    return result;
  };

  /**
   *
   * @param {Number} zoom - zoom value
   * @param {Number} x - x offset of canvas
   * @param {Number} y - y offset of canvas
   * @returns {{x: (number), y: (number)}}
   * @private
   */
  ZoomViewport.prototype._validatePosition = function (zoom, x, y) {
    x = x || 0;
    y = y || 0;
    var width = this.drawer.width,
        height = this.drawer.height,
        availableX = width / zoom,
        availableY = height / zoom,
        maxPositionX = width - availableX,
        maxPositionY = height - availableY;
    if (x < -maxPositionX) {
      x = -maxPositionX;
    }
    if (y < -maxPositionY) {
      y = -maxPositionY;
    }
    if (x > 0) {
      x = 0;
    }
    if (y > 0) {
      y = 0;
    }
    return {
      x: x,
      y: y
    };
  };

  /**
   * @param {Number} [zoom]
   */
  ZoomViewport.prototype.setToCenterOfCanvas = function (zoom) {
    zoom = zoom || this.zoom;
    var halfWidth = this.drawer.width / 2,
        halfHeight = this.drawer.height / 2;

    this._adjustPosition(zoom, halfWidth, halfHeight, true);
    this._render();
  };

  /**
   * Render canvas
   * @private
   */
  ZoomViewport.prototype._render = function () {
    this.drawer.fCanvas.renderAll();
  };

  /**
   * Update position values
   * @param {Number} zoom - zoom value
   * @param {Number} x - x offset of canvas
   * @param {Number} y - y offset of canvas
   */
  ZoomViewport.prototype.setPosition = function (zoom, x, y) {
    zoom = zoom || this.zoom;
    var validatedPoint = this._validatePosition(zoom, x, y);
    this.position.x = validatedPoint.x;
    this.position.y = validatedPoint.y;
    this.zoom = zoom;
  };

  /**
   * Process coordinates of center point
   * @param {Number} newZoom - zoom value
   * @param {Number} x - x coordinate of zoom center point
   * @param {Number} y - y coordinate of zoom center point
   * @param {Boolean} [strict] - do not change given coords
   * @private
   */
  ZoomViewport.prototype._adjustPosition = function (newZoom, x, y, strict) {
    this.position.x = this.position.x || 0;
    this.position.y = this.position.y || 0;
    var width = this.drawer.width,
        height = this.drawer.height,
        k = newZoom / this.zoom,
        oldAvailableX = width / this.zoom,
        oldAvailableY = height / this.zoom,
        newAvailableX = width / newZoom,
        newAvailableY = height / newZoom,
        newX,
        newY;

    if (strict) {
      newX = newAvailableX/2 - x;
      newY = newAvailableY/2 - y;
    } else {
      if (x !== undefined && y !== undefined) {
        var deltaX = (x - width / 2) / this.zoom,
            deltaY = (y - width / 2) / this.zoom;
        newX = this.position.x - deltaX - ((oldAvailableX - newAvailableX ) / 2);
        newY = this.position.y - deltaY - ((oldAvailableY - newAvailableY ) / 2);
      } else {
        newX = width / 2 - k * (width / 2 - this.position.x);
        newY = height / 2 - k * (height / 2 - this.position.y);
      }
    }
    this.setPosition(newZoom, newX, newY);
    return this.position;
  };

  pluginsNamespace.ZoomViewport = ZoomViewport;
}(this, jQuery, DrawerJs.plugins));