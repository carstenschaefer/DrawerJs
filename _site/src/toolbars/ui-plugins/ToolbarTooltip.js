;(function (window, $, util, utilPlugins) {
  'use strict';

  /**
   * @typeDef {Object} returnObj
   * @memberOf DrawerJs.utilPlugins.Tooltip
   * @property {DrawerJs.utilPlugins.Tooltip} instance - Instance of tooltip plugin
   * @property {jQuery} $trigger - Trigger element
   * @property {DrawerJs.utilPlugins.Tooltip#destroy} destroy - Destroy instance
   * @property {DrawerJs.utilPlugins.Tooltip#adjustPosition} adjustPosition - Refresh/change position
   * @property {DrawerJs.utilPlugins.Tooltip#hideTooltip} hideTooltip - Hide tooltip func
   * @property {DrawerJs.utilPlugins.Tooltip#showTooltip} showTooltip - Show tooltip func
   **/

  /**
   * Plugin that provide ability to create tooltip for any element. Position/styles of tooltip are configurable.
   * Can be used as jQuery plugin - $.fn.DrawerTooltip
   * @param {HTMLElement} element - trigger element
   * @param {DrawerJs.utilPlugins.Tooltip.defaultOptions} [options] - configuration object
   * @returns {DrawerJs.utilPlugins.Tooltip.returnObj}
   * @memberOf DrawerJs.utilPlugins
   * @constructs Tooltip
   */
  var Tooltip = function(element, options){
    this.$element = $(element);

    this._setupOptions(options);
    this._processOptions();
    this._setupTooltip();
    this._attachEventHandlers();

    return {
      instance: this,
      $trigger: this.$element,
      adjustPosition: this.adjustPosition.bind(this),
      destroy: this.destroy.bind(this),
      hideTooltip: this.hideTooltip.bind(this),
      showTooltip: this.showTooltip.bind(this)
    };
  };

  /**
   * @memberOf DrawerJs.utilPlugins.Tooltip
   * @typeDef {Object} defaultOptions
   * @property {String} defaultClass="editable-canvas-tooltip" - Tooltip class
   * @property {String} defaultPositionX="center" - Default horizontal position. Can be left/right/center
   * @property {String} defaultPositionY="bottom" - Default vertical position. Can be top/left/center
   * @property {String} additionalClass - Tooltip additional class
   * @property {String} text - Text of tooltip
   * @property {Object} styleObj - Any valid css object
   * @property {String} style - inline style of tooltip. Will be overrided if styleObj is defined
   * @property {String} position - Position of tooltip. Any combination of left/right/center for horizontal and
   * top/bottom/center for vertical. Valid values - "left", "right top", "bottom left", "top center", "top", etc.
   * @property {jQuery} $tooltipWrapper - Wrapper element for tooltip
   * @property {String} tooltipWrapperSelector - Selector of wrapper element for tooltip.
   * Will be overrided if $tooltipWrapper if defined.
   *
   **/

  /**
   *
   * @type {DrawerJs.utilPlugins.Tooltip.defaultOptions}
   * @private
   */
  Tooltip.prototype._defaultOptions = {
    defaultClass: 'editable-canvas-tooltip',
    defaultPositionX: 'center',
    defaultPositionY: 'bottom',
    additionalClass: '',
    text: '',
    position: '',
    style: '',
    styleObj: {},
    $tooltipWrapper: '',
    tooltipWrapperSelector: undefined
  };

  /**
   * Tooltip is enabled
   * @type {boolean}
   * @private
   */
  Tooltip.prototype.enabled = true;

  /**
   * Default tooltip wrapper
   * @type {string}
   * @private
   */
  Tooltip.prototype._defaultWrapper = 'body';

  /**
   * Namespace string for events
   * @type {string}
   * @private
   */
  Tooltip.prototype._eventsNamespace = '.drawerTooltip';

  /**
   * Indicates that tooltip is not displayed yet
   * @type {boolean}
   * @private
   */
  Tooltip.prototype._firstShow = true;


  /**
   * Setup options
   * @param {Tooltip.defaultOptions | Object} [options] - Configuration object
   * @returns {Tooltip.defaultOptions}
   * @private
   */
  Tooltip.prototype._setupOptions = function(options) {
    var optionsFromElement = this._collectOptionsFromElement();
    this.options = $.extend(true, {}, this._defaultOptions || {}, optionsFromElement || {}, options || {});
    this._initialOptions = $.extend(true, {}, options);
    this._initialOptionsFromElement = $.extend(true, {}, optionsFromElement);
    return this.options;
  };


  /**
   * Check if jQuery element exists
   * @param {jQuery} [element]
   * @returns {jQuery|undefined}
   * @private
   */
  Tooltip.prototype._checkElement = function(element) {
    var result,
        $element;
    if (typeof element === 'string') {
      $element = $(element);
    }
    if (element instanceof $) {
      $element = element;
    }
    if ($element && $element.length) {
      result = $element.eq(0);
    }
    return result;
  };
  
  /**
   * Process collected options
   * @private
   */
  Tooltip.prototype._processOptions = function() {
    var $tooltipWrapper = this._checkElement(this.options.$tooltipWrapper),
        $tooltipWrapperFromSelector = this._checkElement(this.options.tooltipWrapperSelector),
        $defaultWrapper = this._checkElement(this._defaultWrapper);

    this.$tooltipWrapper = $tooltipWrapper || $tooltipWrapperFromSelector || $defaultWrapper;
  };


  /**
   * Setup tooltip element
   * @private
   */
  Tooltip.prototype._setupTooltip = function() {
    var tooltipHtml = this._generateTemplate(),
        $tooltip = $(tooltipHtml);

    if (this.options.styleObj) {
      $tooltip.css(this.options.styleObj);
    }
    this.$element.addClass('tooltip-trigger');
    this.$element.data('DrawerTooltip', this);
    this.$tooltipWrapper.append($tooltip);
    this.$tooltip = $tooltip;
  };

  /**
   * Generate html of tooltip
   * @returns {string}
   * @private
   */
  Tooltip.prototype._generateTemplate = function () {
    var html,
        content = this.options.text || '',
        classString = this.options.defaultClass + ' ' + this.options.additionalClass,
        styleString = this.options.style || '';

    html = '' +
        '<span ' +
          'class="' + classString + '"' +
          'style="' + styleString + '"' +
        '>' +
        content +
        '</span>';

    return html;
  };

  /**
   * Setup/attach event handlers
   * @private
   */
  Tooltip.prototype._attachEventHandlers = function() {
    var self = this,
        $trigger = this.$element;
    this._detachEventHandlers();
    $trigger.on('mouseenter' + this._eventsNamespace, function (e) {
      var $eventTrigger = $(e.currentTarget),
          $body = $('body'),
          isMoving = $body.hasClass('drawer-moving'),
          isResizing = $body.hasClass('drawer-resizing'),
          tooltipIsDisabled = $trigger.hasClass('disabled'),
          ignore = isMoving || isResizing || tooltipIsDisabled;
      if (!ignore) {
        self.showTooltip($eventTrigger);
      }
    });
    $trigger.on('mouseout' + this._eventsNamespace, function () {
      self.hideTooltip();
    });
  };

  /**
   * Detach event handlers
   * @private
   */
  Tooltip.prototype._detachEventHandlers = function() {
    this.$element.off('mouseenter' + this._eventsNamespace);
    this.$element.off('mouseout' + this._eventsNamespace);
  };

  /**
   * Helper function which provides ability to parse string for position values
   * @param {String} position
   * @returns {Object}
   * @private
   */
  Tooltip.prototype._parsePositionString = function(position) {
    position = position || this.options.position || '';
    var result = {},
        haveAxisX = position.indexOf('right') !== -1 || position.indexOf('left') !== -1,
        positionX = haveAxisX && (position.indexOf('right') !== -1 ? 'right' : 'left'),
        haveAxisY = position.indexOf('top') !== -1 || position.indexOf('bottom') !== -1,
        positionY = haveAxisY && (position.indexOf('top') !== -1 ? 'top' : 'bottom');


    positionX = positionX || (haveAxisY ? 'center' : this.options.defaultPositionX);
    positionY = positionY || (haveAxisX ? 'center' : this.options.defaultPositionY);

    result.positionX = positionX;
    result.positionY = positionY;
    
    return result;
  };

  /**
   * 
   * @param onlyClasses
   * @private
   */
  Tooltip.prototype._resetTooltip = function(onlyClasses) {
    
  };
  
  /**
   * Adjust tooltip position
   * @param {String|undefined} [positionString] - Position of tooltip. Any combination of left/right/center for horizontal and
   * top/bottom/center for vertical. Valid values - "left", "right top", "bottom left", "top center", "top", etc.
   * @param {jQuery} [$trigger] - trigger element
   */
  Tooltip.prototype.adjustPosition = function(positionString, $trigger) {
    if (!this.enabled) {
      return;
    }
    $trigger = $trigger || this.$element;
    var position = this._parsePositionString(positionString),
        $tooltip = this.$tooltip;

    var top = 0;
    var left = 0;

    var arrowSize = 8,
        scroll = util.getScrollTopFromElement($trigger),
        triggerSizes = $trigger.get(0).getBoundingClientRect(),
        tooltipSizes = $tooltip.get(0).getBoundingClientRect();

    switch (position.positionX) {
      case 'right':
        left = scroll.left + triggerSizes.left + triggerSizes.width + arrowSize;
        break;
      case 'left':
        left = scroll.left + triggerSizes.left - tooltipSizes.width - arrowSize;
        break;
      default:
        left = scroll.left + triggerSizes.left + (triggerSizes.width - tooltipSizes.width)/2 ;
        break;
    }
    
    switch (position.positionY) {
      case 'top':
        top = scroll.top + triggerSizes.top - tooltipSizes.height - arrowSize;
        break;
      case 'bottom':
        top = scroll.top + triggerSizes.top + triggerSizes.height + arrowSize;
        break;
      default:
        top = scroll.top + triggerSizes.top + (triggerSizes.height - tooltipSizes.height)/2;
        break;
    }

    $tooltip.attr('positionX',position.positionX);
    $tooltip.attr('positionY',position.positionY);
    $tooltip.css({
      top: top + 'px',
      left: left + 'px'
    });
  };

  /**
   * Collect array of available options from trigger element
   * @param {jQuery} [$trigger]
   * @returns {Object}
   * @private
   */
  Tooltip.prototype._collectOptionsFromElement = function($trigger) {
    $trigger = $trigger || this.$element;
    var result = {};

    result.items = [];
      var triggerText = $trigger.text(),
          text = $trigger.attr('tooltip-text'),
          style = $trigger.attr('tooltip-style') || '',
          position = $trigger.attr('tooltip-position') || '';
    result.text = text || triggerText;
    result.style = style;
    result.position = position;
    return result;
  };

  /**
   * Destroy current instance of tooltip. Remove all elements and detach events.
   */
  Tooltip.prototype.destroy = function() {
    this._detachEventHandlers();
    this.$tooltip.remove();
    this.$element.data('DrawerTooltip', undefined);
    this.$element.removeClass('tooltip-trigger');
    this.enabled = false;
  };

  /**
   * Show tooltip
   * @param {jQuery} [$trigger] - trigger element. For correct positioning
   */
  Tooltip.prototype.showTooltip = function($trigger) {
    if (this.enabled) {
      this.$element.trigger('showTooltip');
      this._firstShow = false;
      if (!this.$tooltip.is(':visible')) {
        this.$tooltip.addClass('tooltip-transparent');
      }
      this.adjustPosition(undefined, $trigger);
      this.$tooltip.removeClass('tooltip-transparent');
      this.$tooltip.addClass('active');
      this.isVisible = true;
    }
  };

  /**
   * Hide tooltip
   */
  Tooltip.prototype.hideTooltip = function() {
    if (this.enabled && this.isVisible) {
      this.$tooltip.removeClass('active');
      this.isVisible = false;
    }
  };

  /**
   * @Function
   * @param {Object} [options]
   * @returns {Tooltip[]}
   * @memberOf external:"jQuery.fn"
   */
  $.fn.DrawerTooltip = function (options) {
    var instances = [];
    $(this).each(function (i, element) {
      var newInstance = new Tooltip(element, options);
      $(element).data('DrawerTooltip', newInstance);
      instances.push(newInstance);
    });
    return instances;
  };

  /**
   * @Function
   * @memberOf external:"jQuery.fn"
   * @returns {Tooltip|Tooltip[]}
   */
  $.fn.getDrawerTooltip = function () {
    var instances = [];
    $(this).each(function (i, element) {
      var currInstance = $(element).data('DrawerTooltip');
      if (currInstance) {
        instances.push(currInstance);
      }
    });
    return instances.length > 1 ? instances : instances[0];
  };

  utilPlugins.Tooltip = Tooltip;
})(window, jQuery, DrawerJs.util, DrawerJs.utilPlugins);