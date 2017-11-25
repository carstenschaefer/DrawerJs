(function (Drawer, util, texts) {
    Drawer.prototype.defaultOptions =  {
      captionText: 'Drawer',
      defaultWidth : '100%',
      defaultHeight : '500px',

      enableImageCrop: true,

      // TODO: should be fixed or removed
      editOnClick: true,

      exitOnOutsideClick: true,

      // default color for drawing/shapes
      activeColor: '#E80F07',
      activeOpacity: 1,

      // toolbar size in px
      toolbarSize: 35,
      toolbarSizeTouch: 45,

      // toolbars config
      // @todo: move it toolbars files?
      toolbars : {
        popupButtonAlwaysVisible: true,
        // drawing tools toolbar config
        drawingTools : {
            position : 'top'         // one of [left, right, top, bottom]
        },

        // active tool options toolbar config
        toolOptions : {
            position : 'bottom'      // one of [left, right, top, bottom]
        },

        // drawer main toolbar config
        settings  : {
            position : 'right'       // one of [left, right, top, bottom]
        },
      },

      tooltipCss: {
        background: 'black',
        color: 'white'
      },

      // properties that will be applied to fabricjs canvas on creation
      canvasProperties: {
        selectionColor: 'rgba(255, 255, 255, 0.3)',
        selectionDashArray: [3, 8],
        selectionLineWidth: 1,
        selectionBorderColor: '#5f5f5f'
      },

      // properties that will be applied to every created object
      objectControls: {
        borderColor: 'rgba(102,153,255,0.75)',
        borderOpacityWhenMoving: 0.4,
        cornerColor: 'rgba(102,153,255,0.5)',
        cornerSize: 12,
        hasBorders: true
      },

      objectControlsTouch: {
        borderColor: 'rgba(102,153,255,0.75)',
        borderOpacityWhenMoving: 0.4,
        cornerColor: 'rgba(102,153,255,0.5)',
        cornerSize: 20,
        hasBorders: true
      },

      contentConfig: {
        saveAfterInactiveSec: null,
        saveInHtml: true,
        canvasDataContainer: null,
        imagesContainer: null,

        loadCanvasData: null,
        saveCanvasData: null,

        loadImageData: null,
        saveImageData: null
      },

      backgroundCss: 'white',
      borderCss: '1px dashed rgb(195, 194, 194)',
      borderCssEditMode: '1px dashed rgb(195, 194, 194)',

      defaultImageUrl: 'images/drawer.jpg',

      plugins: [],
      pluginsConfig: {},
      corePlugins: ['Zoom'],

      texts: texts,

      basePath: null,

      debug: false
    };

})(DrawerJs.Drawer, DrawerJs.util, DrawerJs.texts);
