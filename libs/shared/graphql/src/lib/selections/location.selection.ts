/**
 * Selección mínima de business para usar dentro de location (evita dependencia circular
 * con businesses.selection que a su vez usa locationFullSelection).
 */
const locationBusinessSelection = `{
  id
  name
  path
  description
  email
  emailValidated
  image { directory extension name url }
  imageCode
  telephone
  hexColor
  provider
  status
  tags
}`;

/**
 * Selección completa de LocationSchema para queries y mutations
 */
export const locationFullSelection = `{
  id
  name
  address
  formattedAddress
  lat
  lng
  idCreationBusiness
  status
 
}`;
