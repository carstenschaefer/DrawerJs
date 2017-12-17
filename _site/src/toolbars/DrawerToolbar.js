/**
 * List of all available options for each mode of each toolbar
 * @typedef {Object} defaultSetOfOptions
 * @memberOf DrawerToolbar
 * @property {Boolean} [hidden=false] - Toolbar is hidden (via CSS)
 * @property {String} [position="top"] - Position of the toolbar relative to the Drawer - top/right/left/bottom/custom
 * @property {Boolean} [toggleVisibilityButton=false] - Use "Toggle visibility" button. Will be ignored if compact type = 'popup'
 * @property {String} [positionType="outside"] - Position type - inside/outside canvas
 * @property {String} [compactType="multiple"] - Compact type - scrollable/multiple/popup
 * @property {String} [customAnchorSelector] - Anchor selector for custom position
 */

var emptyFunc = function() {};

/**
 * Default configuration object of toolbar
 * @typedef {DrawerToolbar.defaultSetOfOptions} defaultToolbarOptions
 * @memberOf DrawerToolbar
 * @property {DrawerToolbar.defaultSetOfOptions} fullscreenMode - Options for fullscreen mode. Able to use same
 * options as for normal mode. Undefined options will be inherited from normal mode
 */

/**
 * Configuration object of button.
 * @typedef {Object} DrawerToolbar.buttonConfig
 * @property {String} [additionalClass] add specified class to button's <li> element.
 * @property {String} [iconClass] add specified class to button's <i> element.
 * @property {String} [tooltipText] Tooltip text that will be shown on mouse over.
 * @property {Number} [buttonOrder=10] Order priority of button. Button with min order value will be first.
 * @property {Boolean} [isSubMenu=false] Button is submenu of other button
 * @property {Function} [clickHandler] function that will be invoked when user clicks on this button.
 * @property {Object} [group]  Group object with group class name and tooltip text
 * @property {String} [group.name]  Group unique id
 * @property {String} [group.tooltip]  A tooltip text that will be shown on mouse over
 */

/**
 * Toolbar with tools like brush/rectangle/text etc.
 * @param {DrawerJs.Drawer} drawerInstance - Drawer instance
 * @param {DrawerToolbar.defaultSetOfOptions} [options] Configuration object
 * @constructor DrawerToolbar
 */
var DrawerToolbar = function (drawerInstance, options) {
  if (!drawerInstance) {
    throw new Error("DrawerToolbar c-tor : drawerInstance is not set!");
  }
  this.drawerInstance = drawerInstance;
  this.buttonsGroups = {};

  this._setupOptions(options);
  this._setupElement();
  this._attachEventHandlers();
  this._attachDrawerEventHandlers();
  this._initCompactType();
};

DrawerToolbar.prototype.MULTILINE = 'multiline';
DrawerToolbar.prototype.SCROLLABLE = 'scrollable';
DrawerToolbar.prototype.POPUP = 'popup';

DrawerToolbar.prototype.POSITION_TYPE_OUTSIDE = 'outside';
DrawerToolbar.prototype.POSITION_TYPE_INSIDE = 'inside';

/**
 * Toolbar position - one of [left, top, right, bottom, custom]
 * @type {string}
 */
DrawerToolbar.prototype.position = 'top';
// button groups
DrawerToolbar.prototype.buttonsGroups = {};
DrawerToolbar.prototype.buttons = [];

DrawerToolbar.prototype._defaultOptions = {
    compactType : DrawerToolbar.prototype.MULTILINE,
    positionType: DrawerToolbar.prototype.POSITION_TYPE_OUTSIDE,
    buttonWidth : 32,
    buttonHeight : 35
};

/**
 * Default values of button config
 * @type {DrawerToolbar.buttonConfig}
 * @private
 */
DrawerToolbar.prototype._defaultButtonConfig = {
  additionalClass: '',
  iconClass: '',
  tooltipText: '',
  buttonOrder: 10,
  isSubMenu: false,
  group: {
    name: '',
    tooltip: ''
  },
  clickHandler: emptyFunc
};

