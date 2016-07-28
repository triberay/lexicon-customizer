import Dropdown from 'react-dropdown'
import enhanceWithClickOutside from 'react-click-outside';
import React, {Component, PropTypes} from 'react';

import Icon from '../components/Icon';
import {resolveColorValue} from '../lib/color';

const numberRegex = /^([0-9]+)$/;

const unitRegex = /^(-)?([0-9\.]+)(px|em|ex|%|in|cm|mm|pt|pc)/;

class VariableInput extends Component {
	constructor(props) {
		super(props);

		this.state = {
			autoCompleteActive: false,
			autoCompleteIndex: 0,
			focused: false
		};
	}

	render() {
		let {label, name, onChange, value, variables} = this.props;
		let {autoCompleteActive, focused} = this.state;

		let autoComplete = '';
		let inputPlugin = '';

		let className = 'form-control';

		if (autoCompleteActive) {
			focused = true;
		}

		if (focused && value && value.length > 1 && value[0] == '$') {
			autoComplete = this._renderAutoComplete(name, value, variables);
		}

		if (this._isColor(name)) {
			className += ' color-input';

			inputPlugin = this.renderColorPickerTrigger(name, value, variables);
		}
		else if (this._isRange(value)) {
			inputPlugin = this.renderRangePicker(name, value);
		}

		return (
			<div className="form-group variable-input">
				{this.renderToolbar()}

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

				{inputPlugin}
			</div>
		);
	}

	renderAutoComplete(name, value, variables) {
		if (variables.has(value)) {
			return '';
		}

		variables = variables.takeUntil((value, key) => {
			return key === name;
		});

		let autoCompleteIndex = this.state.autoCompleteIndex;
		let reducedIndex = 0;

		let items = variables.toArray().reduce((result, item) => {
			const itemName = item.get('name');

			if (itemName.indexOf(value) == 0) {
				result.push(
					<div
						className="auto-complete-item"
						data-selected={autoCompleteIndex == reducedIndex}
						data-value={itemName}
						key={itemName}
						onClick={this.handleAutoCompleteClick.bind(this)}
					>
						{itemName}
					</div>
				);

				reducedIndex++;
			}

			return result;
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

	renderColorPickerTrigger(name, value, variables) {
		const resolvedValue = resolveColorValue(name, value, variables);

		return (
			<div className="color-picker-trigger" onClick={this.props.onColorPickerTriggerClick.bind(null, name, resolvedValue)}>
				<div className="color-picker-trigger-preview" style={this._getTriggerStyle(resolvedValue)}></div>

				<div className="color-picker-trigger-checkerboard"></div>
			</div>
		);
	}

	renderRangePicker() {
		return (
			<div className="range-picker">
				<a
					className="range-picker-up"
					href="javascript:;"
					onClick={this.handleRangePickerClick.bind(this, true)}
				>
					<Icon icon="angle-up" />
				</a>

				<a
					className="range-picker-down"
					href="javascript:;"
					onClick={this.handleRangePickerClick.bind(this, false)}
				>
					<Icon icon="angle-down" />
				</a>
			</div>
		);
	}

	renderToolbar() {
		const instance = this;

		const {name, toolbar, value} = this.props;

		let toolbarContent = '';

		if (toolbar && toolbar.length) {
			toolbarContent = toolbar.map((button, index) => {
				const {action, icon} = button;

				return (
					<a className="variable-input-action" href="javascript:;" key={`action${index}`} onClick={action.bind(null, name, value)}>
						<Icon icon={icon} />
					</a>
				);
			});
		}

		return toolbarContent;
	}

	componentDidUpdate(event) {
		let {autoCompleteActive} = this.state;

		let active = this._isAutoCompleteActive();

		if (autoCompleteActive != active) {
			this.setState({
				autoCompleteActive: active
			});
		}
	}

	handleAutoCompleteClick(event) {
		const value = event.target.getAttribute('data-value');

		const {name, onChange} = this.props;

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

	handleInputBlur(event) {
		this.setState({
			focused: false
		});
	}

	handleInputChange(event) {
		let {onChange, name} = this.props;

		onChange(name, event.currentTarget.value);
	}

	handleInputFocus(event) {
		this.setState({
			focused: true
		});
	}

	handleInputKeyDown(event) {
		let {autoCompleteActive, autoCompleteIndex} = this.state;

		if (!autoCompleteActive) {
			return;
		}

		let key = event.key;

		let autoCompleteList = this._getAutoCompleteMenuList();

		let listLength = autoCompleteList.length;

		if (key == 'Enter') {
			let value = autoCompleteList[autoCompleteIndex].getAttribute('data-value');

			let {name, onChange} = this.props;

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
	}

	handleRangePickerClick(up) {
		const {name, onChange, value} = this.props;

		let numberMatch = value.match(numberRegex);
		let unitMatch = value.match(unitRegex);

		if (unitMatch) {
			let [input, negative, amount, unit] = unitMatch;

			amount = _.toNumber(amount);

			if (negative) {
				up = !up;
			}

			if (up) {
				amount++;
			}
			else {
				amount--;
			}

			if (amount == 0) {
				negative = false;
			}

			input = `${negative ? '-' : ''}${amount}${unit}`;

			onChange(name, input);
		}
		else if (numberMatch) {
			let amount = _.toNumber(numberMatch[1]);

			if (up) {
				amount++;
			}
			else {
				amount--;
			}

			onChange(name, amount.toString());
		}
	}

	_isAutoCompleteActive() {
		let {autoCompleteMenu} = this.refs;

		return autoCompleteMenu && autoCompleteMenu.children.length;
	}

	_getAutoCompleteMenuList() {
		return this.refs.autoCompleteMenu.children;
	}

	_getTriggerStyle(resolvedValue) {
		let triggerStyle = {
			backgroundColor: resolvedValue
		};

		resolvedValue = resolvedValue.toLowerCase();

		if (resolvedValue == '#fff' || resolvedValue == '#ffffff') {
			triggerStyle.border = '1px solid #EEE';
		}

		return triggerStyle;
	}

	_isColor(name) {
		var color = false;

		if (name.indexOf('-bg') > -1 ||
			name.indexOf('brand') > -1 ||
			name.indexOf('color') > -1 ||
			name.indexOf('gray') > -1 ||
			_.endsWith(name, '-border') ||
			_.endsWith(name, '-text')) {
			color = true;
		}

		return color;
	}

	_isRange(value) {
		return unitRegex.test(value) || numberRegex.test(value);
	}
}

VariableInput.propTypes = {
	label: PropTypes.string.isRequired,
	name: PropTypes.string.isRequired,
	onChange: PropTypes.func.isRequired,
	onColorPickerTriggerClick: PropTypes.func.isRequired,
	value: PropTypes.string.isRequired
};

export default enhanceWithClickOutside(VariableInput);
