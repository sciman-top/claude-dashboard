/**
 * Burn rate widget - displays tokens consumed per minute (session average)
 * Consumption = input + cache write + output, summed from the transcript.
 * @handbook 3.3-widget-data-sources
 * @tested scripts/__tests__/widgets.test.ts
 */

import type { Widget } from './base.js';
import type { WidgetContext, BurnRateData } from '../types.js';
import { ICON } from '../utils/emoji.js';
import { formatTokens } from '../utils/formatters.js';
import { getSessionElapsedMinutes } from '../utils/session.js';
import { debugLog } from '../utils/debug.js';
import { getTranscript } from '../utils/transcript-parser.js';

export const burnRateWidget: Widget<BurnRateData> = {
  id: 'burnRate',
  name: 'Burn Rate',

  async getData(ctx: WidgetContext): Promise<BurnRateData | null> {
    let elapsedMinutes: number | null;
    try {
      elapsedMinutes = await getSessionElapsedMinutes(ctx, 0);
    } catch (error) {
      debugLog('burnRate', 'Failed to get session elapsed time', error);
      return null;
    }
    if (elapsedMinutes === null) return null;

    // stdin's current_usage covers the last request only (and counts cache reads), so
    // the session total comes from the transcript. See accountTokens for what counts.
    const transcript = await getTranscript(ctx);
    if (!transcript) return null;

    const { sessionConsumedTokens } = transcript;
    if (elapsedMinutes === 0 || sessionConsumedTokens === 0) {
      return { tokensPerMinute: 0 };
    }

    const tokensPerMinute = sessionConsumedTokens / elapsedMinutes;
    return Number.isFinite(tokensPerMinute) && tokensPerMinute >= 0 ? { tokensPerMinute } : null;
  },

  render(data: BurnRateData, _ctx: WidgetContext): string {
    return `${ICON.fire} ${formatTokens(Math.round(data.tokensPerMinute))}/min`;
  },
};
