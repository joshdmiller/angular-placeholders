var markdown = require('node-markdown').Markdown;

module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Project configuration.
  grunt.initConfig({
    ngversion: '1.1.4',
    srcModules: [], //to be filled in by find-modules task
    pkg: grunt.file.readJSON('package.json'),
    dist: 'dist',
    filename: 'placeholders',
    meta: {
      modules: 'angular.module("placeholders", [<%= srcModules %>]);',
      all: 'angular.module("placeholders", [<%= srcModules %>]);'
    },
    watch: {
      js: {
        //nospawn makes the tests start faster
        nospawn: true,
        files: ['src/**/*.js'],
        //we don't need to jshint here, it slows down everything else
        tasks: ['karma:unit:run']
      }
    },
    concat: {
      dist: {
        options: {
          banner: '<%= meta.modules %>\n'
        },
        src: [],
        dest: '<%= dist %>/<%= filename %>-<%= pkg.version %>.js'
      }
    },
    uglify: {
      dist:{
        src:['<%= dist %>/<%= filename %>-<%= pkg.version %>.js'],
        dest:'<%= dist %>/<%= filename %>-<%= pkg.version %>.min.js'
      }
    },
    copy: {
      assets: {
        files: [
          {
            src: [ '**' ],
            dest: '<%= dist %>/assets/',
            cwd: 'demo/assets',
            expand: true
          }
        ]
      }
    },
    jshint: {
      files: ['Gruntfile.js','src/**/*.js'],
      options: {
        curly: true,
        immed: true,
        newcap: true,
        noarg: true,
        sub: true,
        boss: true,
        eqnull: true,
        globals: {
          angular: true
        }
      }
    },
    karma: {
      options: {
        configFile: 'karma.conf.js'
      },
      unit: {
        background: true
      },
      continuous: {
        singleRun: true
      }
    }
  });

  grunt.renameTask( 'watch', 'delta' );
  grunt.registerTask( 'watch', [ 'default', 'karma:unit', 'delta' ] );
  
  //register before and after test tasks so we've don't have to change cli options on the goole's CI server
  grunt.registerTask('before-test', ['jshint']);
  grunt.registerTask('after-test', ['build', 'site']);
  grunt.registerTask('site', ['index', 'copy']);

  // Default task.
  grunt.registerTask('default', ['before-test', 'karma:continuous', 'after-test']);

  //Common placeholders module containing all modules for src and templates
  //findModule: Adds a given module to config
  function findModule(name) {
    function enquote(str) {
      return '"' + str + '"';
    }
    var srcModules = grunt.config('srcModules');

    grunt.file.expand('src/' + name + '/*.js').forEach(function(file) {
      srcModules.push(enquote('placeholders.' + name));
    });

    grunt.config('srcModules', srcModules);
  }

  grunt.registerTask('dist', 'Override dist directory', function() {
    var dir = this.args[0];
    if (dir) { grunt.config('dist', dir); }
  });

  function dependenciesForModule(name) {
    var deps = [];
    grunt.file.expand('src/' + name + '/*.js')
    .map(grunt.file.read)
    .forEach(function(contents) {
      //Strategy: find where module is declared,
      //and from there get everything inside the [] and split them by comma
      var moduleDeclIndex = contents.indexOf('angular.module(');
      var depArrayStart = contents.indexOf('[', moduleDeclIndex);
      var depArrayEnd = contents.indexOf(']', depArrayStart);
      var dependencies = contents.substring(depArrayStart + 1, depArrayEnd);
      dependencies.split(',').forEach(function(dep) {
        if (dep.indexOf('placeholders.') > -1) {
          var depName = dep.trim().replace('placeholders.','').replace(/['"]/g,'');
          if (deps.indexOf(depName) < 0) {
            deps.push(depName);
            //Get dependencies for this new dependency
            deps = deps.concat(dependenciesForModule(depName));
          }
        }
      });
    });
    return deps;
  }
  grunt.registerTask('build', 'Create bootstrap build files', function() {

    var srcFiles = [];
    if (this.args.length) {
      var modules = [].concat(this.args);
      //Find dependencies
      this.args.forEach(function(moduleName) {
        modules = modules.concat(dependenciesForModule(moduleName));
        findModule(moduleName);
      });
      srcFiles = modules.map(function(name) {
        return 'src/' + name + '/*.js';
      });
      grunt.config('filename', grunt.config('filename')+'-custom');

    } else {
      srcFiles = ['src/*/*.js'];

      var folders = grunt.file.expand({filter: 'isDirectory', cwd: '.'}, 'src/*');

      folders.forEach(function(dir) {
        findModule(dir.split('/')[1]);
      });
    }
    grunt.config('concat.dist.src', grunt.config('concat.dist.src').concat(srcFiles));

    grunt.task.run(['concat', 'uglify']);
  });

  grunt.registerTask('index', 'Create grunt demo site from every module\'s files', function() {

    function breakup(text, separator) {
      return text.replace(/[A-Z]/g, function (match) {
        return separator + match;
      });
    }

    function ucwords(text) {
      return text.replace(/^([a-z])|\s+([a-z])/g, function ($1) {
        return $1.toUpperCase();
      });
    }

    var modules = grunt.file.expand({filter: 'isDirectory'}, 'src/*').map(function(dir) {
      var moduleName = dir.split("/")[1];
      if (grunt.file.isDir(dir + "/docs")) {
        return {
          name: moduleName,
          displayName: ucwords(breakup(moduleName, ' ')),
          js: grunt.file.expand(dir + "/docs/*.js").map(grunt.file.read).join(''),
          html: grunt.file.expand(dir + "/docs/*.html").map(grunt.file.read).join(''),
          description: grunt.file.expand(dir + "/docs/*.md").map(grunt.file.read).map(markdown).join('')
        };
      }
    }).filter(function(module){
       return module !== undefined;
    });

    grunt.file.write(
      'dist/index.html',
      grunt.template.process(grunt.file.read('demo/demo-template.html'), {data: {
        modules: modules,
        filename: grunt.config('filename'),
        version : grunt.config('pkg.version'),
        ngversion: grunt.config('ngversion')
      }})
    );
  });
};
