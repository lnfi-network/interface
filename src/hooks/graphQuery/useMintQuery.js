import { gql, useQuery } from "urql";
import { useMemo } from "react";
// import dayjs from "dayjs";
const GRAPH_BASE = process.env.REACT_APP_GRAPH_BASE || "";

export const useMintActivityDetailStats = (activeId, npub_address) => {
  // console.log("activeId", activeId, npub_address);
  const tableName = `${GRAPH_BASE}nostr_assets_activity_detail`;
  let whereMemo = useMemo(() => {
    let where = "{";
    if(activeId && npub_address) {
        where += `activity_id: {_eq: "${activeId}"} `;
        where += `owner: {_eq: "${npub_address}"} `;
      // where += `activity_id: {_eq: ${activeId}}, _and: {owner: {_eq: ${npub_address} }}`;
    }
    where += "}";
    return where;
  }, [activeId, npub_address]);
  const queryGraphsql = gql`
    query() {
      ${tableName}(where:${whereMemo}) {
        activity_id
        id
        share
        owner
      }
    }`;
  const [result, reexcuteQuery] = useQuery({
    query: queryGraphsql,
    variables: {},
    pause: !activeId || !npub_address
  });
  const { data, fetching } = result;
  return {
    reexcuteQuery,
    fetching,
    hadMintCount: data ? data?.[`${tableName}`]?.[0]?.share || 0 : 0
  };
};
