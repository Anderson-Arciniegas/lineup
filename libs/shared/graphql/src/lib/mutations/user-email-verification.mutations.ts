import { gql } from 'apollo-angular';

const BASE_RESPONSE_FRAGMENT = `
  code
  message
  status
`;

/**
 * Mutation para enviar código de verificación del usuario (canal EMAIL o PHONE)
 */
export const SEND_USER_VERIFICATION_CODE_MUTATION = gql`
  mutation SendUserVerificationCode($data: CreateVerificationCodeDto!) {
    sendUserVerificationCode(data: $data) {
      ${BASE_RESPONSE_FRAGMENT}
    }
  }
`;

/**
 * Mutation para enviar código de verificación por email
 */
export const SEND_VERIFICATION_CODE_USER_MUTATION = gql`
  mutation SendVerificationCode($data: SendVerificationCodeInput!) {
    sendVerificationCode(data: $data) {
      ${BASE_RESPONSE_FRAGMENT}
    }
  }
`;

/**
 * Mutation para verificar código con email
 */
export const VERIFY_CODE_USER_MUTATION = gql`
  mutation VerifyCode($data: VerifyCodeInput!) {
    verifyCode(data: $data) {
      ${BASE_RESPONSE_FRAGMENT}
    }
  }
`;

/**
 * Mutation para verificar código de verificación del usuario
 */
export const VERIFY_USER_VERIFICATION_CODE_MUTATION = gql`
  mutation VerifyUserVerificationCode($data: VerifyVerificationCodeDto!) {
    verifyUserVerificationCode(data: $data) {
      ${BASE_RESPONSE_FRAGMENT}
    }
  }
`;
