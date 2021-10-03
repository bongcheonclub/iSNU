import axios from 'axios';
import {SLACK_ENDPOINT} from '../secure';

export const slack = axios.create({baseURL: SLACK_ENDPOINT});
