var LIVERELOAD_PORT = 35729;
var SERVER_PORT = 9000;
var lrSnippet = require('connect-livereload')({port: LIVERELOAD_PORT});

// function used to make a folder visible to the running server
var mountFolder = function (connect, dir) {
	return connect.static(require('path').resolve(dir));
};

// folder names for source code and compiled application
var src = 'app';
var dist = 'dist';

module.exports = function (grunt) {

	// load all grunt tasks
	require('load-grunt-tasks')(grunt);

	grunt.initConfig({
		watch: {
			files: [
				'<%= src %>/*.html',
				// '{.tmp,<%= src %>}/styles/{,*/}*.css',
				'{.tmp,<%= src %>}/scripts/{,*/}*.js'
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
							mountFolder(connect, '.tmp'),
							mountFolder(connect, src),
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
		clean: {
			dist: ['.tmp', '<%= dist %>/*', '!<%= dist %>/fonts'],
			server: '.tmp'
		}
	});

	grunt.registerTask('server', function (target) {
		
		grunt.task.run([
			'clean:server',
			'connect:livereload',
			'open',
			'watch'
		]);
			
	});
};
	