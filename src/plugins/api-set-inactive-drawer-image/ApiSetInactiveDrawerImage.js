(function ($, DrawerApi, util) {
  'use strict';
  var emptyFunc = function(){};

  /**
   * Check if image have valid width/height
   * @param {Image} image
   * @returns {Boolean}
   */
  function checkImageSizes(image) {
    var result = false;
    if (image) {
      var widthIsValid = image.naturalWidth !== undefined && image.naturalWidth !== 0,
          heightIsValid = image.naturalHeight !== undefined && image.naturalHeight !== 0,
          sizesAreValid = widthIsValid && heightIsValid;
      result = sizesAreValid;
    }
    return result;
  }

  /**
   * Set image from url as inactive background image of drawer
   * @param {String} imageUrl - url of image
   * @private
   */
  function _setImageAsInactiveBackground(imageUrl) {
    var styleSelector = '.editable-canvas-not-edited',
        styleRules = '' +
            'background: url(' + imageUrl + ') !important;' +
            'background-repeat: no-repeat !important;' +
            'background-position: center !important;' +
            'background-size: contain !important;';
    util.addStyleToStyleSheet(styleSelector, styleRules, '#canvasInactiveImage', true);
  }


  /**
   * Sets background image for inactive canvas from given image object.
   *
   * @param {Image|String} image - js Image object or url string
   */
  DrawerApi.prototype.setInactiveDrawerImage = function (image) {
    if (image) {
      var valueIsUrl = typeof image === 'string' && image.length,
          valueIsImage = image instanceof Image,
          valueIsValid = valueIsUrl || valueIsImage,
          urlOfImage = valueIsUrl ? image : image.src,
          imgIsLoaded,
          imgIsValid;

      if (valueIsValid) {
        imgIsLoaded = valueIsImage && image.complete && checkImageSizes(image);
        if (imgIsLoaded) {
          _setImageAsInactiveBackground(urlOfImage);
        } else {
          util.loadImage(urlOfImage, null, null, true).then(function (imgFromPromise) {
            imgIsValid = checkImageSizes(imgFromPromise);
            if (imgIsValid) {
              _setImageAsInactiveBackground(imgFromPromise.src);
            }
          });
        }
      }
    }
  };



})(jQuery, DrawerJs.DrawerApi, DrawerJs.util);