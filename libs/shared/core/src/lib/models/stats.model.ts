import type { TimePeriodGranularityEnum } from '../enums';

export interface TimePeriodInput {
  endDate?: string | null;
  granularity?: TimePeriodGranularityEnum | null;
  startDate?: string | null;
}
