# Placeholders for AngularJS!

See the [demo](http://joshdmiller.github.com/angular-placeholders)!

---

## Placeholder Text

angular-placeholders includes a `phTxt` directive for the insertion of
"Lorem ipsum"-style text. It can work as either an element or an attribute and
accepts two optional attributes: `num-sentences` and `num-paragraphs`. If
`num-sentences` is provided, the body of the element will be replaced with the
specified number of sentences. `num-paragraphs` will replace the body of the
element with the specified number of `<p>` tags containing random sentences. 

The default behavior is a random number of paragraphs.

## Placeholder Images

The `phImg` directive creates client-side placeholder images in any
size. The directive creates a PNG image using the HTML5 canvas library and
uses the generated client-side URL as the `src` on an `img` element.

The directive takes a single eponymous attribute that specifies the dimensions
of the image to create; the expected format is "100x100".

## Building

The build toolchain for angular-placeholders was ~~stolen~~ borrowed from the
[ui-bootstrap](http://github.com/angular-ui/bootstrap) project.

The build script is written using [Grunt](http://gruntjs.com), a command-line
build tool for JavaScript projects. To build, run the following command in the
terminal:

    $ grunt

That was easy! It will run tests, generate the documentation/demo site, compile
the modules, and minify the source. The resulting files will be in the `dist/`
directory.

