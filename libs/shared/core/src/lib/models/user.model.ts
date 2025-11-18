export enum ProvidersEnum {
  LOCAL = 'LOCAL',
  GOOGLE = 'GOOGLE',
  FACEBOOK = 'FACEBOOK',
  // Agrega otros providers según tu API
}

export enum StatusEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  // Agrega otros estados según tu API
}

export interface CreateUserInput {
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  provider: ProvidersEnum;
  password?: string;
}

export interface UserSchema {
  id: number;
  email: string;
  emailValidated: boolean;
  firstName: string;
  lastName: string;
  username: string;
  provider: ProvidersEnum;
  status: StatusEnum;
  creationDate?: Date;
  creationIp?: string;
  modificationDate?: Date;
  modificationIp?: string;
  // Agrega otras propiedades según necesites
}

export interface CreateUserResponse {
  createUser: UserSchema;
}
