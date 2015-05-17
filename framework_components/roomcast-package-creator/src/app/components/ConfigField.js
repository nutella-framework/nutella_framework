var React = require('react');
var Mui = require('material-ui');

var ConfigField = React.createClass({

    componentDidMount: function() {
        this.setValue(this.props.value);
    },

    componentDidUpdate: function() {
        if(this.props.hasToUpdateValues) {
            this.setValue();
            this.props.onUpdatedValues();
        }
    },

    handleChange: function() {
        if(!this.props.lastItem) {
            this.props.onChange(this.props.configId, this.refs.configInput.getDOMNode().value);
        }
    },

    setValue: function() {
        this.refs.configInput.getDOMNode().value = this.props.value;
    },

    getValue: function() {
        return this.refs.configInput.getDOMNode().value;
    },

    render: function() {

        return (

            <div className='config-text-field-div'>
                <input
                    ref='configInput'
                    type='text'
                    className='config-input'
                    placeholder={this.props.placeholder}
                    onChange={this.handleChange}
                    required={true} />
            </div>);

    }

});

module.exports = ConfigField;

