import _ from 'lodash';
import path from 'path';
import {remote} from 'electron';

import * as sassUtil from '../lib/system/sass_util';
import createPreview from '../lib/system/create_preview';
import {addSassError, clearSassErrors} from './sassErrors';
import {setPreviewPaths} from './preview';

const APP_PATH = remote.app.getAppPath();

export function buildLexicon() {
	return function(dispatch, getState) {
		const state = getState();

		const baseLexiconTheme = _.kebabCase(state.get('baseLexiconTheme'));
		const lexiconDirs = state.get('lexiconDirs');

		sassUtil.renderLexiconBase(baseLexiconTheme, lexiconDirs, (err, filePath) => {
			if (err) {
				dispatch(addSassError(err));
			}
			else {
				dispatch(renderPreview(state.get('selectedComponent')));
				dispatch(clearSassErrors());
			}
		});
	};
};

export function createVariablesFile() {
	return function(dispatch, getState) {
		const state = getState();

		const {userDataPath} = state.get('lexiconDirs');

		sassUtil.writeCustomVariablesFile(state.get('variables'), state.get('sourceVariables'), userDataPath, state.get('theme'))
			.then(function() {
				dispatch(buildLexicon());
			});
	};
};

export function renderPreview(component) {
	return function(dispatch, getState) {
		var state = getState();

		const baseLexiconTheme = _.kebabCase(state.get('baseLexiconTheme'));
		const {customDir} = state.get('lexiconDirs');

		let cssPath = path.join(customDir, baseLexiconTheme + '.css?t=' + Date.now());

		cssPath = cssPath.split(path.sep).join('/');

		const htmlPath = createPreview(_.snakeCase(component), cssPath);

		dispatch(setPreviewPaths(cssPath, htmlPath));
	};
};
