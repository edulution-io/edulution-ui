/*
 * LICENSE PLACEHOLDER
 */

import type { Explainability } from '@edulution/events';

function computeSourcesInvolved(explainability: Explainability): string[] {
  const sources = new Set<string>();

  for (const evidence of explainability.evidence) {
    for (const ref of evidence.refs) {
      if (ref.source) {
        sources.add(ref.source);
      }
    }

    if (evidence.meta?.source && typeof evidence.meta.source === 'string') {
      sources.add(evidence.meta.source);
    }
  }

  return Array.from(sources).sort();
}

export { computeSourcesInvolved };
