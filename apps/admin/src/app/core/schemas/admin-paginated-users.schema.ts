import type { UserSchema } from '@lineup/core';

export interface PaginatedUsersSchema {
  items: UserSchema[];
  limit: number;
  page: number;
  total: number;
}
