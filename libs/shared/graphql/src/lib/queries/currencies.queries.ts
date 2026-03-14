import { gql } from 'apollo-angular';
import { currencySelection } from '../selections/currency.selection';

export const FIND_ALL_CURRENCIES_QUERY = gql`
  query FindAllCurrencies {
    findAllCurrencies ${currencySelection}
  }
`;
