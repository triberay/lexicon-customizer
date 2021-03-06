import React, {Component} from 'react';
import {connect} from 'react-redux';

import ColorPickerPanel from '../components/ColorPickerPanel';
import {resolveValue} from '../lib/var_util';
import {setColorVariableName} from '../actions/colorVariableName';
import {setVariable} from '../actions/variables';

const mapStateToProps = (state, ownProps) => {
	const name = state.get('colorVariableName');
	const variables = state.get('variables');

	let value;

	if (variables.has(name)) {
		value = variables.get(name).get('value');

		value = resolveValue(name, value, variables);
	}

	return {
		name,
		value,
		variables
	};
};

const mapDispatchToProps = (dispatch, ownProps) => {
	return {
		onChange: (value, name) => {
			dispatch(setVariable(name, value));
		},
		onClose: event => {
			dispatch(setColorVariableName(null));
		}
	}
};

export default connect(mapStateToProps, mapDispatchToProps)(ColorPickerPanel);
