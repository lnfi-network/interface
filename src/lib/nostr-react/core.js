import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";

import { relayInit } from "nostr-tools";

import { uniqBy } from "./utils";
import { updateRelayStatus } from "store/reducer/relayReducer";
import { useDispatch } from "react-redux";
const NostrContext = createContext({
  isLoading: true,
  connectedRelays: [],
  onConnect: () => null,
  onDisconnect: () => null,
  publish: () => null
});

export const log = (isOn, type, ...args) => {
  if (!isOn) return;
  console[type](...args);
};

export function NostrProvider({ children, relayUrls, debug }) {

  const [isLoading, setIsLoading] = useState(true);
  const [connectedRelays, setConnectedRelays] = useState([]);
  const [relays, setRelays] = useState([]);
  const relayUrlsRef = useRef([]);
  const dispatch = useDispatch();
  let onConnectCallback = null;
  let onDisconnectCallback = null;

  const disconnectToRelays = useCallback(
    (relayUrls) => {
      relayUrls.forEach(async (relayUrl) => {
        await relays.find((relay) => relay.url === relayUrl)?.close();
        setRelays((prev) => prev.filter((r) => r.url !== relayUrl));
      });
    },
    [relays]
  );

  const connectToRelays = useCallback(
    (relayUrls) => {
      relayUrls.forEach(async (relayUrl) => {
        const relay = relayInit(relayUrl);

        if (connectedRelays.findIndex((r) => r.url === relayUrl) >= 0) {
          // already connected, skip
          return;
        }

        setRelays((prev) => uniqBy([...prev, relay], "url"));
        relay.connect();

        relay.on("connect", () => {
          log(debug, "info", `✅ nostr (${relayUrl}): Connected ${Date.now()}!`);

          setIsLoading(false);
          onConnectCallback?.(relay);
          dispatch(updateRelayStatus({ address: relayUrl, status: "connected" }));
          setConnectedRelays((prev) => uniqBy([...prev, relay], "url"));
        });

        relay.on("disconnect", () => {
          log(debug, "warn", `🚪 nostr (${relayUrl}): Connection closed ${Date.now()}.`);
          onDisconnectCallback?.(relay);
          setConnectedRelays((prev) => prev.filter((r) => r.url !== relayUrl));
          // dispatch(updateRelayStatus({ address: relayUrl, status: "disconnected" }));
          relay.connect();
        });

        relay.on("error", () => {
          log(debug, "error", `❌ nostr (${relayUrl}): Connection error!`);
          dispatch(updateRelayStatus({ address: relayUrl, status: "disconnected" }));
        });
      });
    },
    [connectedRelays, debug, dispatch, onConnectCallback, onDisconnectCallback]
  );

  useEffect(() => {
    if (JSON.stringify(relayUrlsRef.current) === JSON.stringify(relayUrls)) {
      // relayUrls isn't updated, skip
      return;
    }
    const relayUrlsToDisconnect = relayUrlsRef.current.filter((relayUrl) => !relayUrls.includes(relayUrl));
    disconnectToRelays(relayUrlsToDisconnect);
    connectToRelays(relayUrls);

    relayUrlsRef.current = relayUrls;
  }, [relayUrls, connectToRelays, disconnectToRelays]);


  const publish = (event) => {
    return connectedRelays.map((relay) => {
      const { message, ...willPublishEvent } = event;
      let pub = relay.publish(willPublishEvent);
      return { pub, relay };
    });
  };

  const value = {
    debug,
    log,
    isLoading,
    connectedRelays,
    connectToRelays,
    disconnectToRelays,
    setConnectedRelays,
    publish,
    onConnect: (_onConnectCallback) => {
      if (_onConnectCallback) {
        onConnectCallback = _onConnectCallback;
      }
    },
    onDisconnect: (_onDisconnectCallback) => {
      if (_onDisconnectCallback) {
        onDisconnectCallback = _onDisconnectCallback;
      }
    }
  };

  return <NostrContext.Provider value={value}>{children}</NostrContext.Provider>;
}

export function useNostr() {
  return useContext(NostrContext);
}

export function useNostrEvents({ filter, enabled = true }) {
  const { isLoading: isLoadingProvider, onConnect, debug, connectedRelays } = useNostr();

  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [unsubscribe, setUnsubscribe] = useState(() => {
    return;
  });

  let onEventCallback = null;
  let onSubscribeCallback = null;
  let onDoneCallback = null;

  // Lets us detect changes in the nested filter object for the useEffect hook
  const filterBase64 = typeof window !== "undefined" ? window.btoa(JSON.stringify(filter)) : null;

  const _unsubscribe = useCallback((sub, relay) => {
    return sub.unsub();
  }, []);

  const subscribe = useCallback(
    (relay, filter) => {
      const sub = relay.sub([filter]);

      setIsLoading(true);

      const unsubscribeFunc = () => {
        _unsubscribe(sub, relay);
      };

      setUnsubscribe(() => unsubscribeFunc);

      sub.on("event", (event) => {
        onEventCallback?.(event);
        setEvents([event]);
      });

      sub.on("eose", () => {
        setIsLoading(false);
        onDoneCallback?.();
      });

      return sub;
    },
    [_unsubscribe, onDoneCallback, onEventCallback]
  );

  useEffect(() => {
    //
    if (!enabled) return;

    const relaySubs = connectedRelays.map((relay) => {
      const sub = subscribe(relay, filter);
      onSubscribeCallback?.(sub, relay);

      return {
        sub,
        relay
      };
    });

    return () => {
      relaySubs.forEach(({ sub, relay }) => {
        _unsubscribe(sub, relay);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectedRelays, filterBase64, enabled, subscribe]);

  const uniqEvents = events.length > 0 ? uniqBy(events, "id") : [];
  const sortedEvents = uniqEvents.sort((a, b) => b.created_at - a.created_at);

  return {
    isLoading: isLoading || isLoadingProvider,
    events: sortedEvents,
    onConnect,
    log,
    debug,
    connectedRelays,
    unsubscribe,
    onSubscribe: (_onSubscribeCallback) => {
      if (_onSubscribeCallback) {
        onSubscribeCallback = _onSubscribeCallback;
      }
    },
    onEvent: (_onEventCallback) => {
      if (_onEventCallback) {
        onEventCallback = _onEventCallback;
      }
    },
    onDone: (_onDoneCallback) => {
      if (_onDoneCallback) {
        onDoneCallback = _onDoneCallback;
      }
    }
  };
}
