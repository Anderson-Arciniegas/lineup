import { gql } from 'apollo-angular';

const BASE_RESPONSE_FRAGMENT = `
  code
  message
  status
`;

/**
 * Mutation para enviar código de verificación del negocio (canal EMAIL o PHONE)
 */
export const SEND_BUSINESS_VERIFICATION_CODE_MUTATION = gql`
  mutation SendBusinessVerificationCode($data: CreateVerificationCodeDto!) {
    sendBusinessVerificationCode(data: $data) {
      ${BASE_RESPONSE_FRAGMENT}
    }
  }
`;

/**
 * Mutation para enviar código de verificación por email
 */
export const SEND_VERIFICATION_CODE_MUTATION = gql`
  mutation SendVerificationCode($data: SendVerificationCodeInput!) {
    sendVerificationCode(data: $data) {
      ${BASE_RESPONSE_FRAGMENT}
    }
  }
`;

/**
 * Mutation para verificar código de verificación del negocio
 */
export const VERIFY_BUSINESS_VERIFICATION_CODE_MUTATION = gql`
  mutation VerifyBusinessVerificationCode($data: VerifyVerificationCodeDto!) {
    verifyBusinessVerificationCode(data: $data) {
      ${BASE_RESPONSE_FRAGMENT}
    }
  }
`;

/**
 * Mutation para verificar código con email
 */
export const VERIFY_CODE_MUTATION = gql`
  mutation VerifyCode($data: VerifyCodeInput!) {
    verifyCode(data: $data) {
      ${BASE_RESPONSE_FRAGMENT}
    }
  }
`;
