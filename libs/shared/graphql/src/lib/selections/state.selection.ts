export const stateSelection = `{
  id
  name
  code
  capital
  status
  idCreationUser
  creationDate
  creationIp
  modificationDate
  modificationIp
  creationCoordinate {
    latitude
    longitude
  }
  modificationCoordinate {
    latitude
    longitude
  }
  creationUser {
    id
    email
    username
    firstName
    lastName
    provider
    status
    emailValidated
  }
  modificationUser {
    id
    email
    username
    firstName
    lastName
    provider
    status
    emailValidated
  }
}`;
