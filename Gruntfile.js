module.exports = function (grunt) {

  var libraries = [
    'lib/fabric.1.7.1.js'
  ];

  // file order IS IMPORTANT
  var standaloneSources = [
    // load core
    'src/Globals.js',
    'src/Localization_en.js',
    'src/Canvas.js',
    'src/Util.js',
    'src/Drawer.Api.js',
    'src/Drawer.ObjectApi.js',
    'src/Drawer.js',
    'src/Drawer.DefaultOptions.js',
    'src/Drawer.Events.js',
    'src/Drawer.Storage.js',

    // load fabric extensions
    'src/fabricjs_extensions/ErasableMixin.js',
    'src/fabricjs_extensions/ErasableObject.js',
    'src/fabricjs_extensions/SegmentablePolygon.js',
    'src/fabricjs_extensions/PText.js',
    'src/fabricjs_extensions/ErasableText.js',
    'src/fabricjs_extensions/*.js',


    // load toolbars files
    'src/toolbars/*.js',
    'src/toolbars/instances/*.js',
    'src/toolbars/ui-plugins/*.js',

    // load tools
    'src/plugins/BaseTool.js',
    'src/plugins/BaseBrush.js',
    'src/plugins/BaseShape.js',
    'src/plugins/**/*.js'
    ];

  var banner = '/*! <%= pkg.name %> - <%= version %> */\n\n';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    version: grunt.file.read('version.txt'),
    'http-server': {
      'dev': {
        root: '',
        port: 8081,
        host: "0.0.0.0",
        cache: 0,
        showDir: true,
        autoIndex: true,
        ext: "html",
        runInBackground: true
        // specify a logger function. By default the requests are
        // sent to stdout.
        //logFn: function(req, res, error) { }
      }
    },
    open : {
      dev : {
        path: 'http://localhost:8081/examples',
        app: 'Chrome'
      }
    },
 	copy: {
      assets: {
        files: [
          {
            expand: true,
            dest: 'dist/assets',
            cwd: 'assets',
            src: [
              '**/*.cur',
              '**/*.gif',
              '**/*.png',
              '**/*.jpg',
              '**/*.jpeg'
            ]
          }
        ]
      },
      fonts: {
        files: [
          {
            expand: true,
            dest: 'fonts',
            cwd: 'assets/fonts',
            src: [
              '**/*.woff',
            ]
          }
        ]
      }
    },
    concat: {
      options: {
        sourceMap: true,
        stripBanners: true,
        banner: banner
      },
      js_standalone: {
        src: libraries.concat(standaloneSources),
        dest: 'dist/drawerJs.standalone.js'
      },
      js_redactor: {
        src: libraries.concat(['src/RedactorPlugin.js'])
          .concat(standaloneSources),
        dest: 'dist/drawerJs.redactor.js'
      },
      css: {
        src: [
          'src/toolbars/*.css',
          'src/toolbars/ui-plugins/*.css',
          'src/plugins/*.css',
          'src/plugins/**/*.css',
          'src/*.css'
        ],
        dest: 'dist/drawerJs.css'
      }
    },
    jshint: {
      files: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
      options: {
        '-W069': true,
        '-W054': true,
        globals: {
          jQuery: true
        }
      }
    },
    uglify: {
      prod: {
        options: {
          banner: banner,
          sourceMapIncludeSources: true
        },
        files: {
          'dist/drawerJs.standalone.min.js': ['dist/drawerJs.standalone.js'],
          'dist/drawerJs.redactor.min.js': ['dist/drawerJs.redactor.js']
        }
      }
    },
    cssmin: {
      options: {
        sourceMapIncludeSources: true,
        banner: banner
      },
      target: {
        files: {
          'dist/drawerJs.min.css': ['dist/drawerJs.css']
        }
      }
    },
    jsdoc: {
      dist: {
        src: standaloneSources,
        options: {
          destination: 'dist/docs',
          readme: 'README.md',
          package: 'package.json',
          private: false
        }
      }
    },
    watch: {
      files: ['<%= concat.js_redactor.src %>', '<%= concat.css.src %>'],
      tasks: [
        'copy',
        'jshint',
        'concat',
        'jsdoc'
      ]
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-http-server');
  grunt.loadNpmTasks('grunt-open');
  grunt.loadNpmTasks('grunt-jsdoc');

  grunt.registerTask('build', [
    'http-server',
    'copy',
    'jshint',
    'concat',
    'uglify',
    'cssmin',
  	'open',
    'jsdoc'
  ]);

  grunt.registerTask('build-prod', [
    'copy',
    'jshint',
    'concat',
    'uglify',
    'cssmin',
    'jsdoc'
  ]);

  grunt.registerTask('default', [
    'build',
    'watch'
  ]);
};
