
(function () {
    var React = require('react'),
        injectTapEventPlugin = require("react-tap-event-plugin"),
        Main = require('./components/main.js');

    window.React = React;
    window.getSelection().removeAllRanges();

    injectTapEventPlugin();

    window.ReactMain = React.render(React.createElement(Main), document.body);
    ReactMain.login = {};

})();