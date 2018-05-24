(function ($, BaseShape, pluginsNamespace) {
  /**
   * Provides a line button which can be used to draw lines.
   *
   * @param {DrawerJs.Drawer} drawerInstance
   * Instance of {@link DrawerJs.Drawer}.
   *
   * Tool is using drawerInstance.options['lineAngleTooltip']
   * Default settings are:
   * {  enabled: false,
   *    fontSize: 11,
   *    fontFamily:  'Arial, sans serif',
   *    color: 'black'};
   *
   * @constructor
   * @memberof DrawerJs.plugins
   */
  var Line = function LineConstructor(drawerInstance) {
    // call super
    BaseShape.call(this, drawerInstance);

    this.name = 'Line';
    /**
     * List of tool options to show when tool is activated.
     * Deviating from BaseShape tool, Line has no 'color', only 'border'.
     * @type {String[]}
     */
    this.toolOptionsList = ['border', 'opacity', 'lineWidth', 'strokeWidth'];

    this.btnClass = 'btn-line';
    this.faClass = 'fa-line';
    this.tooltip = drawerInstance.t('Draw a line');

    this.group = {
      name: 'lines',
      tooltip: drawerInstance.t('Lines and arrows')
    };

    this._setupOptions({});
    $.extend(true, this.options.lineAngleTooltip, drawerInstance.options.lineAngleTooltip || {});

    // add fallback for fontFamily
    this.options.lineAngleTooltip.fontFamily += ', ' + this._defaultOptions.lineAngleTooltip.fontFamily;
  };

  Line.prototype = Object.create(BaseShape.prototype);
  Line.prototype.constructor = Line;

  Line.prototype.checkOnlyWidthOrHeight = true;

  Line.prototype._defaultOptions = {
    lineAngleTooltip: {
      enabled: false,
      fontSize: 11,
      fontFamily:  'Arial, sans serif',
      color: 'black'
    }
  };


  /**
   * Create new shape with minimal size.
   * Is called from BaseShape nmouseDown handler.
   *
   * @param  {Number} left [description]
   * @param  {Number} top  [description]
   * @return {fabric.ErasableLine}
   */
  Line.prototype.createShape = function (left, top) {
    var line = new fabric.ErasableLine();

    line.set('x1', left);
    line.set('x2', left + 1);
    line.set('y1', top);
    line.set('y2', top + 1);
    line.set('stroke', this.drawerInstance.activeColor);
    line.set('opacity', this.drawerInstance.activeOpacity);
    line.set('strokeWidth', this.drawerInstance.lineStrokeWidth || 2);

    this.createAngleTooltip(line);

    return line;
  };


  /**
   * Update shape with new left, top,
   * Is called from BaseShape mouseMove handler
   *
   * @param  {fabric.Line} line    [description]
   * @param  {Number} newLeft [description]
   * @param  {Number} newTop  [description]
   */
  Line.prototype.updateShape = function (line, newLeft, newTop) {
    line.set('x2', newLeft);
    line.set('y2', newTop);

    this.updateAngleTooltip(line);
  };


  /**
   * Is called from BaseShape mouseUp handler.
   */
  Line.prototype.finishShape = function () {
    this.removeAngleTooltip();
  };


  /**
   * Create text object for line angle tooltip
   *
   * @param  {fabric.Line} line
   */
  Line.prototype.createAngleTooltip = function (line) {
    if (!this.options.lineAngleTooltip.enabled)
      return;

    this.angleTooltip = new fabric.IText('Text');
    this.angleTooltip.set('fontFamily', this.options.lineAngleTooltip.fontFamily);
    this.angleTooltip.set('fontSize', this.options.lineAngleTooltip.fontSize);
    this.angleTooltip.set('left', line.x1 - 10);
    this.angleTooltip.set('top', line.y1 - 10);
    this.angleTooltip.set('stroke', this.options.lineAngleTooltip.color);
    this.angleTooltip.set('fill', this.options.lineAngleTooltip.color);
    this.angleTooltip.set('text', '');

    this.drawerInstance.fCanvas.add(this.angleTooltip);
    this.updateAngleTooltip(line);
  };


  /**
   * Update angle tooltip with line current angle
   *
   * @param  {fabric.Line} line
   */
  Line.prototype.updateAngleTooltip = function (line) {
    if (!this.options.lineAngleTooltip.enabled)
      return;

    // calc line angle
    var angleRad = Math.atan((line.y2 - line.y1) / (line.x2 - line.x1));
    var angle = Math.abs(fabric.util.radiansToDegrees(angleRad));
    this.angleTooltip.setText(angle.toFixed().toString());

    // determine tooltip position
    var tooltipOffsetX = this.options.lineAngleTooltip.fontSize;
    var tooltipOffsetY = -this.options.lineAngleTooltip.fontSize;
    // if line is pointing to the left
    if (line.x2 < line.x1) {
      tooltipOffsetX = -(this.options.lineAngleTooltip.fontSize + 10);
    }
    // if line is pointing downside
    if (line.y2 > line.y1) {
      tooltipOffsetY = 2;
    }

    this.angleTooltip.set('left', line.x1 + tooltipOffsetX);
    this.angleTooltip.set('top', line.y1 + tooltipOffsetY);
    // this is needed to overpower strange issue, when tooltip is always same color as line
    this.angleTooltip.set('stroke', this.options.lineAngleTooltip.color);
    this.angleTooltip.set('fill', this.options.lineAngleTooltip.color);
  };


  /**
   * Removes angle tooltip.
   */
  Line.prototype.removeAngleTooltip = function () {
    if (this.options.lineAngleTooltip.enabled) {
      if (this.angleTooltip) {
        this.angleTooltip.remove();
        delete this.tooltip;
      }
    }
  };

  pluginsNamespace.Line = Line;

}(jQuery, DrawerJs.plugins.BaseShape, DrawerJs.plugins));