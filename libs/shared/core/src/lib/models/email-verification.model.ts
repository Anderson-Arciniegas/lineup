import { VerificationCodeChannelEnum } from '../enums/verification-code-channel.enum';

export interface BaseResponse {
  code: number;
  message: string;
  status: boolean;
}

export interface CreateVerificationCodeDto {
  channel: VerificationCodeChannelEnum;
}

export interface SendVerificationCodeInput {
  email: string;
}

export interface VerifyVerificationCodeDto {
  code: string;
}

export interface VerifyCodeInput {
  code: string;
  email: string;
}
