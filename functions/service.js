// /service?s=<slug> - one women's treatment. See _detail.js.
import { detail } from './_detail.js';

export const onRequestGet = (context) => detail(context, 'her');