/**
 * Setup options
 * @param {Object} [options] - Configuration object
 * @private
 */
DrawerToolbar.prototype._setupOptions = function (options) {
  this.options = $.extend(true, {}, this._defaultOptions || {}, options || {});
};

/**
 * Create/setup toolbar element
 * @private
 */
DrawerToolbar.prototype._setupElement = function () {
  var toolbarHtml = this._generateTemplate(),
      $toolbar = $(toolbarHtml);
  this.$toolbar = $toolbar;
  this.$toolbarContentHolder = this.$toolbar.find('.toolbar-content-wrapper');
};

/**
 * Get html of toolbar element
 * @returns {String}
 * @private
 */
DrawerToolbar.prototype._generateTemplate = function () {
  var html,
      wrapperClasses = 'editable-canvas-toolbar ' +
          (this.options.toolbarClass || '') +
          (this.options.hidden ? ' hidden ' : '');

  html = '' +
      '<ul class="' + wrapperClasses + '" ' +
        'contenteditable="false"' +
        // 'tabindex="-1"' +
      '>' +
          '<ul class="toolbar-content-wrapper"></ul>' +
      '</ul>';
  return html;
};

/**
 * Setup events
 * @private
 */
DrawerToolbar.prototype._attachEventHandlers = function () {

};

/**
 * Setup drawer events
 * @private
 */
DrawerToolbar.prototype._attachDrawerEventHandlers = function () {
  var self = this;
  // always hide group dropdown when any tool activates
  this.drawerInstance.on(this.drawerInstance.EVENT_DO_ACTIVATE_TOOL, function () {
    // self.$toolbar.find('ul.group-items-container').addClass('hidden');
    // @todo: hide all open sub-menus
    self.hideActiveSubmenu();
  });
};

/**
 * Process "compactType" option
 * @private
 */
DrawerToolbar.prototype._initCompactType = function () {
  switch (true) {
    case (this.options.compactType === DrawerToolbar.prototype.SCROLLABLE):
      this._initCompactType_scrollable();
      break;
    case (this.options.compactType === DrawerToolbar.prototype.MULTILINE):
      this._initCompactType_multiline();
      break;
    case (this.options.compactType === DrawerToolbar.prototype.POPUP):
      this._initCompactType_popup();
      break;
    default:
      this._initCompactType_multiline();
      break;
  }
};

/**
 * Init 'scrollable' compact type
 * @private
 */
DrawerToolbar.prototype._initCompactType_scrollable = function () {
  this.isScrollable = true;
  this.scrollModeActive = false;
  this.currentScrollOffset = 0;

  this.$toolbar.addClass('toolbar-scrollable');
  this._addScrollButtons();

  // look, if show scroll UI on drawer resize and edit start

  this.drawerInstance.on(this.drawerInstance.EVENT_CANVAS_START_RESIZE, this._onCanvasResizeStart.bind(this));
  this.drawerInstance.on(this.drawerInstance.EVENT_CANVAS_RESIZING, this._onCanvasResizing.bind(this));
  this.drawerInstance.on(this.drawerInstance.EVENT_CANVAS_STOP_RESIZE, this._onCanvasResizeFinish.bind(this));
  this.drawerInstance.on(this.drawerInstance.EVENT_EDIT_START, this.checkScroll.bind(this));

  // handle scrolling by swipe
  this.$toolbar.on('mousedown.toolbar touchstart.toolbar', this.onTouchStart.bind(this));
};

/**
 * Init 'multiline' compact type
 * @private
 */
DrawerToolbar.prototype._initCompactType_multiline = function () {
  this.$toolbar.addClass('toolbar-multiline');
};

/**
 * Init 'popup' compact type
 * @private
 */
DrawerToolbar.prototype._initCompactType_popup = function () {
  this._initCompactType_multiline();
};


/**
 * Removes toolbar element.
 * @fires DrawerJs.Drawer.EVENT_TOOLBAR_DESTROYED
 */
DrawerToolbar.prototype.remove = function () {
    this.$toolbar.remove();
    this.buttonsGroups = {};
    this.drawerInstance.trigger(this.drawerInstance.EVENT_TOOLBAR_DESTROYED, [this]);
};


