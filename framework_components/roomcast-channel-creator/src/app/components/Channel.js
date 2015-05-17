
var React = require('react');
var Mui = require('material-ui');
var Paper = Mui.Paper;
var NutellaMixin = require('./NutellaMixin');
var AnimationMixin = require('./AnimationMixin');
var ColorPicker = require('./ColorPicker');
var TextField = Mui.TextField;
var RadioButtonGroup = Mui.RadioButtonGroup;
var RadioButton = Mui.RadioButton;
var FlatButton = Mui.FlatButton;
//var queue = require("queue-async");

/**
 * @prop channelId
 * @prop channel
 * @prop selected
 * @prop onselectedChannel
 */
var Channel = React.createClass({

    mixins: [NutellaMixin, AnimationMixin],

    componentDidMount: function() {
        this.imageFile = null;
        this.imageData_ = null;
    },

    /**
     * State
     * @returns selected: boolean
     *          side: 'front' or 'back'
     */
    getInitialState: function () {
        return  {
            selected: false,
            flipped: false,
            modifyField: null
        }
    },

    setModifyField: function(field) {
        this.setState({
            modifyField: field
        });
    },

    componentWillReceiveProps: function(nextProps) {
        if(nextProps.selected) {
            this.setState({
                selected: true
            });
        } else {
            this.setState({
                selected: false
            });
            this.setModifyField(null);
        }

    },

    handleSelectChannel: function() {
        this.props.onSelectChannel(this.props.channelId);
    },

    handleModifyIcon: function() {
        this.setModifyField('icon');
    },

    flipCard: function() {
        var self = this;
        this.setState({
            flipped: true
        });
        function callbackFlip() {
            self.addCSSClass(self.refs.cardFront.getDOMNode(), 'hidden-card');
            self.removeCSSClass(self.refs.cardBack.getDOMNode(), 'hidden-card');
            self.flipY(self.refs.card.getDOMNode(), 90, 180, false);
        }
        this.flipY(this.refs.card.getDOMNode(), 0, 90, false, callbackFlip);
    },

    flipCardBack: function() {
        var self = this;
        this.setState({
            flipped: false
        });
        function callbackFlip() {
            self.addCSSClass(self.refs.cardBack.getDOMNode(), 'hidden-card');
            self.removeCSSClass(self.refs.cardFront.getDOMNode(), 'hidden-card');
            self.flipY(self.refs.card.getDOMNode(), 90, 0, true);
        }
        this.flipY(this.refs.card.getDOMNode(), 180, 90, true, callbackFlip);
    },

    handleDeleteCard: function() {
        this.props.onDeleteCard(this.props.channelId);
    },

    addCSSClass: function(node, class_) {
        node.className += ' ' + class_;
    },

    removeCSSClass: function(node, class_) {
        var regex = new RegExp("(?:^|\\s)" + class_ + "(?!\\S)", "g");
        node.className = node.className.replace(regex, '');
    },

    handleSetName: function() {
        var value = this.refs['textFieldName' + this.props.channelId].getValue();
        this.props.onSetName(value);
    },

    handleSetDescription: function() {
        var value = this.refs['textFieldDescription' + this.props.channelId].getValue();
        this.props.onSetDescription(value);
    },

    handleSetType: function(e, value) {
        this.props.onSetType(value);
    },

    handleSetUrl: function() {
        var value = this.refs['textFieldUrl' + this.props.channelId].getValue();
        switch(this.props.channel.type) {
            case 'web':
                value = 'http://' + value;
                break;
            case 'iOS':
                value = value + '://';
                break;
            default:
        }
        this.props.onSetUrl(value);
    },

    validateInputName: function() {
        var value = this.refs['textFieldName' + this.props.channelId].getValue();
        if(value.length > 30) {
            event.returnValue = false;
        }
    },

    validateInputDescription: function() {
        var value = this.refs['textFieldDescription' + this.props.channelId].getValue();
        if(value.length > 50) {
            event.returnValue = false;
        }
    },

    handleUploadImage: function(e) {
        var node = e.target;
        if (node.files && node.files[0]) {
            var reader = new FileReader();
            reader.onload = this.handleLoadedImage;
            reader.readAsDataURL(node.files[0]);
            // Store file for later upload
            this.imageFile_ = node.files[0];
        }
    },

    handleLoadedImage: function(e) {
        // Set as temporary screenshot
        var imageData = e.target.result;
        this.imageData_ = imageData;
        this.refs['channel' + this.props.channelId].getDOMNode().style.backgroundImage = 'url(' + imageData + ')';
    },

    /**
     * Called on every Channel every time Save Changes is pressed
     */
    handleStoreImageOnServer: function() {
        var self = this;
        if(this.imageFile_) {
            ReactMain.imagesQueue++;
            nutella.net.bin.uploadFile(this.imageFile_, function(url) {
                self.props.onSetScreenshot(self.props.channelId, url);
                ReactMain.imagesQueue--;
                if(ReactMain.imagesQueue === 0) {
                    self.props.onSaveCallback();
                }
            });
        }
    },

    render: function() {

        var colorPicker = null;
        var onTouchTapIcon = this.handleModifyIcon;

        var backgroundImage;
        if(this.imageData_) {
            backgroundImage = 'url(' + this.imageData_ + ')';
        } else {
            backgroundImage = 'url(' + this.props.channel.screenshot + ')';
        }
        var style = {
            backgroundImage: backgroundImage,
            backgroundSize: '100% 100%'
        };

        var iconStyle = {
            backgroundColor: this.props.channel.icon
        };

        if(this.state.selected) {
            if (this.state.modifyField === 'icon') {
                colorPicker =
                    <ColorPicker ref='colorPicker'
                                 onPickColor={this.props.onPickColor}/>;
                onTouchTapIcon = null;
            }
        }

        var urlPlaceholder;
        var urlPrefix = null;
        var urlSuffix = null;
        var urlCleaned = this.props.channel.url;
        switch(this.props.channel.type) {
            case 'web':
                urlPlaceholder = 'URL:';
                urlPrefix = 'http://';
                urlCleaned = urlCleaned.slice(7, urlCleaned.length);
                break;
            case 'iOS':
                urlPlaceholder = 'Custom URL:';
                urlSuffix = '://';
                urlCleaned = urlCleaned.slice(0, urlCleaned.length - 3);
                break;
            default:
                urlPlaceholder = 'URL:';
        }

        var cardBack =
            <div className='card-back hidden-card' ref='cardBack'>

                <Paper className='channel'>

                    <div className='corner-icon flip-icon'> <i className="ion ion-android-settings" onTouchTap={this.flipCardBack} ></i> </div>

                    <div className='flex-centered' >
                        <div className='flex-content' >

                            <RadioButtonGroup
                                name="radio_buttons"
                                ref={'radioButtons' + this.props.channelId}
                                defaultSelected={this.props.channel.type}
                                onChange={this.handleSetType} >
                                <RadioButton
                                    value="web"
                                    label="Web channel"
                                    defaultChecked={true} />
                                <RadioButton
                                    value="iOS"
                                    label="iOS app channel" />
                            </RadioButtonGroup>

                            <div className='url-div' >

                                <span className='urlPlaceholder'> {urlPlaceholder} </span>
                                <span> {urlPrefix} </span>
                                <TextField
                                    ref={'textFieldUrl' + this.props.channelId}
                                    hintText={''}
                                    value={urlCleaned}
                                    multiLine={true}
                                    onChange={this.handleSetUrl} />
                                <span> {urlSuffix} </span>

                            </div>
                        </div>

                    </div>

                </Paper>

            </div>;

        var catalogueCard =
            <div className='card-container hovering-layer catalogue-card-style' ref='cardContainer' >

                <div className='card' ref='card'>

                    <div className='card-front' ref='cardFront'>

                        <div className='corner-icon delete-icon' > <i className="fa fa-times" ref='cornerIcon' onTouchTap={this.handleDeleteCard}></i> </div>

                        <Paper className='channel'
                               ref={'channel' + this.props.channelId}
                               style={style}
                               onTouchTap={this.handleSelectChannel} >

                            <div className='channel-div'>

                                <div className='channel-caption'>

                                    <div className='icon-name-wrapper'>

                                        <div className='channel-icon' ref='channelIcon' style={iconStyle} > </div>

                                        <div className='name-wrapper'>
                                            <p className='channel-name'> {this.props.channel.name} </p>
                                            <p className='channel-description'> {this.props.channel.description} </p>
                                        </div>

                                    </div>

                                </div>

                            </div>

                        </Paper>

                    </div>

                    {cardBack}

                </div>

            </div>;

        var detailCard =
            <div className='card-container detail-card-style' ref='cardContainer' >

                <div className='card' ref='card'>

                    <div className='card-front' ref='cardFront'>

                        {colorPicker}



                        <div className='corner-icon flip-icon' > <i className="ion ion-android-settings" ref='cornerIcon' onTouchTap={this.flipCard} ></i> </div>

                        <Paper className='channel'
                               ref={'channel' + this.props.channelId}
                               style={style} >

                            <div className='channel-div'>

                                <div className='channel-caption'>

                                    <div className='upload-button-container' >
                                        <FlatButton secondary={true}>
                                            <span className="mui-flat-button-label upload-image-button">Upload screenshot</span>
                                            <input type="file" id="imageButton" className="upload-image-input" onChange={this.handleUploadImage} ></input>
                                        </FlatButton>
                                    </div>

                                    <div className='icon-name-wrapper'>

                                        <div className='channel-icon modifiable' ref='channelIcon' style={iconStyle} onTouchTap={onTouchTapIcon} > </div>

                                        <div className='name-wrapper-edit'>

                                            <TextField
                                                ref={'textFieldName' + this.props.channelId}
                                                hintText={'Channel name'}
                                                value={this.props.channel.name}
                                                onChange={this.handleSetName}
                                                onKeyPress={this.validateInputName} />

                                            <TextField
                                                ref={'textFieldDescription' + this.props.channelId}
                                                hintText={'Channel description'}
                                                value={this.props.channel.description}
                                                onChange={this.handleSetDescription}
                                                onKeyPress={this.validateInputDescription} />

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </Paper>

                    </div>

                    {cardBack}

                </div>

            </div>;

        return this.state.selected? detailCard : catalogueCard;

    }

});

module.exports = Channel;

