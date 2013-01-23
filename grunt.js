var fs = require('fs');
var markdown = require('node-markdown').Markdown;

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    modules: '', //to be filled in by find-modules task
    ngversion: '1.0.3',
    pkg:'<json:package.json>',
    meta: {
      modules: 'angular.module("placeholders", [<%= modules %>]);',
      all: 'angular.module("placeholders", [<%= modules %>]);'
    },
    lint: {
      files: ['grunt.js','src/**/*.js']
    },
    watch: {
      files: ['<config:lint.files>'],
      tasks: 'before-test test-run'
    },
    concat: {
      dist: {
        src: ['<banner:meta.modules>', 'src/*/*.js'],
        dest: 'dist/angular-placeholders-<%= pkg.version %>.js'
      }
    },
    min: {
      dist:{
        src:['dist/angular-placeholders-<%= pkg.version %>.js'],
        dest:'dist/angular-placeholders-<%= pkg.version %>.min.js'
      }
    },
    jshint: {
      options: {
        curly: true,
        immed: true,
        newcap: true,
        noarg: true,
        sub: true,
        boss: true,
        eqnull: true
      },
      globals: {}
    }
  });

  //register before and after test tasks so we've don't have to change cli options on the goole's CI server
  grunt.registerTask('before-test', 'lint');
  grunt.registerTask('after-test', 'find-modules concat min site');

  // Default task.
  grunt.registerTask('default', 'before-test test after-test');

  //Common placeholders module containing all modules
  grunt.registerTask('find-modules', 'Generate placeholders module depending on all existing directives', function() {
    var modules = grunt.file.expandDirs('src/*').map(function(dir) {
      return '"placeholders.' + dir.split("/")[1] + '"';
    });
    grunt.config('modules', modules);
  });

  grunt.registerTask('site', 'Create grunt demo site from every module\'s files', function() {
    this.requires('find-modules concat');

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

    var modules = grunt.file.expandDirs('src/*').map(function(dir) {

      var moduleName = dir.split("/")[1];
      if (fs.existsSync(dir + "docs")) {
        return {
          name: moduleName,
          displayName: ucwords(breakup(moduleName, ' ')),
          js: grunt.file.expand(dir + "docs/*.js").map(grunt.file.read).join(''),
          html: grunt.file.expand(dir + "docs/*.html").map(grunt.file.read).join(''),
          description: grunt.file.expand(dir + "docs/*.md").map(grunt.file.read).map(markdown).join('')
        };
      }
    }).filter(function(module){
       return module !== undefined;
    });

    grunt.file.write(
      'dist/index.html',
      grunt.template.process(grunt.file.read('demo/demo-template.html'), {
        modules: modules,
        version : grunt.config('pkg.version'),
        ngversion: grunt.config('ngversion')
      })
    );
    
    grunt.file.expand('demo/assets/*.*').forEach(function(path) {
      grunt.file.copy(path, 'dist/assets/' + path.replace('demo/assets/',''));
    });

    grunt.file.expand('demo/assets/img/*.*').forEach(function(path) {
      grunt.file.copy(path, 'dist/' + path.replace('demo/assets/',''));
    });
  });

  // Testacular configuration
  function runTestacular(command, options) {
    var testacularCmd = process.platform === 'win32' ? 'testacular.cmd' : 'testacular';
    var args = [command].concat(options);
    var done = grunt.task.current.async();
    var child = grunt.utils.spawn({
        cmd: testacularCmd,
        args: args
    }, function(err, result, code) {
      if (code) {
        done(false);
      } else {
        done();
      }
    });
    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);
  }

  grunt.registerTask('test', 'run tests on single-run server', function() {
    var options = ['--single-run', '--no-auto-watch', '--log-level=warn'];
    if (process.env.TRAVIS) {
      options =  options.concat(['--browsers=Firefox']);
    } else {
      //Can augment options with command line arguments
      options =  options.concat(this.args);
    }
    runTestacular('start', options);
  });

  grunt.registerTask('server', 'start testacular server', function() {
    var options = ['--no-single-run', '--no-auto-watch'].concat(this.args);
    runTestacular('start', options);
  });

  grunt.registerTask('test-run', 'run tests against continuous testacular server', function() {
    var options = ['--single-run', '--no-auto-watch'].concat(this.args);
    runTestacular('run', options);
  });

  grunt.registerTask('test-watch', 'start testacular server, watch & execute tests', function() {
    var options = ['--no-single-run', '--auto-watch'].concat(this.args);
    runTestacular('start', options);
  });
  };
