(function($, BaseShape, pluginsNamespace) {
  /**
   * Provides a circle button which can be used to draw circles.
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
   * <code>normal</code>: circle's top left corner will be placed to the
   * position of first mouse click and will be resized from that point.
   * <br><br>
   * <code>from_center</code>: circle's center point will be placed to the
   * position of first mouse click and will be resized from center.
   *
   * @constructor
   * @memberof DrawerJs.plugins
   */
  var Circle = function CircleConstructor(drawerInstance, options) {
    var _this = this;

    BaseShape.call(_this, drawerInstance);

    this.name = 'Circle';
    this.btnClass = 'btn-circle';
    this.faClass = 'fa-circle';
    this.tooltip = drawerInstance.t('Draw a circle');

    this.options = options || {};
    this.centeringMode =
      this.options.centeringMode || BaseShape.CENTERING_MODE.NORMAL;
  };

  Circle.prototype = Object.create(BaseShape.prototype);
  Circle.prototype.constructor = Circle;

  Circle.prototype.minShapeSize = 5;

  Circle.prototype.createShape = function (left, top) {
    this.startLeft = left;
    this.startTop = top;

    var circle = new fabric.PCircle({
      left: left,
      top: top,
      radius: 1,
      fill: this.drawerInstance.activeColor,
      opacity:this.drawerInstance.activeOpacity
    });

    return circle;
  };

  Circle.prototype.updateShape = function (circle, newLeft, newTop) {
    var width = newLeft - this.startLeft;
    var height = newTop - this.startTop;

    var widthAbs = Math.abs(width);
    var heightAbs = Math.abs(height);

    var radius = widthAbs < heightAbs ? widthAbs : heightAbs;

    radius = Math.abs(radius);
    radius = radius / 2;

    if (this.centeringMode == BaseShape.CENTERING_MODE.FROM_CENTER) {
      radius *= 2;
      circle.set('left', this.startLeft - radius);
      circle.set('top', this.startTop - radius);
    }

    if (this.centeringMode == BaseShape.CENTERING_MODE.NORMAL) {
      if (width < 0) {
        circle.set('left', this.startLeft - (radius * 2));
      } else {
        circle.set('left', this.startLeft);
      }

      if (height < 0) {
        circle.set('top', this.startTop - (radius * 2));
      } else {
        circle.set('top', this.startTop);
      }
    }

    circle.set('radius', radius);
  };

  pluginsNamespace.Circle = Circle;
}(jQuery, DrawerJs.plugins.BaseShape, DrawerJs.plugins));