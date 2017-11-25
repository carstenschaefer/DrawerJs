(function($, BaseShape, pluginsNamespace) {
  /**
   * Provides a triangle button which can be used to draw triangles.
   *
   * @param {DrawerJs.Drawer} drawerInstance
   * Instance of {@link DrawerJs.Drawer}.
   *
   * @param {Object} options
   * Configuration object.
   *
   * @param {String} [options.centeringMode='normal']
   * Defines centering method when drawing a shape.
   * <br><br>
   * Valid values are:
   * <br><br>
   * <code>normal</code>: triangle's top left corner will be placed to the
   * position of first mouse click and will be resized from that point.
   * <br><br>
   * <code>from_center</code>: triangle's center point will be placed to the
   * position of first mouse click and will be resized from center.
   *
   * @constructor
   * @memberof DrawerJs.plugins
   */
  var Triangle = function TriangleConstructor(drawerInstance, options) {
    var _this = this;

    BaseShape.call(_this, drawerInstance);

    this.name = 'Triangle';
    this.btnClass = 'btn-triangle';
    this.faClass = 'fa-play';
    this.tooltip = drawerInstance.t('Draw a triangle');

    this.options = options || {};
    this.centeringMode =
      this.options.centeringMode || BaseShape.CENTERING_MODE.NORMAL;
  };

  Triangle.prototype = Object.create(BaseShape.prototype);
  Triangle.prototype.constructor = Triangle;

  BaseShape.prototype.minShapeSize = 8;

  Triangle.prototype.createShape = function (left, top) {
    this.startLeft = left;
    this.startTop = top;

    var triangle = new fabric.PTriangle({
      width: 1,
      height: 1,
      left: left,
      top: top,
      fill: this.drawerInstance.activeColor,
      opacity:this.drawerInstance.activeOpacity
    });
    return triangle;
  };

  Triangle.prototype.updateShape = function (triangle, newLeft, newTop) {
    var width = newLeft - this.startLeft;
    var height = newTop - this.startTop;

    if (this.centeringMode === BaseShape.CENTERING_MODE.NORMAL) {
      if(width > 0){
        triangle.set('width', width);
        triangle.set('left', newLeft);
      } else {
        triangle.set('width', width * -1);
        triangle.set('left', newLeft);
      }

      if(height > 0){
        triangle.set('angle', 0);
        triangle.set('height', height);
        if(width > 0){
          triangle.set('left', newLeft - width);
        } else {
          triangle.set('left', newLeft);
        }
      } else {
        triangle.set('angle', 180);
        triangle.set('height', height * -1);
        triangle.set('top', newTop + height * -1);
        if(width > 0){
          triangle.set('left', newLeft);
        } else {
          triangle.set('left', newLeft + width * -1);
        }
      }


    } else if (
      this.centeringMode === BaseShape.CENTERING_MODE.FROM_CENTER
    ) {

      width *= 2;
      height *= 2;
      triangle.set('left', newLeft - width);
      triangle.set('top', newTop - height);
      triangle.set('width', width);
      triangle.set('height', height);
    }
  };

  pluginsNamespace.Triangle = Triangle;

}(jQuery, DrawerJs.plugins.BaseShape, DrawerJs.plugins));