import type { RolesCodesEnum } from '@lineup/core';

/** Variables de `adminDiscountGlobalStats`. */
export interface AdminDiscountGlobalQueryInput {
  days?: number | null;
}

export interface AssignRoleToBusinessInput {
  idBusiness: number;
  idRole: number;
}

export interface AssignRoleToUserInput {
  idRole: number;
  idUser: number;
}

export interface CreateSocialNetworkInput {
  code: string;
  imageCode: string;
  name: string;
}

export interface CreateUserAdminInput {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: RolesCodesEnum;
  imgCode?: string | null;
  telephone?: string | null;
  username?: string | null;
}

export interface RemoveRoleFromBusinessInput {
  idBusiness: number;
  idRole: number;
}

export interface RemoveRoleFromUserInput {
  idRole: number;
  idUser: number;
}

/** API admin: actualización sin `id` en el input (identidad vía sesión o política del backend). */
export interface UpdateUserAdminInput {
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  imageCode?: string | null;
  idState?: number | null;
}

export interface UpdateSocialNetworkInput {
  id: number;
  code?: string | null;
  imageCode?: string | null;
  name?: string | null;
}
