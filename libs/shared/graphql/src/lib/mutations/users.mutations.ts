import { gql } from 'apollo-angular';
import { businessFollowerSelection } from '../selections/businesses.selection';
import {
  productRatingSelection,
  productReactionSelection,
} from '../selections/product.selection';
import {
  loginResponseSelection,
  userBasicSelection,
} from '../selections/users.selection';

/**
 * Mutation para iniciar sesión
 */
export const LOGIN_MUTATION = gql`
  mutation Login($login: LoginDto!) {
    login(login: $login) ${loginResponseSelection}
  }
`;

/**
 * Mutation para refrescar el token de autenticación
 */
export const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken {
    refreshToken ${loginResponseSelection}
  }
`;

/**
 * Mutation para crear un nuevo usuario
 */
export const CREATE_USER_MUTATION = gql`
  mutation CreateUser($data: CreateUserInput!) {
    createUser(data: $data) {
      code
      status
      user ${userBasicSelection}
    }
  }
`;

export const USER_LOGOUT_MUTATION = gql`
  mutation UserLogout {
    logout {
      code
      message
      status
    }
  }
`;

/**
 * Mutation para actualizar un usuario
 */
export const UPDATE_USER_MUTATION = gql`
  mutation UpdateUser($data: UpdateUserInput!) {
    updateUser(data: $data) ${userBasicSelection}
  }
`;

/**
 * Mutation para cambiar la contraseña del usuario
 */
export const CHANGE_PASSWORD_MUTATION = gql`
  mutation ChangePassword($data: ChangePasswordInput!) {
    changePassword(data: $data)
  }
`;

/**
 * Mutation para seguir un negocio
 */
export const FOLLOW_BUSINESS_MUTATION = gql`
  mutation FollowBusiness($idBusiness: Int!) {
    followBusiness(idBusiness: $idBusiness) ${businessFollowerSelection}
  }
`;

/**
 * Mutation para dejar de seguir un negocio
 */
export const UNFOLLOW_BUSINESS_MUTATION = gql`
  mutation UnfollowBusiness($idBusiness: Int!) {
    unfollowBusiness(idBusiness: $idBusiness)
  }
`;

/**
 * Mutation para dar like a un producto
 */
export const LIKE_PRODUCT_MUTATION = gql`
  mutation LikeProduct($idProduct: Int!) {
    likeProduct(idProduct: $idProduct) ${productReactionSelection}
  }
`;

/**
 * Mutation para quitar like a un producto
 */
export const UNLIKE_PRODUCT_MUTATION = gql`
  mutation UnlikeProduct($idProduct: Int!) {
    unlikeProduct(idProduct: $idProduct)
  }
`;

/**
 * Mutation para registrar una visita (negocio, catálogo o producto)
 */
export const RECORD_VISIT_MUTATION = gql`
  mutation RecordVisit($input: RecordVisitInput!) {
    recordVisit(input: $input)
  }
`;

/**
 * Mutation para valorar un producto
 */
export const RATE_PRODUCT_MUTATION = gql`
  mutation RateProduct($data: RateProductInput!) {
    rateProduct(data: $data) ${productRatingSelection}
  }
`;

/**
 * Mutation para registrar usuario con Google
 */
export const REGISTER_WITH_GOOGLE_MUTATION = gql`
  mutation RegisterWithGoogle($data: RegisterGoogleInput!) {
    registerWithGoogle(data: $data) ${loginResponseSelection}
  }
`;

/**
 * Mutation para iniciar sesión con Google
 */
export const LOGIN_WITH_GOOGLE_MUTATION = gql`
  mutation LoginWithGoogle($data: LoginGoogleInput!) {
    loginWithGoogle(data: $data) ${loginResponseSelection}
  }
`;
