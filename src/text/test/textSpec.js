describe( 'TextGeneratorService', function () {
  // Load the module.
  beforeEach(module('placeholders.text'));

  beforeEach(inject(function( _TextGeneratorService_ ) {
    TextGeneratorService = _TextGeneratorService_;
  }));

  it( 'should create a sentence with a specified word count', inject(function () {
    var sentenceLength = 10,
        sentence = TextGeneratorService.createSentence( sentenceLength ).split( ' ' );

    // It should return an array with the specified number of words.
    expect( sentence.length ).toBe( sentenceLength );
  }));

  it( 'should create a sentence with a random word count', inject(function () {
    var sentence = TextGeneratorService.createSentence().split( ' ' );

    // It should return an array with the specified number of words.
    expect( sentence.length ).toBeGreaterThan( 4 );
    expect( sentence.length ).toBeLessThan( 21 );
  }));
});

describe( 'placeholderText Directive', function () {
  // Load the module.
  beforeEach(module('placeholders.text'));

  beforeEach(inject(function (_$rootScope_, _$compile_) {
    scope = _$rootScope_;
    $compile = _$compile_;
  }));

  it( 'should add the specified number of sentences', function () {
    scope.numSentences = 5;
    
    var tpl =  '<div placeholder-text num-sentences="{{numSentences}}"></div>',
        element = $compile( tpl )( scope ),
        text;

    // Get the inner text of the element.
    text = element.text();

    // It should have the specified number of sentences. We have to take one
    // *less* than the length after the split because 5 periods makes 6
    // segments.
    expect( text.split('.').length - 1 ).toBe( scope.numSentences );
  });

});

