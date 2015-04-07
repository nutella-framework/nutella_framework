/**
 * Run-level persistence APIs for nutella
 */



var PersistSubModule = function(main_nutella) {
    // Store a reference to the main module
    this.main_nutella = main_nutella;
};



PersistSubModule.prototype.test = function () {
    console.log("This is just a test method for the persist sub-module");
};



module.exports = PersistSubModule;
