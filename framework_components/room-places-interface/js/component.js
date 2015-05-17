var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;


var AddResource = React.createClass({
	getInitialState: function() {
		return {name: "", model: "IPAD", range: ""};
 	},
 	handleSubmit: function(e) {
 		e.preventDefault();

 		var name = this.refs.name.getDOMNode().value.trim();
 		var model = this.refs.model.getDOMNode().value.trim();
		var range;
		if(this.refs.range != undefined)
			range = this.refs.range.getDOMNode().value.trim();
		else
			range = 0;

 		nutella.net.publish("location/resource/add", {rid: name, model: model, type: this.props.type, proximity_range: parseFloat(range)});

 		// Clean the form
 		this.setState({name: "", range: ""});
 	},
	handleChangeName: function(e) {
		this.setState({name: event.target.value});
	},
	handleChangeModel: function(e) {
		this.setState({model: event.target.value});
	},
	handleChangeRange: function(e) {
		this.setState({range: event.target.value});
	},
	render: function() {
		var proxRange;
		if(this.props.type == "STATIC")
			proxRange = <input type="text" value={this.state.range} placeholder="Proximity range" onChange={this.handleChangeRange} ref="range"/>

		return(
			<tr>
				<td>
					<form onSubmit={this.handleSubmit}>
						<input type="text" value={this.state.name} placeholder="Name" onChange={this.handleChangeName} ref="name"/>
						{proxRange}
						<select value={this.state.model} onChange={this.handleChangeModel} ref="model">
							<option value="IMAC">iMac</option>
							<option value="IPHONE">iPhone</option>
							<option value="IPAD">iPad</option>
							<option value="IBEACON">iBeacon</option>
						</select>
						<input type="submit" />
					</form>
				</td>
			</tr>
		);
	}
});

var AddKeyValue = React.createClass({
	getInitialState: function() {
		return {key: "", value: ""};
	},
	handleChangeKey: function(e) {
		this.setState({key: event.target.value});
	},
	handleChangeValue: function(e) {
		this.setState({value: event.target.value});
	},
	handleSubmit: function(event) {
		event.preventDefault();

		var key = this.state.key;
		var value = this.state.value;

		if(key != "" && value != "") {
			nutella.net.publish("location/resource/update", {rid: this.props.rid, parameters: [{key: key, value: value}]});
			this.setState({key: "", value: ""});
		}
	},
	render: function() {
		return(
			<tr>
				<td>
					<form onSubmit={this.handleSubmit}><input type="text" value={this.state.key} placeholder="Key" onChange={this.handleChangeKey} onBlur={this.handleSubmit} ref="key"/></form>
				</td>
				<td>
					<form onSubmit={this.handleSubmit}><input type="text" value={this.state.value} placeholder="Value" onChange={this.handleChangeValue} onBlur={this.handleSubmit} ref="value"/></form>
				</td>
			</tr>
		);
	}
});

var KeyValue = React.createClass({
	getInitialState: function() {
		return {keyModification: false, valueModification: false, key: this.props._key, value: this.props.value, previousKey: this.props._key};
 	},
 	handleKeyChanged: function(event) {
 		this.setState({key: event.target.value});
 	},
 	handleValueChanged: function(event) {
 		this.setState({value: event.target.value});
 	},
 	handleKeyClicked: function() {
 		this.setState({keyModification: true}, function() {
 			this.refs.key.getDOMNode().focus();
 		});
 	},
 	handleValueClicked: function() {
 		this.setState({valueModification: true}, function() {
 			this.refs.value.getDOMNode().focus();
 		});
 	},
 	handleSubmit: function(event) {
 		event.preventDefault();

		if(this.state.key == "" || this.state.value == "")
			return;

		if(this.state.key != this.state.previousKey) {
			nutella.net.publish("location/resource/update", {rid: this.props.rid, parameters: [{key: this.state.previousKey, delete: true}]});
			nutella.net.publish("location/resource/update", {rid: this.props.rid, parameters: [{key: this.state.key, value: this.state.value}]});
		}
		else {
			nutella.net.publish("location/resource/update", {rid: this.props.rid, parameters: [{key: this.state.key, value: this.state.value}]});
		}

 		this.setState({keyModification: false, valueModification: false, previousKey: this.state.key});
 	},
	render: function() {
		var key;
		var value;
		if(this.state.keyModification)
			key = <form onSubmit={this.handleSubmit}><input type="text" placeholder="Key" ref="key" value={this.state.key} onChange={this.handleKeyChanged} onBlur={this.handleSubmit} /></form>
		else
			key = <div onClick={this.handleKeyClicked}>{this.state.key}</div>

		if(this.state.valueModification)
			value = <form onSubmit={this.handleSubmit}><input type="text" placeholder="Key" ref="value" value={this.state.value} onChange={this.handleValueChanged} onBlur={this.handleSubmit} /></form>
		else
			value = <div onClick={this.handleValueClicked}>{this.state.value}</div>

		return(
			<tr>
				<td>{key}</td>
				<td>{value}</td>
			</tr>
		);
	}
});

