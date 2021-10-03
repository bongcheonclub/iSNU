import axios from 'axios';
import {SLACK_ENDPOINT} from '../constants';

export const slack = axios.create({baseURL: SLACK_ENDPOINT});
