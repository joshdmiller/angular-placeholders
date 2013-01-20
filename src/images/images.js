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

angular.module( 'placeholders.images', [] )
.directive( 'placeholderImage', function () {
  return {
    restrict: 'A',
    scope: { dimensions: '@placeholderImage' },
    link: function( scope, element, attr ) {
      // A reference to a canvas that we can reuse
      var canvas;

      // Recalculate the size when the attribute changes.
      scope.$watch('dimensions', function () {
        var matches = scope.dimensions.match( /^(\d+)x(\d+)$/ );
        
        if(  ! matches ) {
          console.error("Expected '000x000'. Got " + scope.dimensions);
          return;
        }
        
        scope.size = { w: matches[1], h: matches[2] };

        // FIXME: only add these if not already present
        element.prop( "title", scope.dimensions );
        element.prop( "alt", scope.dimensions );

        // And draw the image, setting the returned data URL as the image src.
        element.prop( 'src', drawImage() );
      });

      function drawImage() {
        // Create a new canvas if we don't already have one.
        canvas = canvas || document.createElement( 'canvas' );
        
        // Obtain a 2d drawing context on which we can add the placeholder
        // image.
        var context = canvas.getContext( '2d' );

        // Set the canvas to the appropriate size.
        canvas.width = scope.size.w;
        canvas.height = scope.size.h;

        // Draw the placeholder image square.
        // TODO: support other shapes
        // TODO: support configurable colors
        context.fillStyle = '#EEEEEE';
        context.fillRect( 0, 0, scope.size.w, scope.size.h );

        // Add the dimension text.
        // TODO: support configurable font
        // FIXME: ensure text will fit and resize if it doesn't
        context.fillStyle = '#AAAAAA';
        context.font = 'bold 10pt sans-serif';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText( scope.dimensions, scope.size.w / 2, scope.size.h / 2 );

        // Get the data URL and return it.
        return canvas.toDataURL("image/png");
      }
    }
  };
});