var Resource = React.createClass({
	getInitialState: function() {
		return {collapse: false};
 	},
	handleDelete: function() {
		this.props.handleDelete(this.props.rid);
	},
	handleCollapse: function() {
		this.setState({collapse: !this.state.collapse});
	},
	handleAddTrackingContinuous: function() {
		this.props.handleAddTracking(this.props.resource, "continuous");
	},
	handleAddTrackingDiscrete: function() {
		this.props.handleAddTracking(this.props.resource, "discrete");
	},
	handleAddTrackingNone: function() {
		this.props.handleAddTracking(this.props.resource, "none");
	},
	render: function() {
		var self = this;
		var keyValues = this.props.keyValues.map(function (keyValue, index) {
			return (
				<KeyValue key={keyValue.key+"-"+keyValue.value} _key={keyValue.key} value={keyValue.value} rid={self.props.rid}/>
			);
		});

		var _continuous = "";
		var _discrete = "";
		var _none = "";
		if(this.props.resource.discrete != undefined) {
			_discrete = " active";
		}
		else if(this.props.resource.continuous != undefined) {
			_continuous = " active";
		}
		else {
			_none = " active";
		}

		var addTracking = <div className="btn-group col-md-4 pull-right">
							<button className={"col-md-4 btn btn-default" + _continuous} type="button" aria-label="Left Align" onClick={this.handleAddTrackingContinuous}>
								<span className="glyphicon glyphicon-screenshot" aria-hidden="true" />
							</button>
							<button className={"col-md-4 btn btn-default" + _discrete} type="button" aria-label="Left Align" onClick={this.handleAddTrackingDiscrete}>
								<span className="glyphicon glyphicon-th" aria-hidden="true" />
							</button>
							<button className={"col-md-4 btn btn-default" + _none} type="button" aria-label="Left Align" onClick={this.handleAddTrackingNone}>
								<span className="glyphicon glyphicon-ban-circle" aria-hidden="true" />
							</button>
						</div>;

		if(this.props.resource.type == "DYNAMIC")
			addTracking = null;

		return(
			<tr>
				<td>
					<div className="col-md-4">{this.props.rid}</div>

					<button className="col-md-1 btn btn-default pull-right" type="button" data-toggle="collapse" data-target={"#collapse_"+this.props.rid} aria-expanded="true" aria-controls={"collapse_"+this.props.rid} onClick={this.handleCollapse}>
						<span className={this.state.collapse ? "glyphicon glyphicon-triangle-top" : "glyphicon glyphicon-triangle-bottom"} aria-hidden="true" />
					</button>

					<button className="col-md-1 btn btn-default pull-right" type="button" aria-label="Left Align" onClick={this.handleDelete}>
						<span className="glyphicon glyphicon-remove" aria-hidden="true" />
					</button>

					{addTracking}
					<div className="collapse" id={"collapse_"+this.props.rid}>
						<table className="table table-bordered table-striped">
							<ReactCSSTransitionGroup transitionName="example" component="tbody">
								<tr><th>Key</th><th>Value</th></tr>
								{keyValues}
								<AddKeyValue rid={this.props.rid}/>
							</ReactCSSTransitionGroup>
						</table>
					</div>
				</td>
			</tr>
		);
	}
});

var ResourceEstimote = React.createClass({
	handleDynamicAdd: function() {
		this.props.handleDynamicAdd(this.props.rid);
	},
	handleStaticAdd: function() {
		this.props.handleStaticAdd(this.props.rid);
	},
	render: function() {
		return(
			<tr>
				<td>
					<div className="col-md-4">{this.props.rid}</div>
					<button className="col-md-2 col-md-offset-4 btn btn-default" type="button" aria-label="Left Align" onClick={this.handleStaticAdd}>
						<span className="glyphicon glyphicon-plus" aria-hidden="true" />
					</button>
					<button className="col-md-2 btn btn-default" type="button" aria-label="Left Align" onClick={this.handleDynamicAdd}>
						<span className="glyphicon glyphicon-plus" aria-hidden="true" />
					</button>
				</td>
			</tr>
		);
	}
});


