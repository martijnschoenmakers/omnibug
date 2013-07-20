/*global module*/
module.exports = function( grunt ) {
    "use strict";
    grunt.file.mkdir( "build" );
    var gruntConfig = {
        pkg: grunt.file.readJSON( "package.json" )
    };
    grunt.initConfig( gruntConfig );


    /*
     * JS Lint
     */
    grunt.loadNpmTasks( "grunt-contrib-jshint" );
    gruntConfig.jshint = {
        options: { bitwise: true, camelcase: false, curly: true, eqeqeq: true, forin: true, immed: true,
                   indent: 4, latedef: true, newcap: true, noarg: true, noempty: true, nonew: true, plusplus: false,
                   quotmark: true, regexp: true, undef: true, unused: true, strict: false, trailing: true,
                   white: false, laxcomma: true, nonstandard: true, browser: true, maxparams: 3, maxdepth: 4,
                   maxstatements: 50 },
        all: [
            "Gruntfile.js",
            "chrome/devtools.js"
            //"chrome/devtools_panel.js"
            //"common/providers.js"
            //"chrome/eventPage.js"
            //"chrome/options.js"
        ]
    };


    /*
     * Jasmine tests
     */
    grunt.loadNpmTasks( "grunt-contrib-jasmine" );
    gruntConfig.jasmine = {
        src: {
            src: [
                //"src/js/**/*.js",
                //"!src/js/**/*.test.js"
                "common/*.js"
            ],
            options: {
                //specs: "src/js/**/*.test.js",
                specs: "test/common/*.js",
                junit: {
                    path: "build/test-results"
                }
            }
        }
    };
    grunt.registerTask("test", "jasmine:src");


    /*
    gruntConfig.jasmine.istanbul= {
        src: gruntConfig.jasmine.src.src,
        options: {
            specs: gruntConfig.jasmine.src.options.specs,
            template: require("grunt-template-jasmine-istanbul"),
            templateOptions: {
                coverage: "output/coverage/coverage.json",
                report: [
                    {type: "html", options: {dir: "output/coverage"}},
                    {type: "cobertura", options: {dir: "output/coverage/cobertura"}},
                    {type: "text-summary"}
                ]
            }
        }
    };
    grunt.registerTask("coverage", "jasmine:istanbul");
    */


    /*
     * Copy common files into place
     */
    grunt.loadNpmTasks( "grunt-contrib-copy" );
    gruntConfig.copy = {
        chrome: {
            files: [
                { expand: true, cwd: "common/", src: [ "*.js" ], dest: "chrome/" },
            ]
        },
        firefox: {
            files: [
                { expand: true, cwd: "common/", src: [ "*.js" ], dest: "firefox/chrome/content/omnibug/" }
            ]
        }
    };
    grunt.registerTask( "makeDev", [ "copy" ] );


    /*
     * Clean the project dir
     */
    grunt.loadNpmTasks( "grunt-contrib-clean" );
    gruntConfig.clean = {
        clean: [ "build",
                 "chrome/providers.js", "chrome/omnibugurl.js",
                 "firefox/chrome/content/omnibug/providers.js", "firefox/chrome/content/omnibug/omnibugurl.js",
                 "firefox/install.rdf", "firefox/update.rdf" ]
    };


    /*
     * Set correct version numbers in various files
     */
    grunt.loadNpmTasks( "grunt-version" );
    gruntConfig.version = {
        chrome: {
            src: [ "chrome/manifest.json" ]
        },
        firefox: {
            options: {
                prefix: "em:updateLink=\"http:\/\/.*\/omnibug-|[^\\-]em:version['\"]?\\s*[:=]\\s*['\"]",
                // NOTE: only supporting dot-separated digits (to keep from breaking em:updateLink)
                replace: "[0-9]+\\.[0-9]+\\.[0-9]+",
            },
            src: [ "firefox/install.rdf.site", "firefox/install.rdf.amo", "firefox/update.rdf.tpl" ]
        }
    };


    /*
     * Build Chrome extension
     */
    grunt.loadNpmTasks( "grunt-crx" );
    gruntConfig.crx = {
        omnibugPackage: {
            "src": "chrome/",
            "dest": "build/",
            "privateKey": "omnibug.pem",
            "exclude": [ "scripts" ]
        }
    };
    grunt.registerTask( "makeChrome", [ "copy:chrome", "version:chrome", "crx" ] );


    /*
     * Build Firefox extension
     */
    grunt.loadNpmTasks( "grunt-contrib-compress" );
    gruntConfig.compress = {
        site: {
            options: {
                archive: "build/<%= pkg.name %>-<%= pkg.version %>.xpi",
                mode: "zip"
            },
            files: [
                { expand: true, cwd: "firefox/", src: [ "chrome/**" ] },
                { expand: true, cwd: "firefox/", src: [ "defaults/**" ] },
                { expand: true, cwd: "firefox/", src: [ "chrome.manifest" ] },,
                { expand: true, cwd: "firefox/", src: [ "install.rdf.site" ], rename: function( d, s ) {
                    return s.replace( /\.site|\.amo/, "" );
                } }
            ]
        },
        amo: {
            options: {
                archive: "build/<%= pkg.name %>-amo-<%= pkg.version %>.xpi",
                mode: "zip"
            },
            files: [
                { expand: true, cwd: "firefox/", src: [ "chrome/**" ] },
                { expand: true, cwd: "firefox/", src: [ "defaults/**" ] },
                { expand: true, cwd: "firefox/", src: [ "chrome.manifest" ] },,
                { expand: true, cwd: "firefox/", src: [ "install.rdf.amo" ], rename: function( d, s ) {
                    return s.replace( /\.site|\.amo/, "" );
                } }
            ]
        }
    };
    grunt.registerTask( "makeFirefox", [ "copy:firefox", "version:firefox", "compress:site", "compress:amo" ] );


    grunt.registerTask( "makeAll", [ "clean", "jshint", "test", "makeChrome", "makeFirefox" ] );

    // CI tasks
    grunt.registerTask( "travis", ["jshint", "test" ]);

};