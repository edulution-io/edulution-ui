/*
 * LICENSE PLACEHOLDER
 */

import { SetMetadata } from '@nestjs/common';

export const SKIP_INSTRUMENTATION_KEY = 'skipInstrumentation';

const SkipInstrumentation = () => SetMetadata(SKIP_INSTRUMENTATION_KEY, true);

export default SkipInstrumentation;
