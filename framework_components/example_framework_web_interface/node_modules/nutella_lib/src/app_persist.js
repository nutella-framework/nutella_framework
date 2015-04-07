/**
 * App-level persistence APIs for nutella
 */



var AppPersistSubModule = function(main_nutella) {
    // Store a reference to the main module
    this.main_nutella = main_nutella;
};



AppPersistSubModule.prototype.test = function () {
    console.log("This is just a test method for the APP persist sub-module");
};



module.exports = AppPersistSubModule;
