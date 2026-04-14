/** Omite usuarios anidados: el resolver a veces devuelve null y el tipo GraphQL es no nulo. */
export const adminSocialNetworkSelection = `{
  id
  code
  name
  imageCode
  status
  idCreationUser
  image {
    name
    url
    extension
    directory
  }
}`;