/**
 * Adds control to toolbar.
 * @param {jQuery|HTMLElement} control
 * @param buttonOrder
 */
DrawerToolbar.prototype.addControl = function (control, buttonOrder) {
  buttonOrder = buttonOrder !== undefined ? buttonOrder : this._defaultButtonConfig.buttonOrder;
  var orderString = this._getOrderString(buttonOrder),
      currStyleAttr = control.attr('style');
  control.attr('style', (currStyleAttr || '') + ';' + orderString);
  this.$toolbarContentHolder.append(control);
};


/**
 * Add a button to this toolbar.
 * @param {DrawerToolbar.buttonConfig} options Button configuration object
 */
DrawerToolbar.prototype.addButton = function (options) {
  options = this._validateButtonConfig(options);
  var $button = this.createButton(options);

  this.buttons.push($button);

  // add button and create tooltip
  this.$toolbarContentHolder.append($button);

  // toolbar grew bigger, so call check for scroll
  this.checkScroll();

  return $button;
};

/**
 * Add a button to this toolbar. Button will be appended to group.
 * Group is a one button which will show dropdown with its buttons on click.
 *
 * @param {DrawerToolbar.buttonConfig} options Button configuration object
 */
DrawerToolbar.prototype.addButtonToGroup = function (options) {
  options = this._validateButtonConfig(options);
  var $groupContainer = this.buttonsGroups[options.group.name],
      groupElementIsExist = $groupContainer && $groupContainer.length,
      needToCreateGroup = !groupElementIsExist;

  // create group. if no group exists
  if (needToCreateGroup) {
    this._createAndAppendGroup(options.group, options.iconClass,options.buttonOrder);
    $groupContainer = this.buttonsGroups[options.group.name];
  }

  // create button
  options.isSubMenu = true;
  var $button = this.createButton(options);

  // and append to toolbar
  $groupContainer.$submenuWrapper.buttons.push($button);
  $groupContainer.find('.group-items-container').append($button);

  return $button;
};

/**
 * Check values of button config object
 * @param {DrawerToolbar.buttonConfig} options - button configuration
 * @returns {DrawerToolbar.buttonConfig}
 */
DrawerToolbar.prototype._validateButtonConfig = function (options) {
  options = options || {};
  var defaultConf = $.extend(true, {}, this._defaultButtonConfig),
      result = $.extend(true, {}, defaultConf, options);

  result.buttonOrder = typeof result.buttonOrder === 'number' ? result.buttonOrder : defaultConf.buttonOrder;
  result.isSubMenu = result.isSubMenu !== undefined ? result.isSubMenu : defaultConf.isSubMenu;
  result.clickHandler = typeof result.clickHandler === 'function' ? result.clickHandler : defaultConf.clickHandler;
  return result;
};

DrawerToolbar.prototype._getOrderString = function (orderValue) {
  var orderString = '' +
      '-webkit-order:' + orderValue + ';' +
      '-ms-flex-order:' + orderValue + ';' +
      'order:' + orderValue + ';';
  return orderString;
};

/**
 * Creates jQuery object with button element markup.
 *
 * @param {DrawerToolbar.buttonConfig} options - button configuration
 * @returns {jQuery}
 */
DrawerToolbar.prototype.createButton = function (options) {
  var orderString = this._getOrderString(options.buttonOrder),
      styleString = 'style="' + orderString + '"';
  // button html
  var $button,
      submenuClass = options.isSubMenu ? ' submenu-child ' : ' ',
      classString = 'toolbar-button ' + options.additionalClass + submenuClass,
      buttonHtml = '' +
    '<li ' +
          'class="' + classString + '"' +
          'data-tooltip-class="'+options.additionalClass+'"' +
        styleString +
    '>' +
      '<a href="#" ' +
          'class="toolbar-button-icon ' + submenuClass + '"' +
        'data-editable-canvas-sizeable="toolbar-button" ' +
        'data-editable-canvas-cssrules="line-height,font-size:($v / 2.5)" tabindex="-1"' +
      '>' +
          '<i class="fa ' + options.iconClass + ' ' + submenuClass + '"></i>' +
      '</a>' +
    '</li>';
  $button = $(buttonHtml);

  var tooltipOptions = {
    additionalClass: options.additionalClass,
    text: options.tooltipText,
    position: 'bottom'
  };
  $button.tooltip = this.drawerInstance.trigger(this.drawerInstance.EVENT_CREATE_TOOLTIP, [$button.find('a'), tooltipOptions]);

  // prevent default behavior on link click
  var $link = $button.find('a');
  $link.on('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
  });

  // set click handler
  DrawerJs.util.bindClick($link, 'editable-canvas-toolbar-button', options.clickHandler);
  return $button;
};


