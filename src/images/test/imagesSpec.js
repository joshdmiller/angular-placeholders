describe( 'placeholderImage', function () {
  beforeEach( module( 'placeholders.images' ) );

  beforeEach( inject( function ( _$rootScope_, _$compile_) {
    $compile = _$compile_;
    scope = _$rootScope_;

    scope.w = 300;
    scope.h = 150;

    element = $compile( '<img placeholder-image="{{w}}x{{h}}" />' )( scope );
    scope.$digest();
  }));

  it( 'should add an image source', inject( function () {
    expect( element.prop("src") ).toBeTruthy();
  }));

  it( 'should create an image of appropriate dimensions', inject( function () {
    expect( element.prop( 'naturalWidth' ) ).toBe( scope.w );
    expect( element.prop( 'naturalHeight' ) ).toBe( scope.h );
  }));
  
  it( 'should add the title and alt attributes', inject( function () {
    var dimensions = scope.w+'x'+scope.h;
    expect( element.prop( 'alt' ) ).toBe( dimensions );
    expect( element.prop( 'title' ) ).toBe( dimensions );
  }));
});