var ResourceTable = React.createClass({
	getInitialState: function() {
    	return {
    		resourceData: [],
    		estimoteData: []
    	};
 	},
 	componentDidMount: function() {
 		self = this;

 		// Download all resources
 		nutella.net.request("location/resources", {}, function(reply) {
 			self.setState({resourceData: reply.resources});
 		});

 		// Wait for new added resources
 		nutella.net.subscribe("location/resources/added", function(message) {
 			var data = self.state.resourceData;
 			data = data.concat(message.resources)

 			self.setState({resourceData: data});
 		});

		// Wait for updated resources
		nutella.net.subscribe("location/resources/updated", function(message) {
			var data = self.state.resourceData;
			data = data.filter(function(d) {
				return $.inArray(d.rid, message.resources.map(function(r) {
						return r.rid;
					})) == -1;
			});
			data = data.concat(message.resources)
			self.setState({resourceData: data});
		});

 		// Wait for removed resources
 		nutella.net.subscribe("location/resources/removed", function(message) {
 			var data = self.state.resourceData;
 			data = data.filter(function(d) { 
 				return $.inArray(d.rid, message.resources.map(function(r) {
 					return r.rid;
 				})) == -1;
 			});

 			self.setState({resourceData: data});
 		});

 		// Download estimote beacons data
		nutella.net.request("location/estimote", {}, function(reply) {
 			self.setState({estimoteData: reply.resources});
 		});
  	},
  	handleResourceDelete: function(rid) {
		nutella.net.publish("location/resource/remove", {rid: rid});

		// Delete the corresponding row
		var data = this.state.resourceData;
 		data = data.filter(function(d) { return d.rid != rid; });
 		this.setState({resourceData: data});
	},
	handleResourceEstimoteDynamicAdd: function(rid) {
		nutella.net.publish("location/resource/add", {rid: rid,
				model: "IBEACON",
				type: "DYNAMIC"
		});
	},
	handleResourceEstimoteStaticAdd: function(rid) {
		nutella.net.publish("location/resource/add", {rid: rid,
			model: "IBEACON",
			type: "STATIC",
			proximity_range: 1
		});
	},
	handleAddTracking: function(resource, type) {
		var x = this.props.room.x / 2;
		var y = this.props.room.y / 2;

		var message;

		switch(type) {
			case "continuous":
				message = {rid: resource.rid,
					continuous: {x: x, y: y}
				};
				break;

			case "discrete":
				message = {rid: resource.rid,
					discrete: {x: 0, y: 0}
				};
				break;
			default:
				message = {rid: resource.rid};
				break;
		}

		nutella.net.publish("location/resource/update", message);
	},
	render: function() {
		var self = this;

		// Order the resource list
		var resources = this.state.resourceData;
		resources = resources.sort(function(a, b) {return a.rid.localeCompare(b.rid)});

		var staticResourcesData = resources.filter(function(resource) { return resource.type == "STATIC"});
		var dynamicResourcesData = resources.filter(function(resource) { return resource.type == "DYNAMIC"});
		var estimoteResourcesData = this.state.estimoteData.filter(function(resource) {
				return $.inArray(resource.name, resources.map(function(r) {
 					return r.rid;
 				})) == -1; 
			});

		var staticResources = staticResourcesData.map(function (resource, index) {
			var keyValues = [];
			for(key in resource.parameters) {
				keyValues.push({key: key, value: resource.parameters[key]});
			}
			return (
				<Resource key={resource.rid}
					rid={resource.rid}
					resource={resource}
					room={self.props.room}
					handleDelete={self.handleResourceDelete}
					handleAddTracking={self.handleAddTracking}
					keyValues={keyValues}/>
			);
		});

		var dynamicResources = dynamicResourcesData.map(function (resource, index) {
			var keyValues = [];
			for(key in resource.parameters) {
				keyValues.push({key: key, value: resource.parameters[key]});
			}
			return (
				<Resource key={resource.rid}
					rid={resource.rid}
					resource={resource}
					room={self.props.room}
					handleDelete={self.handleResourceDelete}
					handleAddTracking={self.handleAddTracking}
					keyValues={keyValues}/>
			);
		});

		var estimoteResources = estimoteResourcesData.map(function (resource, index) {
			return (
				<ResourceEstimote key={resource.name}
					rid={resource.name}
					handleDynamicAdd={self.handleResourceEstimoteDynamicAdd}
					handleStaticAdd={self.handleResourceEstimoteStaticAdd}/>
			);
		});

		return(
			<div>
				<table className="table table-bordered table-striped">
					<ReactCSSTransitionGroup transitionName="example" component="tbody">
						<tr><th>Static resources</th></tr>
						{staticResources}
						<AddResource type="STATIC"/>
					</ReactCSSTransitionGroup>
				</table>

				<table className="table table-bordered table-striped">
					<ReactCSSTransitionGroup transitionName="example" component="tbody">
						<tr><th>Dynamic resources</th></tr>
						{dynamicResources}
						<AddResource type="DYNAMIC"/>

						<tr><th>Estimote iBeacon</th></tr>
						{estimoteResources}
					</ReactCSSTransitionGroup>
					
				</table>
			</div>
		);
	}
});
