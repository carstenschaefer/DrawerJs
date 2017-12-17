(function (namespace) {

  /**
   * EraserBrush class.
   * The main purpose of this class is to replace created Path objects
   * with custom EraserPath so canvas could know how to render them.
   *
   * @class EraserBrush
   * @extends fabric.PencilBrush
   *
   * @memberof DrawerJs.brushes
   */
  namespace.EraserBrush = fabric.util.createClass(fabric.PencilBrush, {

    /**
     * Constructor
     * @param {fabric.Canvas} canvas
     * @return {DrawerJs.EraserBrush} Instance of a eraser brush
     */
    initialize: function (canvas) {
      this.callSuper('initialize', canvas);
    },

    /**
     * Overriding fabric.PencilBrush._render
     * Method code is exactly copy of fabric.PencilBrush._render,
     * only change is trigger events
     *
     * @see {fabric.PencilBrush._render}
     * @private
     */
    _render: function () {
      this.canvas.fire('pencil:move:before');
      this.callSuper('_render');
      this.canvas.fire('pencil:move:after');
    },

    /**
     * Creates fabric.Path object to add on canvas
     * @param {String} pathData Path data
     * @return {fabric.Path} Path to add on canvas
     */
    createPath: function (pathData) {
      var path = new fabric.EraserPath(pathData, {
        fill: null,
        stroke: this.color,
        strokeWidth: this.width,
        strokeLineCap: this.strokeLineCap,
        strokeLineJoin: this.strokeLineJoin,
        strokeDashArray: this.strokeDashArray,
        originX: 'center',
        originY: 'center'
      });

      if (this.shadow) {
        this.shadow.affectStroke = true;
        path.setShadow(this.shadow);
      }

      return path;
    }
  });

})(DrawerJs.brushes);