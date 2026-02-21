import { userBasicSelection } from './users.selection';

export const currencySelection = `{
  id
  code
  name
  status
  idCreationUser
  creationUser ${userBasicSelection}
}`;
