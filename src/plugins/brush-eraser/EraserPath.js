(function (global) {
  'use strict';

  /**
   * Path created by eraser brush.
   */
  fabric.EraserPath = fabric.util.createClass(fabric.Path, {

    /**
     * Type of an object
     * @type String
     * @default
     */
    type: 'EraserPath',

    // to avoid issue in fabric.js with clipping of cached objects [bounding rect do not include brush size]
    objectCaching : false,
    evented : false,
    selectable : false,

    initialize: function (path, options) {
      options = options || {};

      this.polygonOffsetX = options.polygonOffsetX || null;
      this.polygonOffsetY = options.polygonOffsetY || null;

      this.callSuper('initialize', path, options);
    },

    /**
     * Returns string representation of an instance
     * @return {String} string representation of an instance
     */
    toString: function () {
      return '#<fabric.EraserPath (' + this.complexity() +
        '): { "top": ' + this.top + ', "left": ' + this.left + ' }>';
    },

    /**
     * Returns object representation of an instance
     * @param {Array} [propertiesToInclude] Any properties that you might want to additionally include in the output
     * @return {Object} object representation of an instance
     */
    toObject: function (propertiesToInclude) {
      var o = fabric.util.object.extend(
        this.callSuper('toObject', propertiesToInclude), {
          path: this.path.map(function (item) {
            return item.slice();
          }),
          pathOffset: this.pathOffset
        });
      if (this.sourcePath) {
        o.sourcePath = this.sourcePath;
      }
      if (this.transformMatrix) {
        o.transformMatrix = this.transformMatrix;
      }

      if(this.polygonOffsetX && this.polygonOffsetY){
        o.polygonOffsetX = this.polygonOffsetX;
        o.polygonOffsetY = this.polygonOffsetY;
      }

      return o;
    }
  });

  fabric.EraserPath.fromObject = function (object, callback) {
    if (typeof object.path === 'string') {
      fabric.loadSVGFromURL(object.path, function (elements) {
        var path = elements[0],
          pathUrl = object.path;

        delete object.path;

        fabric.util.object.extend(path, object);
        path.setSourcePath(pathUrl);

        callback(path);
      });
    }
    else {
      callback(new fabric.EraserPath(object.path, object));
    }
  };

  /**
   * Indicates that instances of this type are async
   * @static
   * @memberOf fabric.Path
   * @type Boolean
   * @default
   */
  fabric.EraserPath.async = true;

})(typeof exports !== 'undefined' ? exports : this);