/**
 * Remove button and attached handlers
 * @param {jQuery} $button - Button element
 */
DrawerToolbar.prototype.removeButton = function ($button) {
  if (!$button) {
    console.warn("DrawerToolbar.removeButton() : no $button is provided!");
    return;
  }
  // unbind click handler
  DrawerJs.util.unbindClick($button.find('a'), 'editable-canvas-toolbar-button');
  // remove element
  $button.remove();

};

/**
 * Creates group button with empty list of tools, and appends it to toolbar
 *
 * @param {Object} group - group data object
 * @param {string} group.name - name of group
 * @param {string} iconClass  - css icon class of group button
 * @param {Number} buttonOrder  - button order value
 * @private
 */
DrawerToolbar.prototype._createAndAppendGroup = function(group, iconClass, buttonOrder) {
  // group container html
  var orderString = this._getOrderString(buttonOrder),
      styleString = 'style="' + orderString + '"';
  var $groupContainer = $(
      '<li class="toolbar-button btn-group group-' + group.name + '"' +
          'data-editable-canvas-sizeable="toolbar-button" ' +
          'data-editable-canvas-cssrules="width,height"' +
          styleString +
      '>' +
          '<a href="#" ' +
              'class="toolbar-button-icon"'+
              'data-editable-canvas-sizeable="toolbar-button" ' +
              'data-editable-canvas-cssrules="line-height,font-size:($v / 2.5)" ' +
              'tabindex="-1"' +
          '>' +
              '<i class="fa ' + iconClass + '"></i>' +
        '</a>' +
        '<div class="submenu-wrapper">' +
            '<ul class="group-items-container submenu-child toolbar-dropdown-block">' +
            '</ul>' +
        '</div>' +
      '</li>');

  $groupContainer.$submenuWrapper = $groupContainer.find('.submenu-wrapper');
  $groupContainer.$submenuWrapper.buttons = [];

  // add group container to toolbar
  this.$toolbarContentHolder.append($groupContainer);
  this.buttonsGroups[group.name] = $groupContainer;

  // prevent default action on link click - moving to anchor
  $groupContainer.find('a').on('click',  function(e) {
      e.preventDefault();
  });
  // react on click
  $groupContainer.on('click', this.onGroupButtonClick.bind(this, $groupContainer));

  // create tooltip to group

  var tooltipOptions = {
    additionalClass: group.name,
    text: group.tooltip,
    position: 'bottom'
  };
  this.drawerInstance.trigger(this.drawerInstance.EVENT_CREATE_TOOLTIP, [$groupContainer.children('a'), tooltipOptions]);
};

/**
 * Set active button
 * @param {String} buttonClassName
 */
DrawerToolbar.prototype.setActiveButton = function (buttonClassName) {
  var $button = this.$toolbar.find('.toolbar-button.' + buttonClassName),
      $buttonIcon = $button.find('.toolbar-button-icon');
  $buttonIcon.addClass('active');
};

/**
 * Remove active state for all buttons
 */
DrawerToolbar.prototype.clearActiveButton = function () {
  var $activeButton = this.$toolbar.find('.toolbar-button .toolbar-button-icon.active');
  $activeButton.removeClass('active');
};


/**
 * React on group button click
 * @param {jQuery} $groupButtton - Group container
 * @param {Event} evt
 * @private
 */
