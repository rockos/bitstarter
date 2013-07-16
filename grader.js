#!/usr/bin/env node
/*
 * Automatically grade files for the presence of specified HTML tags/attributes.
 * Uses commander.js and cheerio. Teaches command line application development
 * and basic DOM parsing.
 *
 * References:
 *
 *  + cheerio
 *     - https://github.com/MatthewMueller/cheerio
 *     - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
 *     - http://maxogden.com/scraping-with-node.html
 *
 *  + commander.js
 *     - https://github.com/visionmedia/commander.js
 *     - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy
 *
 *  + JSON
 *     - http://en.wikipedia.org/wiki/JSON
 *     - https://developer.mozilla.org/en-US/docs/JSON
 *     - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
 */

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var restler = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "http://google.com";
var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};
var assertUrlExists = function(inUrl) {
    console.log('inurl ' + inUrl);
    if (inUrl ==='') {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    /*
    restler.get(inUrl)
        .on('complete', function(data) {
            return inUrl.toString();
    })
    .on('error', function(err) {
        console.log("%s does not exist. Exiting.", inUrl);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    });
    */
    return inUrl;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};
var cheerioUrlFile = function(urlfile) {
    return cheerio.load(urlfile);
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};
var checkHtmlUrl = function(urlfile, checksfile) {
    restler.get(urlfile)
        .on('complete', function(data) {
            $ = cheerioUrlFile(data);
            var checks = loadChecks(checksfile).sort();
            var out = {};

            for(var ii in checks) {
                var present = $(checks[ii]).length > 0;
                out[checks[ii]] = present;
                //console.log("checks " + checks[ii] + ', out '+present);
            }
            console.log(JSON.stringify(out, null, 4));
    //        return out;
        })
    .on('error', function(err) {
        console.log('error restler.');
    });
};

if(require.main == module) {
    program
        .option('-c, --checks ', 'Path to checks.json', assertFileExists, CHECKSFILE_DEFAULT)
        .option('-f, --file ', 'Path to index.html', assertFileExists, HTMLFILE_DEFAULT)
        .option('-u,--url <url>', 'Url of web site', String)
        .parse(process.argv);
    if (program.url) {
        console.log("url " + program.url);
         var checkJson = checkHtmlUrl(program.url, program.checks);
    } else if(program.file) {
        console.log("file " + program.file);
        var checkJson = checkHtmlFile(program.file, program.checks);
        var outJson = JSON.stringify(checkJson, null, 4);
        console.log(outJson);
    }
    
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
