import { gql, useQuery } from "urql";
import { useMemo } from "react";
// import dayjs from "dayjs";
const GRAPH_BASE = process.env.REACT_APP_GRAPH_BASE || "";
export const usePointsAccount = ({ id }) => {
  const tableName = `${GRAPH_BASE}nostr_points_account`;
  const queryGraphsql = gql`
    query($id: String!) {
      ${tableName}(where: {id: {_eq: $id}}) {
        create_time
        id
        modify_time
        ranking
        reward_points
        task_points
      }
      ${tableName}_aggregate {
        aggregate {
          count
        }
      }
    }`;
  const [result, reexcuteQuery] = useQuery({
    query: queryGraphsql,
    variables: { id: id },
    pause: !id
  });

  const { data, fetching } = result;
  return {
    reexcuteQuery,
    fetching,
    total: data?.[`${tableName}_aggregate`]?.aggregate?.count || 0,
    data: data?.[tableName]?.[0] || {}
  };
};
export const usePointsTask = () => {
  const tableName = `${GRAPH_BASE}nostr_points_task`;
  const queryGraphsql = gql`
    query {
      ${tableName} {
        activity_end_time
        activity_start_time
        create_time
        halve_time
        id
        modify_time
        reward_halve_points
        reward_points
        sys_time
        task_type
      }
    }`;
  const [result, reexcuteQuery] = useQuery({
    query: queryGraphsql
  });

  const { data, fetching } = result;
  return {
    reexcuteQuery,
    fetching,
    data: data?.[tableName] || []
  };
};
export const usePointsTaskQuests = ({ address }) => {
  const tableName = `${GRAPH_BASE}nostr_points_task_quests`;
  const queryGraphsql = gql`
    query($address: String!) {
      ${tableName}(where: {address: {_eq: $address}}) {
        task_type
        reward_points
        modify_time
        id
        event_id
        create_time
        address
      }
    }`;
  const [result, reexcuteQuery] = useQuery({
    query: queryGraphsql,
    variables: { address: address },
    pause: !address
  });

  const { data, fetching } = result;
  return {
    reexcuteQuery,
    fetching,
    data: data?.[tableName] || []
  };
};
export const usePointsTaskDay = () => {
  const tableName = `${GRAPH_BASE}nostr_points_task_day`;
  const queryGraphsql = gql`
    query {
      ${tableName} {
        activity_end_time
        activity_start_time
        create_time
        halve_time
        id
        modify_time
        reward_halve_points
        reward_points
        sys_time
        task_num
        task_type
      }
    }`;
  const [result, reexcuteQuery] = useQuery({
    query: queryGraphsql
  });

  const { data, fetching } = result;
  return {
    reexcuteQuery,
    fetching,
    data: data?.[tableName] || []
  };
};
export const usePointsTaskDayQuests = ({ address, selectedTime }) => {
  const tableName = `${GRAPH_BASE}nostr_points_task_day_quests`;
  let whereMemo = useMemo(() => {
    let where = "{";
    if (address) {
      where += `address:{_eq: "${address}"} `;
    }
    if (selectedTime) {
      where += `create_time:{_gte: "${selectedTime + "T00:00:00"}",_lte:"${selectedTime + "T23:59:59"}"} `;
    }
    where += "}";
    return where;
  }, [address, selectedTime]);
  const queryGraphsql = gql`
    query() {
      ${tableName}(where: ${whereMemo},) {
        address
        create_time
        event_id
        id
        modify_time
        reward_points
        task_details
        task_num
        task_type
      }
    }`;
  const [result, reexcuteQuery] = useQuery({
    query: queryGraphsql,
    // variables: { address: address },
    pause: !address
  });

  const { data, fetching } = result;
  return {
    reexcuteQuery,
    fetching,
    data: data?.[tableName] || []
  };
};