DrawerToolbar.prototype.onGroupButtonClick = function($groupButtton, evt) {
  // copy submenu, including handlers
  this.activeSubmenu = $groupButtton.$submenuWrapper.clone(true);
  // var $submenu = $submenuSrc.clone(true);

  // position our submenu below button
  var $btn = $(evt.currentTarget);

  // button position relative to toolbar placeholder =
  // button position relative to toolbarContentWrapper - toolbarOffset +
  // toolbar padding
  if (this.isHorizontal()) {
      var paddingLeft = parseInt(this.$toolbar.css('padding-left'));
      var left = $btn.position().left - this.currentScrollOffset + paddingLeft;
      this.activeSubmenu.css('left', left + 'px');
  } else {
      var paddingTop = parseInt(this.$toolbar.css('padding-top'));
      var top = $btn.position().top - this.currentScrollOffset + paddingTop;
      this.activeSubmenu.css('top', top + 'px');
  }

  // append to toolbar before positioning, so this.activeSubmenu has width and height for further calculations
  this.$toolbar.parent().append(this.activeSubmenu);

  // offset of submenu relative to toolbar placeholder
  var submenuOffset = 0;
  switch (this.position) {
    case 'custom' :
    case 'top' :
    // position submenu below of the toolbar
        submenuOffset = this.$toolbar[0].offsetTop + this.$toolbar.height();
        this.activeSubmenu.css('top', submenuOffset + 'px');
    break;
    case 'left' :
    // position submenu to the right of toolbar
        submenuOffset = this.$toolbar[0].offsetLeft + this.$toolbar.width();
        this.activeSubmenu.css('left', submenuOffset + 'px');
    break;
    case 'right' :
    // position submenu to the left of toolbar
        submenuOffset = this.$toolbar[0].offsetLeft - this.$toolbar.width();
        this.activeSubmenu.css('left', submenuOffset + 'px');
    break;
    case 'bottom' :
    // position submenu above of toolbar
        submenuOffset = this.$toolbar[0].offsetTop - this.activeSubmenu.height();
        this.activeSubmenu.css('top', submenuOffset + 'px');
    break;
  }

  $('body').on('mousedown.submenu', this.onSubmenuMouseDown.bind(this));

};

/**
 * React on submenu click
 * @param {Event} evt
 * @private
 */
DrawerToolbar.prototype.onSubmenuMouseDown = function(evt) {
    if (!this.activeSubmenu)
        return;
    if (evt.target == this.activeSubmenu || $(evt.target).hasClass('submenu-child') )
        return;

    this.hideActiveSubmenu();
};

/**
 * Hide active submenu
 */
DrawerToolbar.prototype.hideActiveSubmenu = function() {
    if (this.activeSubmenu) {
        // hide all tooltips
        this.drawerInstance.trigger(this.drawerInstance.EVENT_HIDE_TOOLTIPS);

        this.activeSubmenu.remove();
        this.activeSubmenu = null;
        $('body').off('mousedown.submenu');

    }
};

// DrawerToolbar.prototype.onGroupButtonClick = function(evt, button) {

// };

/**
 * Makes tool button with css class buttonClass as active.
 * This is achieved by making group button copy of the tool button.
 *
 * @param groupName
 * @param buttonClass
 * @private
 */
DrawerToolbar.prototype._setGroupButtonActive = function (groupName, buttonClass) {
  // find group and button
  var $groupContainer = this.buttonsGroups[groupName];
  var $button = this.$toolbar.find('.' + buttonClass);

  // set $groupContainer css class same as $button class
  $groupContainer.attr('class', $button.attr('class'));
  $groupContainer.addClass('btn-group');

  var groupButton = $groupContainer.children('a');
  // make $button.a active
  groupButton.addClass('active');
  // copy $button.a html to $groupContainer.a
  groupButton.html($button.children('a').html());
};


/**
 * Setup/add scroll buttons
 * @private
 */
