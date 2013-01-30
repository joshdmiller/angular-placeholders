The `phImg` directive creates client-side placeholder images in any
size. The directive creates a PNG image using the HTML5 canvas library and
uses the generated client-side URL as either (a) the `src` attribute, if the
element is an `img`, or (b) the `css-background` for all other types of
elements.

The directive takes a single eponymous attribute that specifies the dimensions
of the image to create; the expected format is "100x100".
