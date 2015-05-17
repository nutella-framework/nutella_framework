if( typeof NUTELLA === 'undefined' ) {
  var NUTELLA = require('../src/nutella_lib');
  var assert = require('chai').assert;
} else {
  var assert = chai.assert;
}



describe('Nutella', function(){
  describe('NUTELLA', function(){
    it('should return defined when called', function(){
      assert.notEqual(undefined, NUTELLA, 'NUTELLA is undefined!');
    })
  })
})