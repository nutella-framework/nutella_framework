var UIMailInput = React.createClass ({displayName: "UIMailInput",
    getInitialState: function() {
        return {
            email: "",
            validMail: undefined
        }
    },
    handleChange: function(event) {
        this.setState({email: event.target.value,
            validMail: validateEmail(event.target.value) ? true : undefined});
    },
    handleSubmit: function() {

        if(validateEmail(this.state.email) == false) {
            this.setState({validMail: false});
            return;
        }

        var message = {
            application: this.props.application,
            mail: this.state.email
        };

        if(this.props.instance != undefined) {
            message.instance = this.props.instance;
        }

        if(this.props.component != undefined) {
            message.component = this.props.component;
        }

        nutella.net.publish("monitoring/alert/add", message);
        alertsModel.fetchData();
        console.log(message);
    },
    render: function() {
        var error = "has-success";
        var btn = "btn-success";
        if(this.state.validMail == false) {
            error = "has-error";
            btn = "btn-danger";
        }
        if(this.state.validMail == undefined) {
            error = "has-warning";
            btn = "btn-warning";
        }

        return(
            React.createElement("div", {className: "input-group input-group-lg "+error}, 
                React.createElement("span", {className: "input-group-addon", id: "sizing-addon1"}, "@"), 
                React.createElement("input", {type: "text", id: "subscribeEmail", className: "form-control", placeholder: "e-mail", "aria-describedby": "sizing-addon1", value: this.state.email, onChange: this.handleChange}), 
                React.createElement("span", {className: "input-group-btn"}, 
                    React.createElement("button", {className: "btn "+btn, type: "button", id: "subscribeButton", onClick: this.handleSubmit}, "Subscribe")
                )
            )
        )
    }
});

var UIAlerts = React.createClass ({displayName: "UIAlerts",
    getInitialState: function() {
        return {
            application: undefined,
            instance: undefined,
            component: undefined,
            emails: []

        }
    },

    componentDidMount: function() {
        var self = this;

        notificationCenter.subscribe(Notifications.alerts.ALERT_CHANGE, function() {
            self.setState({
                application: alertsModel.application,
                instance: alertsModel.instance,
                component: alertsModel.component
            });
        });

        notificationCenter.subscribe(Notifications.alerts.EMAILS_CHANGE, function() {
            self.setState({
                emails: alertsModel.emails
            });
        });
    },
    handleDelete: function(mail) {
        var message = {
            application: this.state.application,
            mail: mail
        };

        if(this.state.instance != undefined) {
            message.instance = this.state.instance;
        }

        if(this.state.component != undefined) {
            message.component = this.state.component;
        }

        nutella.net.publish("monitoring/alert/remove", message);
        alertsModel.fetchData();
    },
    render: function() {
        var self = this;

                    //<div className="floatLeft"><h4>{email}</h4></div>
                    //<div className="floatLeft"><h4><b>X</b></h4></div>
        var emails = this.state.emails.map(function(email, index) {
            return (
                React.createElement("tr", {key: index}, 
                    React.createElement("td", null, 
                        "Administrator"
                    ), 
                    React.createElement("td", null, 
                        email
                    ), 
                    React.createElement("td", null, 
                        React.createElement("button", {type: "button", className: "close", "aria-label": "Close", onClick: _.partial(self.handleDelete, email)}, React.createElement("span", {"aria-hidden": "true"}, "×"))
                    )
                )

            )
        });

        subscription = [];

        if(this.state.application != undefined) {
            subscription.push(React.createElement("span", null, "application: ", React.createElement("span", {className: "label label-default"}, this.state.application)));
        }

        if(this.state.instance != undefined) {
            subscription.push(React.createElement("span", null, " instance: ", React.createElement("span", {className: "label label-default"}, this.state.instance)));
        }

        if(this.state.component != undefined) {
            subscription.push(React.createElement("span", null, " component: ", React.createElement("span", {className: "label label-default"}, this.state.component)));
        }

        return (
            React.createElement("div", {className: "modal-dialog modal-messages"}, 
                React.createElement("div", {className: "modal-content"}, 
                    React.createElement("div", {className: "modal-header"}, 
                        React.createElement("button", {type: "button", className: "close", "data-dismiss": "modal", "aria-label": "Close"}, React.createElement("span", {"aria-hidden": "true"}, "×")), 
                        React.createElement("h4", {className: "modal-title text-center", id: "myMailLabel"}, "Subscription to ", subscription)
                    ), 
                    React.createElement("div", {className: "modal-body"}, 
                        React.createElement(UIMailInput, {application: self.state.application, instance: self.state.instance, component: self.state.component}), 
                        React.createElement("div", {className: "panel panel-default"}, 
                            React.createElement("table", {className: "table table-striped"}, 
                                React.createElement("thead", null, 
                                React.createElement("tr", null, 
                                    React.createElement("th", null, "Role"), 
                                    React.createElement("th", null, "Email"), 
                                    React.createElement("th", null)
                                )
                                ), 
                                React.createElement("tbody", null, 
                                    emails
                                )
                            )
                        )
                    ), 

                    React.createElement("div", {className: "modal-footer"}, 
                        React.createElement("button", {type: "button", className: "btn btn-default", "data-dismiss": "modal"}, "Close")
                    )
                )
            )
        );
    }
});

function validateEmail(email) {
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);
}