var UIMessages = React.createClass({displayName: "UIMessages",
    getInitialState: function () {
        return {
            messages: [],
            from: undefined,
            to: undefined,
            type: undefined
        };
    },
    componentDidMount: function () {
        var self = this;
        notificationCenter.subscribe(Notifications.data.MESSAGE_DATA_CHANGE, function() {

            var messages = [];

            if(messageModel.data != undefined)
                messages = messageModel.data.messages;

            self.setState({messages: messages,
                    from:  messageModel.from,
                    to: messageModel.to,
                    type: messageModel.type
                });
        });

        messageModel.downloadMessages();

        /*
        messageModel.fetchData("data/message.json");

        setTimeout(function() {
            messageModel.fetchData("data/message.json");
        }, 10000)
        */
    },
    render: function () {
        var self = this;

        var messages = this.state.messages.map(function(message, index) {

            var date = new Date(message.date);

            return (
                React.createElement("div", {className: "panel-group", id: "accordion", role: "tablist", "aria-multiselectable": "true"}, 
                    React.createElement("div", {className: "panel panel-default"}, 
                        React.createElement("a", {"data-toggle": "collapse", "data-parent": "#accordion", href: "#collapse"+index, "aria-expanded": "true", "aria-controls": "collapse"+index}, 
                            React.createElement("div", {className: "panel-heading", role: "tab", id: "headingOne"}, 
                                React.createElement("h4", {className: "panel-title"}, 
                                date.getDate()+"/"+(date.getMonth()+1)+"/"+date.getFullYear()+" "+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds()+"."+date.getMilliseconds()+
                                " - "+message.type
                                )
                            )
                        ), 
                        React.createElement("div", {id: "collapse"+index, className: "panel-collapse collapse", role: "tabpanel", "aria-labelledby": "heading"+index}, 
                            React.createElement("div", {className: "panel-body"}, 
                                React.createElement("pre", null, 
                                    React.createElement("code", {className: "JSON"}, 
                                        JSON.stringify(message.payload, null, 4)
                                    )
                                )
                            )
                        )
                    )
                )
            );
        });

        return(
            React.createElement("div", {className: "modal-dialog modal-messages"}, 
                React.createElement("div", {className: "modal-content"}, 
                    React.createElement("div", {className: "modal-header"}, 
                        React.createElement("button", {type: "button", className: "close", "data-dismiss": "modal", "aria-label": "Close"}, 
                            React.createElement("span", {"aria-hidden": "true"}, "×")
                        ), 
                        React.createElement("h4", {className: "modal-title", id: "modalLabel"}, "Message display for channel ", React.createElement("span", {className: "label label-default"}, messageModel.channel)), 
                        React.createElement("svg", {style: {height: "40px", width: "100%"}, viewBox: "0 0 1000 40"}, 
                            React.createElement("text", {x: "50", y: "20", textAnchor: "middle", fill: "black"}, this.state.to), 
                            React.createElement("text", {x: "950", y: "20", textAnchor: "middle", fill: "black"}, this.state.from), 
                            React.createElement("line", {x1: "0", y1: "35", x2: "990", y2: "35", style: {stroke: "#425266", strokeWidth: "5"}}), 
                            self.state.type == messageModel.constant.type.publish ?
                            React.createElement("polygon", {points: "990,40 990,30 1000,35", style: {fill:"#425266",stroke:"#425266",strokeWidth:1}})
                            :
                            React.createElement("polygon", {points: "990,40 990,30 1000,30 1000,40", style: {fill:"#425266",stroke:"#425266",strokeWidth:1}})
                        )
                    ), 
                    React.createElement("div", {className: "modal-body"}, 
                    messages
                    ), 
                    React.createElement("div", {className: "modal-footer"}, 
                        React.createElement("button", {type: "button", className: "btn btn-default", "data-dismiss": "modal"}, "Close")
                    )
                )
            )
        );

    },
    componentDidUpdate: function() {
        $('pre code').each(function(i, block) {
            hljs.highlightBlock(block);
        });
    }
});

