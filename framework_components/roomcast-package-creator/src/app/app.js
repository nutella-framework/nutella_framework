(function () {
    var React = require('react'),
        injectTapEventPlugin = require("react-tap-event-plugin"),
        Main = require('./components/main.js'),
        NUTELLA = require('nutella_lib');

    //Needed for React Developer Tools
    window.React = React;

    //Needed for onTouchTap
    //Can go away when react 1.0 release
    //Check this repo:
    //https://github.com/zilverline/react-tap-event-plugin
    injectTapEventPlugin();

    var query_parameters = NUTELLA.parseURLParameters();
    if(query_parameters.broker) {
        window.nutella = NUTELLA.init(query_parameters.broker, query_parameters.app_id, query_parameters.run_id, 'roomcast-package-creator', function(connected) {
            if(connected) {
                window.ReactMain = React.render( <Main /> , document.body);
            }
        });
    } else {
        // for debugging purposes - works with tests outside of nutella
        window.nutella = NUTELLA.init('ltg.evl.uic.edu', 'wallcology', '6TV', 'roomcast-package-creator', function(connected) {
            window.ReactMain = React.render( <Main /> , document.body);
        });
    }

})();