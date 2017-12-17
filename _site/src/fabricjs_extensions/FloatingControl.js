(function (global, Util) {

    'use strict';

    var fabric = global.fabric || (global.fabric = {}),
        extend = fabric.util.object.extend;


    var ObjectFloatingControl = function(obj, iconPath, callback, options) {
        // set object
        if (!obj || !(obj instanceof fabric.Object)) {
            throw new Error('[ObjectFloatingControl()]  invalid param : obj');
        }
        this.obj = obj;

        // set iconPath
        if (!iconPath || !Util.isString(iconPath)) {
            throw new Error('[ObjectFloatingControl()]  invalid param : iconPath');
        }
        this.iconPath = iconPath;

        // set iconClickHandler
        if (!callback || !(callback instanceof Function)) {
            throw new Error('[ObjectFloatingControl()]  invalid param : callback');
        }
        this.callback = callback;

        // set options
        this.options = $.extend(true, {}, this._defaultOptions || {}, options || {});

        // by default control is enabled
        this.enabled = this.options.enabled;

        // load icon
        fabric.Image.fromURL(iconPath, this._onIconReady.bind(this));

        // set handlers on object added to / removed from canvas
        this.obj.on('added', this._onAdded.bind(this));
        this.obj.on('removed', this._onRemoved.bind(this));
    };


    ObjectFloatingControl.prototype.SMALL_ICON  = 'small';
    ObjectFloatingControl.prototype.MEDIUM_ICON = 'medium';
    ObjectFloatingControl.prototype.LARGE_ICON  = 'large';

    ObjectFloatingControl.prototype.LEFT_TOP  = 'left-top';
    ObjectFloatingControl.prototype.LEFT_BOTTOM  = 'left-bottom';
    ObjectFloatingControl.prototype.RIGHT_TOP  = 'right-top';
    ObjectFloatingControl.prototype.RIGHT_BOTTOM  = 'right-bottom';

    ObjectFloatingControl.prototype._defaultOptions = {
        defaulIconSize : 32,
        symbolicIconSizes : {
            'small'  : 16,
            'medium' : 32,
            'large'  : 48
        },
        enabled : true
    };


    ObjectFloatingControl.prototype.remove = function() {
        this._onRemoved();
    };


    ObjectFloatingControl.prototype.enable = function() {
        this.enabled = true;
    };


    ObjectFloatingControl.prototype.disable = function() {
        this.enabled = false;
    };

    /**
     * After object was added to canvas - add our click handler on canvas
     * @param  {fabric.Event} evt
     */
    ObjectFloatingControl.prototype._onAdded = function(evt) {
        // object now has canvas property set
        this.canvas = this.obj.canvas;

        // set click handlers
        this._iconClickHandlerBinded = this._iconClickHandler.bind(this);
        this.canvas.on('mouse:up', this._iconClickHandlerBinded);
        this.canvas.on('touchend', this._iconClickHandlerBinded);

        // set after:render handler
        this._bindedAfterRender = this._onAfterRender.bind(this);
        this.canvas.on('after:render', this._bindedAfterRender);
    };


    /**
     * After object was removed from canvas - remove our click handler on canvas
     * @param  {fabric.Event} evt
     */
    ObjectFloatingControl.prototype._onRemoved = function(evt) {
        this.canvas.off('mouse:up', this._iconClickHandlerBinded);
        this.canvas.off('touchend', this._iconClickHandlerBinded);
        this.canvas.off('after:render', this._bindedAfterRender);
    };


    /**
     * When image is loaded - save it as this.icon,
     * and calc it dimensions;
     *
     * @param  {fabric.Image} image
     */
    ObjectFloatingControl.prototype._onIconReady = function(image) {
        var originalSize = this.options.iconSize || this.options.defaulIconSize,
            sizeFromOptions = this.options.editIconSize,
            neededSizeAsSymbolic = typeof sizeFromOptions === 'string' && this.options.symbolicIconSizes[sizeFromOptions],
            neededSize = neededSizeAsSymbolic || sizeFromOptions || this.options.defaulIconSize,
            iconScale = neededSize / originalSize;

        this.icon = image;
        this.iconSize = originalSize;
        this.iconScale = iconScale;

        // calc the best looking offset
        this.icon.offsetFromLeft = this.options.defaulIconSize * 0.66;
        this.icon.offsetFromTop  = -this.iconSize * 0.66;

        this.icon.set({
          scaleX: iconScale,
          scaleY: iconScale,
          originX : 'center',
          originY : 'center',
          opacity: 1});
    };


    /**
     * If click on canvas is inside icon rect - launches iconClickHandler.
     *
     * @param  {fabric.Event} evt
     */
    ObjectFloatingControl.prototype._iconClickHandler = function(evt) {
        // checking for this.canvas to be sure, kinda hacky
        // checking for this.icon, as event can be fired, when icon is not ready yet
        if (!this.enabled || !this.canvas || !this.icon) {
            return;
        }

        var x, y;

        var evtCoords = this.canvas.getPointer(evt.e);

        if (evtCoords) {
          x = evtCoords.x;
          y = evtCoords.y;
        } else {
          // if no offsetX provided (case of touch events)
          if (evt.e.offsetX === undefined) {
            var drawerLeft = drawer.left();
            var drawerTop = drawer.top();

            // in case of touch event - we have no offestX, offsetY
            x = evt.e.pageX - drawerLeft;
            y = evt.e.pageY - drawerTop;
            console.log('x : ', evt.e.pageX, '-', drawerLeft, '=', x);
            console.log('y : ', evt.e.pageY, '-', drawerTop,  '=', y);
          } else {
            x = evt.e.offsetX;
            y = evt.e.offsetY;
          }
        }

        if (this._coordInsideIcon(x, y)) {
            this.callback(evt, this);
        }
    };


    /**
     * Returns true, if coord is inside icon rect
     *
     * @param  {number} x
     * @param  {number} y
     * @return {Boolean}
     */
    ObjectFloatingControl.prototype._coordInsideIcon = function (x, y) {
      var rect = (this.icon.width * this.icon.scaleX) / 2,
          coords = this._calcIconCoords(),
          insideX = (x > coords.x - rect) && (x < coords.x + rect),
          insideY = (y > coords.y - rect)  && (y < coords.y + rect),
          inside = insideX && insideY;

      return inside;
    };


    ObjectFloatingControl.prototype._onAfterRender = function (evt) {
      this.canvas.fire('canvas:zoom:lower:set');
      this._drawIcon();
      this.canvas.fire('canvas:zoom:lower:restore');
    };

    /**
     * Draws edit icon, if object is selected.
     *
     * @param  {context2D} ctx
     */
    ObjectFloatingControl.prototype._drawIcon = function () {
        if (this.enabled && this.icon && this.obj.active) {
            var coords = this._calcIconCoords();

            this.icon.left = coords.x;
            this.icon.top = coords.y;
            this.icon.render(this.canvas.getContext());
        }
    };


    /**
     * Calc icon coords based on object coords.
     * @return {Object} coords {x, y}
     */
    ObjectFloatingControl.prototype._calcIconCoords = function() {
        var realTopLeft = this.obj.getPointByOrigin('left', 'top');

        var xOffsetLocal = this.icon.offsetFromLeft * this.obj.scaleX;
        var yOffsetLocal = this.icon.offsetFromTop;

        var a = fabric.util.degreesToRadians(this.obj.angle);
        var xOffset = xOffsetLocal * Math.cos(a) - yOffsetLocal * Math.sin(a);
        var yOffset = xOffsetLocal * Math.sin(a) + yOffsetLocal * Math.cos(a);

        return {x: realTopLeft.x + xOffset, y : realTopLeft.y + yOffset};
    };

    global.ObjectFloatingControl = ObjectFloatingControl;

})(typeof exports !== 'undefined' ? exports : this,  DrawerJs.util);
