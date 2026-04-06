export const fileSelection = `{
  name
  url
  extension
  directory
  creationDate
  creationUser {
    id
    username
    email
  }
  thumbnails {
    md { height url width }
    sm { height url width }
    xs { height url width }
  }
}`;
