if (!RedactorPlugins) var RedactorPlugins = {};

(function ($) {
  RedactorPlugins.drawer = function () {
    var canvases = [];

    var getCanvasById = function (id) {
      for (var i = 0; i < canvases.length; i++) {
        if (canvases[i].id == id) {
          return canvases[i];
        }
      }

      return null;
    };

    var drawerPlugins = [
      // Drawing tools
      'Pencil',
      'Eraser',
      'Text',
      'Line',
      'ArrowOneSide',
      'ArrowTwoSide',
      'Triangle',
      'Rectangle',
      'Circle',

      // Drawing options
      //'ColorpickerHtml5',
      'ColorpickerRedactor',
      'BrushSize'
    ];

    var createDrawer = function(redactorInstance, width, height){
      var drawerOptions = redactorInstance.opts.drawer || {};
      if(!drawerOptions.plugins){
        drawerOptions.plugins = drawerPlugins;
      }

      if(drawerOptions.plugins.indexOf('ShapeContextMenu') < 0){
        drawerOptions.plugins.push('ShapeContextMenu');
      }

      if(drawerOptions.plugins.indexOf('CanvasProperties') < 0){
        drawerOptions.plugins.push('CanvasProperties');
      }

      var newDrawer = new DrawerJs.Drawer(redactorInstance, drawerOptions,
        width, height
      );

      newDrawer.on(newDrawer.EVENT_CANVAS_MODIFIED, function () {
        for (var i = 0; i < canvases.length; i++) {
          canvases[i].beforeSync();
        }

        redactorInstance.code.startSync();

        for (var j = 0; j < canvases.length; j++) {
          canvases[j].afterSync();
        }
      });

      return newDrawer;
    };

    return {
      init: function () {
        var button = this.button.addAfter('image', 'drawer',
          this.drawer.t('Add Drawer'));

        this.button.setAwesome('drawer', 'fa-paint-brush');
        this.button.addCallback(button, this.drawer.show);

        var modalTemplate = '' +
          '<section id="redactor-drawer-insert">' +
            this.drawer.t('Size (px)') +
            '<input id="drawer-insert-width" type="number" ' +
                   'value="350" style="width: 50px; text-align: right" />' +
            ' x ' +
            '<input id="drawer-insert-height" type="number" ' +
                   'value="250" style="width: 50px; text-align: right" />' +
          '</section>';

        this.modal.addTemplate('drawer', modalTemplate);

        // This is very important!
        // When Redactor do a code sync
        // between presentation and markup layers
        // it destroys all html and event handlers we've set.
        // It happens everytime something changes in redactor.
        this.opts.syncCallback = function (html) {
          // also there could be a situation where image is deleted
          // but we still have Drawer.  So here we iterate though
          // all canvases and check if they still have an image
          var indexesToDelete = [];
          for(var j in canvases){
            var imageElement = document.getElementById(
              'canvas_image_' + canvases[j].id);
            if(!imageElement) {
              canvases[j].destroy();
              canvases[j] = null;
            }
          }
          canvases = canvases.filter(function(e){return e; });

          // now we should check if there are any images for canvases
          // without Drawer attached to them
          // this could happen when content is pasted/loaded into redactor
          var canvasImages = $('img[data-redactor-drawer-enabled="true"]');
          for (var i = 0; i < canvasImages.length; i++) {
            var img = canvasImages[i];
            var canvasId = img.id.replace('canvas_image_', '');
            var drawer = getCanvasById(canvasId);

            if (!drawer) {
              drawer = createDrawer(this);
              drawer.id = canvasId;
              canvases.push(drawer);
            }
          }

          for (var c = 0; c < canvases.length; c++) {
            canvases[c].onInsert();
          }

          return html;
        };
      },
      get: function(){
        return canvases;
      },
      show: function () {
        this.modal.load('drawer', this.drawer.t('Insert Drawer'), 260);
        this.modal.createCancelButton();
        $('.redactor-modal-close-btn').html(this.drawer.t('Cancel'));
        var button = this.modal.createActionButton(this.drawer.t('Insert'));
        button.on('click', this.drawer.insert);

        this.selection.save();
        this.modal.show();
      },
      insert: function () {
        var width = $('#drawer-insert-width').val();
        var height = $('#drawer-insert-height').val();

        var canvasElem = createDrawer(this, width, height);
        this.insert.html(canvasElem.getHtml(), false);
        canvasElem.onInsert();
        canvases.push(canvasElem);
        this.modal.close();
      },
      t: function(textString){
        return this.opts.drawer.texts[textString];
      }
    };
  };
})(jQuery);
