"use strict";

var fs = require('fs');
var path = require('path');

var Q = require('q');
var _ = require('underscore');
var mkdirp = require('mkdirp');

module.exports = {
    bundle: bundle,
    writeBundle: writeBundle,
    getTemplates: getTemplates,
    getTemplateSource: getTemplateSource
};

/**
 * Bundle all templates in a directory into a CommonJS module. Currently,
 * template search is non-recursive.
 *
 * @param templateDir Path to the input directory
 * @param bundleFile Path to the output file
 * @param options Options passed to `writeBundle`
 * @returns A promise which resolves once the bundle file has been written
 */
function bundle(templateDir, bundleFile, options)
{
    return getTemplates(templateDir).then(function (data)
    {
        // Create the target directory if needed
        mkdirp(path.dirname(bundleFile));

        var stream = fs.createWriteStream(bundleFile);
        var deferred = Q.defer();

        stream.on('open', function ()
        {
            writeBundle(data, stream, options);
            stream.end();
        });

        stream.on('finish', function ()
        {
            deferred.resolve();
        });

        return deferred.promise;
    });
}

/**
 * Given an array of objects representing compiled templates and a
 * writeable stream, output the source for a CommonJS module containing
 * the template functions to the stream.
 *
 * Accepts an optional `options` argument, which is a dict of
 * configuration values. Currently the only accepted option is `preface`,
 * which defines an optional string that is inserted at the start of the
 * file.
 *
 * @param templates
 * @param stream
 * @param options
 */
function writeBundle(templates, stream, options)
{
    var preface = _.result(options, 'preface');

    if (preface)
        stream.write(preface);

    var len = templates.length;

    stream.write('module.exports={\n');

    templates.forEach(function (source, index)
    {
        var continuation = (index === len - 1) ? '\n' : ',\n';
        stream.write('"' + source.file.replace(/[\"\\]/g, '\\$&') + '":' + source.template + continuation);
    });

    stream.write('};\n');
}

/**
 *
 * @param templateDir
 * @returns A promise which resolves when the source file
 */
function getTemplates(templateDir)
{
    return Q.nfcall(fs.readdir, templateDir).then(function (files)
    {
        return Q.all(files.map(function (file)
        {
            return getTemplateSource(file, templateDir);
        }));
    });
}

/**
 * Given a filename get an object containing the file, and the source of the
 * template function.
 *
 * @param file
 * @param cwd Optional. The cwd to evaluate the filename against.
 * @returns A promise which resolves to the template object
 */
function getTemplateSource(file, cwd)
{
    return Q.nfcall(fs.readFile, path.resolve(cwd || '.', file)).then(function (data)
    {
        return {
            file: file,
            cwd: cwd || null,
            template: _.template(data.toString()).source
        };
    });
}