DrawerToolbar.prototype._addScrollButtons = function() {
  // aux function
  var _getBtnHtml = function(btnClass) {
    return '<li class="toolbar-button ' + btnClass + '">' +
                '<a href="#" ' +
                  'data-editable-canvas-sizeable="toolbar-button" ' +
                  'data-editable-canvas-cssrules="line-height,font-size:($v / 2.5)" tabindex="-1"' +
                '>' +
                   '<i class="fa"></i>' +
               '</a>' +
            '</li>';
  };

  // buttons html
  this.$scrollToBeginBtn = $(_getBtnHtml('scroll-to-begin-btn'));
  this.$scrollToEndBtn   = $(_getBtnHtml('scroll-to-end-btn'));

  // prevent default behavior on link click
  var $linkToBegin = this.$scrollToBeginBtn.find('a');
  var $linkToEnd = this.$scrollToEndBtn.find('a');
  $linkToBegin.on('click', function (e) {
      e.preventDefault();
      // e.stopPropagation();
  });
  $linkToEnd.on('click', function (e) {
      e.preventDefault();
      // e.stopPropagation();
  });

  // set click handlers
  DrawerJs.util.bindClick($linkToBegin, 'scroll-to-begin-btn', this.onScrollToBegin.bind(this));
  DrawerJs.util.bindClick($linkToEnd, 'scroll-to-end-btn', this.onScrollToEnd.bind(this));

  // scroll buttons are added direct;y to toolbar,
  // unlike common buttons, which are added to $toolbarContentHolder
  this.$toolbar.append(this.$scrollToBeginBtn);
  this.$toolbar.append(this.$scrollToEndBtn);
};


/**
 * React on touch start
 * @param {Event} evt
 * @private
 */
DrawerToolbar.prototype.onTouchStart = function(evt) {
    if (!this.scrollModeActive)
        return;

    this.mouseDown = true;

    // handling touch events
    var e = (evt.type == 'touchstart') ?  evt.originalEvent.touches[0] : evt;
    // get coord we are interested in
    var curCoord = this.isHorizontal() ? e.pageX : e.pageY;

    // touch start coord plus existing offset
    this.touchStartCoord = curCoord + this.currentScrollOffset;

    console.log('TOUCH START', this.touchStartCoord, evt);

    $('body').on('mouseup.toolbar touchend.toolbar', this.onTouchEnd.bind(this));

    this.$toolbar.on('mousemove.toolbar touchmove.toolbar', this.onTouchMove.bind(this));
};

/**
 * React on touch end
 * @param {Event} evt
 * @private
 */
DrawerToolbar.prototype.onTouchEnd = function(evt) {
    console.log('TOUCH END', evt);
    this.mouseDown = false;
    $('body').off('mousemove.toolbar touchmove.toolbar');
    $('body').off('mouseup.toolbar touchend.toolbar');
};

/**
 * React on touch move
 * @param {Event} evt
 * @private
 */
DrawerToolbar.prototype.onTouchMove = function(evt) {
  if (this.mouseDown) {
    var eventTarget = evt.target,
        $eventTarget = $(eventTarget),
        isInput = $eventTarget.is('input'),
        isColorIndicator = $eventTarget.is('.color-indicator'),
        processEvent = !isInput && !isColorIndicator;

    if (processEvent) {
      // prevent default action - copying of toolbar content
      evt.preventDefault();

      // handling touch events
      var e = (evt.type === 'touchmove') ?  evt.originalEvent.touches[0] : evt;

      // get coord we are interested in
      var curCoord = this.isHorizontal() ? e.pageX : e.pageY;

      var delta = this.touchStartCoord - curCoord;
      console.log('TOUCH MOVE', curCoord, delta);

      this.scrollTo(delta);
    }
  }
};

/**
 * React on canvas resize start
 * @private
 */
DrawerToolbar.prototype._onCanvasResizeStart = function() {
  this.checkScroll();
};

/**
 * React on canvas resizing
 * @private
 */
DrawerToolbar.prototype._onCanvasResizing = function() {
  this.checkScroll();
};

/**
 * React on canvas resize finish
 * @private
 */
DrawerToolbar.prototype._onCanvasResizeFinish = function() {
  this.checkScroll();
};

/**
 *  Compares sizes of toolbar and its placeholder,
 *  if toolbar is bigger - shows scroll
 */
