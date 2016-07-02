'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _immutable = require('immutable');

var _redux_util = require('../lib/redux_util');

var actionHandlers = {
	SET_GROUP_VARIABLES: function SET_GROUP_VARIABLES(state, action) {
		return state;
	},

	SET_COMPONENT_VARIABLES: function SET_COMPONENT_VARIABLES(state, action) {
		return state;
	},

	SET_VARIABLE: function SET_VARIABLE(state, action) {
		var name = action.name;
		var value = action.value;


		var variable = state.get(name);

		return state.set(name, variable.set('value', value));
	},

	SET_VARIABLES: function SET_VARIABLES(state, _ref) {
		var variables = _ref.variables;

		if (_immutable.OrderedMap.isOrderedMap(variables)) {
			return variables;
		} else {
			return state;
		}
	}
};

exports.default = (0, _redux_util.createReducer)((0, _immutable.OrderedMap)(), actionHandlers);