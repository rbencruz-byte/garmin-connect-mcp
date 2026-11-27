import { z } from 'zod';
import { seg } from '../garmin/client.js';
import { jsonTool } from './define.js';
import { checkRange, endDate, startDate } from './schemas.js';

/** FIT SDK sport names are upper-case words joined by underscores (RUNNING, CYCLING, TRAIL_RUNNING…). */
const FIT_SPORT = /^[A-Za-z]+(?:_[A-Za-z]+)*$/;

export const getVo2Max = jsonTool({
  name: 'garmin_get_vo2_max',
  title: 'Get daily VO2 max (date range)',
  endpoint: 'GET /metrics-service/metrics/maxmet/daily/{startDate}/{endDate}',
  description:
    'Get the daily VO2 max estimates Garmin calculated for a date range, one entry per day and sport with a value ' +
    '(running and/or cycling, depending on the device and activities recorded). Days without a new estimate may be absent. ' +
    'Optionally filter by sport using FIT SDK sport names such as RUNNING or CYCLING. ' +
    'Use for VO2 max trends; Garmin only updates the estimate after qualifying outdoor activities.',
  inputSchema: z.object({
    startDate: startDate(),
    endDate: endDate(),
    sport: z
      .array(z.string().regex(FIT_SPORT, 'Use a FIT SDK sport name such as RUNNING or CYCLING.'))
      .min(1)
      .optional()
      .describe('Only return these sports, e.g. ["RUNNING"] or ["RUNNING", "CYCLING"]. Default: all sports.'),
  }),
  validate: ({ startDate, endDate }) => checkRange(startDate, endDate),
  request: ({ startDate, endDate, sport }) => ({
    path: `/metrics-service/metrics/maxmet/daily/${seg(startDate)}/${seg(endDate)}`,
    query: { sport },
  }),
});

export const metricsTools = [getVo2Max];
