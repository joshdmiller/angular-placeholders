/**
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

/**
 * Creates a placeholder image client-side for use during design and
 * development.
 *
 * TODO: Right now, it only supports `img` tags. This should be enforced in code
 * and default to adding a CSS `background-image` for non-`img` elements.
 */
angular.module( 'placeholders.img', [] )
.directive( 'phImg', function () {
  return {
    restrict: 'A',
    scope: { dimensions: '@phImg' },
    link: function( scope, element, attr ) {
      // A reference to a canvas that we can reuse
      var canvas;

      /**
       * The configurable parameters of the placeholder image.
       *
       * TODO: make configurable
       * TODO: make defaultable
       */
      var config = {
        text_size: 10,
        fill_color: '#EEEEEE',
        text_color: '#AAAAAA'
      };

      /**
       * When the provided dimensions change, re-pull the width and height and
       * then redraw the image.
       */
      scope.$watch('dimensions', function () {
        if( ! angular.isDefined( scope.dimensions ) ) {
            return;
        }
        var matches = scope.dimensions.match( /^(\d+)x(\d+)$/ ),
            dataUrl;
        
        if(  ! matches ) {
          console.error("Expected '000x000'. Got " + scope.dimensions);
          return;
        }
        
        // Grab the provided dimensions.
        scope.size = { w: matches[1], h: matches[2] };

        // FIXME: only add these if not already present
        element.prop( "title", scope.dimensions );
        element.prop( "alt", scope.dimensions );

        // And draw the image, getting the returned data URL.
        dataUrl = drawImage();

        // If this is an `img` tag, set the src as the data URL. Else, we set
        // the CSS `background-image` property to same.
        if ( element.prop( "tagName" ) === "IMG" ) {
          element.prop( 'src', dataUrl );
        } else {
          element.css( 'background-image', 'url("' + dataUrl + '")' );      
        }
      });

      /**
       * Calculate the maximum height of the text we can draw, based on the
       * requested dimensions of the image.
       */
      function getTextSize() {
        var dimension_arr = [scope.size.h, scope.size.w].sort(),
            maxFactor = Math.round(dimension_arr[1] / 16);

        return Math.max(config.text_size, maxFactor);
      }

      /**
       * Using the HTML5 canvas API, draw a placeholder image of the requested
       * size with text centered vertically and horizontally that specifies its
       * dimensions. Returns the data URL that can be used as an `img`'s `src`
       * attribute.
       */
      function drawImage() {
        // Create a new canvas if we don't already have one. We reuse the canvas
        // when if gets redrawn so as not to be wasteful.
        canvas = canvas || document.createElement( 'canvas' );
        
        // Obtain a 2d drawing context on which we can add the placeholder
        // image.
        var context = canvas.getContext( '2d' ),
            text_size,
            text;

        // Set the canvas to the appropriate size.
        canvas.width = scope.size.w;
        canvas.height = scope.size.h;

        // Draw the placeholder image square.
        // TODO: support other shapes
        // TODO: support configurable colors
        context.fillStyle = config.fill_color;
        context.fillRect( 0, 0, scope.size.w, scope.size.h );

        // Add the dimension text.
        // TODO: support configurable font
        // FIXME: ensure text will fit and resize if it doesn't
        text_size = getTextSize();
        text = scope.dimensions;
        context.fillStyle = config.text_color;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.font = 'bold '+text_size+'pt sans-serif';

        // If the text is too long to fit, reduce it until it will.
        if (context.measureText( text ).width / scope.size.w > 1) {
          text_size = config.text_size / (context.measureText( text ).width / scope.size.w);
          context.font = 'bold '+text_size+'pt sans-serif';
        }

        // Finally, draw the text in its calculated position.
        context.fillText( scope.dimensions, scope.size.w / 2, scope.size.h / 2 );

        // Get the data URL and return it.
        return canvas.toDataURL("image/png");
      }
    }
  };
});

