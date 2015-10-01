
(function () {

    var React = require('react'),
        injectTapEventPlugin = require("react-tap-event-plugin"),
        Main = require('./components/main'), // Our custom react component
        NUTELLA = require('nutella_lib');

    //Needed for React Developer Tools
    window.React = React;
    injectTapEventPlugin();

    var query_parameters = NUTELLA.parseURLParameters();
    if(query_parameters.broker) {
        window.nutella = NUTELLA.init(query_parameters.broker, query_parameters.app_id, query_parameters.run_id, 'roomcast-channel-creator', function(connected) {
            if(connected) {
                window.ReactMain = React.render( <Main /> , document.body);
                ReactMain.imagesQueue = 0;
            }
        });
    } else {
        window.nutella = NUTELLA.init('52.1.142.215', 't1', 'default', 'roomcast-channel-creator', function(connected) {
            window.ReactMain = React.render( <Main /> , document.body);
            ReactMain.imagesQueue = 0;
        });
    }

})();