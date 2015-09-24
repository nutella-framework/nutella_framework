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
    if(query_parameters[0]) {
        window.nutella = NUTELLA.init(query_parameters.broker, query_parameters.app_id, query_parameters.run_id, 'roomcast-package-creator', function(connected) {
            if(connected) {
                window.ReactMain = React.render( <Main /> , document.body);
            }
        });
    } else {
        window.nutella = NUTELLA.init('52.1.142.215', 't1', 'default', 'roomcast-package-creator', function(connected) {
            window.ReactMain = React.render( <Main /> , document.body);
        });
    }

})();