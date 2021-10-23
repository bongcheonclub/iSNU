import {Amplitude} from '@amplitude/react-native';
import {AMPLITUDE_API_KEY} from '../../secure';

const amplitude = Amplitude.getInstance();
amplitude.init(AMPLITUDE_API_KEY);

export default amplitude;
