var LIVERELOAD_PORT = 35729;
var SERVER_PORT = 9000;
var lrSnippet = require('connect-livereload')({port: LIVERELOAD_PORT});

// function used to make a folder visible to the running server
var mountFolder = function (connect, dir) {
	return connect.static(require('path').resolve(dir));
};


module.exports = function (grunt) {

	// the folder that the live-reload server should watch
	var serverRoot = 'dist'; 

	// load all grunt tasks
	require('load-grunt-tasks')(grunt);
	grunt.initConfig({

		// FOLDERS
		
		folders: {
			src: 'app',
			dist: 'dist'
		},

		// DEVELOPMENT SERVER SETUP
		// --------------

		watch: {
			files: [
				'**/*.js',
				'**/*.html'
			],
			options: {
				spawn: false,
				livereload: LIVERELOAD_PORT
			}
		},
		connect: {
			options: {
				port: SERVER_PORT,
				// change this to '0.0.0.0' to access the server from outside
				hostname: 'localhost',
			},
			livereload: {
				options: {
					middleware: function (connect) {
						console.log('reloading');
						return [
							lrSnippet,
							mountFolder(connect, serverRoot)
						];
					}
				}
			}
		},
		open: {
			server: {
				path: 'http://localhost:<%= connect.options.port %>',
				// change this to your prefered web browser
				app: 'google-chrome'
			}
		},

		// BUILD SETUP
		// -----------

		// remove dist folder before making a new build
		clean: {
			dist: '<%= folders.dist %>'
		},

		// copy only neccessary bower scripts over to the dist folder
		copy: {
			main: {
				files: [{
					expand: true,
					cwd: './<%= folders.src %>/bower_components/',
					src: [
					'requirejs/require.js',
					'gl-matrix/dist/gl-matrix-min.js'
					],
					dest: './<%= folders.dist %>/bower_components/'
				}]
			}
    },

    // setup a requirejs optimizer build
		requirejs: {
			compile: {
				options: {
					appDir: './<%= folders.src %>',
					baseUrl: './scripts',
					dir: './<%= folders.dist %>',
					modules: [
					{
						name: 'main'
					}
					],
					removeCombined: true,
					keepBuildDir: true,
					fileExclusionRegExp: /(bower_components)/,
					paths: {
						glMatrix: '../bower_components/gl-matrix/dist/gl-matrix-min'
					}
				}
			}
		},
		usemin: {
			html: ['<%= folders.dist %>/{,*/}*.html'],
			options: {
				dirs: ['<%= folders.dist %>']
			}
		},
	});
	

	// TASK SEQUENCE TO RUN WHEN DEVELOPING
	// --------

	grunt.registerTask('server', function (target) {
		
		grunt.task.run([
			'connect:livereload',
			'open',
			'watch'
		]);
			
	});

	// TASK SEQUENCE TO RUN FOR BUILDING APP
	// -----------------

	grunt.registerTask('build', function (target) {
		
		grunt.task.run([
			'clean:dist',
			'copy',
			'requirejs'
		]);
			
	});

};
	