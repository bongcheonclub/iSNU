/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';

import codePush from 'react-native-code-push';

const codePushOptions = {
  installMode: codePush.InstallMode.IMMEDIATE,
  checkFrequency: codePush.CheckFrequency.MANUAL,
  mandatoryInstallMode: codePush.InstallMode.ON_NEXT_RESTART,
  updateDialog: false,
};

AppRegistry.registerComponent(appName, () => codePush(codePushOptions)(App));