DrawerToolbar.prototype.checkScroll = function() {
    var toolbarContentHolder = this.$toolbarContentHolder.get(0),
        contentSize = this.isHorizontal() ? toolbarContentHolder.scrollWidth : toolbarContentHolder.scrollHeight;

    var toolbarSize = this.isHorizontal() ? this.$toolbar.width()
                                          : this.$toolbar.height();

    if (contentSize > toolbarSize) {
        this.scrollModeActive = true;
        this.$toolbar.addClass('show-scroll');
    } else {
        this.scrollModeActive = false;
        this.$toolbar.removeClass('show-scroll');
        this.scrollTo(0);
    }
};


DrawerToolbar.prototype._getCurrOffsetProps = function () {
  var result = {},
      $element,
      isHorizontal = this.isHorizontal(),
      currentScrollOffset = this.currentScrollOffset,
      $contentWrapper = this.$toolbar.find('.toolbar-content-wrapper'),
      contentWrapperSizes = $contentWrapper.get(0).getBoundingClientRect(),
      $elementsToCheck = $contentWrapper.children(),
      minOffset,
      relativeOffset;

  $elementsToCheck.each(function (i, currElement) {
    var $currElement = $(currElement),
        currElSizes = currElement.getBoundingClientRect(),
        currElOffsetAbsolute = isHorizontal ? currElSizes.left - contentWrapperSizes.left : currElSizes.top - contentWrapperSizes.top,
        currElOffset = Math.abs(currElOffsetAbsolute - currentScrollOffset),
        currElIsVisible = $currElement.is(':visible'),
        currElIsCloser = minOffset > currElOffset,
        currElIsMatched = currElIsVisible && (minOffset === undefined || currElIsCloser);

    if (currElIsMatched) {
      minOffset = currElOffset;

      result.relativeOffset = currElOffsetAbsolute - currentScrollOffset;
      result.$element = $currElement;
      result.sizes = currElSizes;
    }
  });
  return result;
};

DrawerToolbar.prototype._getOffsetStep_Custom = function (toBegin) {
  var result = 0,
      isHorizontal = this.isHorizontal(),
      toolbarSize = isHorizontal ? this.$toolbar.width() : this.$toolbar.height(),
      buttonSize = isHorizontal ? this.options.buttonWidth : this.options.buttonHeight,
      maxOffsetVal = toolbarSize - buttonSize*2;

  var offsetProps = this._getCurrOffsetProps(),
      $currentStartOffsetEl = offsetProps.$element,
      needMoreOffset = true,
      $el,
      $nextEl,
      prevSizes,
      currSizes,
      delta;

  result = offsetProps.relativeOffset;



    var startElSizes = $currentStartOffsetEl.get(0).getBoundingClientRect();
    $el = $currentStartOffsetEl;

    while (needMoreOffset) {
      $nextEl = toBegin ? $el.prev() : $el.next();
      if ($nextEl.length && (Math.abs(result) < maxOffsetVal)) {
        var isVisible = $nextEl.is(':visible');
        if (isVisible) {
          currSizes = $nextEl.get(0).getBoundingClientRect();
          delta = isHorizontal ? currSizes.left - startElSizes.left :currSizes.top - startElSizes.top;

          if (delta > 0) {
            delta += 3;
          } else {
            delta -= 3;
          }
          result += delta;
          needMoreOffset = false;
        }
      } else {
        needMoreOffset = false;
      }
      $el = $nextEl;
    }
  // result += buttonSize;
  return result;
};

DrawerToolbar.prototype._getOffsetStep_Buttons = function() {
  var offset,
      toolbarLength = this.isHorizontal() ? this.$toolbar.width() : this.$toolbar.height(),
      btnLength     = this.isHorizontal() ? this.options.buttonWidth : this.options.buttonHeight,
      buttonsPerToolbar = Math.ceil(toolbarLength / btnLength),
      buttonsToScroll = Math.max(buttonsPerToolbar - 1, 1);
  offset = buttonsToScroll * btnLength;
  return offset;
};

/**
 * Do scroll to begin
 */
