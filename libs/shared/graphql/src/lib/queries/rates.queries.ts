import { gql } from 'apollo-angular';

import { bcvOfficialRatesSelection } from '../selections/bcv-official-rates.selection';

export const FIND_BCV_OFFICIAL_RATES_QUERY = gql`
  query FindBcvOfficialRates {
    findBcvOfficialRates ${bcvOfficialRatesSelection}
  }
`;
