import type { WeekDayEnum } from '../enums';
import type { BusinessSchema } from './business.schema';

export interface BusinessHourSchema {
  business?: BusinessSchema;
  closesAtMinute: number;
  dayOfWeek: WeekDayEnum;
  id: number;
  idBusiness: number;
  opensAtMinute: number;
  slotOrder: number;
  __typename?: 'BusinessHourSchema';
}
