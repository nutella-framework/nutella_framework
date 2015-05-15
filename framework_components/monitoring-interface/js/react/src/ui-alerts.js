var UIMailInput = React.createClass ({
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
            <div className={"input-group input-group-lg "+error}>
                <span className="input-group-addon" id="sizing-addon1">@</span>
                <input type="text" id="subscribeEmail" className="form-control" placeholder="e-mail" aria-describedby="sizing-addon1" value={this.state.email} onChange={this.handleChange}/>
                <span className="input-group-btn">
                    <button className={"btn "+btn} type="button" id="subscribeButton" onClick={this.handleSubmit}>Subscribe</button>
                </span>
            </div>
        )
    }
});

var UIAlerts = React.createClass ({
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
                <tr key={index}>
                    <td>
                        Administrator
                    </td>
                    <td>
                        {email}
                    </td>
                    <td>
                        <button type="button" className="close" aria-label="Close" onClick={_.partial(self.handleDelete, email)}><span aria-hidden="true">&times;</span></button>
                    </td>
                </tr>

            )
        });

        subscription = [];

        if(this.state.application != undefined) {
            subscription.push(<span>application: <span className="label label-default">{this.state.application}</span></span>);
        }

        if(this.state.instance != undefined) {
            subscription.push(<span> instance: <span className="label label-default">{this.state.instance}</span></span>);
        }

        if(this.state.component != undefined) {
            subscription.push(<span> component: <span className="label label-default">{this.state.component}</span></span>);
        }

        return (
            <div className="modal-dialog modal-messages">
                <div className="modal-content">
                    <div className="modal-header">
                        <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        <h4 className="modal-title text-center" id="myMailLabel">Subscription to {subscription}</h4>
                    </div>
                    <div className="modal-body">
                        <UIMailInput application={self.state.application} instance={self.state.instance} component={self.state.component}/>
                        <div className = "panel panel-default">
                            <table className="table table-striped">
                                <thead>
                                <tr>
                                    <th>Role</th>
                                    <th>Email</th>
                                    <th></th>
                                </tr>
                                </thead>
                                <tbody>
                                    {emails}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        );
    }
});

function validateEmail(email) {
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);
}