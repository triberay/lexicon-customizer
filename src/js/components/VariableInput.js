import enhanceWithClickOutside from 'react-click-outside';
import React, { Component, PropTypes } from 'react';

import ColorPicker from './ColorPicker';
import {resolveColorValue} from '../lib/color';

class VariableInput extends Component {
	constructor(props) {
		super(props);

		this.state = {
			autoCompleteActive: false,
			autoCompleteIndex: 0,
			colorPickerVisible: false,
			focused: false
		};
	}

	render() {
		let { label, name, onChange, value, variables } = this.props;
		let { autoCompleteActive, focused } = this.state;

		let autoComplete = '';
		let colorPicker = '';

		let className = 'form-control';

		if (autoCompleteActive) {
			focused = true;
		}

		if (focused && value && value.length > 1 && value[0] == '$') {
			autoComplete = this._renderAutoComplete(value, variables);
		}

		if (this.props.color) {
			className += ' color-input';

			let resolvedValue = resolveColorValue(name, value, variables);

			colorPicker = (
				<ColorPicker onChange={this.handleColorPickerChange.bind(this)} value={resolvedValue} />
			);
		}

		return (
			<div className="form-group variable-input">
				<label htmlFor={name}>{name}</label>

				<input
					className={className}
					name={name}
					onBlur={this.handleInputBlur.bind(this)}
					onChange={this.handleInputChange.bind(this)}
					onFocus={this.handleInputFocus.bind(this)}
					onKeyDown={this.handleInputKeyDown.bind(this)}
					ref="input"
					type="text"
					value={value}
				/>

				{autoComplete}

				{colorPicker}
			</div>
		);
	}

	componentDidUpdate(event) {
		let { autoCompleteActive } = this.state;

		let active = this._isAutoCompleteActive();

		if (autoCompleteActive != active) {
			this.setState({
				autoCompleteActive: active
			});
		}
	}

	handleAutoCompleteClick(event) {
		let value = event.target.getAttribute('data-value');

		let { name, onChange } = this.props;

		this.setState({
			autoCompleteIndex: 0
		});

		onChange(name, value);
	}

	handleAutoCompleteMouseEnter(event) {
		this.setState({
			autoCompleteActive: true
		});
	}

	handleAutoCompleteMouseLeave(event) {
		this.setState({
			autoCompleteActive: false
		});
	}

	handleColorPickerChange(value) {
		let { onChange, name } = this.props;

		onChange(name, value);
	}

	handleInputBlur(event) {
		this.setState({
			focused: false
		});
	}

	handleInputChange(event) {
		let { onChange, name } = this.props;

		onChange(name, event.currentTarget.value);
	}

	handleInputFocus(event) {
		this.setState({
			focused: true
		});
	}

	handleInputKeyDown(event) {
		let { autoCompleteActive, autoCompleteIndex } = this.state;

		if (!autoCompleteActive) {
			return;
		}

		let key = event.key;

		let autoCompleteList = this._getAutoCompleteMenuList();

		let listLength = autoCompleteList.length;

		if (key == 'Enter') {
			let value = autoCompleteList[autoCompleteIndex].getAttribute('data-value');

			let { name, onChange } = this.props;

			this.setState({
				autoCompleteIndex: 0
			});

			onChange(name, value);
		}
		else if (key == 'ArrowDown') {
			if (autoCompleteIndex + 1 < listLength) {
				this.setState({
					autoCompleteIndex: autoCompleteIndex + 1
				});
			}
		}
		else if (key == 'ArrowUp') {
			if (autoCompleteIndex > 0) {
				this.setState({
					autoCompleteIndex: autoCompleteIndex - 1
				});
			}
		}

		this.setState({
			colorPickerVisible: false
		});
	}

	_isAutoCompleteActive() {
		let { autoCompleteMenu } = this.refs;

		return autoCompleteMenu && autoCompleteMenu.children.length;
	}

	_getAutoCompleteMenuList() {
		return this.refs.autoCompleteMenu.children;
	}

	_renderAutoComplete(value, modifiedVariables) {
		if (modifiedVariables[value]) {
			return '';
		}

		let handleAutoCompleteClick = this.handleAutoCompleteClick.bind(this);

		let autoCompleteIndex = this.state.autoCompleteIndex;
		let reducedIndex = 0;

		let items = Object.keys(modifiedVariables).reduce(function(previousValue, currentValue, currentIndex, array) {
			if (currentValue.indexOf(value) == 0) {
				previousValue.push(
					<div
						className="auto-complete-item"
						data-selected={autoCompleteIndex == reducedIndex}
						data-value={currentValue}
						key={currentValue}
						onClick={handleAutoCompleteClick}
					>
						{currentValue}
					</div>
				);

				reducedIndex++;
			}

			return previousValue;
		}, []);

		return (
			<div
				className="input-auto-complete-menu"
				onMouseEnter={this.handleAutoCompleteMouseEnter.bind(this)}
				onMouseLeave={this.handleAutoCompleteMouseLeave.bind(this)}
				ref="autoCompleteMenu"
			>
				{items}
			</div>
		);
	}
}

VariableInput.propTypes = {
	label: PropTypes.string.isRequired,
	name: PropTypes.string.isRequired,
	onChange: PropTypes.func.isRequired,
	value: PropTypes.string.isRequired
};

export default enhanceWithClickOutside(VariableInput);
