describe( 'phImg', function () {
  beforeEach( module( 'placeholders.img' ) );

  beforeEach( inject( function ( _$rootScope_, _$compile_) {
    $compile = _$compile_;
    scope = _$rootScope_;

    scope.w = 300;
    scope.h = 150;

    element = $compile( '<img ph-img="{{w}}x{{h}}" />' )( scope );
    scope.$digest();
  }));

  it( 'should create an image of appropriate dimensions', inject( function () {
    // Unfortunately, it can take just a few milliseconds sometimes for the
    // creation of the canvas and assigning its data url to the image. So we
    // have to call this asynchronously.
    waits(10);
    runs(function () {
      expect( element.prop("src") ).toBeTruthy();
      
      expect( element.prop( 'naturalWidth' ) ).toBe( scope.w );
      expect( element.prop( 'naturalHeight' ) ).toBe( scope.h );
    });
  }));
  
  it( 'should add the title and alt attributes', inject( function () {
    var dimensions = scope.w+'x'+scope.h;
    expect( element.prop( 'alt' ) ).toBe( dimensions );
    expect( element.prop( 'title' ) ).toBe( dimensions );
  }));

  it( 'should set the CSS `background-image` property if tag is not an img', inject( function () {
    element = $compile( '<div ph-img="{{w}}x{{h}}"></div>' )( scope );
    scope.$digest();

    var bgImg = element.css( 'background-image' );
    expect( bgImg.length ).toBeGreaterThan( 0 );
  }));
});

