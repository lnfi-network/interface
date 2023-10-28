import { gql, useQuery } from "urql";
import { useMemo } from "react";
import { nip19 } from "nostr-tools";
const GRAPH_BASE = process.env.REACT_APP_GRAPH_BASE || "";
export const useTokenQuery = ({ pageSize = 20, pageIndex = 1, filter }) => {
  // const tableName = `${GRAPH_BASE}token_graph`;
  const tableName = `${GRAPH_BASE}nostr_token_transaction`;
  const limit = useMemo(() => {
    return pageSize;
  }, [pageSize]);
  const offset = useMemo(() => {
    return (pageIndex - 1) * pageSize;
  }, [pageIndex, pageSize]);

  let whereMemo = useMemo(() => {
    let where = "{";
    if (filter.type) {
      where += `type:{_eq: "${filter.type}"} `;
    } else {
      where += `type:{_neq: "zap"} `;
    }
    if (filter.token) {
      where += `token:{_eq: "${filter.token}"} `;
    }
    if (filter.nostrAddress) {
      if (filter.nostrAddress.indexOf("npub") > -1) {
        const _decode = nip19.decode(filter.nostrAddress);
        where += `sender_address:{_eq: "${_decode?.data}"} `;
      } else {
        const _decode = nip19.decode(filter.nostrAddress);
        where += `event_id:{_eq: "${_decode?.data}"} `;
      }
    }
    where += "}";
    return where;
  }, [filter]);
  let queryGraphsql = useMemo(() => {
    return gql`
    query($offset: Int!, $limit: Int!){
      ${tableName}(limit:$limit,offset:$offset,where:${whereMemo},order_by: {id: desc}) {
        id
        amount
        create_at
        error
        event_content
        event_id
        from_address
        index
        plaintext_content
        reply_event_id
        sender_address
        sequence
        status
        to_address
        token
        token_address
        tx_hash
        type
      }
      ${tableName}_aggregate(where:${whereMemo}){
        aggregate {
          count
        }
      }
    }
  `;
  }, [tableName, whereMemo]);
  const [result, reexcuteQuery] = useQuery({
    query: queryGraphsql,
    variables: {
      offset,
      limit
    }
  });

  const { data, fetching } = result;

  const list = data ? data[tableName] : [];
  const total = data ? data[`${tableName}_aggregate`]?.aggregate?.count : 0;

  return {
    list,
    total,
    fetching,
    reexcuteQuery
  };
};
export const useMarketQuery = ({ pageSize = 20, pageIndex = 1, filter }) => {
  const tableName = `${GRAPH_BASE}market_events`;
  const limit = useMemo(() => {
    return pageSize;
  }, [pageSize]);
  const offset = useMemo(() => {
    return (pageIndex - 1) * pageSize;
  }, [pageIndex, pageSize]);

  let whereMemo = useMemo(() => {
    let where = "{";
    if (filter.type) {
      where += `type:{_eq: "${filter.type}"} `;
    }
    if (filter.token) {
      where += `token:{_eq: "${filter.token}"} `;
    }
    if (filter.nostrAddress) {
      if (filter.nostrAddress.indexOf("npub") > -1) {
        where += `nostr_address:{_eq: "${filter.nostrAddress}"} `;
      } else {
        where += `messageid:{_eq: "${filter.nostrAddress}"} `;
      }
    }
    where += "}";
    return where;
  }, [filter]);
  let queryGraphsql = useMemo(() => {
    return gql`
    query($offset: Int!, $limit: Int!){
      ${tableName}(limit:$limit,offset:$offset,where:${whereMemo},order_by: {create_time: desc}) {
        create_time
        message_detail
        messageid
        nostr_address
        plaintext_context
        status
        token
        type
      }
      ${tableName}_aggregate(where:${whereMemo}){
        aggregate {
          count
        }
      }
    }
  `;
  }, [tableName, whereMemo]);
  const [result, reexcuteQuery] = useQuery({
    query: queryGraphsql,
    variables: {
      offset,
      limit
    }
  });

  const { data, fetching } = result;

  const list = data ? data[tableName] : [];
  const total = data ? data[`${tableName}_aggregate`]?.aggregate?.count : 0;

  return {
    list,
    total,
    fetching,
    reexcuteQuery
  };
};
export const useOrderQuery = ({ pageSize = 20, pageIndex = 1, filter }) => {
  const tableName = `${GRAPH_BASE}market_orders`;
  const limit = useMemo(() => {
    return pageSize;
  }, [pageSize]);
  const offset = useMemo(() => {
    return (pageIndex - 1) * pageSize;
  }, [pageIndex, pageSize]);

  let whereMemo = useMemo(() => {
    let where = "{";
    if (filter.type) {
      where += `type:{_eq: "${filter.type}"} `;
    }
    if (filter.token) {
      where += `token:{_eq: "${filter.token}"} `;
    }
    if (filter.status) {
      where += `status:{_eq: "${filter.status}"} `;
    }
    if (filter.nostrAddress) {
      if (filter.nostrAddress.indexOf("npub") > -1) {
        where += `nostr_address:{_eq: "${filter.nostrAddress}"} `;
      } else {
        where += `messageid:{_eq: "${filter.nostrAddress}"} `;
      }
    }
    where += "}";
    return where;
  }, [filter]);
  let queryGraphsql = useMemo(() => {
    return gql`
    query($offset: Int!, $limit: Int!){
      ${tableName}(limit:$limit,offset:$offset,where:${whereMemo},order_by: {ctime: desc}) {
        amount
        avg_price
        ctime
        message_detail
        messageid
        nostr_address
        price
        status
        token
        type
      }
      ${tableName}_aggregate(where:${whereMemo}){
        aggregate {
          count
        }
      }
    }
  `;
  }, [tableName, whereMemo]);
  const [result, reexcuteQuery] = useQuery({
    query: queryGraphsql,
    variables: {
      offset,
      limit
    }
  });

  const { data, fetching } = result;

  const list = data ? data[tableName] : [];
  const total = data ? data[`${tableName}_aggregate`]?.aggregate?.count : 0;

  return {
    list,
    total,
    fetching,
    reexcuteQuery
  };
};
export const useListingQuery = ({ pageSize = 20, pageIndex = 1, token, type, sort }) => {
  const tableName = `${GRAPH_BASE}nostr_market_order`;
  const limit = useMemo(() => {
    return pageSize;
  }, [pageSize]);
  const offset = useMemo(() => {
    return (pageIndex - 1) * pageSize;
  }, [pageIndex, pageSize]);
  let whereMemo = useMemo(() => {
    let where = "{";
    where += `status: { _in: ["INIT", "PUSH_MARKET_SUCCESS", "PART_SUCCESS"]}`;
    if (type) {
      where += `type:{_eq: "${type == "Buy" ? "SELL" : "BUY"}"} `;
    }
    if (token) {
      where += `token:{_eq: "${token.toUpperCase()}"} `;
    }

    where += "}";
    return where;
  }, [token, type]);
  let sortMemo = useMemo(() => {
    let order_by = "";
    if (sort == "Price From Low to High") {
      order_by = `order_by:{price: asc} `;
    }
    if (sort == "Price From High to Low") {
      order_by = `order_by:{price: desc} `;
    }
    if (sort == "Amount From Small to Large") {
      order_by = `order_by:{volume: asc} `;
    }
    if (sort == "Amount From Large to Small") {
      order_by = `order_by:{volume: desc} `;
    }
    if (sort == "From Latest to Earliest") {
      order_by = `order_by:{create_time: desc} `;
    }
    if (sort == "From Earliest to Latest") {
      order_by = `order_by:{create_time: asc} `;
    }
    return order_by;
  }, [sort]);
  let queryGraphsql = useMemo(() => {
    return gql`
    query($offset: Int!, $limit: Int!){
      ${tableName}(limit:$limit,offset:$offset,where:${whereMemo},${sortMemo}) {
        avg_price
        create_time
        deal_money
        deal_volume
        event_id
        id
        modify_time
        owner
        price
        status
        token
        token_address
        total_price
        trade_fee
        type
        volume
      }
      ${tableName}_aggregate(where:${whereMemo}){
        aggregate {
          count
        }
      }
    }
  `;
  }, [sortMemo, tableName, whereMemo]);
  const [result, reexcuteQuery] = useQuery({
    query: queryGraphsql,
    pause: !token,
    // pollInterval: 2000,
    variables: {
      offset,
      limit
    }
  });

  const { data, fetching } = result;

  const list = data ? data[tableName] : [];
  const total = data ? data[`${tableName}_aggregate`]?.aggregate?.count : 0;

  return {
    list,
    total,
    fetching,
    reexcuteQuery
  };
};
export const useListingOrderQuery = ({ pageSize = 20, pageIndex = 1, type, token, status, nostrAddress }) => {
  const tableName = `${GRAPH_BASE}nostr_market_order`;
  const limit = useMemo(() => {
    return pageSize;
  }, [pageSize]);
  const offset = useMemo(() => {
    return (pageIndex - 1) * pageSize;
  }, [pageIndex, pageSize]);

  let whereMemo = useMemo(() => {
    let where = "{";
    // where += `status: { _in: ["INIT", "PUSH_MARKET_SUCCESS", "PUSH_MARKET_FAIL", "PART_SUCCESS"]}`;
    if (type) {
      where += `type:{_eq: "${type.toUpperCase()}"} `;
    }
    if (token) {
      where += `token:{_eq: "${token.toUpperCase()}"} `;
    }
    // if (!status) {
    //   where += `status: { _in: [INIT","PUSH_MARKET_SUCCESS","PUSH_MARKET_FAIL","TAKE_LOCK","TRADE_PENDING","CANCEL_PENDING","TRADE_PENDING","PART_SUCCESS","SUCCESS","CANCEL"]} `;
    // }
    if (!status) {
      where += `status: { _in: ["INIT","INIT_FAIL","PUSH_MARKET_SUCCESS","TAKE_LOCK","TRADE_PENDING","TRADE_FAI","PART_SUCCESS","SUCCESS","CANCEL","CANCEL_FAIL"]} `;
    }
    if (status == "Open Orders") {
      where += `status: { _in: ["INIT","PUSH_MARKET_SUCCESS","TAKE_LOCK","TRADE_PENDING","TRADE_FAI","PART_SUCCESS","CANCEL_FAIL"]} `;
    }
    if (status == "History Orders") {
      where += `status: { _in: ["INIT_FAIL","SUCCESS","CANCEL"]} `;
    }
    // if (filter?.status == "Partial") {
    //   where += `status: { _in: ["PART_SUCCESS"]} `;
    // }
    // if (filter?.status == "Filled") {
    //   where += `status: { _in: ["SUCCESS"]} `;
    // }
    // if (filter?.status == "Cancelled") {
    //   where += `status: { _in: ["CANCEL_PENDING","CANCEL"]} `;
    // }
    if (nostrAddress) {
      if (nostrAddress.indexOf("npub") > -1) {
        where += `owner:{_eq: "${nip19.decode(nostrAddress).data}"} `;
      } else if (nostrAddress.indexOf("note") > -1) {
        where += `event_id:{_eq: "${nip19.decode(nostrAddress).data}"} `;
      } else {
        where += `event_id:{_eq: "${nostrAddress}"} `;
      }
    }
    where += "}";

    return where;
  }, [nostrAddress, status, token, type]);
  let sortMemo = useMemo(() => {
    let order_by = `order_by:{create_time: desc} `;
    return order_by;
  }, []);
  let queryGraphsql = useMemo(() => {
    return gql`
    query($offset: Int!, $limit: Int!){
      ${tableName}(limit:$limit,offset:$offset,where:${whereMemo},${sortMemo}) {
        avg_price
        create_time
        deal_money
        deal_volume
        event_id
        id
        modify_time
        owner
        price
        status
        token
        token_address
        total_price
        trade_fee
        type
        volume
      }
      ${tableName}_aggregate(where:${whereMemo}){
        aggregate {
          count
        }
      }
    }
  `;
  }, [sortMemo, tableName, whereMemo]);
  const [result, reexcuteQuery] = useQuery({
    query: queryGraphsql,
    variables: {
      offset,
      limit
    }
  });

  const { data, fetching } = result;

  const list = data ? data[tableName] : [];
  const total = data ? data[`${tableName}_aggregate`]?.aggregate?.count : 0;

  return {
    list,
    total,
    fetching,
    reexcuteQuery
  };
};
export const useMyOrderQuery = ({ pageSize = 20, pageIndex = 1, type, token, status, owner }) => {
  const tableName = `${GRAPH_BASE}nostr_market_order`;
  const limit = useMemo(() => {
    return pageSize;
  }, [pageSize]);
  const offset = useMemo(() => {
    return (pageIndex - 1) * pageSize;
  }, [pageIndex, pageSize]);

  let whereMemo = useMemo(() => {
    let where = "{";
    // where += `status: { _in: ["INIT", "PUSH_MARKET_SUCCESS", "PUSH_MARKET_FAIL", "PART_SUCCESS"]}`;
    where += `owner: {_eq: "${owner}"} `;
    if (type) {
      where += `type:{_eq: "${type.toUpperCase()}"} `;
    }
    if (token) {
      where += `token:{_eq: "${token.toUpperCase()}"} `;
    }
    if (!status) {
      where += `status: { _in: ["INIT","INIT_FAIL","PUSH_MARKET_SUCCESS","TAKE_LOCK","TRADE_PENDING","TRADE_FAI","PART_SUCCESS","SUCCESS","CANCEL","CANCEL_FAIL"]} `;
    }
    if (status == "Open Orders") {
      where += `status: { _in: ["INIT","PUSH_MARKET_SUCCESS","TAKE_LOCK","TRADE_PENDING","TRADE_FAI","PART_SUCCESS","CANCEL_FAIL"]} `;
    }
    if (status == "History Orders") {
      where += `status: { _in: ["INIT_FAIL","SUCCESS","CANCEL"]} `;
    }

    where += "}";
    return where;
  }, [owner, status, token, type]);
  let sortMemo = useMemo(() => {
    let order_by = `order_by:{create_time: desc} `;
    return order_by;
  }, []);

  let queryGraphsql = useMemo(() => {
    return gql`
    query($offset: Int!, $limit: Int!){
      ${tableName}(limit:$limit,offset:$offset,where:${whereMemo},${sortMemo}) {
        avg_price
        create_time
        deal_money
        deal_volume
        event_id
        id
        modify_time
        owner
        price
        status
        token
        token_address
        total_price
        trade_fee
        type
        volume
      }
      ${tableName}_aggregate(where:${whereMemo}){
        aggregate {
          count
        }
      }
    }
  `;
  }, [sortMemo, tableName, whereMemo]);
  const [result, reexcuteQuery] = useQuery({
    query: queryGraphsql,
    pause: !owner,
    variables: {
      offset,
      limit
    }
  });

  const { data, fetching } = result;

  const list = data ? data[tableName] : [];
  const total = data ? data[`${tableName}_aggregate`]?.aggregate?.count : 0;

  return {
    list,
    total,
    fetching,
    reexcuteQuery
  };
};
export const useOrderDetailQuery = ({ pageSize = 20, pageIndex = 1, id, type }) => {
  const tableName = `${GRAPH_BASE}nostr_market_trade`;
  const limit = useMemo(() => {
    return pageSize;
  }, [pageSize]);
  const offset = useMemo(() => {
    return (pageIndex - 1) * pageSize;
  }, [pageIndex, pageSize]);

  let whereMemo = useMemo(() => {
    let where = "{";
    if (type == "BUY") {
      where += `buy_order_id:{_eq: "${id}"} `;
    }
    if (type == "SELL") {
      where += `sell_order_id:{_eq: "${id}"} `;
    }
    where += "}";
    return where;
  }, [id, type]);
  let sortMemo = useMemo(() => {
    let order_by = `order_by:{create_time: desc} `;
    return order_by;
  }, []);
  let queryGraphsql = useMemo(() => {
    return gql`
    query($offset: Int!, $limit: Int!){
      ${tableName}(limit:$limit,offset:$offset,where:${whereMemo},${sortMemo}) {
        buy_free
        buy_order_id
        buy_owner
        create_time
        id
        modify_time
        price
        sell_free
        sell_order_id
        sell_owner
        trend_side
        volume
      }
    }
  `;
  }, [sortMemo, tableName, whereMemo]);
  const [result, reexcuteQuery] = useQuery({
    query: queryGraphsql,
    pause: !id,
    variables: {
      offset,
      limit
    }
  });

  const { data, fetching } = result;

  const list = data ? data[tableName] : [];

  return {
    list,
    fetching,
    reexcuteQuery
  };
};
export const useCreateAssetsQuery = ({ pageSize = 20, pageIndex = 1, type, creator, event_id, search }) => {
  const tableName = `${GRAPH_BASE}nostr_create_assets`;
  const limit = useMemo(() => {
    return pageSize;
  }, [pageSize]);
  const offset = useMemo(() => {
    return (pageIndex - 1) * pageSize;
  }, [pageIndex, pageSize]);

  let whereMemo = useMemo(() => {
    let where = "{";
    if (type == "My") {
      where += `creator: {_eq: "${creator}"} `;
    }
    if (event_id) {
      where += `event_id: {_eq: "${event_id}"} `;
    }
    if (type == "In-Progress") {
      where += `status: { _in: [0,1,2,99]} `;
    }
    if (type == "Completed") {
      where += `status: { _in: [9]} `;
    }
    if (search) {
      where += `_or:[{ asset_id: {_iregex: "${search}"} }, { name: {_iregex: "${search}"} }] `;
    }
    // where += `status: { _in: ["INIT", "PUSH_MARKET_SUCCESS", "PUSH_MARKET_FAIL", "PART_SUCCESS"]}`;
    // where += `owner: {_eq: "${owner}"} `;
    // if (type) {
    //   where += `type:{_eq: "${type.toUpperCase()}"} `;
    // }
    // if (token) {
    //   where += `token:{_eq: "${token.toUpperCase()}"} `;
    // }
    // if (!status) {
    //   where += `status: { _in: ["INIT","PUSH_MARKET_SUCCESS","TAKE_LOCK","TRADE_PENDING","PART_SUCCESS","SUCCESS","CANCEL"]} `;
    // }
    // if (status == "Open Orders") {
    //   where += `status: { _in: ["INIT","PUSH_MARKET_SUCCESS","TAKE_LOCK","TRADE_PENDING","PART_SUCCESS"]} `;
    // }
    // if (status == "History Orders") {
    //   where += `status: { _in: ["SUCCESS","CANCEL"]} `;
    // }

    where += "}";
    return where;
  }, [creator, event_id, search, type]);
  let sortMemo = useMemo(() => {
    let order_by = `order_by:{create_time: desc} `;
    return order_by;
  }, []);

  let queryGraphsql = useMemo(() => {
    return gql`
    query($offset: Int!, $limit: Int!){
      ${tableName}(limit:$limit,offset:$offset,where:${whereMemo},${sortMemo}) {
        asset_id
        batch_key
        create_time
        create_tx_hash
        creator
        data
        event_id
        id
        logo
        name
        pay_tx_hash
        status
        update_time
      }
      ${tableName}_aggregate(where:${whereMemo}){
        aggregate {
          count
        }
      }
    }
  `;
  }, [sortMemo, tableName, whereMemo]);
  const [result, reexcuteQuery] = useQuery({
    query: queryGraphsql,
    // pause: !owner,
    variables: {
      offset,
      limit
    }
  });

  const { data, fetching } = result;

  const list = data ? data[tableName] : [];
  const total = data ? data[`${tableName}_aggregate`]?.aggregate?.count : 0;

  return {
    list,
    total,
    fetching,
    reexcuteQuery
  };
};
export const useMintAssetsQuery = ({ pageSize = 20, pageIndex = 1, type, creator, event_id, search }) => {
  const tableName = `${GRAPH_BASE}nostr_assets_activity`;
  const limit = useMemo(() => {
    return pageSize;
  }, [pageSize]);
  const offset = useMemo(() => {
    return (pageIndex - 1) * pageSize;
  }, [pageIndex, pageSize]);

  let whereMemo = useMemo(() => {
    let where = "{";
    if (type == "My") {
      where += `owner: {_eq: "${creator}"} `;
      where += `status: { _in: ["INIT", "INIT_PENDING", "INIT_FAIL", "SUCCESS"]}`;
    } else if(type == "In-Progress") {
      where += `status: { _in: ["INIT"]}`;
    } else if(type == "Completed") {
      where += `status: { _in: ["SUCCESS"]}`;
    } else {
      where += `status: { _in: ["INIT", "SUCCESS"]}`;
    }
    if (event_id) {
      where += `event_id: {_eq: "${event_id}"} `;
    }
    // if (type == "In-Progress") {
    //   where += `status: { _in: [0,1,2,99]} `;
    // }
    // if (type == "Completed") {
    //   where += `status: { _in: [9]} `;
    // }
    if (search) {
      where += `_or:[{ owner: {_iregex: "${search}"} }, { token_name: {_iregex: "${search}"} }] `;
    }
    // where += `status: { _in: ["INIT", "PUSH_MARKET_SUCCESS", "PUSH_MARKET_FAIL", "PART_SUCCESS"]}`;
    // where += `owner: {_eq: "${owner}"} `;
    // if (type) {
    //   where += `type:{_eq: "${type.toUpperCase()}"} `;
    // }
    // if (token) {
    //   where += `token:{_eq: "${token.toUpperCase()}"} `;
    // }
    // if (!status) {
    //   where += `status: { _in: ["INIT","PUSH_MARKET_SUCCESS","TAKE_LOCK","TRADE_PENDING","PART_SUCCESS","SUCCESS","CANCEL"]} `;
    // }
    // if (status == "Open Orders") {
    //   where += `status: { _in: ["INIT","PUSH_MARKET_SUCCESS","TAKE_LOCK","TRADE_PENDING","PART_SUCCESS"]} `;
    // }
    // if (status == "History Orders") {
    //   where += `status: { _in: ["SUCCESS","CANCEL"]} `;
    // }

    where += "}";
    return where;
  }, [creator, event_id, search, type]);
  let sortMemo = useMemo(() => {
    let order_by = `order_by:{create_time: desc} `;
    return order_by;
  }, []);

  let queryGraphsql = useMemo(() => {
    return gql`
    query($offset: Int!, $limit: Int!){
      ${tableName}(limit:$limit,offset:$offset,where:${whereMemo},${sortMemo}) {
        call_event_id
        create_fee
        create_fee_symbol
        create_time
        erro_msg
        event_id
        id
        max_address
        max_amount
        mint_fee
        modify_time
        npub_address
        number
        owner
        received_amount
        received_number
        send_id
        single_amount
        status
        token_address
        token_name
      }
      ${tableName}_aggregate(where:${whereMemo}){
        aggregate {
          count
        }
      }
    }
  `;
  }, [sortMemo, tableName, whereMemo]);
  const [result, reexcuteQuery] = useQuery({
    query: queryGraphsql,
    // pause: !owner,
    variables: {
      offset,
      limit
    }
  });

  const { data, fetching } = result;

  const list = data ? data[tableName] : [];
  const total = data ? data[`${tableName}_aggregate`]?.aggregate?.count : 0;

  return {
    list,
    total,
    fetching,
    reexcuteQuery
  };
};
export const useMintAssetDetailQuery = ({ id }) => {
  const tableName = `${GRAPH_BASE}nostr_assets_activity_by_pk`;
  const queryGraphsql = gql`
    query() {
      ${tableName}(id: "${id}") {
        call_event_id
        create_fee
        create_fee_symbol
        create_time
        erro_msg
        event_id
        id
        max_address
        max_amount
        mint_fee
        modify_time
        npub_address
        number
        owner
        received_amount
        received_number
        send_id
        single_amount
        status
        token_address
        token_name
      }
    }`;
  const [result, reexcuteQuery] = useQuery({
    query: queryGraphsql,
  });

  const { data, fetching } = result;
  return {
    reexcuteQuery,
    fetching,
    data: data?.[tableName] || {}
  };
};
export const useQueryAssetByEventIdOrAssetName = ({ eventId, assetName }) => {
  const tableName = `${GRAPH_BASE}nostr_create_assets`;
  let whereMemo = useMemo(() => {
    let where = "{";
    if (eventId) {
      where += `event_id: {_eq: "${eventId}"} `;
    }
    if (assetName) {
      where += `name: {_eq: "${assetName}"} `;
    }
    where += "}";
    return where;
  }, [assetName, eventId]);

  let queryGraphsql = useMemo(() => {
    return gql`
    query(){
      ${tableName}(where:${whereMemo}) {
        asset_id
        batch_key
        create_time
        create_tx_hash
        creator
        data
        event_id
        id
        logo
        name
        pay_tx_hash
        status
        update_time
      }
      ${tableName}_aggregate(where:${whereMemo}){
        aggregate {
          count
        }
      }
    }
  `;
  }, [tableName, whereMemo]);

  const pause = useMemo(() => {
    return !eventId && !assetName
  }, [assetName, eventId])
  const [result, reexcuteQuery] = useQuery({
    query: queryGraphsql,
    pause: pause,
  });

  const { data, fetching } = result;
  const list = data ? data[tableName] : [];
  const total = data ? data[`${tableName}_aggregate`]?.aggregate?.count : 0;

  return {
    list,
    total,
    fetching,
    reexcuteQuery
  };
};

