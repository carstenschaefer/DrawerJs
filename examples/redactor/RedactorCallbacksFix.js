if (!RedactorPlugins) var RedactorPlugins = {};

(function ($) {
  RedactorPlugins.callbacksFix = function () {
    var callbacks = [
      'initCallback',
      'destroyCallback',
      'pasteBeforeCallback',
      'changeCallback',
      'syncBeforeCallback',
      'syncCallback',
      'keydownCallback',
      'keyupCallback',
      'enterCallback',
      'autosaveCallback',
      'autosaveErrorCallback',
      'focusCallback',
      'blurCallback',
      'dropCallback',
      'clickCallback',
      'sourceCallback',
      'codeKeydownCallback',
      'codeKeyupCallback',
      'visualCallback',
      'imageUploadCallback',
      'imageDeleteCallback',
      'modalOpenedCallback',
      'modalClosedCallback',
      'dropdownShowCallback',
      'dropdownShownCallback',
      'dropdownHideCallback',
      'insertedTableCallback',
      'insertedLinkCallback',
      'uploadStartCallback'
    ];

    var handlers = {};

    var makeFix = function (redactor, obj, callbackName) {
      Object.defineProperty(obj, callbackName, {
        get: function redactorCallbackGetter() {
          if (handlers[callbackName]) {
            return function (e, data) { // redactor's callback parameters
              for (var handlerIndex = 0;
                   handlerIndex < handlers[callbackName].length;
                   handlerIndex++) {
                if(handlers[callbackName][handlerIndex]){
                  var handlerResult = handlers[callbackName][handlerIndex]
                    .call(redactor, e, data);
                  if(handlerResult !== undefined){
                    e = handlerResult;
                  }
                }
              }
              return e;
            }
          } else {
            return undefined;
          }
        },
        set: function (cb) {
          if (!handlers[callbackName]) {
            handlers[callbackName] = [];
          }
          handlers[callbackName].push(cb);
        }
      });
    };

    return {
      init: function () {
        for (var i = 0; i < callbacks.length; i++) {
          var callbackName = callbacks[i];
          makeFix(this, this.opts, callbackName);
        }
      }
    }
  };
})(jQuery);