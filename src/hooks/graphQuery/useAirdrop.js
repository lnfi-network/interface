import { gql, useQuery } from "urql";
import { useMemo } from "react";
// import dayjs from "dayjs";
const GRAPH_BASE = process.env.REACT_APP_GRAPH_BASE || "";
export const useAirdrop = ({ nostrAddr }) => {
  const tableName = `${GRAPH_BASE}nostr_trick_treat`;
  const queryGraphsql = gql`
    query($address: String!) {
      ${tableName}(where: {address: {_eq: $address}}) {
        address
        amount
        choice
        create_time
        description
        status
      }
    }`;
  const [result, reexcuteQuery] = useQuery({
    query: queryGraphsql,
    variables: { address: nostrAddr },
    pause: !nostrAddr
  });
  const { data, fetching } = result;
  return {
    reexcuteQuery,
    fetching,
    data: data?.[tableName]?.[0] || null
  };
};
export const useAirdropStats = (trickOrTreat) => {
  const tableName = `${GRAPH_BASE}nostr_trick_treat`;
  const queryGraphsql = gql`
    query($choice: String!) {
    
      ${tableName}_aggregate(where: {status: {_eq: 2}, _and: {choice: {_eq: $choice}}}) {
        aggregate {
          count
        }
      }
    }`;
  const [result, reexcuteQuery] = useQuery({
    query: queryGraphsql,
    variables: { choice: trickOrTreat },
    pause: !trickOrTreat
  });
  const { data, fetching } = result;
  return {
    reexcuteQuery,
    fetching,
    data: data ? data[`${tableName}_aggregate`]?.aggregate?.count : 0
  };
};

