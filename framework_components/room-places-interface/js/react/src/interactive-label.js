var InteractiveLabel = React.createClass({
    getInitialState: function () {
        return {
            value: this.props.labelValue
        };
    },
    componentWillReceiveProps: function(nextProps) {
        this.setState({
            value: nextProps.labelValue
        });
    },
    onBlur: function(event) {
        this.onSubmit();

        return false;
    },
    onSubmit: function(event) {
        if(this.props.id != undefined) {
            $("#"+this.props.id).attr("v", this.state.value);
        }
        this.props.onValueChange(this.props.labelName, this.props.labelKey, this.state.value);

        if(event != undefined) {
            event.preventDefault();
        }

        return false;
    },
    handleChange: function(event) {
        this.setState({value: event.target.value});
    },
    render: function() {
        return (
            <form onSubmit={this.onSubmit}>
                {this.props.id != undefined ?
                    <input
                        id={this.props.id}
                        className="pointer"
                        value={this.state.value}
                        onKeyPress={this.props.onKeyPress}
                        onChange={this.handleChange}
                        onBlur={this.onBlur}/>
                    :
                    <input
                        className="pointer"
                        value={this.state.value}
                        onKeyPress={this.props.onKeyPress}
                        onChange={this.handleChange}
                        onBlur={this.onBlur}/>
                }
            </form>
        )
    }
});