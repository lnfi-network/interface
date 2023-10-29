import { gql, useQuery } from "urql";
import { useMemo } from "react";
// import dayjs from "dayjs";
const GRAPH_BASE = process.env.REACT_APP_GRAPH_BASE || "";

export const useMintActivityDetailStats = (activeId, npub_address) => {
  const tableName = `${GRAPH_BASE}nostr_assets_activity_detail`;
  const queryGraphsql = gql`
    query($activity_id:String!,$npub_address:String!) {
      ${tableName}_aggregate(where: {activity_id: {_eq: $activity_id}, _and: {npub_address: {_eq:$npub_address }}}) {
        aggregate {
          count
        }
      }
    }`;
  const [result, reexcuteQuery] = useQuery({
    query: queryGraphsql,
    variables: { activity_id: '' + activeId, npub_address },
    pause: !activeId || !npub_address
  });
  const { data, fetching } = result;
  return {
    reexcuteQuery,
    fetching,
    hadMintCount: data ? data[`${tableName}_aggregate`]?.aggregate?.count : 0
  };
};