export const useQueryAssetByName = () => {
  const tableName = `${GRAPH_BASE}nostr_create_assets`;

  const qeryGraphaql = gql`
  query ($name: String!) {
    ${tableName}(where: { name: { _eq: $name } }) {
      name,
      creator
    }
  }
`;
  return qeryGraphaql
}


export const useTokenChangeQuery = ({ pageSize = 20, pageIndex = 1 }) => {
  const tableName = `${GRAPH_BASE}nostr_token`;
  const limit = useMemo(() => {
    return pageSize;
  }, [pageSize]);
  const offset = useMemo(() => {
    return (pageIndex - 1) * pageSize;
  }, [pageIndex, pageSize]);
  let queryGraphsql = useMemo(() => {
    return gql`
    query($offset: Int!, $limit: Int!){
      ${tableName}(limit:$limit,offset:$offset,order_by: {id: asc}) {
        chain
        chain_name
        create_time
        deal_price
        decimals
        id
        modify_time
        name
        reserve
        symbol
        tf_change
        tf_total_price
        totalSupply
        token
        volume
      }
    }
  `;
  }, [tableName]);
  const [result, reexcuteQuery] = useQuery({
    query: queryGraphsql,
    variables: {
      offset,
      limit
    }
  });

  const { data, fetching } = result;

  const list = data ? data[tableName] : [];

  return {
    list,
    fetching,
    reexcuteQuery
  };
};
export const useImportAssetsQuery = ({ pageSize = 20, pageIndex = 1, assetId }) => {
  const tableName = `${GRAPH_BASE}nostr_universe_assets`;
  const limit = useMemo(() => {
    return pageSize;
  }, [pageSize]);
  const offset = useMemo(() => {
    return (pageIndex - 1) * pageSize;
  }, [pageIndex, pageSize]);
  let whereMemo = useMemo(() => {
    let where = "{";
    // 0: "Token"   1: "NFT"
    where += `asset_type:{_eq: "0"} `;
    if (assetId) {
      where += `_or:[{ asset_id: {_iregex: "${assetId}"} }, { asset_name: {_iregex: "${assetId}"} }] `;
    }

    where += "}";
    return where;
  }, [assetId]);
  let queryGraphsql = useMemo(() => {
    return gql`
    query($offset: Int!, $limit: Int!){
      ${tableName}(limit:$limit,offset:$offset,where:${whereMemo}) {
        asset_id
        asset_name
        asset_type
        genesis_height
        genesis_point
        group_key
        meta_data
        meta_hash
        meta_type
        total_proofs
        total_supply
        total_syncs
      }
      ${tableName}_aggregate(where:${whereMemo}){
        aggregate {
          count
        }
      }
    }
  `;
  }, [tableName, whereMemo]);
  const [result, reexcuteQuery] = useQuery({
    query: queryGraphsql,
    // pause: !token,
    // pollInterval: 2000,
    variables: {
      offset,
      limit
    }
  });

  const { data, fetching } = result;

  const list = data ? data[tableName] : [];
  const total = data ? data[`${tableName}_aggregate`]?.aggregate?.count : 0;

  return {
    list,
    total,
    fetching,
    reexcuteQuery
  };
};
