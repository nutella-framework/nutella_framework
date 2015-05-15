var UIMessages = React.createClass({
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
                <div className="panel-group" id="accordion" role="tablist" aria-multiselectable="true">
                    <div className="panel panel-default">
                        <a data-toggle="collapse" data-parent="#accordion" href={"#collapse"+index} aria-expanded="true" aria-controls={"collapse"+index}>
                            <div className="panel-heading" role="tab" id="headingOne">
                                <h4 className="panel-title">
                                {date.getUTCDate()+"/"+(date.getUTCMonth()+1)+"/"+date.getUTCFullYear()+" "+date.getUTCHours()+":"+date.getUTCMinutes()+":"+date.getUTCSeconds()+"."+date.getUTCMilliseconds()+
                                " - "+message.type}
                                </h4>
                            </div>
                        </a>
                        <div id={"collapse"+index} className="panel-collapse collapse" role="tabpanel" aria-labelledby={"heading"+index}>
                            <div className="panel-body">
                                <pre>
                                    <code className="JSON">
                                        {JSON.stringify(message.payload, null, 4)}
                                    </code>
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            );
        });

        return(
            <div className="modal-dialog modal-messages">
                <div className="modal-content">
                    <div className="modal-header">
                        <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                        <h4 className="modal-title" id="modalLabel">Message display</h4>
                        <svg style={{height: "40px", width: "100%"}} viewBox="0 0 1000 40">
                            <text x="50" y="20" textAnchor="middle" fill="black">{this.state.to}</text>
                            <text x="950" y="20" textAnchor="middle" fill="black">{this.state.from}</text>
                            <line x1="0" y1="35" x2="990" y2="35" style={{stroke: "#425266", strokeWidth: "5"}} />
                            {self.state.type == messageModel.constant.type.publish ?
                            <polygon points="990,40 990,30 1000,35" style={{fill:"#425266",stroke:"#425266",strokeWidth:1}} />
                            :
                            <polygon points="990,40 990,30 1000,30 1000,40" style={{fill:"#425266",stroke:"#425266",strokeWidth:1}} />}
                        </svg>
                    </div>
                    <div className="modal-body">
                    {messages}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        );

    },
    componentDidUpdate: function() {
        $('pre code').each(function(i, block) {
            hljs.highlightBlock(block);
        });
    }
});

