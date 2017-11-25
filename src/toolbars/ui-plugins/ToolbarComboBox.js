;(function (window, $, util, utilPlugins) {
  'use strict';
  var emptyFunc = function () {},
      eventNameSpace = '.ToolbarComboBox';

  /**
   * @typeDef {Object} returnObj
   * @memberOf ToolbarComboBox
   * @property {ToolbarComboBox} instance - instance of combo box
   * @property {ToolbarComboBox#updateSelectedValues} updateSelectedValues - Update selected values func
   * @property {ToolbarComboBox#hideDropdown} hideDropdown - Hide dropdown func
   * @property {ToolbarComboBox#showDropdown} showDropdown - Show dropdown func
   **/

  /**
   * @param {HTMLElement} element - trigger element
   * @param {ToolbarComboBox.defaultOptions} [options] - configuration object
   * @returns {ToolbarComboBox.returnObj}
   * @memberOf DrawerJs.utilPlugins
   * @constructs ToolbarComboBox
   */
  var ToolbarComboBox = function(element, options){
    this.$element = $(element);
    
    this._setupOptions(options);
    this._setupCombobox();
    this._attachEventHandlers();
    this._attachDrawerEventHandlers();

    return {
      instance: this,
      updateSelectedValues: this.updateSelectedValues.bind(this),
      hideDropdown: this.hideDropdown.bind(this),
      showDropdown: this.hideDropdown.bind(this)
    };
  };

  /**
   * @memberOf ToolbarComboBox
   * @typeDef {Object} defaultOptions
   * @property {String} wrapper="toolbar-combobox-wrapper" - wrapper class
   * @property {Boolean} editable=false - wrapper class
   * @property {Boolean} addNewOptions=false - wrapper class
   * @property {Boolean} buttonMode=false - wrapper class
   * @property {Array} items - wrapper class
   *
   **/

  /**
   *
   * @type {ToolbarComboBox.defaultOptions}
   * @private
   */
  ToolbarComboBox.prototype._defaultOptions = {
    wrapper: 'toolbar-combobox-wrapper',
    editable: false,
    addNewOptions: false,
    buttonMode: false,
    items: []
  };

  /**
   * Setup options
   * @param {ToolbarComboBox.defaultOptions | Object} [options] - Configuration object
   * @returns {ToolbarComboBox.defaultOptions}
   * @private
   */
  ToolbarComboBox.prototype._setupOptions = function(options) {
    var optionsFromElement = this._collectOptionsFromElement();
    this.options = $.extend(true, {}, this._defaultOptions || {}, optionsFromElement || {}, options || {});
    this._initialOptions = $.extend(true, {}, options);
    this._initialOptionsFromElement = $.extend(true, {}, optionsFromElement);
    return this.options;
  };

  /**
   * Setup combobox element
   * @private
   */
  ToolbarComboBox.prototype._setupCombobox = function() {
    var comboboxHtml = this._generateTemplate(),
        $comboboxElement = $(comboboxHtml);

    $comboboxElement.insertAfter(this.$element);
    this.$element.addClass('hidden');

    this.$combobox = $comboboxElement;
    this.$options = this.$combobox.find('ul');
    this.$dropdown = this.$combobox.find(".dropdown-box");
    this.$input = this.$combobox.find("input");
    this.$closestToolbarItem = this.$element.closest('.toolbar-item-wrapper');
  };

  /**
   * Generate html of combobox
   * @returns {string}
   * @private
   */
  ToolbarComboBox.prototype._generateTemplate = function() {
    var _self = this,
        inputHtml =  '<div class="inputbox"><input type="text"/></div>',
        optionsHtml = '',
        html;


    this.options.items.forEach(function(item){
      var isObj = typeof item === 'object',
          valueToFill = isObj ? item.value : item,
          textToFill = isObj ? item.text || valueToFill : valueToFill,
          styleToFill = isObj ? item.style || '' : '',
          currItemHtml;
      currItemHtml = _self._generateNewOptionItem(textToFill, valueToFill, false, true, styleToFill);
      optionsHtml +=currItemHtml;
    });

    this.wrapperClasses = this.options.wrapper +
        (this.options.buttonMode ? ' button-mode ' : '') +
        (this.options.editable ? ' edit-mode ' : '');

    html = '' +
        '<div class="' + this.wrapperClasses + ' collapsed" tabindex="-1">' +
          '<div class="selected">' +
            '<span></span>' +
            '<a class="ui-button"><i class="fa fa-angle-down"></i></a>' +
          '</div>' +
          '<div class="dropdown-box">' +
            (this.options.editable ? inputHtml : '') +
            '<ul class="option-list">' +
              optionsHtml +
            '</ul>' +
          '</div>' +
        '</div>';
    return html;
  };

  /**
   *
   * @param {String} [txt] - Text value of option
   * @param {String} val - Value of option
   * @param {Boolean} [isSelected] - This option is selected
   * @param {Boolean} returnHtml - Need return html string
   * @param {String} [style] - Inline styles of option
   * @returns {jQuery|String}
   * @private
   */
  ToolbarComboBox.prototype._generateNewOptionItem = function (txt, val, isSelected, returnHtml, style) {
    txt = txt || '';
    style = style || '';
    var optionItemHtml = '' +
        '<li ' +
          'style="' + style + '"' +
          'data-val="' + val + '"' +
          'class="option-item">' +
            '<div class="option-item-text">' + txt + '</div>' +
        '</li>';
    var $optionItem = $(optionItemHtml);
    if (isSelected) {
      this.$combobox.find(".selected").attr("data-val", val).find('span').text(txt);
      $optionItem.addClass('selected');
    }
    return returnHtml ? $optionItem.get(0).outerHTML : $optionItem;
  };

  /**
   * Setup size of dropdown
   * @private
   */
  ToolbarComboBox.prototype._setupDropDownSize = function() {
    var comboboxWidth = this.$combobox.width();
    if (comboboxWidth) {

      this.sizesUpdated = true;
    }
  };

  /**
   * Setup/attach drawer handlers
   * @private
   */
  ToolbarComboBox.prototype._attachDrawerEventHandlers = function() {
    var _self = this,
        $closestToolbarItem = this.$element.closest('.toolbar-item-wrapper');

    if ($closestToolbarItem && $closestToolbarItem.length) {

      util.bindClick($('body'), '_optionTool_toggleDropdown', function (event) {
        var $target = $(event.target),
            $clickToolbarItem = $target.closest('.toolbar-item-wrapper'),
            isCanvas = $target.is('canvas'),
            sameToolControl = $closestToolbarItem.get(0) === $clickToolbarItem.get(0),
            needToHide = !sameToolControl && !isCanvas;
        if (needToHide) {
          $closestToolbarItem.find('.toolbar-dropdown-block').addClass('collapsed');
          _self.hideDropdown();
        }
      });

      util.bindClick($closestToolbarItem.find('.toolbar-item-icon'), '_optionTool_toggleDDropdown', function (event) {
        var needRemoveClass = $closestToolbarItem.find('.toolbar-dropdown-block').hasClass('collapsed'),
            toolbarHaveScrollable;
        if (needRemoveClass) {
          var toolbar = _self.options && _self.options.drawer && _self.options.drawer.toolbars && _self.options.drawer.toolbars.toolOptionsToolbar,
              toolbarOptions = toolbar && toolbar.options,
              notInsidePopup = toolbarOptions && toolbarOptions.position !== 'popup',
              outside = toolbarOptions && toolbarOptions.positionType === 'outside',
              insideScrollable = toolbarOptions && toolbarOptions.compactType === 'scrollable';
          toolbarHaveScrollable = notInsidePopup && outside && insideScrollable;
          if (toolbarHaveScrollable) {
            var clone = _self.$combobox.clone(true);
            // _self.$cloneControl = $('<div class="colorpicker-control"></div>');
            // _self.$cloneDropdown = this.$colorButton.$colorDropdown.clone(true);
            // _self.$cloneControl.append(this.$cloneDropdown);
            $closestToolbarItem.closest('.toolbar-placeholder').append(clone);
            clone.addClass('combobox-cloned');
            _self.$clonedCombobox = clone;

            var drawerSizes = util.getScrollOffset(_self.options.drawer.$canvasEditContainer),
                parentSizes = util.getScrollOffset(_self.$element.parent()),
                canvasRect = _self.options.drawer.$canvasEditContainer.get(0).getBoundingClientRect();

            var left = _self.$element.parent().get(0).getBoundingClientRect().left,
                clonedComboboxLeft = (left - canvasRect.left - (parentSizes.left - drawerSizes.left)) - _self.$clonedCombobox.width() / 2;
            _self.$clonedCombobox.css({
              'left': clonedComboboxLeft
            });
          }
        }

        if (!toolbarHaveScrollable) {
          $closestToolbarItem.find('.toolbar-dropdown-block').toggleClass('collapsed', !needRemoveClass);
        }

      });
    }
  };

  /**
   * Setup/attach event handlers
   * @private
   */
  ToolbarComboBox.prototype._attachEventHandlers = function() {
    var _self = this;
    if (this.options.editable) {
      var $input = this.$input,
          bEdit;

      $input.off('focus' + eventNameSpace).on('focus' + eventNameSpace, function(e){
        _self.$combobox.addClass('focus');
        bEdit = true;
      });

      $input.off('blur' + eventNameSpace).on('blur' + eventNameSpace, function(e){
        bEdit = false;
        _self.$combobox.trigger('blur');
      });

      $input.off('keypress' + eventNameSpace).on('keypress' + eventNameSpace, function(e){
        if (e.keyCode == "13") {
          var val = $input.val();

          $input.val('');


          var $originalSelect = $("<option>").val(val).text(val).attr('data-is-input', 1);
          _self.$element.append($originalSelect);

          if (_self.options.addNewOptions) {
            var $opt = _self._generateNewOptionItem(val, val, true);
            _self.$options.append($opt);
          }

          _self.changeActiveOption(val);
        }
      });
    }

    this.$element.off('valueChanged' + eventNameSpace).on('valueChanged' + eventNameSpace, function(e, valueObj){
      var valueFromElement = _self.$element.val(),
          valueFromObject = valueObj ? valueObj.value : undefined,
          value = valueObj ? valueFromObject : valueFromElement,
          classes;

      if (valueObj) {
        classes = valueObj.classString;
      }

      _self.updateSelectedValues(value, classes);
    });

    this.$element.off('change' + eventNameSpace).on('change' + eventNameSpace, function(e){
      if (!_self.addNewOptions) {
        var $element = _self.$element,
            prevValue = $element.attr('prev-value'),
            prevValueIsNotInitial = _self.options.valuesArr.indexOf(prevValue) === -1;
        if (prevValueIsNotInitial) {
          $element.find('option[data-val="' + prevValue + '"]').remove();
        }
      }
    });


    this.$combobox.off('mouseleave' + eventNameSpace).on('mouseleave' + eventNameSpace, function(e){
      var $closestToolbarItem = _self.$element.closest('.toolbar-item-wrapper');
      $closestToolbarItem.find('.toolbar-dropdown-block').addClass('collapsed');
      _self.hideDropdown();
    });

    this.$combobox.off('click' + eventNameSpace + '_optionSelect').on('click' + eventNameSpace + '_optionSelect', '.option-item', this._onOptionSelect.bind(this));

    this.$combobox.off('click' + eventNameSpace + '_toggleDropdown').on('click' + eventNameSpace + '_toggleDropdown', '.selected', function(){
      _self.toggleDropdown();
    });

    this.$combobox.off('blur' + eventNameSpace).on('blur' + eventNameSpace, function (e) {
      e.preventDefault();
      setTimeout(function () {
        if (bEdit) return;
        _self.hideDropdown();
      }, 100);
      _self.$combobox.removeClass('focus');
    });
  };

  /**
   * Collect array of available options from trigger element
   * @returns {Object}
   * @private
   */
  ToolbarComboBox.prototype._collectOptionsFromElement = function() {
    var result = {};
    
    var isEditable = this.$element.attr('data-editable') && this.$element.attr('data-editable') === 'true';

    result.items = [];
    result.valuesArr = [];
    this.$element.find('option').each(function (i, item) {
      var $item = $(item),
          value = $item.val(),
          text = $item.text(),
          style = $item.attr('style') || '',
          currItemObj = {
            value: value,
            text: text,
            style: style
          };
      result.valuesArr.push(value);
      result.items.push(currItemObj);
    });

    result.editable = isEditable;

    return result;
  };

  /**
   * React on select of option
   * @param {Event} event
   * @private
   */
  ToolbarComboBox.prototype._onOptionSelect = function(event) {
    var $selectedOption = $(event.currentTarget),
        alreadySelected = $selectedOption.hasClass('selected'),
        selectedValue = !alreadySelected ?  $selectedOption.attr('data-val') : '',
        selectedText = $selectedOption.text();
    this.hideDropdown();
    this.changeActiveOption(selectedValue, selectedText);
    event.stopPropagation();
    event.preventDefault();
  };

  /**
   * Change current active option
   * @param {String} [value] - Value of new active option
   * @param {*} [text] - Text of new active option
   */
  ToolbarComboBox.prototype.changeActiveOption = function(value, text) {
    var prevValue = this.$element.val();

    this.$element.attr('prev-value', prevValue);
    this.$element.val(value);

    this.updateSelectedValues(value);

    this.$element.trigger('toolbarOptionChange');
  };

  /**
   * Update selected values
   * @param {*} [value] - Value of selected option
   * @param {String} [classes] - Additional classes
   * @param {String} [optionName] - Name of option
   */
  ToolbarComboBox.prototype.updateSelectedValues = function(value, classes, optionName) {
    value = value || '';
    var $allOptions = this.$combobox.find('.option-item'),
        $neededOption = $allOptions.filter('[data-val="' + value + '"]'),
        neededText = $neededOption && $neededOption.length ? $neededOption.text() : value,
        collapsedClass = this.$combobox.hasClass('collapsed') ? ' collapsed' : '',
        wrapperClasses = this.wrapperClasses + ' ' + (classes || '') + collapsedClass;


    this.$combobox.attr('class', wrapperClasses);
    this.$combobox.find(".selected span").text(neededText);

    $allOptions.removeClass('selected');
    if ($neededOption) {
      $neededOption.addClass('selected');
      this.$input.val('');
    } else {
      this.$input.val(value);
    }
  };


  /**
   * Show combobox dropdown
   */
  ToolbarComboBox.prototype.showDropdown = function() {
    this.dropdownIsVisible = true;
    if (!this.sizesUpdated) {
      this._setupDropDownSize();
    }
    this.$combobox.find('.ui-button .fa').addClass('fa-angle-down').removeClass('fa-angle-up');
    this.$combobox.removeClass('collapsed');
  };

  /**
   * Hide combobox dropdown
   */
  ToolbarComboBox.prototype.hideDropdown = function() {
    this.dropdownIsVisible = false;
    this.$combobox.addClass('collapsed');
    this.$combobox.find('.ui-button .fa').removeClass('fa-angle-down').addClass('fa-angle-up');

    if (this.$clonedCombobox) {
      this.$clonedCombobox.remove();
    }
  };

  /**
   * Toggle visibility of combobox dropdown
   * @param {Boolean} [show] - new state of dropdown
   */
  ToolbarComboBox.prototype.toggleDropdown = function(show) {
    var needToShow = show !== undefined ? show : !this.dropdownIsVisible;
    this.dropdownIsVisible = needToShow;

    if (needToShow) {
      this.showDropdown();
    } else {
      this.hideDropdown();
    }
  };

  /**
   * @Function
   * @param options
   * @returns {ToolbarComboBox[]}
   * @memberOf external:"jQuery.fn"
   */
  $.fn.ToolbarComboBox = function (options) {
    var instances = [];
    $(this).each(function (i, element) {
      var newInstance = new ToolbarComboBox(element, options);
      $(element).data('comboBox', newInstance);
      instances.push(newInstance);
    });
    return instances;
  };

  /**
   * @Function
   * @memberOf external:"jQuery.fn"
   * @returns {ToolbarComboBox|ToolbarComboBox[]}
   */
  $.fn.getComboBox = function () {
    var instances = [];
    $(this).each(function (i, element) {
      var currInstance = $(element).data('comboBox');
      if (currInstance) {
        instances.push(currInstance);
      }
    });
    return instances.length > 1 ? instances : instances[0];
  };

  utilPlugins.ToolbarComboBox = ToolbarComboBox;
})(window, jQuery, DrawerJs.util, DrawerJs.utilPlugins);