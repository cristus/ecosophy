// /gent-service?s=<slug> - one men's treatment. See _detail.js.
import { detail } from './_detail.js';

export const onRequestGet = (context) => detail(context, 'him');
