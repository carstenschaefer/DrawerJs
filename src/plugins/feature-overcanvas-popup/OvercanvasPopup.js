(function ($, pluginsNamespace, util) {
  /**
   * Provides ability to use popup over canvas
   *
   * @param {DrawerJs.Drawer} drawerInstance
   * Instance of {@link DrawerJs.Drawer}.
   *
   * @constructor
   * @memberof DrawerJs.plugins
   */
  var OvercanvasPopup = function ResizeConstructor(drawerInstance) {
    this.drawerInstance = drawerInstance;
    this.LOGTAG = this.name;

    this._attachDrawerEvents();
  };

  /**
   * Instance of Drawer
   * @type {Drawer}
   */
  OvercanvasPopup.prototype.drawerInstance = null;

  /**
   * Namespace for events
   * @const
   * @type {String}
   */
  OvercanvasPopup.prototype.namespace = 'OvercanvasPopup';

  /**
   * Name of plugin
   * @const
   * @type {String}
   */
  OvercanvasPopup.prototype.name = 'DrawerPluginOvercanvasPopup';

  /**
   * Additional class of popup-wrapper element
   * @type {String}
   */
  OvercanvasPopup.prototype.popupClass = 'popup-wrapper';
  /**
   * Default position of popup
   * @type {string}
   */
  OvercanvasPopup.prototype.defaultPosition = 'bottom';
  /**
   * Array of available positions. Note that order is necessary.
   * @type {String[]}
   */
  OvercanvasPopup.prototype.positions = ['bottom', 'left', 'right', 'top'];

  /**
   * Toolbar behavior
   * @type {string}
   */
  OvercanvasPopup.prototype.toolbarBehavior = 'overlay';

  /**
   * Attach drawer events
   * @private
   */
  OvercanvasPopup.prototype._attachDrawerEvents = function () {
    this.drawerInstance.on(this.drawerInstance.BEFORE_CREATE_TOOLBARS, this._onBeforeCreateToolbars.bind(this));
    this.drawerInstance.on(this.drawerInstance.EVENT_OVERCANVAS_POPUP_SHOW, this.showPopup.bind(this));
    this.drawerInstance.on(this.drawerInstance.EVENT_OVERCANVAS_POPUP_HIDE, this.hidePopup.bind(this));
  };

  /**
   * React on event - before toolbars create
   * @private
   */
  OvercanvasPopup.prototype._onBeforeCreateToolbars = function () {
    this._createHelperElements();
    this._attachHelperEvents();
  };

  /**
   * Add event handlers for popup and helpers elements
   * @private
   */
  OvercanvasPopup.prototype._attachHelperEvents = function () {
    var $closeBtn = this.$popup.find('.popup-close-btn'),
        $overlay = this.$popup.find('.popup-overlay'),
        $body = $('body');
    util.bindClick($closeBtn, this.namespace, this._triggerPopupHide.bind(this));
    util.bindClick($overlay, this.namespace, this._triggerPopupHide.bind(this));

    util.bindClick($body, this.namespace, this._onBodyClick.bind(this));
  };

  /**
   * Throw "hide overcanvas popup" event
   * @private
   */
  OvercanvasPopup.prototype._triggerPopupHide = function () {
    this.drawerInstance.trigger(this.drawerInstance.EVENT_OVERCANVAS_POPUP_HIDE);
  };

  /**
   * Throw "show overcanvas popup" event
   * @private
   */
  OvercanvasPopup.prototype._triggerPopupShow = function () {
    this.drawerInstance.trigger(this.drawerInstance.EVENT_OVERCANVAS_POPUP_SHOW);
  };

  /**
   * Close popup on click outside drawer
   * @param event
   * @private
   */
  OvercanvasPopup.prototype._onBodyClick = function (event) {
    if (this.popupIsVisible) {
      var $buttonExists = this.$button && this.$button.length,
          isButton = $buttonExists && (event.target === this.$button.get(0) || this.$button.find(event.target).length),
          isPopup = event.target === this.$popup.get(0) || this.$popup.find(event.target).length;
      if (!isButton && !isPopup) {
        this.drawerInstance.trigger(this.drawerInstance.EVENT_OVERCANVAS_POPUP_HIDE);
      }
    }
  };
  /**
   * Create helper elements
   * @private
   */
  OvercanvasPopup.prototype._createHelperElements = function () {
    this._removeHelperElements();

    var popupWrapperHtml = '' +
            '<div class="' + this.popupClass + ' hidden">' +
            '<div class="popup-content-wrapper">' +
              '<div class="popup-arrow"></div>' +
              '<div class="popup-content"></div>' +
            '</div>' +
            '<div class="popup-overlay"></div>' +
            '<div class="popup-close-btn">' +
            '<div class="fa fa-close"></div>' +
            '</div>' +
            '</div>';

    var $popupWrapper = $(popupWrapperHtml),
        container = this.drawerInstance.$canvasEditContainer;

    container.append($popupWrapper);

    this.drawerInstance.$popupWrapper = $popupWrapper;
    this.$popup = $popupWrapper;
    this.$arrow = $popupWrapper.find('.popup-arrow');
    this.$popupContentWrapper = $popupWrapper.find('.popup-content-wrapper');
  };

  /**
   * Remove helper elements
   * @private
   */
  OvercanvasPopup.prototype._removeHelperElements = function () {
    if (this.drawerInstance.$popupWrapper && this.drawerInstance.$popupWrapper.length) {
      this.drawerInstance.$popupWrapper.remove();
    }
    var $popupElement = this.drawerInstance.$canvasEditContainer.find('.' + this.popupClass);
    if ($popupElement && $popupElement.length) {
      $popupElement.remove();
    }
    this.drawerInstance.$popupWrapper = undefined;
    this.$popup = undefined;
  };

  /**
   * Refresh size values
   * @param {jQuery} $trigger - Trigger element
   * @returns {Object|undefined}
   * @private
   */
  OvercanvasPopup.prototype._getAvailableSpace = function ($trigger) {
    var result;
    if ($trigger && $trigger.length) {
      var $canvas = this.drawerInstance.$canvasEditContainer,
          canvasSizes = $canvas.get(0).getBoundingClientRect(),
          triggerSizes = $trigger.get(0).getBoundingClientRect(),
          popupSizes = this.$popupContentWrapper.get(0).getBoundingClientRect(),
          // arrowSize = this.$arrow.width(),
          arrowSize = 10,
          triggerOffsetX = triggerSizes.left - canvasSizes.left,
          triggerOffsetY = triggerSizes.top - canvasSizes.top;
      result = {};

      result.top = triggerOffsetY;
      result.left = triggerOffsetX;
      result.right = canvasSizes.width - triggerOffsetX - triggerSizes.width;
      result.bottom = canvasSizes.height - triggerOffsetY - triggerSizes.height;

      result.centerX = triggerOffsetX + triggerSizes.width/2;
      result.centerY = triggerOffsetY + triggerSizes.height/2;

      result.popup = {
        arrowSize: arrowSize,
        top: popupSizes.height,
        bottom: popupSizes.height,
        left: popupSizes.width,
        right: popupSizes.width
      };

      result.popupSizes = popupSizes;
      result.canvasSizes = canvasSizes;
      result.triggerSizes = triggerSizes;
    }
    this.sizes = result;
    return result;
  };

  /**
   * Move popup to position
   * @param {String} position - Position of popup - top/bottom/left/right
   * @private
   */
  OvercanvasPopup.prototype._movePopup = function (position) {
    var sizes = this.sizes,
        isVerticalAlign,
        styles = {},
        offsetLeft,
        offsetTop,
        arrowOffsetLeft = sizes.popupSizes.width/2,
        arrowOffsetTop = sizes.popupSizes.height/2,
        negativeDiff;

    switch (position) {
      case 'left':
        offsetLeft = sizes.left - sizes.popupSizes.width - sizes.popup.arrowSize;
        offsetTop = sizes.centerY - sizes.popupSizes.height/2;
        break;
      case 'right':
        offsetLeft = sizes.canvasSizes.width - sizes.right + sizes.popup.arrowSize;
        offsetTop = sizes.centerY - sizes.popupSizes.height/2;
        break;
      case 'top':
        isVerticalAlign = true;
        offsetLeft = sizes.centerX - sizes.popupSizes.width/2;
        offsetTop = sizes.top - sizes.popupSizes.height - sizes.popup.arrowSize;
        break;
      case 'bottom':
        isVerticalAlign = true;
        offsetLeft = sizes.centerX - sizes.popupSizes.width/2;
        offsetTop = sizes.canvasSizes.height - sizes.bottom + sizes.popup.arrowSize;
        break;
    }

    if (isVerticalAlign) {
      styles.top = offsetTop;
      negativeDiff = (offsetLeft + sizes.popupSizes.width ) - sizes.canvasSizes.width;
      if (negativeDiff > 0) {
        arrowOffsetLeft += negativeDiff;
        styles.right = 0;
      } else {
        if (offsetLeft < 0) {
          arrowOffsetLeft += offsetLeft;
          offsetLeft = 0;
        }
        styles.left = offsetLeft;
      }
    } else {
      styles.left = offsetLeft;
      negativeDiff = (offsetTop + sizes.popupSizes.height) - sizes.canvasSizes.height;
      if (negativeDiff > 0) {
        arrowOffsetTop += negativeDiff;
        styles.bottom = 0;
      } else {
        if (offsetTop < 0) {
          arrowOffsetTop += offsetTop;
          offsetTop = 0;
        }
        styles.top = offsetTop;
      }
    }

    this.$popupContentWrapper.attr('data-position',position);
    this.$popupContentWrapper.removeAttr('style');
    this.$popupContentWrapper.css(styles);
    this._moveArrow(arrowOffsetLeft, arrowOffsetTop);
  };


  /**
   * Move helper element - arrow
   * @param {Number} left - Absolute position in px
   * @param {Number} top - Absolute position in px
   * @private
   */
  OvercanvasPopup.prototype._moveArrow = function (left, top) {
    this.$arrow.css({
      left: left,
      top: top
    });
  };

  /**
   * Adjust position of popup according of trigger element
   * @param {jQuery} $element
   */
  OvercanvasPopup.prototype._adjustPosition = function ($element) {
    var sizes = this._getAvailableSpace($element),
        positionFound;
    this.positions.forEach(function (position, i) {
      var positionExists = sizes[position] && sizes.popup[position];
      if (!positionFound && positionExists) {
        var neededSpace = sizes.popup[position] + sizes.popup.arrowSize,
            spaceIsEnough = (sizes[position] - neededSpace) > 0;
        positionFound = spaceIsEnough && position;
      }
    });
    if (positionFound) {
      this._movePopup(positionFound);
    }
  };

  /**
   * Show popup
   * @param {fabric.Event} [fEvent]
   * @param {jQuery} $trigger
   */
  OvercanvasPopup.prototype.showPopup = function (fEvent, $trigger) {
    this.popupIsVisible = true;
    this.$popup.removeClass('hidden');
    this._adjustPosition($trigger);
    this.$popupContentWrapper.removeClass('popup-transparent');
    this.drawerInstance.trigger(this.drawerInstance.EVENT_TOOLBAR_CHANGE_STATE, [{
      excludeElements: $().add(this.$popup).add($trigger),
      turnOn: true,
      state: this.toolbarBehavior
    }]);
  };

  /**
   * Hide popup
   */
  OvercanvasPopup.prototype.hidePopup = function () {
    this.drawerInstance.trigger(this.drawerInstance.EVENT_TOOLBAR_CLEAR_STATE);
    this.popupIsVisible = false;
    this.$popup.addClass('hidden');
    this.$popupContentWrapper.addClass('popup-transparent');
  };

  pluginsNamespace.OvercanvasPopup = OvercanvasPopup;
}(jQuery, DrawerJs.plugins, DrawerJs.util));