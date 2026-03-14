import { gql } from 'apollo-angular';
import { stateSelection } from '../selections/state.selection';

export const FIND_ALL_STATES_QUERY = gql`
  query FindAllStates {
    findAllStates ${stateSelection}
  }
`;