DrawerToolbar.prototype.onScrollToBegin = function () {
  var offset,
      offsetDelta;
  if (this.customScrollMode) {
    offset = this._getOffsetStep_Custom(true);
  } else {
    offsetDelta = this._getOffsetStep_Buttons();
    offset = -offsetDelta;
  }
  this.scrollToolbarBy(offset);
};

/**
 * Do scroll to end
 */
DrawerToolbar.prototype.onScrollToEnd = function() {
  var offset,
      offsetDelta;
  if (this.customScrollMode) {
    offset = this._getOffsetStep_Custom();
  } else {
    offsetDelta = this._getOffsetStep_Buttons();
    offset = offsetDelta;
  }
  this.scrollToolbarBy(offset);
};


/**
 * Scrolls toolbar  by offset in directions - to the end(offset>0)/ to the beginning (offset<0).
 * If offset is to big, it is set to max possible.
 * @param offset
 */
DrawerToolbar.prototype.scrollToolbarBy = function (offset) {
  var newOffset = this.currentScrollOffset + parseInt(offset),
      toolbarEl = this.$toolbar.get(0),
      isHorizontal = this.isHorizontal(),
      toolbarSize = isHorizontal ? this.$toolbar.width() : this.$toolbar.height(),
      toolbarContentSize = isHorizontal ? toolbarEl.scrollWidth : toolbarEl.scrollHeight,
      btnSize = isHorizontal ? this.options.buttonWidth : this.options.buttonHeight,
      maxOffset = toolbarContentSize - btnSize;

  newOffset = Math.min(newOffset, maxOffset); // see, if offset not exceeds maximum
  newOffset = Math.max(newOffset, 0); // no negative offset check
  // scroll it
  this.scrollTo(newOffset);
};

/**
 * Toggle toolbar visibility
 * @param {Boolean} [saveCurrentState]
 * @param {Boolean} [useSaved]
 */
DrawerToolbar.prototype.toggleToolbarVisibility = function (saveCurrentState, useSaved) {
  var currentState = !this.$toolbar.hasClass('hidden'),
      showToolbar = useSaved ? this.visibilityState : currentState;

  if (showToolbar) {
    this.showToolbar(saveCurrentState);
  } else {
    this.hideToolbar(saveCurrentState);
  }
};

/**
 * Hide toolbar
 * @param {Boolean} [saveCurrentState]
 */
DrawerToolbar.prototype.hideToolbar = function (saveCurrentState) {
  if (saveCurrentState) {
    this.visibilityState = !this.$toolbar.hasClass('hidden');
  }
  this.invisible = true;
  this.$toolbar.addClass('hidden');
};

/**
 * Show toolbar
 * @param {Boolean} [saveCurrentState]
 */
DrawerToolbar.prototype.showToolbar = function (saveCurrentState) {
  if (saveCurrentState) {
    this.visibilityState = !this.$toolbar.hasClass('hidden');
  }
  this.invisible = false;
  this.$toolbar.removeClass('hidden');
};


/**
 * Scroll toolbar to the offset.
 * @param  {Number} newOffset
 */
DrawerToolbar.prototype.scrollTo = function (newOffset) {
    this.currentScrollOffset = parseInt(newOffset);
    if (this.isHorizontal()) {
        this.$toolbarContentHolder.css('left', '-' + this.currentScrollOffset + 'px');
    } else {
        this.$toolbarContentHolder.css('top', '-' + this.currentScrollOffset + 'px');
    }
};


/**
 * Returns one of [horizontal, vertical]
 * @return {String} toolbar orientation
 */
DrawerToolbar.prototype.getToolbarOrientation = function () {
  return this.$toolbar.hasClass('toolbar-vertical') ? 'vertical' : 'horizontal';
};


/**
 * @return {Boolean}
 */
DrawerToolbar.prototype.isHorizontal = function () {
  return (this.getToolbarOrientation() ===  'horizontal');
};


/**
 * height of toolbar
 * @return {Number}
 */
DrawerToolbar.prototype.height = function () {
  return this.$toolbar.height();
};


/**
 * Width of toolbar
 * @return {Number}
 */
DrawerToolbar.prototype.width = function () {
  return this.$toolbar.width();
};


