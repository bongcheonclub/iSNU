import {PureComponent} from 'react';
import codePush from 'react-native-code-push';
export const codePushOptions = {
  installMode: codePush.InstallMode.IMMEDIATE,
  checkFrequency: codePush.CheckFrequency.MANUAL,
  mandatoryInstallMode: codePush.InstallMode.ON_NEXT_RESTART,
  updateDialog: false,
};
export class LikeAPP extends PureComponent {
  componentDidMount() {
    codePush.sync(codePushOptions);
    codePush.notifyAppReady();
  }
  render() {
    return null;
  }
}
export default codePush(codePushOptions)(LikeAPP);
