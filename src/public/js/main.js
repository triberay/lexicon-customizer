'use strict';

import _ from 'lodash';
import fs from 'fs';
import he from 'he';
import path from 'path';

import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Autosuggest from 'react-autosuggest';

import componentScraper from '../../../lib/component-scraper';
import sass from '../../../lib/sass';
import themeUtil from '../../../lib/theme';
import UserConfig from '../../../lib/user_config';

import lexiconCustomizerReducer from '../js/reducers/index'

import LexiconCustomizer from '../js/components/LexiconCustomizer'

// <Extract to different file>
import { combineReducers, createStore } from 'redux';
import { connect, Provider } from 'react-redux';

const store = createStore(lexiconCustomizerReducer);
// </Extract to different file>

var userConfig = new UserConfig();

var lexiconBaseVariables = componentScraper.mapLexiconVariables();
store.dispatch({
	type: 'SET_VARIABLES',
	variables: lexiconBaseVariables
});

var customVariables = componentScraper.getVariablesFromFile(path.join(process.cwd(), 'lexicon/_custom_variables.scss'));
store.dispatch({
	type: 'SET_VARIABLES',
	variables: customVariables
});

const render = () => {
	ReactDOM.render(
		<Provider store={store}>
			<LexiconCustomizer
				baseVariables={lexiconBaseVariables}
				variables={store.getState().variables}
			/>
		</Provider>,
		document.getElementById('main')
	);
};

render();

store.subscribe(render);