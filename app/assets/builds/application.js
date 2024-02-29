(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __esm = (fn2, res) => function __init() {
    return fn2 && (res = (0, fn2[__getOwnPropNames(fn2)[0]])(fn2 = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // node_modules/@rails/actioncable/src/adapters.js
  var adapters_default;
  var init_adapters = __esm({
    "node_modules/@rails/actioncable/src/adapters.js"() {
      adapters_default = {
        logger: typeof console !== "undefined" ? console : void 0,
        WebSocket: typeof WebSocket !== "undefined" ? WebSocket : void 0
      };
    }
  });

  // node_modules/@rails/actioncable/src/logger.js
  var logger_default;
  var init_logger = __esm({
    "node_modules/@rails/actioncable/src/logger.js"() {
      init_adapters();
      logger_default = {
        log(...messages) {
          if (this.enabled) {
            messages.push(Date.now());
            adapters_default.logger.log("[ActionCable]", ...messages);
          }
        }
      };
    }
  });

  // node_modules/@rails/actioncable/src/connection_monitor.js
  var now, secondsSince, ConnectionMonitor, connection_monitor_default;
  var init_connection_monitor = __esm({
    "node_modules/@rails/actioncable/src/connection_monitor.js"() {
      init_logger();
      now = () => new Date().getTime();
      secondsSince = (time) => (now() - time) / 1e3;
      ConnectionMonitor = class {
        constructor(connection) {
          this.visibilityDidChange = this.visibilityDidChange.bind(this);
          this.connection = connection;
          this.reconnectAttempts = 0;
        }
        start() {
          if (!this.isRunning()) {
            this.startedAt = now();
            delete this.stoppedAt;
            this.startPolling();
            addEventListener("visibilitychange", this.visibilityDidChange);
            logger_default.log(`ConnectionMonitor started. stale threshold = ${this.constructor.staleThreshold} s`);
          }
        }
        stop() {
          if (this.isRunning()) {
            this.stoppedAt = now();
            this.stopPolling();
            removeEventListener("visibilitychange", this.visibilityDidChange);
            logger_default.log("ConnectionMonitor stopped");
          }
        }
        isRunning() {
          return this.startedAt && !this.stoppedAt;
        }
        recordPing() {
          this.pingedAt = now();
        }
        recordConnect() {
          this.reconnectAttempts = 0;
          this.recordPing();
          delete this.disconnectedAt;
          logger_default.log("ConnectionMonitor recorded connect");
        }
        recordDisconnect() {
          this.disconnectedAt = now();
          logger_default.log("ConnectionMonitor recorded disconnect");
        }
        startPolling() {
          this.stopPolling();
          this.poll();
        }
        stopPolling() {
          clearTimeout(this.pollTimeout);
        }
        poll() {
          this.pollTimeout = setTimeout(
            () => {
              this.reconnectIfStale();
              this.poll();
            },
            this.getPollInterval()
          );
        }
        getPollInterval() {
          const { staleThreshold, reconnectionBackoffRate } = this.constructor;
          const backoff = Math.pow(1 + reconnectionBackoffRate, Math.min(this.reconnectAttempts, 10));
          const jitterMax = this.reconnectAttempts === 0 ? 1 : reconnectionBackoffRate;
          const jitter = jitterMax * Math.random();
          return staleThreshold * 1e3 * backoff * (1 + jitter);
        }
        reconnectIfStale() {
          if (this.connectionIsStale()) {
            logger_default.log(`ConnectionMonitor detected stale connection. reconnectAttempts = ${this.reconnectAttempts}, time stale = ${secondsSince(this.refreshedAt)} s, stale threshold = ${this.constructor.staleThreshold} s`);
            this.reconnectAttempts++;
            if (this.disconnectedRecently()) {
              logger_default.log(`ConnectionMonitor skipping reopening recent disconnect. time disconnected = ${secondsSince(this.disconnectedAt)} s`);
            } else {
              logger_default.log("ConnectionMonitor reopening");
              this.connection.reopen();
            }
          }
        }
        get refreshedAt() {
          return this.pingedAt ? this.pingedAt : this.startedAt;
        }
        connectionIsStale() {
          return secondsSince(this.refreshedAt) > this.constructor.staleThreshold;
        }
        disconnectedRecently() {
          return this.disconnectedAt && secondsSince(this.disconnectedAt) < this.constructor.staleThreshold;
        }
        visibilityDidChange() {
          if (document.visibilityState === "visible") {
            setTimeout(
              () => {
                if (this.connectionIsStale() || !this.connection.isOpen()) {
                  logger_default.log(`ConnectionMonitor reopening stale connection on visibilitychange. visibilityState = ${document.visibilityState}`);
                  this.connection.reopen();
                }
              },
              200
            );
          }
        }
      };
      ConnectionMonitor.staleThreshold = 6;
      ConnectionMonitor.reconnectionBackoffRate = 0.15;
      connection_monitor_default = ConnectionMonitor;
    }
  });

  // node_modules/@rails/actioncable/src/internal.js
  var internal_default;
  var init_internal = __esm({
    "node_modules/@rails/actioncable/src/internal.js"() {
      internal_default = {
        "message_types": {
          "welcome": "welcome",
          "disconnect": "disconnect",
          "ping": "ping",
          "confirmation": "confirm_subscription",
          "rejection": "reject_subscription"
        },
        "disconnect_reasons": {
          "unauthorized": "unauthorized",
          "invalid_request": "invalid_request",
          "server_restart": "server_restart",
          "remote": "remote"
        },
        "default_mount_path": "/cable",
        "protocols": [
          "actioncable-v1-json",
          "actioncable-unsupported"
        ]
      };
    }
  });

  // node_modules/@rails/actioncable/src/connection.js
  var message_types, protocols, supportedProtocols, indexOf, Connection, connection_default;
  var init_connection = __esm({
    "node_modules/@rails/actioncable/src/connection.js"() {
      init_adapters();
      init_connection_monitor();
      init_internal();
      init_logger();
      ({ message_types, protocols } = internal_default);
      supportedProtocols = protocols.slice(0, protocols.length - 1);
      indexOf = [].indexOf;
      Connection = class {
        constructor(consumer2) {
          this.open = this.open.bind(this);
          this.consumer = consumer2;
          this.subscriptions = this.consumer.subscriptions;
          this.monitor = new connection_monitor_default(this);
          this.disconnected = true;
        }
        send(data) {
          if (this.isOpen()) {
            this.webSocket.send(JSON.stringify(data));
            return true;
          } else {
            return false;
          }
        }
        open() {
          if (this.isActive()) {
            logger_default.log(`Attempted to open WebSocket, but existing socket is ${this.getState()}`);
            return false;
          } else {
            const socketProtocols = [...protocols, ...this.consumer.subprotocols || []];
            logger_default.log(`Opening WebSocket, current state is ${this.getState()}, subprotocols: ${socketProtocols}`);
            if (this.webSocket) {
              this.uninstallEventHandlers();
            }
            this.webSocket = new adapters_default.WebSocket(this.consumer.url, socketProtocols);
            this.installEventHandlers();
            this.monitor.start();
            return true;
          }
        }
        close({ allowReconnect } = { allowReconnect: true }) {
          if (!allowReconnect) {
            this.monitor.stop();
          }
          if (this.isOpen()) {
            return this.webSocket.close();
          }
        }
        reopen() {
          logger_default.log(`Reopening WebSocket, current state is ${this.getState()}`);
          if (this.isActive()) {
            try {
              return this.close();
            } catch (error2) {
              logger_default.log("Failed to reopen WebSocket", error2);
            } finally {
              logger_default.log(`Reopening WebSocket in ${this.constructor.reopenDelay}ms`);
              setTimeout(this.open, this.constructor.reopenDelay);
            }
          } else {
            return this.open();
          }
        }
        getProtocol() {
          if (this.webSocket) {
            return this.webSocket.protocol;
          }
        }
        isOpen() {
          return this.isState("open");
        }
        isActive() {
          return this.isState("open", "connecting");
        }
        triedToReconnect() {
          return this.monitor.reconnectAttempts > 0;
        }
        isProtocolSupported() {
          return indexOf.call(supportedProtocols, this.getProtocol()) >= 0;
        }
        isState(...states) {
          return indexOf.call(states, this.getState()) >= 0;
        }
        getState() {
          if (this.webSocket) {
            for (let state in adapters_default.WebSocket) {
              if (adapters_default.WebSocket[state] === this.webSocket.readyState) {
                return state.toLowerCase();
              }
            }
          }
          return null;
        }
        installEventHandlers() {
          for (let eventName in this.events) {
            const handler = this.events[eventName].bind(this);
            this.webSocket[`on${eventName}`] = handler;
          }
        }
        uninstallEventHandlers() {
          for (let eventName in this.events) {
            this.webSocket[`on${eventName}`] = function() {
            };
          }
        }
      };
      Connection.reopenDelay = 500;
      Connection.prototype.events = {
        message(event) {
          if (!this.isProtocolSupported()) {
            return;
          }
          const { identifier, message, reason, reconnect, type } = JSON.parse(event.data);
          switch (type) {
            case message_types.welcome:
              if (this.triedToReconnect()) {
                this.reconnectAttempted = true;
              }
              this.monitor.recordConnect();
              return this.subscriptions.reload();
            case message_types.disconnect:
              logger_default.log(`Disconnecting. Reason: ${reason}`);
              return this.close({ allowReconnect: reconnect });
            case message_types.ping:
              return this.monitor.recordPing();
            case message_types.confirmation:
              this.subscriptions.confirmSubscription(identifier);
              if (this.reconnectAttempted) {
                this.reconnectAttempted = false;
                return this.subscriptions.notify(identifier, "connected", { reconnected: true });
              } else {
                return this.subscriptions.notify(identifier, "connected", { reconnected: false });
              }
            case message_types.rejection:
              return this.subscriptions.reject(identifier);
            default:
              return this.subscriptions.notify(identifier, "received", message);
          }
        },
        open() {
          logger_default.log(`WebSocket onopen event, using '${this.getProtocol()}' subprotocol`);
          this.disconnected = false;
          if (!this.isProtocolSupported()) {
            logger_default.log("Protocol is unsupported. Stopping monitor and disconnecting.");
            return this.close({ allowReconnect: false });
          }
        },
        close(event) {
          logger_default.log("WebSocket onclose event");
          if (this.disconnected) {
            return;
          }
          this.disconnected = true;
          this.monitor.recordDisconnect();
          return this.subscriptions.notifyAll("disconnected", { willAttemptReconnect: this.monitor.isRunning() });
        },
        error() {
          logger_default.log("WebSocket onerror event");
        }
      };
      connection_default = Connection;
    }
  });

  // node_modules/@rails/actioncable/src/subscription.js
  var extend, Subscription;
  var init_subscription = __esm({
    "node_modules/@rails/actioncable/src/subscription.js"() {
      extend = function(object, properties) {
        if (properties != null) {
          for (let key in properties) {
            const value = properties[key];
            object[key] = value;
          }
        }
        return object;
      };
      Subscription = class {
        constructor(consumer2, params = {}, mixin) {
          this.consumer = consumer2;
          this.identifier = JSON.stringify(params);
          extend(this, mixin);
        }
        perform(action, data = {}) {
          data.action = action;
          return this.send(data);
        }
        send(data) {
          return this.consumer.send({ command: "message", identifier: this.identifier, data: JSON.stringify(data) });
        }
        unsubscribe() {
          return this.consumer.subscriptions.remove(this);
        }
      };
    }
  });

  // node_modules/@rails/actioncable/src/subscription_guarantor.js
  var SubscriptionGuarantor, subscription_guarantor_default;
  var init_subscription_guarantor = __esm({
    "node_modules/@rails/actioncable/src/subscription_guarantor.js"() {
      init_logger();
      SubscriptionGuarantor = class {
        constructor(subscriptions) {
          this.subscriptions = subscriptions;
          this.pendingSubscriptions = [];
        }
        guarantee(subscription) {
          if (this.pendingSubscriptions.indexOf(subscription) == -1) {
            logger_default.log(`SubscriptionGuarantor guaranteeing ${subscription.identifier}`);
            this.pendingSubscriptions.push(subscription);
          } else {
            logger_default.log(`SubscriptionGuarantor already guaranteeing ${subscription.identifier}`);
          }
          this.startGuaranteeing();
        }
        forget(subscription) {
          logger_default.log(`SubscriptionGuarantor forgetting ${subscription.identifier}`);
          this.pendingSubscriptions = this.pendingSubscriptions.filter((s) => s !== subscription);
        }
        startGuaranteeing() {
          this.stopGuaranteeing();
          this.retrySubscribing();
        }
        stopGuaranteeing() {
          clearTimeout(this.retryTimeout);
        }
        retrySubscribing() {
          this.retryTimeout = setTimeout(
            () => {
              if (this.subscriptions && typeof this.subscriptions.subscribe === "function") {
                this.pendingSubscriptions.map((subscription) => {
                  logger_default.log(`SubscriptionGuarantor resubscribing ${subscription.identifier}`);
                  this.subscriptions.subscribe(subscription);
                });
              }
            },
            500
          );
        }
      };
      subscription_guarantor_default = SubscriptionGuarantor;
    }
  });

  // node_modules/@rails/actioncable/src/subscriptions.js
  var Subscriptions;
  var init_subscriptions = __esm({
    "node_modules/@rails/actioncable/src/subscriptions.js"() {
      init_subscription();
      init_subscription_guarantor();
      init_logger();
      Subscriptions = class {
        constructor(consumer2) {
          this.consumer = consumer2;
          this.guarantor = new subscription_guarantor_default(this);
          this.subscriptions = [];
        }
        create(channelName, mixin) {
          const channel = channelName;
          const params = typeof channel === "object" ? channel : { channel };
          const subscription = new Subscription(this.consumer, params, mixin);
          return this.add(subscription);
        }
        add(subscription) {
          this.subscriptions.push(subscription);
          this.consumer.ensureActiveConnection();
          this.notify(subscription, "initialized");
          this.subscribe(subscription);
          return subscription;
        }
        remove(subscription) {
          this.forget(subscription);
          if (!this.findAll(subscription.identifier).length) {
            this.sendCommand(subscription, "unsubscribe");
          }
          return subscription;
        }
        reject(identifier) {
          return this.findAll(identifier).map((subscription) => {
            this.forget(subscription);
            this.notify(subscription, "rejected");
            return subscription;
          });
        }
        forget(subscription) {
          this.guarantor.forget(subscription);
          this.subscriptions = this.subscriptions.filter((s) => s !== subscription);
          return subscription;
        }
        findAll(identifier) {
          return this.subscriptions.filter((s) => s.identifier === identifier);
        }
        reload() {
          return this.subscriptions.map((subscription) => this.subscribe(subscription));
        }
        notifyAll(callbackName, ...args) {
          return this.subscriptions.map((subscription) => this.notify(subscription, callbackName, ...args));
        }
        notify(subscription, callbackName, ...args) {
          let subscriptions;
          if (typeof subscription === "string") {
            subscriptions = this.findAll(subscription);
          } else {
            subscriptions = [subscription];
          }
          return subscriptions.map((subscription2) => typeof subscription2[callbackName] === "function" ? subscription2[callbackName](...args) : void 0);
        }
        subscribe(subscription) {
          if (this.sendCommand(subscription, "subscribe")) {
            this.guarantor.guarantee(subscription);
          }
        }
        confirmSubscription(identifier) {
          logger_default.log(`Subscription confirmed ${identifier}`);
          this.findAll(identifier).map((subscription) => this.guarantor.forget(subscription));
        }
        sendCommand(subscription, command) {
          const { identifier } = subscription;
          return this.consumer.send({ command, identifier });
        }
      };
    }
  });

  // node_modules/@rails/actioncable/src/consumer.js
  function createWebSocketURL(url) {
    if (typeof url === "function") {
      url = url();
    }
    if (url && !/^wss?:/i.test(url)) {
      const a = document.createElement("a");
      a.href = url;
      a.href = a.href;
      a.protocol = a.protocol.replace("http", "ws");
      return a.href;
    } else {
      return url;
    }
  }
  var Consumer;
  var init_consumer = __esm({
    "node_modules/@rails/actioncable/src/consumer.js"() {
      init_connection();
      init_subscriptions();
      Consumer = class {
        constructor(url) {
          this._url = url;
          this.subscriptions = new Subscriptions(this);
          this.connection = new connection_default(this);
          this.subprotocols = [];
        }
        get url() {
          return createWebSocketURL(this._url);
        }
        send(data) {
          return this.connection.send(data);
        }
        connect() {
          return this.connection.open();
        }
        disconnect() {
          return this.connection.close({ allowReconnect: false });
        }
        ensureActiveConnection() {
          if (!this.connection.isActive()) {
            return this.connection.open();
          }
        }
        addSubProtocol(subprotocol) {
          this.subprotocols = [...this.subprotocols, subprotocol];
        }
      };
    }
  });

  // node_modules/@rails/actioncable/src/index.js
  var src_exports = {};
  __export(src_exports, {
    Connection: () => connection_default,
    ConnectionMonitor: () => connection_monitor_default,
    Consumer: () => Consumer,
    INTERNAL: () => internal_default,
    Subscription: () => Subscription,
    SubscriptionGuarantor: () => subscription_guarantor_default,
    Subscriptions: () => Subscriptions,
    adapters: () => adapters_default,
    createConsumer: () => createConsumer,
    createWebSocketURL: () => createWebSocketURL,
    getConfig: () => getConfig,
    logger: () => logger_default
  });
  function createConsumer(url = getConfig("url") || internal_default.default_mount_path) {
    return new Consumer(url);
  }
  function getConfig(name) {
    const element = document.head.querySelector(`meta[name='action-cable-${name}']`);
    if (element) {
      return element.getAttribute("content");
    }
  }
  var init_src = __esm({
    "node_modules/@rails/actioncable/src/index.js"() {
      init_connection();
      init_connection_monitor();
      init_consumer();
      init_internal();
      init_subscription();
      init_subscriptions();
      init_subscription_guarantor();
      init_adapters();
      init_logger();
    }
  });

  // node_modules/inputmask/dist/inputmask.js
  var require_inputmask = __commonJS({
    "node_modules/inputmask/dist/inputmask.js"(exports, module) {
      !function(e, t) {
        if ("object" == typeof exports && "object" == typeof module)
          module.exports = t();
        else if ("function" == typeof define && define.amd)
          define([], t);
        else {
          var i = t();
          for (var n in i)
            ("object" == typeof exports ? exports : e)[n] = i[n];
        }
      }("undefined" != typeof self ? self : exports, function() {
        return function() {
          "use strict";
          var e = {
            8741: function(e2, t2) {
              Object.defineProperty(t2, "__esModule", {
                value: true
              }), t2.default = void 0;
              var i2 = !("undefined" == typeof window || !window.document || !window.document.createElement);
              t2.default = i2;
            },
            3976: function(e2, t2, i2) {
              Object.defineProperty(t2, "__esModule", {
                value: true
              }), t2.default = void 0;
              var n2 = i2(2839), a = {
                _maxTestPos: 500,
                placeholder: "_",
                optionalmarker: ["[", "]"],
                quantifiermarker: ["{", "}"],
                groupmarker: ["(", ")"],
                alternatormarker: "|",
                escapeChar: "\\",
                mask: null,
                regex: null,
                oncomplete: function() {
                },
                onincomplete: function() {
                },
                oncleared: function() {
                },
                repeat: 0,
                greedy: false,
                autoUnmask: false,
                removeMaskOnSubmit: false,
                clearMaskOnLostFocus: true,
                insertMode: true,
                insertModeVisual: true,
                clearIncomplete: false,
                alias: null,
                onKeyDown: function() {
                },
                onBeforeMask: null,
                onBeforePaste: function(e3, t3) {
                  return "function" == typeof t3.onBeforeMask ? t3.onBeforeMask.call(this, e3, t3) : e3;
                },
                onBeforeWrite: null,
                onUnMask: null,
                showMaskOnFocus: true,
                showMaskOnHover: true,
                onKeyValidation: function() {
                },
                skipOptionalPartCharacter: " ",
                numericInput: false,
                rightAlign: false,
                undoOnEscape: true,
                radixPoint: "",
                _radixDance: false,
                groupSeparator: "",
                keepStatic: null,
                positionCaretOnTab: true,
                tabThrough: false,
                supportsInputType: ["text", "tel", "url", "password", "search"],
                ignorables: [n2.keys.Backspace, n2.keys.Tab, n2.keys.Pause, n2.keys.Escape, n2.keys.PageUp, n2.keys.PageDown, n2.keys.End, n2.keys.Home, n2.keys.ArrowLeft, n2.keys.ArrowUp, n2.keys.ArrowRight, n2.keys.ArrowDown, n2.keys.Insert, n2.keys.Delete, n2.keys.ContextMenu, n2.keys.F1, n2.keys.F2, n2.keys.F3, n2.keys.F4, n2.keys.F5, n2.keys.F6, n2.keys.F7, n2.keys.F8, n2.keys.F9, n2.keys.F10, n2.keys.F11, n2.keys.F12, n2.keys.Process, n2.keys.Unidentified, n2.keys.Shift, n2.keys.Control, n2.keys.Alt, n2.keys.Tab, n2.keys.AltGraph, n2.keys.CapsLock],
                isComplete: null,
                preValidation: null,
                postValidation: null,
                staticDefinitionSymbol: void 0,
                jitMasking: false,
                nullable: true,
                inputEventOnly: false,
                noValuePatching: false,
                positionCaretOnClick: "lvp",
                casing: null,
                inputmode: "text",
                importDataAttributes: true,
                shiftPositions: true,
                usePrototypeDefinitions: true,
                validationEventTimeOut: 3e3,
                substitutes: {}
              };
              t2.default = a;
            },
            7392: function(e2, t2) {
              Object.defineProperty(t2, "__esModule", {
                value: true
              }), t2.default = void 0;
              t2.default = {
                9: {
                  validator: "[0-9\uFF10-\uFF19]",
                  definitionSymbol: "*"
                },
                a: {
                  validator: "[A-Za-z\u0410-\u044F\u0401\u0451\xC0-\xFF\xB5]",
                  definitionSymbol: "*"
                },
                "*": {
                  validator: "[0-9\uFF10-\uFF19A-Za-z\u0410-\u044F\u0401\u0451\xC0-\xFF\xB5]"
                }
              };
            },
            253: function(e2, t2) {
              Object.defineProperty(t2, "__esModule", {
                value: true
              }), t2.default = function(e3, t3, i2) {
                if (void 0 === i2)
                  return e3.__data ? e3.__data[t3] : null;
                e3.__data = e3.__data || {}, e3.__data[t3] = i2;
              };
            },
            3776: function(e2, t2, i2) {
              Object.defineProperty(t2, "__esModule", {
                value: true
              }), t2.Event = void 0, t2.off = function(e3, t3) {
                var i3, n3;
                f(this[0]) && e3 && (i3 = this[0].eventRegistry, n3 = this[0], e3.split(" ").forEach(function(e4) {
                  var a2 = l(e4.split("."), 2);
                  (function(e5, n4) {
                    var a3, r2, o2 = [];
                    if (e5.length > 0)
                      if (void 0 === t3)
                        for (a3 = 0, r2 = i3[e5][n4].length; a3 < r2; a3++)
                          o2.push({
                            ev: e5,
                            namespace: n4 && n4.length > 0 ? n4 : "global",
                            handler: i3[e5][n4][a3]
                          });
                      else
                        o2.push({
                          ev: e5,
                          namespace: n4 && n4.length > 0 ? n4 : "global",
                          handler: t3
                        });
                    else if (n4.length > 0) {
                      for (var s2 in i3)
                        for (var l2 in i3[s2])
                          if (l2 === n4)
                            if (void 0 === t3)
                              for (a3 = 0, r2 = i3[s2][l2].length; a3 < r2; a3++)
                                o2.push({
                                  ev: s2,
                                  namespace: l2,
                                  handler: i3[s2][l2][a3]
                                });
                            else
                              o2.push({
                                ev: s2,
                                namespace: l2,
                                handler: t3
                              });
                    }
                    return o2;
                  })(a2[0], a2[1]).forEach(function(e5) {
                    var t4 = e5.ev, a3 = e5.handler;
                    !function(e6, t5, a4) {
                      if (e6 in i3 == 1)
                        if (n3.removeEventListener ? n3.removeEventListener(e6, a4, false) : n3.detachEvent && n3.detachEvent("on".concat(e6), a4), "global" === t5)
                          for (var r2 in i3[e6])
                            i3[e6][r2].splice(i3[e6][r2].indexOf(a4), 1);
                        else
                          i3[e6][t5].splice(i3[e6][t5].indexOf(a4), 1);
                    }(t4, e5.namespace, a3);
                  });
                }));
                return this;
              }, t2.on = function(e3, t3) {
                if (f(this[0])) {
                  var i3 = this[0].eventRegistry, n3 = this[0];
                  e3.split(" ").forEach(function(e4) {
                    var a2 = l(e4.split("."), 2), r2 = a2[0], o2 = a2[1];
                    !function(e5, a3) {
                      n3.addEventListener ? n3.addEventListener(e5, t3, false) : n3.attachEvent && n3.attachEvent("on".concat(e5), t3), i3[e5] = i3[e5] || {}, i3[e5][a3] = i3[e5][a3] || [], i3[e5][a3].push(t3);
                    }(r2, void 0 === o2 ? "global" : o2);
                  });
                }
                return this;
              }, t2.trigger = function(e3) {
                var t3 = arguments;
                if (f(this[0]))
                  for (var i3 = this[0].eventRegistry, n3 = this[0], r2 = "string" == typeof e3 ? e3.split(" ") : [e3.type], s2 = 0; s2 < r2.length; s2++) {
                    var l2 = r2[s2].split("."), c2 = l2[0], u2 = l2[1] || "global";
                    if (void 0 !== document && "global" === u2) {
                      var d, p = {
                        bubbles: true,
                        cancelable: true,
                        composed: true,
                        detail: arguments[1]
                      };
                      if (document.createEvent) {
                        try {
                          if ("input" === c2)
                            p.inputType = "insertText", d = new InputEvent(c2, p);
                          else
                            d = new CustomEvent(c2, p);
                        } catch (e4) {
                          (d = document.createEvent("CustomEvent")).initCustomEvent(c2, p.bubbles, p.cancelable, p.detail);
                        }
                        e3.type && (0, a.default)(d, e3), n3.dispatchEvent(d);
                      } else
                        (d = document.createEventObject()).eventType = c2, d.detail = arguments[1], e3.type && (0, a.default)(d, e3), n3.fireEvent("on" + d.eventType, d);
                    } else if (void 0 !== i3[c2]) {
                      arguments[0] = arguments[0].type ? arguments[0] : o.default.Event(arguments[0]), arguments[0].detail = arguments.slice(1);
                      var h = i3[c2];
                      ("global" === u2 ? Object.values(h).flat() : h[u2]).forEach(function(e4) {
                        return e4.apply(n3, t3);
                      });
                    }
                  }
                return this;
              };
              var n2, a = u(i2(600)), r = u(i2(9380)), o = u(i2(4963)), s = u(i2(8741));
              function l(e3, t3) {
                return function(e4) {
                  if (Array.isArray(e4))
                    return e4;
                }(e3) || function(e4, t4) {
                  var i3 = null == e4 ? null : "undefined" != typeof Symbol && e4[Symbol.iterator] || e4["@@iterator"];
                  if (null != i3) {
                    var n3, a2, r2, o2, s2 = [], l2 = true, c2 = false;
                    try {
                      if (r2 = (i3 = i3.call(e4)).next, 0 === t4) {
                        if (Object(i3) !== i3)
                          return;
                        l2 = false;
                      } else
                        for (; !(l2 = (n3 = r2.call(i3)).done) && (s2.push(n3.value), s2.length !== t4); l2 = true)
                          ;
                    } catch (e5) {
                      c2 = true, a2 = e5;
                    } finally {
                      try {
                        if (!l2 && null != i3.return && (o2 = i3.return(), Object(o2) !== o2))
                          return;
                      } finally {
                        if (c2)
                          throw a2;
                      }
                    }
                    return s2;
                  }
                }(e3, t3) || function(e4, t4) {
                  if (!e4)
                    return;
                  if ("string" == typeof e4)
                    return c(e4, t4);
                  var i3 = Object.prototype.toString.call(e4).slice(8, -1);
                  "Object" === i3 && e4.constructor && (i3 = e4.constructor.name);
                  if ("Map" === i3 || "Set" === i3)
                    return Array.from(e4);
                  if ("Arguments" === i3 || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(i3))
                    return c(e4, t4);
                }(e3, t3) || function() {
                  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
                }();
              }
              function c(e3, t3) {
                (null == t3 || t3 > e3.length) && (t3 = e3.length);
                for (var i3 = 0, n3 = new Array(t3); i3 < t3; i3++)
                  n3[i3] = e3[i3];
                return n3;
              }
              function u(e3) {
                return e3 && e3.__esModule ? e3 : {
                  default: e3
                };
              }
              function f(e3) {
                return e3 instanceof Element;
              }
              t2.Event = n2, "function" == typeof r.default.CustomEvent ? t2.Event = n2 = r.default.CustomEvent : s.default && (t2.Event = n2 = function(e3, t3) {
                t3 = t3 || {
                  bubbles: false,
                  cancelable: false,
                  composed: true,
                  detail: void 0
                };
                var i3 = document.createEvent("CustomEvent");
                return i3.initCustomEvent(e3, t3.bubbles, t3.cancelable, t3.detail), i3;
              }, n2.prototype = r.default.Event.prototype);
            },
            600: function(e2, t2) {
              function i2(e3) {
                return i2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e4) {
                  return typeof e4;
                } : function(e4) {
                  return e4 && "function" == typeof Symbol && e4.constructor === Symbol && e4 !== Symbol.prototype ? "symbol" : typeof e4;
                }, i2(e3);
              }
              Object.defineProperty(t2, "__esModule", {
                value: true
              }), t2.default = function e3() {
                var t3, n2, a, r, o, s, l = arguments[0] || {}, c = 1, u = arguments.length, f = false;
                "boolean" == typeof l && (f = l, l = arguments[c] || {}, c++);
                "object" !== i2(l) && "function" != typeof l && (l = {});
                for (; c < u; c++)
                  if (null != (t3 = arguments[c]))
                    for (n2 in t3)
                      a = l[n2], l !== (r = t3[n2]) && (f && r && ("[object Object]" === Object.prototype.toString.call(r) || (o = Array.isArray(r))) ? (o ? (o = false, s = a && Array.isArray(a) ? a : []) : s = a && "[object Object]" === Object.prototype.toString.call(a) ? a : {}, l[n2] = e3(f, s, r)) : void 0 !== r && (l[n2] = r));
                return l;
              };
            },
            4963: function(e2, t2, i2) {
              Object.defineProperty(t2, "__esModule", {
                value: true
              }), t2.default = void 0;
              var n2 = s(i2(600)), a = s(i2(9380)), r = s(i2(253)), o = i2(3776);
              function s(e3) {
                return e3 && e3.__esModule ? e3 : {
                  default: e3
                };
              }
              var l = a.default.document;
              function c(e3) {
                return e3 instanceof c ? e3 : this instanceof c ? void (null != e3 && e3 !== a.default && (this[0] = e3.nodeName ? e3 : void 0 !== e3[0] && e3[0].nodeName ? e3[0] : l.querySelector(e3), void 0 !== this[0] && null !== this[0] && (this[0].eventRegistry = this[0].eventRegistry || {}))) : new c(e3);
              }
              c.prototype = {
                on: o.on,
                off: o.off,
                trigger: o.trigger
              }, c.extend = n2.default, c.data = r.default, c.Event = o.Event;
              var u = c;
              t2.default = u;
            },
            9845: function(e2, t2, i2) {
              Object.defineProperty(t2, "__esModule", {
                value: true
              }), t2.mobile = t2.iphone = t2.ie = void 0;
              var n2, a = (n2 = i2(9380)) && n2.__esModule ? n2 : {
                default: n2
              };
              var r = a.default.navigator && a.default.navigator.userAgent || "", o = r.indexOf("MSIE ") > 0 || r.indexOf("Trident/") > 0, s = navigator.userAgentData && navigator.userAgentData.mobile || a.default.navigator && a.default.navigator.maxTouchPoints || "ontouchstart" in a.default, l = /iphone/i.test(r);
              t2.iphone = l, t2.mobile = s, t2.ie = o;
            },
            7184: function(e2, t2) {
              Object.defineProperty(t2, "__esModule", {
                value: true
              }), t2.default = function(e3) {
                return e3.replace(i2, "\\$1");
              };
              var i2 = new RegExp("(\\" + ["/", ".", "*", "+", "?", "|", "(", ")", "[", "]", "{", "}", "\\", "$", "^"].join("|\\") + ")", "gim");
            },
            6030: function(e2, t2, i2) {
              Object.defineProperty(t2, "__esModule", {
                value: true
              }), t2.EventHandlers = void 0;
              var n2 = i2(8711), a = i2(2839), r = i2(9845), o = i2(7215), s = i2(7760), l = i2(4713);
              function c(e3, t3) {
                var i3 = "undefined" != typeof Symbol && e3[Symbol.iterator] || e3["@@iterator"];
                if (!i3) {
                  if (Array.isArray(e3) || (i3 = function(e4, t4) {
                    if (!e4)
                      return;
                    if ("string" == typeof e4)
                      return u(e4, t4);
                    var i4 = Object.prototype.toString.call(e4).slice(8, -1);
                    "Object" === i4 && e4.constructor && (i4 = e4.constructor.name);
                    if ("Map" === i4 || "Set" === i4)
                      return Array.from(e4);
                    if ("Arguments" === i4 || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(i4))
                      return u(e4, t4);
                  }(e3)) || t3 && e3 && "number" == typeof e3.length) {
                    i3 && (e3 = i3);
                    var n3 = 0, a2 = function() {
                    };
                    return {
                      s: a2,
                      n: function() {
                        return n3 >= e3.length ? {
                          done: true
                        } : {
                          done: false,
                          value: e3[n3++]
                        };
                      },
                      e: function(e4) {
                        throw e4;
                      },
                      f: a2
                    };
                  }
                  throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
                }
                var r2, o2 = true, s2 = false;
                return {
                  s: function() {
                    i3 = i3.call(e3);
                  },
                  n: function() {
                    var e4 = i3.next();
                    return o2 = e4.done, e4;
                  },
                  e: function(e4) {
                    s2 = true, r2 = e4;
                  },
                  f: function() {
                    try {
                      o2 || null == i3.return || i3.return();
                    } finally {
                      if (s2)
                        throw r2;
                    }
                  }
                };
              }
              function u(e3, t3) {
                (null == t3 || t3 > e3.length) && (t3 = e3.length);
                for (var i3 = 0, n3 = new Array(t3); i3 < t3; i3++)
                  n3[i3] = e3[i3];
                return n3;
              }
              var f = {
                keyEvent: function(e3, t3, i3, c2, u2) {
                  var d = this.inputmask, p = d.opts, h = d.dependencyLib, v = d.maskset, m = this, g = h(m), y = e3.key, k = n2.caret.call(d, m), b = p.onKeyDown.call(this, e3, n2.getBuffer.call(d), k, p);
                  if (void 0 !== b)
                    return b;
                  if (y === a.keys.Backspace || y === a.keys.Delete || r.iphone && y === a.keys.BACKSPACE_SAFARI || e3.ctrlKey && y === a.keys.x && !("oncut" in m))
                    e3.preventDefault(), o.handleRemove.call(d, m, y, k), (0, s.writeBuffer)(m, n2.getBuffer.call(d, true), v.p, e3, m.inputmask._valueGet() !== n2.getBuffer.call(d).join(""));
                  else if (y === a.keys.End || y === a.keys.PageDown) {
                    e3.preventDefault();
                    var x = n2.seekNext.call(d, n2.getLastValidPosition.call(d));
                    n2.caret.call(d, m, e3.shiftKey ? k.begin : x, x, true);
                  } else
                    y === a.keys.Home && !e3.shiftKey || y === a.keys.PageUp ? (e3.preventDefault(), n2.caret.call(d, m, 0, e3.shiftKey ? k.begin : 0, true)) : p.undoOnEscape && y === a.keys.Escape && true !== e3.altKey ? ((0, s.checkVal)(m, true, false, d.undoValue.split("")), g.trigger("click")) : y !== a.keys.Insert || e3.shiftKey || e3.ctrlKey || void 0 !== d.userOptions.insertMode ? true === p.tabThrough && y === a.keys.Tab ? true === e3.shiftKey ? (k.end = n2.seekPrevious.call(d, k.end, true), true === l.getTest.call(d, k.end - 1).match.static && k.end--, k.begin = n2.seekPrevious.call(d, k.end, true), k.begin >= 0 && k.end > 0 && (e3.preventDefault(), n2.caret.call(d, m, k.begin, k.end))) : (k.begin = n2.seekNext.call(d, k.begin, true), k.end = n2.seekNext.call(d, k.begin, true), k.end < v.maskLength && k.end--, k.begin <= v.maskLength && (e3.preventDefault(), n2.caret.call(d, m, k.begin, k.end))) : e3.shiftKey || p.insertModeVisual && false === p.insertMode && (y === a.keys.ArrowRight ? setTimeout(function() {
                      var e4 = n2.caret.call(d, m);
                      n2.caret.call(d, m, e4.begin);
                    }, 0) : y === a.keys.ArrowLeft && setTimeout(function() {
                      var e4 = n2.translatePosition.call(d, m.inputmask.caretPos.begin);
                      n2.translatePosition.call(d, m.inputmask.caretPos.end);
                      d.isRTL ? n2.caret.call(d, m, e4 + (e4 === v.maskLength ? 0 : 1)) : n2.caret.call(d, m, e4 - (0 === e4 ? 0 : 1));
                    }, 0)) : o.isSelection.call(d, k) ? p.insertMode = !p.insertMode : (p.insertMode = !p.insertMode, n2.caret.call(d, m, k.begin, k.begin));
                  return d.isComposing = y == a.keys.Process || y == a.keys.Unidentified, d.ignorable = p.ignorables.includes(y), f.keypressEvent.call(this, e3, t3, i3, c2, u2);
                },
                keypressEvent: function(e3, t3, i3, r2, l2) {
                  var c2 = this.inputmask || this, u2 = c2.opts, f2 = c2.dependencyLib, d = c2.maskset, p = c2.el, h = f2(p), v = e3.key;
                  if (true === t3 || e3.ctrlKey && e3.altKey || !(e3.ctrlKey || e3.metaKey || c2.ignorable)) {
                    if (v) {
                      var m, g = t3 ? {
                        begin: l2,
                        end: l2
                      } : n2.caret.call(c2, p);
                      v = u2.substitutes[v] || v, d.writeOutBuffer = true;
                      var y = o.isValid.call(c2, g, v, r2, void 0, void 0, void 0, t3);
                      if (false !== y && (n2.resetMaskSet.call(c2, true), m = void 0 !== y.caret ? y.caret : n2.seekNext.call(c2, y.pos.begin ? y.pos.begin : y.pos), d.p = m), m = u2.numericInput && void 0 === y.caret ? n2.seekPrevious.call(c2, m) : m, false !== i3 && (setTimeout(function() {
                        u2.onKeyValidation.call(p, v, y);
                      }, 0), d.writeOutBuffer && false !== y)) {
                        var k = n2.getBuffer.call(c2);
                        (0, s.writeBuffer)(p, k, m, e3, true !== t3);
                      }
                      if (e3.preventDefault(), t3)
                        return false !== y && (y.forwardPosition = m), y;
                    }
                  } else
                    v === a.keys.Enter && c2.undoValue !== c2._valueGet(true) && (c2.undoValue = c2._valueGet(true), setTimeout(function() {
                      h.trigger("change");
                    }, 0));
                },
                pasteEvent: function(e3) {
                  var t3, i3 = this.inputmask, a2 = i3.opts, r2 = i3._valueGet(true), o2 = n2.caret.call(i3, this);
                  i3.isRTL && (t3 = o2.end, o2.end = n2.translatePosition.call(i3, o2.begin), o2.begin = n2.translatePosition.call(i3, t3));
                  var l2 = r2.substr(0, o2.begin), u2 = r2.substr(o2.end, r2.length);
                  if (l2 == (i3.isRTL ? n2.getBufferTemplate.call(i3).slice().reverse() : n2.getBufferTemplate.call(i3)).slice(0, o2.begin).join("") && (l2 = ""), u2 == (i3.isRTL ? n2.getBufferTemplate.call(i3).slice().reverse() : n2.getBufferTemplate.call(i3)).slice(o2.end).join("") && (u2 = ""), window.clipboardData && window.clipboardData.getData)
                    r2 = l2 + window.clipboardData.getData("Text") + u2;
                  else {
                    if (!e3.clipboardData || !e3.clipboardData.getData)
                      return true;
                    r2 = l2 + e3.clipboardData.getData("text/plain") + u2;
                  }
                  var f2 = r2;
                  if (i3.isRTL) {
                    f2 = f2.split("");
                    var d, p = c(n2.getBufferTemplate.call(i3));
                    try {
                      for (p.s(); !(d = p.n()).done; ) {
                        var h = d.value;
                        f2[0] === h && f2.shift();
                      }
                    } catch (e4) {
                      p.e(e4);
                    } finally {
                      p.f();
                    }
                    f2 = f2.join("");
                  }
                  if ("function" == typeof a2.onBeforePaste) {
                    if (false === (f2 = a2.onBeforePaste.call(i3, f2, a2)))
                      return false;
                    f2 || (f2 = r2);
                  }
                  (0, s.checkVal)(this, true, false, f2.toString().split(""), e3), e3.preventDefault();
                },
                inputFallBackEvent: function(e3) {
                  var t3 = this.inputmask, i3 = t3.opts, o2 = t3.dependencyLib;
                  var c2, u2 = this, d = u2.inputmask._valueGet(true), p = (t3.isRTL ? n2.getBuffer.call(t3).slice().reverse() : n2.getBuffer.call(t3)).join(""), h = n2.caret.call(t3, u2, void 0, void 0, true);
                  if (p !== d) {
                    if (c2 = function(e4, a2, r2) {
                      for (var o3, s2, c3, u3 = e4.substr(0, r2.begin).split(""), f2 = e4.substr(r2.begin).split(""), d2 = a2.substr(0, r2.begin).split(""), p2 = a2.substr(r2.begin).split(""), h2 = u3.length >= d2.length ? u3.length : d2.length, v2 = f2.length >= p2.length ? f2.length : p2.length, m = "", g = [], y = "~"; u3.length < h2; )
                        u3.push(y);
                      for (; d2.length < h2; )
                        d2.push(y);
                      for (; f2.length < v2; )
                        f2.unshift(y);
                      for (; p2.length < v2; )
                        p2.unshift(y);
                      var k = u3.concat(f2), b = d2.concat(p2);
                      for (s2 = 0, o3 = k.length; s2 < o3; s2++)
                        switch (c3 = l.getPlaceholder.call(t3, n2.translatePosition.call(t3, s2)), m) {
                          case "insertText":
                            b[s2 - 1] === k[s2] && r2.begin == k.length - 1 && g.push(k[s2]), s2 = o3;
                            break;
                          case "insertReplacementText":
                          case "deleteContentBackward":
                            k[s2] === y ? r2.end++ : s2 = o3;
                            break;
                          default:
                            k[s2] !== b[s2] && (k[s2 + 1] !== y && k[s2 + 1] !== c3 && void 0 !== k[s2 + 1] || (b[s2] !== c3 || b[s2 + 1] !== y) && b[s2] !== y ? b[s2 + 1] === y && b[s2] === k[s2 + 1] ? (m = "insertText", g.push(k[s2]), r2.begin--, r2.end--) : k[s2] !== c3 && k[s2] !== y && (k[s2 + 1] === y || b[s2] !== k[s2] && b[s2 + 1] === k[s2 + 1]) ? (m = "insertReplacementText", g.push(k[s2]), r2.begin--) : k[s2] === y ? (m = "deleteContentBackward", (n2.isMask.call(t3, n2.translatePosition.call(t3, s2), true) || b[s2] === i3.radixPoint) && r2.end++) : s2 = o3 : (m = "insertText", g.push(k[s2]), r2.begin--, r2.end--));
                        }
                      return {
                        action: m,
                        data: g,
                        caret: r2
                      };
                    }(d, p, h), (u2.inputmask.shadowRoot || u2.ownerDocument).activeElement !== u2 && u2.focus(), (0, s.writeBuffer)(u2, n2.getBuffer.call(t3)), n2.caret.call(t3, u2, h.begin, h.end, true), !r.mobile && t3.skipNextInsert && "insertText" === e3.inputType && "insertText" === c2.action && t3.isComposing)
                      return false;
                    switch ("insertCompositionText" === e3.inputType && "insertText" === c2.action && t3.isComposing ? t3.skipNextInsert = true : t3.skipNextInsert = false, c2.action) {
                      case "insertText":
                      case "insertReplacementText":
                        c2.data.forEach(function(e4, i4) {
                          var n3 = new o2.Event("keypress");
                          n3.key = e4, t3.ignorable = false, f.keypressEvent.call(u2, n3);
                        }), setTimeout(function() {
                          t3.$el.trigger("keyup");
                        }, 0);
                        break;
                      case "deleteContentBackward":
                        var v = new o2.Event("keydown");
                        v.key = a.keys.Backspace, f.keyEvent.call(u2, v);
                        break;
                      default:
                        (0, s.applyInputValue)(u2, d), n2.caret.call(t3, u2, h.begin, h.end, true);
                    }
                    e3.preventDefault();
                  }
                },
                setValueEvent: function(e3) {
                  var t3 = this.inputmask, i3 = this, a2 = e3 && e3.detail ? e3.detail[0] : arguments[1];
                  void 0 === a2 && (a2 = i3.inputmask._valueGet(true)), (0, s.applyInputValue)(i3, a2), (e3.detail && void 0 !== e3.detail[1] || void 0 !== arguments[2]) && n2.caret.call(t3, i3, e3.detail ? e3.detail[1] : arguments[2]);
                },
                focusEvent: function(e3) {
                  var t3 = this.inputmask, i3 = t3.opts, a2 = null == t3 ? void 0 : t3._valueGet();
                  i3.showMaskOnFocus && a2 !== n2.getBuffer.call(t3).join("") && (0, s.writeBuffer)(this, n2.getBuffer.call(t3), n2.seekNext.call(t3, n2.getLastValidPosition.call(t3))), true !== i3.positionCaretOnTab || false !== t3.mouseEnter || o.isComplete.call(t3, n2.getBuffer.call(t3)) && -1 !== n2.getLastValidPosition.call(t3) || f.clickEvent.apply(this, [e3, true]), t3.undoValue = null == t3 ? void 0 : t3._valueGet(true);
                },
                invalidEvent: function(e3) {
                  this.inputmask.validationEvent = true;
                },
                mouseleaveEvent: function() {
                  var e3 = this.inputmask, t3 = e3.opts, i3 = this;
                  e3.mouseEnter = false, t3.clearMaskOnLostFocus && (i3.inputmask.shadowRoot || i3.ownerDocument).activeElement !== i3 && (0, s.HandleNativePlaceholder)(i3, e3.originalPlaceholder);
                },
                clickEvent: function(e3, t3) {
                  var i3 = this.inputmask;
                  i3.clicked++;
                  var a2 = this;
                  if ((a2.inputmask.shadowRoot || a2.ownerDocument).activeElement === a2) {
                    var r2 = n2.determineNewCaretPosition.call(i3, n2.caret.call(i3, a2), t3);
                    void 0 !== r2 && n2.caret.call(i3, a2, r2);
                  }
                },
                cutEvent: function(e3) {
                  var t3 = this.inputmask, i3 = t3.maskset, r2 = this, l2 = n2.caret.call(t3, r2), c2 = t3.isRTL ? n2.getBuffer.call(t3).slice(l2.end, l2.begin) : n2.getBuffer.call(t3).slice(l2.begin, l2.end), u2 = t3.isRTL ? c2.reverse().join("") : c2.join("");
                  window.navigator.clipboard ? window.navigator.clipboard.writeText(u2) : window.clipboardData && window.clipboardData.getData && window.clipboardData.setData("Text", u2), o.handleRemove.call(t3, r2, a.keys.Delete, l2), (0, s.writeBuffer)(r2, n2.getBuffer.call(t3), i3.p, e3, t3.undoValue !== t3._valueGet(true));
                },
                blurEvent: function(e3) {
                  var t3 = this.inputmask, i3 = t3.opts, a2 = t3.dependencyLib;
                  t3.clicked = 0;
                  var r2 = a2(this), l2 = this;
                  if (l2.inputmask) {
                    (0, s.HandleNativePlaceholder)(l2, t3.originalPlaceholder);
                    var c2 = l2.inputmask._valueGet(), u2 = n2.getBuffer.call(t3).slice();
                    "" !== c2 && (i3.clearMaskOnLostFocus && (-1 === n2.getLastValidPosition.call(t3) && c2 === n2.getBufferTemplate.call(t3).join("") ? u2 = [] : s.clearOptionalTail.call(t3, u2)), false === o.isComplete.call(t3, u2) && (setTimeout(function() {
                      r2.trigger("incomplete");
                    }, 0), i3.clearIncomplete && (n2.resetMaskSet.call(t3), u2 = i3.clearMaskOnLostFocus ? [] : n2.getBufferTemplate.call(t3).slice())), (0, s.writeBuffer)(l2, u2, void 0, e3)), t3.undoValue !== t3._valueGet(true) && (t3.undoValue = t3._valueGet(true), r2.trigger("change"));
                  }
                },
                mouseenterEvent: function() {
                  var e3 = this.inputmask, t3 = e3.opts.showMaskOnHover, i3 = this;
                  if (e3.mouseEnter = true, (i3.inputmask.shadowRoot || i3.ownerDocument).activeElement !== i3) {
                    var a2 = (e3.isRTL ? n2.getBufferTemplate.call(e3).slice().reverse() : n2.getBufferTemplate.call(e3)).join("");
                    t3 && (0, s.HandleNativePlaceholder)(i3, a2);
                  }
                },
                submitEvent: function() {
                  var e3 = this.inputmask, t3 = e3.opts;
                  e3.undoValue !== e3._valueGet(true) && e3.$el.trigger("change"), -1 === n2.getLastValidPosition.call(e3) && e3._valueGet && e3._valueGet() === n2.getBufferTemplate.call(e3).join("") && e3._valueSet(""), t3.clearIncomplete && false === o.isComplete.call(e3, n2.getBuffer.call(e3)) && e3._valueSet(""), t3.removeMaskOnSubmit && (e3._valueSet(e3.unmaskedvalue(), true), setTimeout(function() {
                    (0, s.writeBuffer)(e3.el, n2.getBuffer.call(e3));
                  }, 0));
                },
                resetEvent: function() {
                  var e3 = this.inputmask;
                  e3.refreshValue = true, setTimeout(function() {
                    (0, s.applyInputValue)(e3.el, e3._valueGet(true));
                  }, 0);
                }
              };
              t2.EventHandlers = f;
            },
            9716: function(e2, t2, i2) {
              Object.defineProperty(t2, "__esModule", {
                value: true
              }), t2.EventRuler = void 0;
              var n2, a = (n2 = i2(2394)) && n2.__esModule ? n2 : {
                default: n2
              }, r = i2(2839), o = i2(8711), s = i2(7760);
              var l = {
                on: function(e3, t3, i3) {
                  var n3 = e3.inputmask.dependencyLib, l2 = function(t4) {
                    t4.originalEvent && (t4 = t4.originalEvent || t4, arguments[0] = t4);
                    var l3, c = this, u = c.inputmask, f = u ? u.opts : void 0;
                    if (void 0 === u && "FORM" !== this.nodeName) {
                      var d = n3.data(c, "_inputmask_opts");
                      n3(c).off(), d && new a.default(d).mask(c);
                    } else {
                      if (["submit", "reset", "setvalue"].includes(t4.type) || "FORM" === this.nodeName || !(c.disabled || c.readOnly && !("keydown" === t4.type && t4.ctrlKey && t4.key === r.keys.c || false === f.tabThrough && t4.key === r.keys.Tab))) {
                        switch (t4.type) {
                          case "input":
                            if (true === u.skipInputEvent)
                              return u.skipInputEvent = false, t4.preventDefault();
                            break;
                          case "click":
                          case "focus":
                            return u.validationEvent ? (u.validationEvent = false, e3.blur(), (0, s.HandleNativePlaceholder)(e3, (u.isRTL ? o.getBufferTemplate.call(u).slice().reverse() : o.getBufferTemplate.call(u)).join("")), setTimeout(function() {
                              e3.focus();
                            }, f.validationEventTimeOut), false) : (l3 = arguments, void setTimeout(function() {
                              e3.inputmask && i3.apply(c, l3);
                            }, 0));
                        }
                        var p = i3.apply(c, arguments);
                        return false === p && (t4.preventDefault(), t4.stopPropagation()), p;
                      }
                      t4.preventDefault();
                    }
                  };
                  ["submit", "reset"].includes(t3) ? (l2 = l2.bind(e3), null !== e3.form && n3(e3.form).on(t3, l2)) : n3(e3).on(t3, l2), e3.inputmask.events[t3] = e3.inputmask.events[t3] || [], e3.inputmask.events[t3].push(l2);
                },
                off: function(e3, t3) {
                  if (e3.inputmask && e3.inputmask.events) {
                    var i3 = e3.inputmask.dependencyLib, n3 = e3.inputmask.events;
                    for (var a2 in t3 && ((n3 = [])[t3] = e3.inputmask.events[t3]), n3) {
                      for (var r2 = n3[a2]; r2.length > 0; ) {
                        var o2 = r2.pop();
                        ["submit", "reset"].includes(a2) ? null !== e3.form && i3(e3.form).off(a2, o2) : i3(e3).off(a2, o2);
                      }
                      delete e3.inputmask.events[a2];
                    }
                  }
                }
              };
              t2.EventRuler = l;
            },
            219: function(e2, t2, i2) {
              var n2 = d(i2(2394)), a = i2(2839), r = d(i2(7184)), o = i2(8711), s = i2(4713);
              function l(e3, t3) {
                return function(e4) {
                  if (Array.isArray(e4))
                    return e4;
                }(e3) || function(e4, t4) {
                  var i3 = null == e4 ? null : "undefined" != typeof Symbol && e4[Symbol.iterator] || e4["@@iterator"];
                  if (null != i3) {
                    var n3, a2, r2, o2, s2 = [], l2 = true, c2 = false;
                    try {
                      if (r2 = (i3 = i3.call(e4)).next, 0 === t4) {
                        if (Object(i3) !== i3)
                          return;
                        l2 = false;
                      } else
                        for (; !(l2 = (n3 = r2.call(i3)).done) && (s2.push(n3.value), s2.length !== t4); l2 = true)
                          ;
                    } catch (e5) {
                      c2 = true, a2 = e5;
                    } finally {
                      try {
                        if (!l2 && null != i3.return && (o2 = i3.return(), Object(o2) !== o2))
                          return;
                      } finally {
                        if (c2)
                          throw a2;
                      }
                    }
                    return s2;
                  }
                }(e3, t3) || function(e4, t4) {
                  if (!e4)
                    return;
                  if ("string" == typeof e4)
                    return c(e4, t4);
                  var i3 = Object.prototype.toString.call(e4).slice(8, -1);
                  "Object" === i3 && e4.constructor && (i3 = e4.constructor.name);
                  if ("Map" === i3 || "Set" === i3)
                    return Array.from(e4);
                  if ("Arguments" === i3 || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(i3))
                    return c(e4, t4);
                }(e3, t3) || function() {
                  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
                }();
              }
              function c(e3, t3) {
                (null == t3 || t3 > e3.length) && (t3 = e3.length);
                for (var i3 = 0, n3 = new Array(t3); i3 < t3; i3++)
                  n3[i3] = e3[i3];
                return n3;
              }
              function u(e3) {
                return u = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e4) {
                  return typeof e4;
                } : function(e4) {
                  return e4 && "function" == typeof Symbol && e4.constructor === Symbol && e4 !== Symbol.prototype ? "symbol" : typeof e4;
                }, u(e3);
              }
              function f(e3, t3) {
                for (var i3 = 0; i3 < t3.length; i3++) {
                  var n3 = t3[i3];
                  n3.enumerable = n3.enumerable || false, n3.configurable = true, "value" in n3 && (n3.writable = true), Object.defineProperty(e3, (a2 = n3.key, r2 = void 0, r2 = function(e4, t4) {
                    if ("object" !== u(e4) || null === e4)
                      return e4;
                    var i4 = e4[Symbol.toPrimitive];
                    if (void 0 !== i4) {
                      var n4 = i4.call(e4, t4 || "default");
                      if ("object" !== u(n4))
                        return n4;
                      throw new TypeError("@@toPrimitive must return a primitive value.");
                    }
                    return ("string" === t4 ? String : Number)(e4);
                  }(a2, "string"), "symbol" === u(r2) ? r2 : String(r2)), n3);
                }
                var a2, r2;
              }
              function d(e3) {
                return e3 && e3.__esModule ? e3 : {
                  default: e3
                };
              }
              var p = n2.default.dependencyLib, h = function() {
                function e3(t4, i4, n4) {
                  !function(e4, t5) {
                    if (!(e4 instanceof t5))
                      throw new TypeError("Cannot call a class as a function");
                  }(this, e3), this.mask = t4, this.format = i4, this.opts = n4, this._date = new Date(1, 0, 1), this.initDateObject(t4, this.opts);
                }
                var t3, i3, n3;
                return t3 = e3, (i3 = [{
                  key: "date",
                  get: function() {
                    return void 0 === this._date && (this._date = new Date(1, 0, 1), this.initDateObject(void 0, this.opts)), this._date;
                  }
                }, {
                  key: "initDateObject",
                  value: function(e4, t4) {
                    var i4;
                    for (P(t4).lastIndex = 0; i4 = P(t4).exec(this.format); ) {
                      var n4 = new RegExp("\\d+$").exec(i4[0]), a2 = n4 ? i4[0][0] + "x" : i4[0], r2 = void 0;
                      if (void 0 !== e4) {
                        if (n4) {
                          var o2 = P(t4).lastIndex, s2 = E(i4.index, t4);
                          P(t4).lastIndex = o2, r2 = e4.slice(0, e4.indexOf(s2.nextMatch[0]));
                        } else
                          r2 = e4.slice(0, g[a2] && g[a2][4] || a2.length);
                        e4 = e4.slice(r2.length);
                      }
                      Object.prototype.hasOwnProperty.call(g, a2) && this.setValue(this, r2, a2, g[a2][2], g[a2][1]);
                    }
                  }
                }, {
                  key: "setValue",
                  value: function(e4, t4, i4, n4, a2) {
                    if (void 0 !== t4 && (e4[n4] = "ampm" === n4 ? t4 : t4.replace(/[^0-9]/g, "0"), e4["raw" + n4] = t4.replace(/\s/g, "_")), void 0 !== a2) {
                      var r2 = e4[n4];
                      ("day" === n4 && 29 === parseInt(r2) || "month" === n4 && 2 === parseInt(r2)) && (29 !== parseInt(e4.day) || 2 !== parseInt(e4.month) || "" !== e4.year && void 0 !== e4.year || e4._date.setFullYear(2012, 1, 29)), "day" === n4 && (m = true, 0 === parseInt(r2) && (r2 = 1)), "month" === n4 && (m = true), "year" === n4 && (m = true, r2.length < 4 && (r2 = M(r2, 4, true))), "" === r2 || isNaN(r2) || a2.call(e4._date, r2), "ampm" === n4 && a2.call(e4._date, r2);
                    }
                  }
                }, {
                  key: "reset",
                  value: function() {
                    this._date = new Date(1, 0, 1);
                  }
                }, {
                  key: "reInit",
                  value: function() {
                    this._date = void 0, this.date;
                  }
                }]) && f(t3.prototype, i3), n3 && f(t3, n3), Object.defineProperty(t3, "prototype", {
                  writable: false
                }), e3;
              }(), v = new Date().getFullYear(), m = false, g = {
                d: ["[1-9]|[12][0-9]|3[01]", Date.prototype.setDate, "day", Date.prototype.getDate],
                dd: ["0[1-9]|[12][0-9]|3[01]", Date.prototype.setDate, "day", function() {
                  return M(Date.prototype.getDate.call(this), 2);
                }],
                ddd: [""],
                dddd: [""],
                m: ["[1-9]|1[012]", function(e3) {
                  var t3 = e3 ? parseInt(e3) : 0;
                  return t3 > 0 && t3--, Date.prototype.setMonth.call(this, t3);
                }, "month", function() {
                  return Date.prototype.getMonth.call(this) + 1;
                }],
                mm: ["0[1-9]|1[012]", function(e3) {
                  var t3 = e3 ? parseInt(e3) : 0;
                  return t3 > 0 && t3--, Date.prototype.setMonth.call(this, t3);
                }, "month", function() {
                  return M(Date.prototype.getMonth.call(this) + 1, 2);
                }],
                mmm: [""],
                mmmm: [""],
                yy: ["[0-9]{2}", Date.prototype.setFullYear, "year", function() {
                  return M(Date.prototype.getFullYear.call(this), 2);
                }],
                yyyy: ["[0-9]{4}", Date.prototype.setFullYear, "year", function() {
                  return M(Date.prototype.getFullYear.call(this), 4);
                }],
                h: ["[1-9]|1[0-2]", Date.prototype.setHours, "hours", Date.prototype.getHours],
                hh: ["0[1-9]|1[0-2]", Date.prototype.setHours, "hours", function() {
                  return M(Date.prototype.getHours.call(this), 2);
                }],
                hx: [function(e3) {
                  return "[0-9]{".concat(e3, "}");
                }, Date.prototype.setHours, "hours", function(e3) {
                  return Date.prototype.getHours;
                }],
                H: ["1?[0-9]|2[0-3]", Date.prototype.setHours, "hours", Date.prototype.getHours],
                HH: ["0[0-9]|1[0-9]|2[0-3]", Date.prototype.setHours, "hours", function() {
                  return M(Date.prototype.getHours.call(this), 2);
                }],
                Hx: [function(e3) {
                  return "[0-9]{".concat(e3, "}");
                }, Date.prototype.setHours, "hours", function(e3) {
                  return function() {
                    return M(Date.prototype.getHours.call(this), e3);
                  };
                }],
                M: ["[1-5]?[0-9]", Date.prototype.setMinutes, "minutes", Date.prototype.getMinutes],
                MM: ["0[0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9]", Date.prototype.setMinutes, "minutes", function() {
                  return M(Date.prototype.getMinutes.call(this), 2);
                }],
                s: ["[1-5]?[0-9]", Date.prototype.setSeconds, "seconds", Date.prototype.getSeconds],
                ss: ["0[0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9]", Date.prototype.setSeconds, "seconds", function() {
                  return M(Date.prototype.getSeconds.call(this), 2);
                }],
                l: ["[0-9]{3}", Date.prototype.setMilliseconds, "milliseconds", function() {
                  return M(Date.prototype.getMilliseconds.call(this), 3);
                }, 3],
                L: ["[0-9]{2}", Date.prototype.setMilliseconds, "milliseconds", function() {
                  return M(Date.prototype.getMilliseconds.call(this), 2);
                }, 2],
                t: ["[ap]", k, "ampm", b, 1],
                tt: ["[ap]m", k, "ampm", b, 2],
                T: ["[AP]", k, "ampm", b, 1],
                TT: ["[AP]M", k, "ampm", b, 2],
                Z: [".*", void 0, "Z", function() {
                  var e3 = this.toString().match(/\((.+)\)/)[1];
                  e3.includes(" ") && (e3 = (e3 = e3.replace("-", " ").toUpperCase()).split(" ").map(function(e4) {
                    return l(e4, 1)[0];
                  }).join(""));
                  return e3;
                }],
                o: [""],
                S: [""]
              }, y = {
                isoDate: "yyyy-mm-dd",
                isoTime: "HH:MM:ss",
                isoDateTime: "yyyy-mm-dd'T'HH:MM:ss",
                isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
              };
              function k(e3) {
                var t3 = this.getHours();
                e3.toLowerCase().includes("p") ? this.setHours(t3 + 12) : e3.toLowerCase().includes("a") && t3 >= 12 && this.setHours(t3 - 12);
              }
              function b() {
                var e3 = this.getHours();
                return (e3 = e3 || 12) >= 12 ? "PM" : "AM";
              }
              function x(e3) {
                var t3 = new RegExp("\\d+$").exec(e3[0]);
                if (t3 && void 0 !== t3[0]) {
                  var i3 = g[e3[0][0] + "x"].slice("");
                  return i3[0] = i3[0](t3[0]), i3[3] = i3[3](t3[0]), i3;
                }
                if (g[e3[0]])
                  return g[e3[0]];
              }
              function P(e3) {
                if (!e3.tokenizer) {
                  var t3 = [], i3 = [];
                  for (var n3 in g)
                    if (/\.*x$/.test(n3)) {
                      var a2 = n3[0] + "\\d+";
                      -1 === i3.indexOf(a2) && i3.push(a2);
                    } else
                      -1 === t3.indexOf(n3[0]) && t3.push(n3[0]);
                  e3.tokenizer = "(" + (i3.length > 0 ? i3.join("|") + "|" : "") + t3.join("+|") + ")+?|.", e3.tokenizer = new RegExp(e3.tokenizer, "g");
                }
                return e3.tokenizer;
              }
              function w(e3, t3, i3) {
                if (!m)
                  return true;
                if (void 0 === e3.rawday || !isFinite(e3.rawday) && new Date(e3.date.getFullYear(), isFinite(e3.rawmonth) ? e3.month : e3.date.getMonth() + 1, 0).getDate() >= e3.day || "29" == e3.day && (!isFinite(e3.rawyear) || void 0 === e3.rawyear || "" === e3.rawyear) || new Date(e3.date.getFullYear(), isFinite(e3.rawmonth) ? e3.month : e3.date.getMonth() + 1, 0).getDate() >= e3.day)
                  return t3;
                if ("29" == e3.day) {
                  var n3 = E(t3.pos, i3);
                  if ("yyyy" === n3.targetMatch[0] && t3.pos - n3.targetMatchIndex == 2)
                    return t3.remove = t3.pos + 1, t3;
                } else if ("02" == e3.month && "30" == e3.day && void 0 !== t3.c)
                  return e3.day = "03", e3.date.setDate(3), e3.date.setMonth(1), t3.insert = [{
                    pos: t3.pos,
                    c: "0"
                  }, {
                    pos: t3.pos + 1,
                    c: t3.c
                  }], t3.caret = o.seekNext.call(this, t3.pos + 1), t3;
                return false;
              }
              function S(e3, t3, i3, n3) {
                var a2, o2, s2 = "";
                for (P(i3).lastIndex = 0; a2 = P(i3).exec(e3); ) {
                  if (void 0 === t3)
                    if (o2 = x(a2))
                      s2 += "(" + o2[0] + ")";
                    else
                      switch (a2[0]) {
                        case "[":
                          s2 += "(";
                          break;
                        case "]":
                          s2 += ")?";
                          break;
                        default:
                          s2 += (0, r.default)(a2[0]);
                      }
                  else if (o2 = x(a2))
                    if (true !== n3 && o2[3])
                      s2 += o2[3].call(t3.date);
                    else
                      o2[2] ? s2 += t3["raw" + o2[2]] : s2 += a2[0];
                  else
                    s2 += a2[0];
                }
                return s2;
              }
              function M(e3, t3, i3) {
                for (e3 = String(e3), t3 = t3 || 2; e3.length < t3; )
                  e3 = i3 ? e3 + "0" : "0" + e3;
                return e3;
              }
              function _(e3, t3, i3) {
                return "string" == typeof e3 ? new h(e3, t3, i3) : e3 && "object" === u(e3) && Object.prototype.hasOwnProperty.call(e3, "date") ? e3 : void 0;
              }
              function O(e3, t3) {
                return S(t3.inputFormat, {
                  date: e3
                }, t3);
              }
              function E(e3, t3) {
                var i3, n3, a2 = 0, r2 = 0;
                for (P(t3).lastIndex = 0; n3 = P(t3).exec(t3.inputFormat); ) {
                  var o2 = new RegExp("\\d+$").exec(n3[0]);
                  if ((a2 += r2 = o2 ? parseInt(o2[0]) : n3[0].length) >= e3 + 1) {
                    i3 = n3, n3 = P(t3).exec(t3.inputFormat);
                    break;
                  }
                }
                return {
                  targetMatchIndex: a2 - r2,
                  nextMatch: n3,
                  targetMatch: i3
                };
              }
              n2.default.extendAliases({
                datetime: {
                  mask: function(e3) {
                    return e3.numericInput = false, g.S = e3.i18n.ordinalSuffix.join("|"), e3.inputFormat = y[e3.inputFormat] || e3.inputFormat, e3.displayFormat = y[e3.displayFormat] || e3.displayFormat || e3.inputFormat, e3.outputFormat = y[e3.outputFormat] || e3.outputFormat || e3.inputFormat, e3.placeholder = "" !== e3.placeholder ? e3.placeholder : e3.inputFormat.replace(/[[\]]/, ""), e3.regex = S(e3.inputFormat, void 0, e3), e3.min = _(e3.min, e3.inputFormat, e3), e3.max = _(e3.max, e3.inputFormat, e3), null;
                  },
                  placeholder: "",
                  inputFormat: "isoDateTime",
                  displayFormat: null,
                  outputFormat: null,
                  min: null,
                  max: null,
                  skipOptionalPartCharacter: "",
                  i18n: {
                    dayNames: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                    monthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
                    ordinalSuffix: ["st", "nd", "rd", "th"]
                  },
                  preValidation: function(e3, t3, i3, n3, a2, r2, o2, s2) {
                    if (s2)
                      return true;
                    if (isNaN(i3) && e3[t3] !== i3) {
                      var l2 = E(t3, a2);
                      if (l2.nextMatch && l2.nextMatch[0] === i3 && l2.targetMatch[0].length > 1) {
                        var c2 = g[l2.targetMatch[0]][0];
                        if (new RegExp(c2).test("0" + e3[t3 - 1]))
                          return e3[t3] = e3[t3 - 1], e3[t3 - 1] = "0", {
                            fuzzy: true,
                            buffer: e3,
                            refreshFromBuffer: {
                              start: t3 - 1,
                              end: t3 + 1
                            },
                            pos: t3 + 1
                          };
                      }
                    }
                    return true;
                  },
                  postValidation: function(e3, t3, i3, n3, a2, r2, o2, l2) {
                    var c2, u2;
                    if (o2)
                      return true;
                    if (false === n3 && (((c2 = E(t3 + 1, a2)).targetMatch && c2.targetMatchIndex === t3 && c2.targetMatch[0].length > 1 && void 0 !== g[c2.targetMatch[0]] || (c2 = E(t3 + 2, a2)).targetMatch && c2.targetMatchIndex === t3 + 1 && c2.targetMatch[0].length > 1 && void 0 !== g[c2.targetMatch[0]]) && (u2 = g[c2.targetMatch[0]][0]), void 0 !== u2 && (void 0 !== r2.validPositions[t3 + 1] && new RegExp(u2).test(i3 + "0") ? (e3[t3] = i3, e3[t3 + 1] = "0", n3 = {
                      pos: t3 + 2,
                      caret: t3
                    }) : new RegExp(u2).test("0" + i3) && (e3[t3] = "0", e3[t3 + 1] = i3, n3 = {
                      pos: t3 + 2
                    })), false === n3))
                      return n3;
                    if (n3.fuzzy && (e3 = n3.buffer, t3 = n3.pos), (c2 = E(t3, a2)).targetMatch && c2.targetMatch[0] && void 0 !== g[c2.targetMatch[0]]) {
                      var f2 = g[c2.targetMatch[0]];
                      u2 = f2[0];
                      var d2 = e3.slice(c2.targetMatchIndex, c2.targetMatchIndex + c2.targetMatch[0].length);
                      if (false === new RegExp(u2).test(d2.join("")) && 2 === c2.targetMatch[0].length && r2.validPositions[c2.targetMatchIndex] && r2.validPositions[c2.targetMatchIndex + 1] && (r2.validPositions[c2.targetMatchIndex + 1].input = "0"), "year" == f2[2])
                        for (var p2 = s.getMaskTemplate.call(this, false, 1, void 0, true), h2 = t3 + 1; h2 < e3.length; h2++)
                          e3[h2] = p2[h2], delete r2.validPositions[h2];
                    }
                    var m2 = n3, y2 = _(e3.join(""), a2.inputFormat, a2);
                    return m2 && !isNaN(y2.date.getTime()) && (a2.prefillYear && (m2 = function(e4, t4, i4) {
                      if (e4.year !== e4.rawyear) {
                        var n4 = v.toString(), a3 = e4.rawyear.replace(/[^0-9]/g, ""), r3 = n4.slice(0, a3.length), o3 = n4.slice(a3.length);
                        if (2 === a3.length && a3 === r3) {
                          var s2 = new Date(v, e4.month - 1, e4.day);
                          e4.day == s2.getDate() && (!i4.max || i4.max.date.getTime() >= s2.getTime()) && (e4.date.setFullYear(v), e4.year = n4, t4.insert = [{
                            pos: t4.pos + 1,
                            c: o3[0]
                          }, {
                            pos: t4.pos + 2,
                            c: o3[1]
                          }]);
                        }
                      }
                      return t4;
                    }(y2, m2, a2)), m2 = function(e4, t4, i4, n4, a3) {
                      if (!t4)
                        return t4;
                      if (t4 && i4.min && !isNaN(i4.min.date.getTime())) {
                        var r3;
                        for (e4.reset(), P(i4).lastIndex = 0; r3 = P(i4).exec(i4.inputFormat); ) {
                          var o3;
                          if ((o3 = x(r3)) && o3[3]) {
                            for (var s2 = o3[1], l3 = e4[o3[2]], c3 = i4.min[o3[2]], u3 = i4.max ? i4.max[o3[2]] : c3, f3 = [], d3 = false, p3 = 0; p3 < c3.length; p3++)
                              void 0 !== n4.validPositions[p3 + r3.index] || d3 ? (f3[p3] = l3[p3], d3 = d3 || l3[p3] > c3[p3]) : (f3[p3] = c3[p3], "year" === o3[2] && l3.length - 1 == p3 && c3 != u3 && (f3 = (parseInt(f3.join("")) + 1).toString().split("")), "ampm" === o3[2] && c3 != u3 && i4.min.date.getTime() > e4.date.getTime() && (f3[p3] = u3[p3]));
                            s2.call(e4._date, f3.join(""));
                          }
                        }
                        t4 = i4.min.date.getTime() <= e4.date.getTime(), e4.reInit();
                      }
                      return t4 && i4.max && (isNaN(i4.max.date.getTime()) || (t4 = i4.max.date.getTime() >= e4.date.getTime())), t4;
                    }(y2, m2 = w.call(this, y2, m2, a2), a2, r2)), void 0 !== t3 && m2 && n3.pos !== t3 ? {
                      buffer: S(a2.inputFormat, y2, a2).split(""),
                      refreshFromBuffer: {
                        start: t3,
                        end: n3.pos
                      },
                      pos: n3.caret || n3.pos
                    } : m2;
                  },
                  onKeyDown: function(e3, t3, i3, n3) {
                    e3.ctrlKey && e3.key === a.keys.ArrowRight && (this.inputmask._valueSet(O(new Date(), n3)), p(this).trigger("setvalue"));
                  },
                  onUnMask: function(e3, t3, i3) {
                    return t3 ? S(i3.outputFormat, _(e3, i3.inputFormat, i3), i3, true) : t3;
                  },
                  casing: function(e3, t3, i3, n3) {
                    return 0 == t3.nativeDef.indexOf("[ap]") ? e3.toLowerCase() : 0 == t3.nativeDef.indexOf("[AP]") ? e3.toUpperCase() : e3;
                  },
                  onBeforeMask: function(e3, t3) {
                    return "[object Date]" === Object.prototype.toString.call(e3) && (e3 = O(e3, t3)), e3;
                  },
                  insertMode: false,
                  insertModeVisual: false,
                  shiftPositions: false,
                  keepStatic: false,
                  inputmode: "numeric",
                  prefillYear: true
                }
              });
            },
            3851: function(e2, t2, i2) {
              var n2, a = (n2 = i2(2394)) && n2.__esModule ? n2 : {
                default: n2
              }, r = i2(8711), o = i2(4713);
              a.default.extendDefinitions({
                A: {
                  validator: "[A-Za-z\u0410-\u044F\u0401\u0451\xC0-\xFF\xB5]",
                  casing: "upper"
                },
                "&": {
                  validator: "[0-9A-Za-z\u0410-\u044F\u0401\u0451\xC0-\xFF\xB5]",
                  casing: "upper"
                },
                "#": {
                  validator: "[0-9A-Fa-f]",
                  casing: "upper"
                }
              });
              var s = new RegExp("25[0-5]|2[0-4][0-9]|[01][0-9][0-9]");
              function l(e3, t3, i3, n3, a2) {
                return i3 - 1 > -1 && "." !== t3.buffer[i3 - 1] ? (e3 = t3.buffer[i3 - 1] + e3, e3 = i3 - 2 > -1 && "." !== t3.buffer[i3 - 2] ? t3.buffer[i3 - 2] + e3 : "0" + e3) : e3 = "00" + e3, s.test(e3);
              }
              a.default.extendAliases({
                cssunit: {
                  regex: "[+-]?[0-9]+\\.?([0-9]+)?(px|em|rem|ex|%|in|cm|mm|pt|pc)"
                },
                url: {
                  regex: "(https?|ftp)://.*",
                  autoUnmask: false,
                  keepStatic: false,
                  tabThrough: true
                },
                ip: {
                  mask: "i{1,3}.j{1,3}.k{1,3}.l{1,3}",
                  definitions: {
                    i: {
                      validator: l
                    },
                    j: {
                      validator: l
                    },
                    k: {
                      validator: l
                    },
                    l: {
                      validator: l
                    }
                  },
                  onUnMask: function(e3, t3, i3) {
                    return e3;
                  },
                  inputmode: "decimal",
                  substitutes: {
                    ",": "."
                  }
                },
                email: {
                  mask: function(e3) {
                    var t3 = e3.separator, i3 = e3.quantifier, n3 = "*{1,64}[.*{1,64}][.*{1,64}][.*{1,63}]@-{1,63}.-{1,63}[.-{1,63}][.-{1,63}]", a2 = n3;
                    if (t3)
                      for (var r2 = 0; r2 < i3; r2++)
                        a2 += "[".concat(t3).concat(n3, "]");
                    return a2;
                  },
                  greedy: false,
                  casing: "lower",
                  separator: null,
                  quantifier: 5,
                  skipOptionalPartCharacter: "",
                  onBeforePaste: function(e3, t3) {
                    return (e3 = e3.toLowerCase()).replace("mailto:", "");
                  },
                  definitions: {
                    "*": {
                      validator: "[0-9\uFF11-\uFF19A-Za-z\u0410-\u044F\u0401\u0451\xC0-\xFF\xB5!#$%&'*+/=?^_`{|}~-]"
                    },
                    "-": {
                      validator: "[0-9A-Za-z-]"
                    }
                  },
                  onUnMask: function(e3, t3, i3) {
                    return e3;
                  },
                  inputmode: "email"
                },
                mac: {
                  mask: "##:##:##:##:##:##"
                },
                vin: {
                  mask: "V{13}9{4}",
                  definitions: {
                    V: {
                      validator: "[A-HJ-NPR-Za-hj-npr-z\\d]",
                      casing: "upper"
                    }
                  },
                  clearIncomplete: true,
                  autoUnmask: true
                },
                ssn: {
                  mask: "999-99-9999",
                  postValidation: function(e3, t3, i3, n3, a2, s2, l2) {
                    var c = o.getMaskTemplate.call(this, true, r.getLastValidPosition.call(this), true, true);
                    return /^(?!219-09-9999|078-05-1120)(?!666|000|9.{2}).{3}-(?!00).{2}-(?!0{4}).{4}$/.test(c.join(""));
                  }
                }
              });
            },
            207: function(e2, t2, i2) {
              var n2 = s(i2(2394)), a = s(i2(7184)), r = i2(8711), o = i2(2839);
              function s(e3) {
                return e3 && e3.__esModule ? e3 : {
                  default: e3
                };
              }
              var l = n2.default.dependencyLib;
              function c(e3, t3) {
                for (var i3 = "", a2 = 0; a2 < e3.length; a2++)
                  n2.default.prototype.definitions[e3.charAt(a2)] || t3.definitions[e3.charAt(a2)] || t3.optionalmarker[0] === e3.charAt(a2) || t3.optionalmarker[1] === e3.charAt(a2) || t3.quantifiermarker[0] === e3.charAt(a2) || t3.quantifiermarker[1] === e3.charAt(a2) || t3.groupmarker[0] === e3.charAt(a2) || t3.groupmarker[1] === e3.charAt(a2) || t3.alternatormarker === e3.charAt(a2) ? i3 += "\\" + e3.charAt(a2) : i3 += e3.charAt(a2);
                return i3;
              }
              function u(e3, t3, i3, n3) {
                if (e3.length > 0 && t3 > 0 && (!i3.digitsOptional || n3)) {
                  var a2 = e3.indexOf(i3.radixPoint), r2 = false;
                  i3.negationSymbol.back === e3[e3.length - 1] && (r2 = true, e3.length--), -1 === a2 && (e3.push(i3.radixPoint), a2 = e3.length - 1);
                  for (var o2 = 1; o2 <= t3; o2++)
                    isFinite(e3[a2 + o2]) || (e3[a2 + o2] = "0");
                }
                return r2 && e3.push(i3.negationSymbol.back), e3;
              }
              function f(e3, t3) {
                var i3 = 0;
                for (var n3 in "+" === e3 && (i3 = r.seekNext.call(this, t3.validPositions.length - 1)), t3.tests)
                  if ((n3 = parseInt(n3)) >= i3) {
                    for (var a2 = 0, o2 = t3.tests[n3].length; a2 < o2; a2++)
                      if ((void 0 === t3.validPositions[n3] || "-" === e3) && t3.tests[n3][a2].match.def === e3)
                        return n3 + (void 0 !== t3.validPositions[n3] && "-" !== e3 ? 1 : 0);
                  }
                return i3;
              }
              function d(e3, t3) {
                for (var i3 = -1, n3 = 0, a2 = t3.validPositions.length; n3 < a2; n3++) {
                  var r2 = t3.validPositions[n3];
                  if (r2 && r2.match.def === e3) {
                    i3 = n3;
                    break;
                  }
                }
                return i3;
              }
              function p(e3, t3, i3, n3, a2) {
                var r2 = t3.buffer ? t3.buffer.indexOf(a2.radixPoint) : -1, o2 = (-1 !== r2 || n3 && a2.jitMasking) && new RegExp(a2.definitions[9].validator).test(e3);
                return a2._radixDance && -1 !== r2 && o2 && null == t3.validPositions[r2] ? {
                  insert: {
                    pos: r2 === i3 ? r2 + 1 : r2,
                    c: a2.radixPoint
                  },
                  pos: i3
                } : o2;
              }
              n2.default.extendAliases({
                numeric: {
                  mask: function(e3) {
                    e3.repeat = 0, e3.groupSeparator === e3.radixPoint && e3.digits && "0" !== e3.digits && ("." === e3.radixPoint ? e3.groupSeparator = "," : "," === e3.radixPoint ? e3.groupSeparator = "." : e3.groupSeparator = ""), " " === e3.groupSeparator && (e3.skipOptionalPartCharacter = void 0), e3.placeholder.length > 1 && (e3.placeholder = e3.placeholder.charAt(0)), "radixFocus" === e3.positionCaretOnClick && "" === e3.placeholder && (e3.positionCaretOnClick = "lvp");
                    var t3 = "0", i3 = e3.radixPoint;
                    true === e3.numericInput && void 0 === e3.__financeInput ? (t3 = "1", e3.positionCaretOnClick = "radixFocus" === e3.positionCaretOnClick ? "lvp" : e3.positionCaretOnClick, e3.digitsOptional = false, isNaN(e3.digits) && (e3.digits = 2), e3._radixDance = false, i3 = "," === e3.radixPoint ? "?" : "!", "" !== e3.radixPoint && void 0 === e3.definitions[i3] && (e3.definitions[i3] = {}, e3.definitions[i3].validator = "[" + e3.radixPoint + "]", e3.definitions[i3].placeholder = e3.radixPoint, e3.definitions[i3].static = true, e3.definitions[i3].generated = true)) : (e3.__financeInput = false, e3.numericInput = true);
                    var n3, r2 = "[+]";
                    if (r2 += c(e3.prefix, e3), "" !== e3.groupSeparator ? (void 0 === e3.definitions[e3.groupSeparator] && (e3.definitions[e3.groupSeparator] = {}, e3.definitions[e3.groupSeparator].validator = "[" + e3.groupSeparator + "]", e3.definitions[e3.groupSeparator].placeholder = e3.groupSeparator, e3.definitions[e3.groupSeparator].static = true, e3.definitions[e3.groupSeparator].generated = true), r2 += e3._mask(e3)) : r2 += "9{+}", void 0 !== e3.digits && 0 !== e3.digits) {
                      var o2 = e3.digits.toString().split(",");
                      isFinite(o2[0]) && o2[1] && isFinite(o2[1]) ? r2 += i3 + t3 + "{" + e3.digits + "}" : (isNaN(e3.digits) || parseInt(e3.digits) > 0) && (e3.digitsOptional || e3.jitMasking ? (n3 = r2 + i3 + t3 + "{0," + e3.digits + "}", e3.keepStatic = true) : r2 += i3 + t3 + "{" + e3.digits + "}");
                    } else
                      e3.inputmode = "numeric";
                    return r2 += c(e3.suffix, e3), r2 += "[-]", n3 && (r2 = [n3 + c(e3.suffix, e3) + "[-]", r2]), e3.greedy = false, function(e4) {
                      void 0 === e4.parseMinMaxOptions && (null !== e4.min && (e4.min = e4.min.toString().replace(new RegExp((0, a.default)(e4.groupSeparator), "g"), ""), "," === e4.radixPoint && (e4.min = e4.min.replace(e4.radixPoint, ".")), e4.min = isFinite(e4.min) ? parseFloat(e4.min) : NaN, isNaN(e4.min) && (e4.min = Number.MIN_VALUE)), null !== e4.max && (e4.max = e4.max.toString().replace(new RegExp((0, a.default)(e4.groupSeparator), "g"), ""), "," === e4.radixPoint && (e4.max = e4.max.replace(e4.radixPoint, ".")), e4.max = isFinite(e4.max) ? parseFloat(e4.max) : NaN, isNaN(e4.max) && (e4.max = Number.MAX_VALUE)), e4.parseMinMaxOptions = "done");
                    }(e3), "" !== e3.radixPoint && e3.substituteRadixPoint && (e3.substitutes["." == e3.radixPoint ? "," : "."] = e3.radixPoint), r2;
                  },
                  _mask: function(e3) {
                    return "(" + e3.groupSeparator + "999){+|1}";
                  },
                  digits: "*",
                  digitsOptional: true,
                  enforceDigitsOnBlur: false,
                  radixPoint: ".",
                  positionCaretOnClick: "radixFocus",
                  _radixDance: true,
                  groupSeparator: "",
                  allowMinus: true,
                  negationSymbol: {
                    front: "-",
                    back: ""
                  },
                  prefix: "",
                  suffix: "",
                  min: null,
                  max: null,
                  SetMaxOnOverflow: false,
                  step: 1,
                  inputType: "text",
                  unmaskAsNumber: false,
                  roundingFN: Math.round,
                  inputmode: "decimal",
                  shortcuts: {
                    k: "1000",
                    m: "1000000"
                  },
                  placeholder: "0",
                  greedy: false,
                  rightAlign: true,
                  insertMode: true,
                  autoUnmask: false,
                  skipOptionalPartCharacter: "",
                  usePrototypeDefinitions: false,
                  stripLeadingZeroes: true,
                  substituteRadixPoint: true,
                  definitions: {
                    0: {
                      validator: p
                    },
                    1: {
                      validator: p,
                      definitionSymbol: "9"
                    },
                    9: {
                      validator: "[0-9\uFF10-\uFF19\u0660-\u0669\u06F0-\u06F9]",
                      definitionSymbol: "*"
                    },
                    "+": {
                      validator: function(e3, t3, i3, n3, a2) {
                        return a2.allowMinus && ("-" === e3 || e3 === a2.negationSymbol.front);
                      }
                    },
                    "-": {
                      validator: function(e3, t3, i3, n3, a2) {
                        return a2.allowMinus && e3 === a2.negationSymbol.back;
                      }
                    }
                  },
                  preValidation: function(e3, t3, i3, n3, a2, r2, o2, s2) {
                    if (false !== a2.__financeInput && i3 === a2.radixPoint)
                      return false;
                    var l2 = e3.indexOf(a2.radixPoint), c2 = t3;
                    if (t3 = function(e4, t4, i4, n4, a3) {
                      return a3._radixDance && a3.numericInput && t4 !== a3.negationSymbol.back && e4 <= i4 && (i4 > 0 || t4 == a3.radixPoint) && (void 0 === n4.validPositions[e4 - 1] || n4.validPositions[e4 - 1].input !== a3.negationSymbol.back) && (e4 -= 1), e4;
                    }(t3, i3, l2, r2, a2), "-" === i3 || i3 === a2.negationSymbol.front) {
                      if (true !== a2.allowMinus)
                        return false;
                      var u2 = false, p2 = d("+", r2), h = d("-", r2);
                      return -1 !== p2 && (u2 = [p2, h]), false !== u2 ? {
                        remove: u2,
                        caret: c2 - a2.negationSymbol.back.length
                      } : {
                        insert: [{
                          pos: f.call(this, "+", r2),
                          c: a2.negationSymbol.front,
                          fromIsValid: true
                        }, {
                          pos: f.call(this, "-", r2),
                          c: a2.negationSymbol.back,
                          fromIsValid: void 0
                        }],
                        caret: c2 + a2.negationSymbol.back.length
                      };
                    }
                    if (i3 === a2.groupSeparator)
                      return {
                        caret: c2
                      };
                    if (s2)
                      return true;
                    if (-1 !== l2 && true === a2._radixDance && false === n3 && i3 === a2.radixPoint && void 0 !== a2.digits && (isNaN(a2.digits) || parseInt(a2.digits) > 0) && l2 !== t3)
                      return {
                        caret: a2._radixDance && t3 === l2 - 1 ? l2 + 1 : l2
                      };
                    if (false === a2.__financeInput) {
                      if (n3) {
                        if (a2.digitsOptional)
                          return {
                            rewritePosition: o2.end
                          };
                        if (!a2.digitsOptional) {
                          if (o2.begin > l2 && o2.end <= l2)
                            return i3 === a2.radixPoint ? {
                              insert: {
                                pos: l2 + 1,
                                c: "0",
                                fromIsValid: true
                              },
                              rewritePosition: l2
                            } : {
                              rewritePosition: l2 + 1
                            };
                          if (o2.begin < l2)
                            return {
                              rewritePosition: o2.begin - 1
                            };
                        }
                      } else if (!a2.showMaskOnHover && !a2.showMaskOnFocus && !a2.digitsOptional && a2.digits > 0 && "" === this.__valueGet.call(this.el))
                        return {
                          rewritePosition: l2
                        };
                    }
                    return {
                      rewritePosition: t3
                    };
                  },
                  postValidation: function(e3, t3, i3, n3, a2, r2, o2) {
                    if (false === n3)
                      return n3;
                    if (o2)
                      return true;
                    if (null !== a2.min || null !== a2.max) {
                      var s2 = a2.onUnMask(e3.slice().reverse().join(""), void 0, l.extend({}, a2, {
                        unmaskAsNumber: true
                      }));
                      if (null !== a2.min && s2 < a2.min && (s2.toString().length > a2.min.toString().length || s2 < 0))
                        return false;
                      if (null !== a2.max && s2 > a2.max)
                        return !!a2.SetMaxOnOverflow && {
                          refreshFromBuffer: true,
                          buffer: u(a2.max.toString().replace(".", a2.radixPoint).split(""), a2.digits, a2).reverse()
                        };
                    }
                    return n3;
                  },
                  onUnMask: function(e3, t3, i3) {
                    if ("" === t3 && true === i3.nullable)
                      return t3;
                    var n3 = e3.replace(i3.prefix, "");
                    return n3 = (n3 = n3.replace(i3.suffix, "")).replace(new RegExp((0, a.default)(i3.groupSeparator), "g"), ""), "" !== i3.placeholder.charAt(0) && (n3 = n3.replace(new RegExp(i3.placeholder.charAt(0), "g"), "0")), i3.unmaskAsNumber ? ("" !== i3.radixPoint && -1 !== n3.indexOf(i3.radixPoint) && (n3 = n3.replace(a.default.call(this, i3.radixPoint), ".")), n3 = (n3 = n3.replace(new RegExp("^" + (0, a.default)(i3.negationSymbol.front)), "-")).replace(new RegExp((0, a.default)(i3.negationSymbol.back) + "$"), ""), Number(n3)) : n3;
                  },
                  isComplete: function(e3, t3) {
                    var i3 = (t3.numericInput ? e3.slice().reverse() : e3).join("");
                    return i3 = (i3 = (i3 = (i3 = (i3 = i3.replace(new RegExp("^" + (0, a.default)(t3.negationSymbol.front)), "-")).replace(new RegExp((0, a.default)(t3.negationSymbol.back) + "$"), "")).replace(t3.prefix, "")).replace(t3.suffix, "")).replace(new RegExp((0, a.default)(t3.groupSeparator) + "([0-9]{3})", "g"), "$1"), "," === t3.radixPoint && (i3 = i3.replace((0, a.default)(t3.radixPoint), ".")), isFinite(i3);
                  },
                  onBeforeMask: function(e3, t3) {
                    var i3 = t3.radixPoint || ",";
                    isFinite(t3.digits) && (t3.digits = parseInt(t3.digits)), "number" != typeof e3 && "number" !== t3.inputType || "" === i3 || (e3 = e3.toString().replace(".", i3));
                    var n3 = "-" === e3.charAt(0) || e3.charAt(0) === t3.negationSymbol.front, r2 = e3.split(i3), o2 = r2[0].replace(/[^\-0-9]/g, ""), s2 = r2.length > 1 ? r2[1].replace(/[^0-9]/g, "") : "", l2 = r2.length > 1;
                    e3 = o2 + ("" !== s2 ? i3 + s2 : s2);
                    var c2 = 0;
                    if ("" !== i3 && (c2 = t3.digitsOptional ? t3.digits < s2.length ? t3.digits : s2.length : t3.digits, "" !== s2 || !t3.digitsOptional)) {
                      var f2 = Math.pow(10, c2 || 1);
                      e3 = e3.replace((0, a.default)(i3), "."), isNaN(parseFloat(e3)) || (e3 = (t3.roundingFN(parseFloat(e3) * f2) / f2).toFixed(c2)), e3 = e3.toString().replace(".", i3);
                    }
                    if (0 === t3.digits && -1 !== e3.indexOf(i3) && (e3 = e3.substring(0, e3.indexOf(i3))), null !== t3.min || null !== t3.max) {
                      var d2 = e3.toString().replace(i3, ".");
                      null !== t3.min && d2 < t3.min ? e3 = t3.min.toString().replace(".", i3) : null !== t3.max && d2 > t3.max && (e3 = t3.max.toString().replace(".", i3));
                    }
                    return n3 && "-" !== e3.charAt(0) && (e3 = "-" + e3), u(e3.toString().split(""), c2, t3, l2).join("");
                  },
                  onBeforeWrite: function(e3, t3, i3, n3) {
                    function r2(e4, t4) {
                      if (false !== n3.__financeInput || t4) {
                        var i4 = e4.indexOf(n3.radixPoint);
                        -1 !== i4 && e4.splice(i4, 1);
                      }
                      if ("" !== n3.groupSeparator)
                        for (; -1 !== (i4 = e4.indexOf(n3.groupSeparator)); )
                          e4.splice(i4, 1);
                      return e4;
                    }
                    var o2, s2;
                    if (n3.stripLeadingZeroes && (s2 = function(e4, t4) {
                      var i4 = new RegExp("(^" + ("" !== t4.negationSymbol.front ? (0, a.default)(t4.negationSymbol.front) + "?" : "") + (0, a.default)(t4.prefix) + ")(.*)(" + (0, a.default)(t4.suffix) + ("" != t4.negationSymbol.back ? (0, a.default)(t4.negationSymbol.back) + "?" : "") + "$)").exec(e4.slice().reverse().join("")), n4 = i4 ? i4[2] : "", r3 = false;
                      return n4 && (n4 = n4.split(t4.radixPoint.charAt(0))[0], r3 = new RegExp("^[0" + t4.groupSeparator + "]*").exec(n4)), !(!r3 || !(r3[0].length > 1 || r3[0].length > 0 && r3[0].length < n4.length)) && r3;
                    }(t3, n3)))
                      for (var c2 = t3.join("").lastIndexOf(s2[0].split("").reverse().join("")) - (s2[0] == s2.input ? 0 : 1), f2 = s2[0] == s2.input ? 1 : 0, d2 = s2[0].length - f2; d2 > 0; d2--)
                        delete this.maskset.validPositions[c2 + d2], delete t3[c2 + d2];
                    if (e3)
                      switch (e3.type) {
                        case "blur":
                        case "checkval":
                          if (null !== n3.min) {
                            var p2 = n3.onUnMask(t3.slice().reverse().join(""), void 0, l.extend({}, n3, {
                              unmaskAsNumber: true
                            }));
                            if (null !== n3.min && p2 < n3.min)
                              return {
                                refreshFromBuffer: true,
                                buffer: u(n3.min.toString().replace(".", n3.radixPoint).split(""), n3.digits, n3).reverse()
                              };
                          }
                          if (t3[t3.length - 1] === n3.negationSymbol.front) {
                            var h = new RegExp("(^" + ("" != n3.negationSymbol.front ? (0, a.default)(n3.negationSymbol.front) + "?" : "") + (0, a.default)(n3.prefix) + ")(.*)(" + (0, a.default)(n3.suffix) + ("" != n3.negationSymbol.back ? (0, a.default)(n3.negationSymbol.back) + "?" : "") + "$)").exec(r2(t3.slice(), true).reverse().join(""));
                            0 == (h ? h[2] : "") && (o2 = {
                              refreshFromBuffer: true,
                              buffer: [0]
                            });
                          } else if ("" !== n3.radixPoint) {
                            t3.indexOf(n3.radixPoint) === n3.suffix.length && (o2 && o2.buffer ? o2.buffer.splice(0, 1 + n3.suffix.length) : (t3.splice(0, 1 + n3.suffix.length), o2 = {
                              refreshFromBuffer: true,
                              buffer: r2(t3)
                            }));
                          }
                          if (n3.enforceDigitsOnBlur) {
                            var v = (o2 = o2 || {}) && o2.buffer || t3.slice().reverse();
                            o2.refreshFromBuffer = true, o2.buffer = u(v, n3.digits, n3, true).reverse();
                          }
                      }
                    return o2;
                  },
                  onKeyDown: function(e3, t3, i3, n3) {
                    var a2, r2 = l(this);
                    if (3 != e3.location) {
                      var s2, c2 = e3.key;
                      if ((s2 = n3.shortcuts && n3.shortcuts[c2]) && s2.length > 1)
                        return this.inputmask.__valueSet.call(this, parseFloat(this.inputmask.unmaskedvalue()) * parseInt(s2)), r2.trigger("setvalue"), false;
                    }
                    if (e3.ctrlKey)
                      switch (e3.key) {
                        case o.keys.ArrowUp:
                          return this.inputmask.__valueSet.call(this, parseFloat(this.inputmask.unmaskedvalue()) + parseInt(n3.step)), r2.trigger("setvalue"), false;
                        case o.keys.ArrowDown:
                          return this.inputmask.__valueSet.call(this, parseFloat(this.inputmask.unmaskedvalue()) - parseInt(n3.step)), r2.trigger("setvalue"), false;
                      }
                    if (!e3.shiftKey && (e3.key === o.keys.Delete || e3.key === o.keys.Backspace || e3.key === o.keys.BACKSPACE_SAFARI) && i3.begin !== t3.length) {
                      if (t3[e3.key === o.keys.Delete ? i3.begin - 1 : i3.end] === n3.negationSymbol.front)
                        return a2 = t3.slice().reverse(), "" !== n3.negationSymbol.front && a2.shift(), "" !== n3.negationSymbol.back && a2.pop(), r2.trigger("setvalue", [a2.join(""), i3.begin]), false;
                      if (true === n3._radixDance) {
                        var f2 = t3.indexOf(n3.radixPoint);
                        if (n3.digitsOptional) {
                          if (0 === f2)
                            return (a2 = t3.slice().reverse()).pop(), r2.trigger("setvalue", [a2.join(""), i3.begin >= a2.length ? a2.length : i3.begin]), false;
                        } else if (-1 !== f2 && (i3.begin < f2 || i3.end < f2 || e3.key === o.keys.Delete && (i3.begin === f2 || i3.begin - 1 === f2))) {
                          var d2 = void 0;
                          return i3.begin === i3.end && (e3.key === o.keys.Backspace || e3.key === o.keys.BACKSPACE_SAFARI ? i3.begin++ : e3.key === o.keys.Delete && i3.begin - 1 === f2 && (d2 = l.extend({}, i3), i3.begin--, i3.end--)), (a2 = t3.slice().reverse()).splice(a2.length - i3.begin, i3.begin - i3.end + 1), a2 = u(a2, n3.digits, n3).join(""), d2 && (i3 = d2), r2.trigger("setvalue", [a2, i3.begin >= a2.length ? f2 + 1 : i3.begin]), false;
                        }
                      }
                    }
                  }
                },
                currency: {
                  prefix: "",
                  groupSeparator: ",",
                  alias: "numeric",
                  digits: 2,
                  digitsOptional: false
                },
                decimal: {
                  alias: "numeric"
                },
                integer: {
                  alias: "numeric",
                  inputmode: "numeric",
                  digits: 0
                },
                percentage: {
                  alias: "numeric",
                  min: 0,
                  max: 100,
                  suffix: " %",
                  digits: 0,
                  allowMinus: false
                },
                indianns: {
                  alias: "numeric",
                  _mask: function(e3) {
                    return "(" + e3.groupSeparator + "99){*|1}(" + e3.groupSeparator + "999){1|1}";
                  },
                  groupSeparator: ",",
                  radixPoint: ".",
                  placeholder: "0",
                  digits: 2,
                  digitsOptional: false
                }
              });
            },
            9380: function(e2, t2, i2) {
              var n2;
              Object.defineProperty(t2, "__esModule", {
                value: true
              }), t2.default = void 0;
              var a = ((n2 = i2(8741)) && n2.__esModule ? n2 : {
                default: n2
              }).default ? window : {};
              t2.default = a;
            },
            7760: function(e2, t2, i2) {
              Object.defineProperty(t2, "__esModule", {
                value: true
              }), t2.HandleNativePlaceholder = function(e3, t3) {
                var i3 = e3 ? e3.inputmask : this;
                if (s.ie) {
                  if (e3.inputmask._valueGet() !== t3 && (e3.placeholder !== t3 || "" === e3.placeholder)) {
                    var n3 = r.getBuffer.call(i3).slice(), a2 = e3.inputmask._valueGet();
                    if (a2 !== t3) {
                      var o2 = r.getLastValidPosition.call(i3);
                      -1 === o2 && a2 === r.getBufferTemplate.call(i3).join("") ? n3 = [] : -1 !== o2 && u.call(i3, n3), d(e3, n3);
                    }
                  }
                } else
                  e3.placeholder !== t3 && (e3.placeholder = t3, "" === e3.placeholder && e3.removeAttribute("placeholder"));
              }, t2.applyInputValue = c, t2.checkVal = f, t2.clearOptionalTail = u, t2.unmaskedvalue = function(e3) {
                var t3 = e3 ? e3.inputmask : this, i3 = t3.opts, n3 = t3.maskset;
                if (e3) {
                  if (void 0 === e3.inputmask)
                    return e3.value;
                  e3.inputmask && e3.inputmask.refreshValue && c(e3, e3.inputmask._valueGet(true));
                }
                for (var a2 = [], o2 = n3.validPositions, s2 = 0, l2 = o2.length; s2 < l2; s2++)
                  o2[s2] && o2[s2].match && (1 != o2[s2].match.static || Array.isArray(n3.metadata) && true !== o2[s2].generatedInput) && a2.push(o2[s2].input);
                var u2 = 0 === a2.length ? "" : (t3.isRTL ? a2.reverse() : a2).join("");
                if ("function" == typeof i3.onUnMask) {
                  var f2 = (t3.isRTL ? r.getBuffer.call(t3).slice().reverse() : r.getBuffer.call(t3)).join("");
                  u2 = i3.onUnMask.call(t3, f2, u2, i3);
                }
                return u2;
              }, t2.writeBuffer = d;
              var n2 = i2(2839), a = i2(4713), r = i2(8711), o = i2(7215), s = i2(9845), l = i2(6030);
              function c(e3, t3) {
                var i3 = e3 ? e3.inputmask : this, n3 = i3.opts;
                e3.inputmask.refreshValue = false, "function" == typeof n3.onBeforeMask && (t3 = n3.onBeforeMask.call(i3, t3, n3) || t3), f(e3, true, false, t3 = (t3 || "").toString().split("")), i3.undoValue = i3._valueGet(true), (n3.clearMaskOnLostFocus || n3.clearIncomplete) && e3.inputmask._valueGet() === r.getBufferTemplate.call(i3).join("") && -1 === r.getLastValidPosition.call(i3) && e3.inputmask._valueSet("");
              }
              function u(e3) {
                e3.length = 0;
                for (var t3, i3 = a.getMaskTemplate.call(this, true, 0, true, void 0, true); void 0 !== (t3 = i3.shift()); )
                  e3.push(t3);
                return e3;
              }
              function f(e3, t3, i3, n3, s2) {
                var c2 = e3 ? e3.inputmask : this, u2 = c2.maskset, f2 = c2.opts, p = c2.dependencyLib, h = n3.slice(), v = "", m = -1, g = void 0, y = f2.skipOptionalPartCharacter;
                f2.skipOptionalPartCharacter = "", r.resetMaskSet.call(c2), u2.tests = {}, m = f2.radixPoint ? r.determineNewCaretPosition.call(c2, {
                  begin: 0,
                  end: 0
                }, false, false === f2.__financeInput ? "radixFocus" : void 0).begin : 0, u2.p = m, c2.caretPos = {
                  begin: m
                };
                var k = [], b = c2.caretPos;
                if (h.forEach(function(e4, t4) {
                  if (void 0 !== e4) {
                    var n4 = new p.Event("_checkval");
                    n4.key = e4, v += e4;
                    var o2 = r.getLastValidPosition.call(c2, void 0, true);
                    !function(e5, t5) {
                      for (var i4 = a.getMaskTemplate.call(c2, true, 0).slice(e5, r.seekNext.call(c2, e5, false, false)).join("").replace(/'/g, ""), n5 = i4.indexOf(t5); n5 > 0 && " " === i4[n5 - 1]; )
                        n5--;
                      var o3 = 0 === n5 && !r.isMask.call(c2, e5) && (a.getTest.call(c2, e5).match.nativeDef === t5.charAt(0) || true === a.getTest.call(c2, e5).match.static && a.getTest.call(c2, e5).match.nativeDef === "'" + t5.charAt(0) || " " === a.getTest.call(c2, e5).match.nativeDef && (a.getTest.call(c2, e5 + 1).match.nativeDef === t5.charAt(0) || true === a.getTest.call(c2, e5 + 1).match.static && a.getTest.call(c2, e5 + 1).match.nativeDef === "'" + t5.charAt(0)));
                      if (!o3 && n5 > 0 && !r.isMask.call(c2, e5, false, true)) {
                        var s3 = r.seekNext.call(c2, e5);
                        c2.caretPos.begin < s3 && (c2.caretPos = {
                          begin: s3
                        });
                      }
                      return o3;
                    }(m, v) ? (g = l.EventHandlers.keypressEvent.call(c2, n4, true, false, i3, c2.caretPos.begin)) && (m = c2.caretPos.begin + 1, v = "") : g = l.EventHandlers.keypressEvent.call(c2, n4, true, false, i3, o2 + 1), g ? (void 0 !== g.pos && u2.validPositions[g.pos] && true === u2.validPositions[g.pos].match.static && void 0 === u2.validPositions[g.pos].alternation && (k.push(g.pos), c2.isRTL || (g.forwardPosition = g.pos + 1)), d.call(c2, void 0, r.getBuffer.call(c2), g.forwardPosition, n4, false), c2.caretPos = {
                      begin: g.forwardPosition,
                      end: g.forwardPosition
                    }, b = c2.caretPos) : void 0 === u2.validPositions[t4] && h[t4] === a.getPlaceholder.call(c2, t4) && r.isMask.call(c2, t4, true) ? c2.caretPos.begin++ : c2.caretPos = b;
                  }
                }), k.length > 0) {
                  var x, P, w = r.seekNext.call(c2, -1, void 0, false);
                  if (!o.isComplete.call(c2, r.getBuffer.call(c2)) && k.length <= w || o.isComplete.call(c2, r.getBuffer.call(c2)) && k.length > 0 && k.length !== w && 0 === k[0])
                    for (var S = w; void 0 !== (x = k.shift()); ) {
                      var M = new p.Event("_checkval");
                      if ((P = u2.validPositions[x]).generatedInput = true, M.key = P.input, (g = l.EventHandlers.keypressEvent.call(c2, M, true, false, i3, S)) && void 0 !== g.pos && g.pos !== x && u2.validPositions[g.pos] && true === u2.validPositions[g.pos].match.static)
                        k.push(g.pos);
                      else if (!g)
                        break;
                      S++;
                    }
                }
                t3 && d.call(c2, e3, r.getBuffer.call(c2), g ? g.forwardPosition : c2.caretPos.begin, s2 || new p.Event("checkval"), s2 && ("input" === s2.type && c2.undoValue !== r.getBuffer.call(c2).join("") || "paste" === s2.type)), f2.skipOptionalPartCharacter = y;
              }
              function d(e3, t3, i3, a2, s2) {
                var l2 = e3 ? e3.inputmask : this, c2 = l2.opts, u2 = l2.dependencyLib;
                if (a2 && "function" == typeof c2.onBeforeWrite) {
                  var f2 = c2.onBeforeWrite.call(l2, a2, t3, i3, c2);
                  if (f2) {
                    if (f2.refreshFromBuffer) {
                      var d2 = f2.refreshFromBuffer;
                      o.refreshFromBuffer.call(l2, true === d2 ? d2 : d2.start, d2.end, f2.buffer || t3), t3 = r.getBuffer.call(l2, true);
                    }
                    void 0 !== i3 && (i3 = void 0 !== f2.caret ? f2.caret : i3);
                  }
                }
                if (void 0 !== e3 && (e3.inputmask._valueSet(t3.join("")), void 0 === i3 || void 0 !== a2 && "blur" === a2.type || r.caret.call(l2, e3, i3, void 0, void 0, void 0 !== a2 && "keydown" === a2.type && (a2.key === n2.keys.Delete || a2.key === n2.keys.Backspace)), true === s2)) {
                  var p = u2(e3), h = e3.inputmask._valueGet();
                  e3.inputmask.skipInputEvent = true, p.trigger("input"), setTimeout(function() {
                    h === r.getBufferTemplate.call(l2).join("") ? p.trigger("cleared") : true === o.isComplete.call(l2, t3) && p.trigger("complete");
                  }, 0);
                }
              }
            },
            2394: function(e2, t2, i2) {
              Object.defineProperty(t2, "__esModule", {
                value: true
              }), t2.default = void 0;
              var n2 = i2(157), a = m(i2(4963)), r = m(i2(9380)), o = i2(2391), s = i2(4713), l = i2(8711), c = i2(7215), u = i2(7760), f = i2(9716), d = m(i2(7392)), p = m(i2(3976)), h = m(i2(8741));
              function v(e3) {
                return v = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e4) {
                  return typeof e4;
                } : function(e4) {
                  return e4 && "function" == typeof Symbol && e4.constructor === Symbol && e4 !== Symbol.prototype ? "symbol" : typeof e4;
                }, v(e3);
              }
              function m(e3) {
                return e3 && e3.__esModule ? e3 : {
                  default: e3
                };
              }
              var g = r.default.document, y = "_inputmask_opts";
              function k(e3, t3, i3) {
                if (h.default) {
                  if (!(this instanceof k))
                    return new k(e3, t3, i3);
                  this.dependencyLib = a.default, this.el = void 0, this.events = {}, this.maskset = void 0, true !== i3 && ("[object Object]" === Object.prototype.toString.call(e3) ? t3 = e3 : (t3 = t3 || {}, e3 && (t3.alias = e3)), this.opts = a.default.extend(true, {}, this.defaults, t3), this.noMasksCache = t3 && void 0 !== t3.definitions, this.userOptions = t3 || {}, b(this.opts.alias, t3, this.opts)), this.refreshValue = false, this.undoValue = void 0, this.$el = void 0, this.skipInputEvent = false, this.validationEvent = false, this.ignorable = false, this.maxLength, this.mouseEnter = false, this.clicked = 0, this.originalPlaceholder = void 0, this.isComposing = false, this.hasAlternator = false;
                }
              }
              function b(e3, t3, i3) {
                var n3 = k.prototype.aliases[e3];
                return n3 ? (n3.alias && b(n3.alias, void 0, i3), a.default.extend(true, i3, n3), a.default.extend(true, i3, t3), true) : (null === i3.mask && (i3.mask = e3), false);
              }
              k.prototype = {
                dataAttribute: "data-inputmask",
                defaults: p.default,
                definitions: d.default,
                aliases: {},
                masksCache: {},
                get isRTL() {
                  return this.opts.isRTL || this.opts.numericInput;
                },
                mask: function(e3) {
                  var t3 = this;
                  return "string" == typeof e3 && (e3 = g.getElementById(e3) || g.querySelectorAll(e3)), (e3 = e3.nodeName ? [e3] : Array.isArray(e3) ? e3 : [].slice.call(e3)).forEach(function(e4, i3) {
                    var s2 = a.default.extend(true, {}, t3.opts);
                    if (function(e5, t4, i4, n3) {
                      function o2(t5, a2) {
                        var o3 = "" === n3 ? t5 : n3 + "-" + t5;
                        null !== (a2 = void 0 !== a2 ? a2 : e5.getAttribute(o3)) && ("string" == typeof a2 && (0 === t5.indexOf("on") ? a2 = r.default[a2] : "false" === a2 ? a2 = false : "true" === a2 && (a2 = true)), i4[t5] = a2);
                      }
                      if (true === t4.importDataAttributes) {
                        var s3, l3, c2, u2, f2 = e5.getAttribute(n3);
                        if (f2 && "" !== f2 && (f2 = f2.replace(/'/g, '"'), l3 = JSON.parse("{" + f2 + "}")), l3) {
                          for (u2 in c2 = void 0, l3)
                            if ("alias" === u2.toLowerCase()) {
                              c2 = l3[u2];
                              break;
                            }
                        }
                        for (s3 in o2("alias", c2), i4.alias && b(i4.alias, i4, t4), t4) {
                          if (l3) {
                            for (u2 in c2 = void 0, l3)
                              if (u2.toLowerCase() === s3.toLowerCase()) {
                                c2 = l3[u2];
                                break;
                              }
                          }
                          o2(s3, c2);
                        }
                      }
                      a.default.extend(true, t4, i4), ("rtl" === e5.dir || t4.rightAlign) && (e5.style.textAlign = "right");
                      ("rtl" === e5.dir || t4.numericInput) && (e5.dir = "ltr", e5.removeAttribute("dir"), t4.isRTL = true);
                      return Object.keys(i4).length;
                    }(e4, s2, a.default.extend(true, {}, t3.userOptions), t3.dataAttribute)) {
                      var l2 = (0, o.generateMaskSet)(s2, t3.noMasksCache);
                      void 0 !== l2 && (void 0 !== e4.inputmask && (e4.inputmask.opts.autoUnmask = true, e4.inputmask.remove()), e4.inputmask = new k(void 0, void 0, true), e4.inputmask.opts = s2, e4.inputmask.noMasksCache = t3.noMasksCache, e4.inputmask.userOptions = a.default.extend(true, {}, t3.userOptions), e4.inputmask.el = e4, e4.inputmask.$el = (0, a.default)(e4), e4.inputmask.maskset = l2, a.default.data(e4, y, t3.userOptions), n2.mask.call(e4.inputmask));
                    }
                  }), e3 && e3[0] && e3[0].inputmask || this;
                },
                option: function(e3, t3) {
                  return "string" == typeof e3 ? this.opts[e3] : "object" === v(e3) ? (a.default.extend(this.userOptions, e3), this.el && true !== t3 && this.mask(this.el), this) : void 0;
                },
                unmaskedvalue: function(e3) {
                  if (this.maskset = this.maskset || (0, o.generateMaskSet)(this.opts, this.noMasksCache), void 0 === this.el || void 0 !== e3) {
                    var t3 = ("function" == typeof this.opts.onBeforeMask && this.opts.onBeforeMask.call(this, e3, this.opts) || e3).split("");
                    u.checkVal.call(this, void 0, false, false, t3), "function" == typeof this.opts.onBeforeWrite && this.opts.onBeforeWrite.call(this, void 0, l.getBuffer.call(this), 0, this.opts);
                  }
                  return u.unmaskedvalue.call(this, this.el);
                },
                remove: function() {
                  if (this.el) {
                    a.default.data(this.el, y, null);
                    var e3 = this.opts.autoUnmask ? (0, u.unmaskedvalue)(this.el) : this._valueGet(this.opts.autoUnmask);
                    e3 !== l.getBufferTemplate.call(this).join("") ? this._valueSet(e3, this.opts.autoUnmask) : this._valueSet(""), f.EventRuler.off(this.el), Object.getOwnPropertyDescriptor && Object.getPrototypeOf ? Object.getOwnPropertyDescriptor(Object.getPrototypeOf(this.el), "value") && this.__valueGet && Object.defineProperty(this.el, "value", {
                      get: this.__valueGet,
                      set: this.__valueSet,
                      configurable: true
                    }) : g.__lookupGetter__ && this.el.__lookupGetter__("value") && this.__valueGet && (this.el.__defineGetter__("value", this.__valueGet), this.el.__defineSetter__("value", this.__valueSet)), this.el.inputmask = void 0;
                  }
                  return this.el;
                },
                getemptymask: function() {
                  return this.maskset = this.maskset || (0, o.generateMaskSet)(this.opts, this.noMasksCache), (this.isRTL ? l.getBufferTemplate.call(this).reverse() : l.getBufferTemplate.call(this)).join("");
                },
                hasMaskedValue: function() {
                  return !this.opts.autoUnmask;
                },
                isComplete: function() {
                  return this.maskset = this.maskset || (0, o.generateMaskSet)(this.opts, this.noMasksCache), c.isComplete.call(this, l.getBuffer.call(this));
                },
                getmetadata: function() {
                  if (this.maskset = this.maskset || (0, o.generateMaskSet)(this.opts, this.noMasksCache), Array.isArray(this.maskset.metadata)) {
                    var e3 = s.getMaskTemplate.call(this, true, 0, false).join("");
                    return this.maskset.metadata.forEach(function(t3) {
                      return t3.mask !== e3 || (e3 = t3, false);
                    }), e3;
                  }
                  return this.maskset.metadata;
                },
                isValid: function(e3) {
                  if (this.maskset = this.maskset || (0, o.generateMaskSet)(this.opts, this.noMasksCache), e3) {
                    var t3 = ("function" == typeof this.opts.onBeforeMask && this.opts.onBeforeMask.call(this, e3, this.opts) || e3).split("");
                    u.checkVal.call(this, void 0, true, false, t3);
                  } else
                    e3 = this.isRTL ? l.getBuffer.call(this).slice().reverse().join("") : l.getBuffer.call(this).join("");
                  for (var i3 = l.getBuffer.call(this), n3 = l.determineLastRequiredPosition.call(this), a2 = i3.length - 1; a2 > n3 && !l.isMask.call(this, a2); a2--)
                    ;
                  return i3.splice(n3, a2 + 1 - n3), c.isComplete.call(this, i3) && e3 === (this.isRTL ? l.getBuffer.call(this).slice().reverse().join("") : l.getBuffer.call(this).join(""));
                },
                format: function(e3, t3) {
                  this.maskset = this.maskset || (0, o.generateMaskSet)(this.opts, this.noMasksCache);
                  var i3 = ("function" == typeof this.opts.onBeforeMask && this.opts.onBeforeMask.call(this, e3, this.opts) || e3).split("");
                  u.checkVal.call(this, void 0, true, false, i3);
                  var n3 = this.isRTL ? l.getBuffer.call(this).slice().reverse().join("") : l.getBuffer.call(this).join("");
                  return t3 ? {
                    value: n3,
                    metadata: this.getmetadata()
                  } : n3;
                },
                setValue: function(e3) {
                  this.el && (0, a.default)(this.el).trigger("setvalue", [e3]);
                },
                analyseMask: o.analyseMask
              }, k.extendDefaults = function(e3) {
                a.default.extend(true, k.prototype.defaults, e3);
              }, k.extendDefinitions = function(e3) {
                a.default.extend(true, k.prototype.definitions, e3);
              }, k.extendAliases = function(e3) {
                a.default.extend(true, k.prototype.aliases, e3);
              }, k.format = function(e3, t3, i3) {
                return k(t3).format(e3, i3);
              }, k.unmask = function(e3, t3) {
                return k(t3).unmaskedvalue(e3);
              }, k.isValid = function(e3, t3) {
                return k(t3).isValid(e3);
              }, k.remove = function(e3) {
                "string" == typeof e3 && (e3 = g.getElementById(e3) || g.querySelectorAll(e3)), (e3 = e3.nodeName ? [e3] : e3).forEach(function(e4) {
                  e4.inputmask && e4.inputmask.remove();
                });
              }, k.setValue = function(e3, t3) {
                "string" == typeof e3 && (e3 = g.getElementById(e3) || g.querySelectorAll(e3)), (e3 = e3.nodeName ? [e3] : e3).forEach(function(e4) {
                  e4.inputmask ? e4.inputmask.setValue(t3) : (0, a.default)(e4).trigger("setvalue", [t3]);
                });
              }, k.dependencyLib = a.default, r.default.Inputmask = k;
              var x = k;
              t2.default = x;
            },
            5296: function(e2, t2, i2) {
              function n2(e3) {
                return n2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e4) {
                  return typeof e4;
                } : function(e4) {
                  return e4 && "function" == typeof Symbol && e4.constructor === Symbol && e4 !== Symbol.prototype ? "symbol" : typeof e4;
                }, n2(e3);
              }
              var a = h(i2(9380)), r = h(i2(2394)), o = h(i2(8741));
              function s(e3, t3) {
                for (var i3 = 0; i3 < t3.length; i3++) {
                  var a2 = t3[i3];
                  a2.enumerable = a2.enumerable || false, a2.configurable = true, "value" in a2 && (a2.writable = true), Object.defineProperty(e3, (r2 = a2.key, o2 = void 0, o2 = function(e4, t4) {
                    if ("object" !== n2(e4) || null === e4)
                      return e4;
                    var i4 = e4[Symbol.toPrimitive];
                    if (void 0 !== i4) {
                      var a3 = i4.call(e4, t4 || "default");
                      if ("object" !== n2(a3))
                        return a3;
                      throw new TypeError("@@toPrimitive must return a primitive value.");
                    }
                    return ("string" === t4 ? String : Number)(e4);
                  }(r2, "string"), "symbol" === n2(o2) ? o2 : String(o2)), a2);
                }
                var r2, o2;
              }
              function l(e3) {
                var t3 = f();
                return function() {
                  var i3, a2 = p(e3);
                  if (t3) {
                    var r2 = p(this).constructor;
                    i3 = Reflect.construct(a2, arguments, r2);
                  } else
                    i3 = a2.apply(this, arguments);
                  return function(e4, t4) {
                    if (t4 && ("object" === n2(t4) || "function" == typeof t4))
                      return t4;
                    if (void 0 !== t4)
                      throw new TypeError("Derived constructors may only return object or undefined");
                    return function(e5) {
                      if (void 0 === e5)
                        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                      return e5;
                    }(e4);
                  }(this, i3);
                };
              }
              function c(e3) {
                var t3 = "function" == typeof Map ? /* @__PURE__ */ new Map() : void 0;
                return c = function(e4) {
                  if (null === e4 || (i3 = e4, -1 === Function.toString.call(i3).indexOf("[native code]")))
                    return e4;
                  var i3;
                  if ("function" != typeof e4)
                    throw new TypeError("Super expression must either be null or a function");
                  if (void 0 !== t3) {
                    if (t3.has(e4))
                      return t3.get(e4);
                    t3.set(e4, n3);
                  }
                  function n3() {
                    return u(e4, arguments, p(this).constructor);
                  }
                  return n3.prototype = Object.create(e4.prototype, {
                    constructor: {
                      value: n3,
                      enumerable: false,
                      writable: true,
                      configurable: true
                    }
                  }), d(n3, e4);
                }, c(e3);
              }
              function u(e3, t3, i3) {
                return u = f() ? Reflect.construct.bind() : function(e4, t4, i4) {
                  var n3 = [null];
                  n3.push.apply(n3, t4);
                  var a2 = new (Function.bind.apply(e4, n3))();
                  return i4 && d(a2, i4.prototype), a2;
                }, u.apply(null, arguments);
              }
              function f() {
                if ("undefined" == typeof Reflect || !Reflect.construct)
                  return false;
                if (Reflect.construct.sham)
                  return false;
                if ("function" == typeof Proxy)
                  return true;
                try {
                  return Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
                  })), true;
                } catch (e3) {
                  return false;
                }
              }
              function d(e3, t3) {
                return d = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(e4, t4) {
                  return e4.__proto__ = t4, e4;
                }, d(e3, t3);
              }
              function p(e3) {
                return p = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function(e4) {
                  return e4.__proto__ || Object.getPrototypeOf(e4);
                }, p(e3);
              }
              function h(e3) {
                return e3 && e3.__esModule ? e3 : {
                  default: e3
                };
              }
              var v = a.default.document;
              if (o.default && v && v.head && v.head.attachShadow && a.default.customElements && void 0 === a.default.customElements.get("input-mask")) {
                var m = function(e3) {
                  !function(e4, t4) {
                    if ("function" != typeof t4 && null !== t4)
                      throw new TypeError("Super expression must either be null or a function");
                    e4.prototype = Object.create(t4 && t4.prototype, {
                      constructor: {
                        value: e4,
                        writable: true,
                        configurable: true
                      }
                    }), Object.defineProperty(e4, "prototype", {
                      writable: false
                    }), t4 && d(e4, t4);
                  }(o2, e3);
                  var t3, i3, n3, a2 = l(o2);
                  function o2() {
                    var e4;
                    !function(e5, t5) {
                      if (!(e5 instanceof t5))
                        throw new TypeError("Cannot call a class as a function");
                    }(this, o2);
                    var t4 = (e4 = a2.call(this)).getAttributeNames(), i4 = e4.attachShadow({
                      mode: "closed"
                    }), n4 = v.createElement("input");
                    for (var s2 in n4.type = "text", i4.appendChild(n4), t4)
                      Object.prototype.hasOwnProperty.call(t4, s2) && n4.setAttribute(t4[s2], e4.getAttribute(t4[s2]));
                    var l2 = new r.default();
                    return l2.dataAttribute = "", l2.mask(n4), n4.inputmask.shadowRoot = i4, e4;
                  }
                  return t3 = o2, i3 && s(t3.prototype, i3), n3 && s(t3, n3), Object.defineProperty(t3, "prototype", {
                    writable: false
                  }), t3;
                }(c(HTMLElement));
                a.default.customElements.define("input-mask", m);
              }
            },
            2839: function(e2, t2) {
              function i2(e3, t3) {
                return function(e4) {
                  if (Array.isArray(e4))
                    return e4;
                }(e3) || function(e4, t4) {
                  var i3 = null == e4 ? null : "undefined" != typeof Symbol && e4[Symbol.iterator] || e4["@@iterator"];
                  if (null != i3) {
                    var n3, a2, r2, o2, s = [], l = true, c = false;
                    try {
                      if (r2 = (i3 = i3.call(e4)).next, 0 === t4) {
                        if (Object(i3) !== i3)
                          return;
                        l = false;
                      } else
                        for (; !(l = (n3 = r2.call(i3)).done) && (s.push(n3.value), s.length !== t4); l = true)
                          ;
                    } catch (e5) {
                      c = true, a2 = e5;
                    } finally {
                      try {
                        if (!l && null != i3.return && (o2 = i3.return(), Object(o2) !== o2))
                          return;
                      } finally {
                        if (c)
                          throw a2;
                      }
                    }
                    return s;
                  }
                }(e3, t3) || function(e4, t4) {
                  if (!e4)
                    return;
                  if ("string" == typeof e4)
                    return n2(e4, t4);
                  var i3 = Object.prototype.toString.call(e4).slice(8, -1);
                  "Object" === i3 && e4.constructor && (i3 = e4.constructor.name);
                  if ("Map" === i3 || "Set" === i3)
                    return Array.from(e4);
                  if ("Arguments" === i3 || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(i3))
                    return n2(e4, t4);
                }(e3, t3) || function() {
                  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
                }();
              }
              function n2(e3, t3) {
                (null == t3 || t3 > e3.length) && (t3 = e3.length);
                for (var i3 = 0, n3 = new Array(t3); i3 < t3; i3++)
                  n3[i3] = e3[i3];
                return n3;
              }
              Object.defineProperty(t2, "__esModule", {
                value: true
              }), t2.keys = t2.keyCode = void 0, t2.toKey = function(e3, t3) {
                return r[e3] || (t3 ? String.fromCharCode(e3) : String.fromCharCode(e3).toLowerCase());
              }, t2.toKeyCode = function(e3) {
                return a[e3];
              };
              var a = {
                AltGraph: 18,
                ArrowDown: 40,
                ArrowLeft: 37,
                ArrowRight: 39,
                ArrowUp: 38,
                Backspace: 8,
                BACKSPACE_SAFARI: 127,
                CapsLock: 20,
                Delete: 46,
                End: 35,
                Enter: 13,
                Escape: 27,
                Home: 36,
                Insert: 45,
                PageDown: 34,
                PageUp: 33,
                Space: 32,
                Tab: 9,
                c: 67,
                x: 88,
                z: 90,
                Shift: 16,
                Control: 17,
                Alt: 18,
                Pause: 19,
                Meta_LEFT: 91,
                Meta_RIGHT: 92,
                ContextMenu: 93,
                Process: 229,
                Unidentified: 229,
                F1: 112,
                F2: 113,
                F3: 114,
                F4: 115,
                F5: 116,
                F6: 117,
                F7: 118,
                F8: 119,
                F9: 120,
                F10: 121,
                F11: 122,
                F12: 123
              };
              t2.keyCode = a;
              var r = Object.entries(a).reduce(function(e3, t3) {
                var n3 = i2(t3, 2), a2 = n3[0], r2 = n3[1];
                return e3[r2] = void 0 === e3[r2] ? a2 : e3[r2], e3;
              }, {}), o = Object.entries(a).reduce(function(e3, t3) {
                var n3 = i2(t3, 2), a2 = n3[0];
                n3[1];
                return e3[a2] = "Space" === a2 ? " " : a2, e3;
              }, {});
              t2.keys = o;
            },
            2391: function(e2, t2, i2) {
              Object.defineProperty(t2, "__esModule", {
                value: true
              }), t2.analyseMask = function(e3, t3, i3) {
                var n3, o2, s2, l2, c, u, f = /(?:[?*+]|\{[0-9+*]+(?:,[0-9+*]*)?(?:\|[0-9+*]*)?\})|[^.?*+^${[]()|\\]+|./g, d = /\[\^?]?(?:[^\\\]]+|\\[\S\s]?)*]?|\\(?:0(?:[0-3][0-7]{0,2}|[4-7][0-7]?)?|[1-9][0-9]*|x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4}|c[A-Za-z]|[\S\s]?)|\((?:\?[:=!]?)?|(?:[?*+]|\{[0-9]+(?:,[0-9]*)?\})\??|[^.?*+^${[()|\\]+|./g, p = false, h = new a.default(), v = [], m = [], g = false;
                function y(e4, n4, a2) {
                  a2 = void 0 !== a2 ? a2 : e4.matches.length;
                  var o3 = e4.matches[a2 - 1];
                  if (t3) {
                    if (0 === n4.indexOf("[") || p && /\\d|\\s|\\w|\\p/i.test(n4) || "." === n4) {
                      var s3 = i3.casing ? "i" : "";
                      /^\\p\{.*}$/i.test(n4) && (s3 += "u"), e4.matches.splice(a2++, 0, {
                        fn: new RegExp(n4, s3),
                        static: false,
                        optionality: false,
                        newBlockMarker: void 0 === o3 ? "master" : o3.def !== n4,
                        casing: null,
                        def: n4,
                        placeholder: void 0,
                        nativeDef: n4
                      });
                    } else
                      p && (n4 = n4[n4.length - 1]), n4.split("").forEach(function(t4, n5) {
                        o3 = e4.matches[a2 - 1], e4.matches.splice(a2++, 0, {
                          fn: /[a-z]/i.test(i3.staticDefinitionSymbol || t4) ? new RegExp("[" + (i3.staticDefinitionSymbol || t4) + "]", i3.casing ? "i" : "") : null,
                          static: true,
                          optionality: false,
                          newBlockMarker: void 0 === o3 ? "master" : o3.def !== t4 && true !== o3.static,
                          casing: null,
                          def: i3.staticDefinitionSymbol || t4,
                          placeholder: void 0 !== i3.staticDefinitionSymbol ? t4 : void 0,
                          nativeDef: (p ? "'" : "") + t4
                        });
                      });
                    p = false;
                  } else {
                    var l3 = i3.definitions && i3.definitions[n4] || i3.usePrototypeDefinitions && r.default.prototype.definitions[n4];
                    l3 && !p ? e4.matches.splice(a2++, 0, {
                      fn: l3.validator ? "string" == typeof l3.validator ? new RegExp(l3.validator, i3.casing ? "i" : "") : new function() {
                        this.test = l3.validator;
                      }() : new RegExp("."),
                      static: l3.static || false,
                      optionality: l3.optional || false,
                      defOptionality: l3.optional || false,
                      newBlockMarker: void 0 === o3 || l3.optional ? "master" : o3.def !== (l3.definitionSymbol || n4),
                      casing: l3.casing,
                      def: l3.definitionSymbol || n4,
                      placeholder: l3.placeholder,
                      nativeDef: n4,
                      generated: l3.generated
                    }) : (e4.matches.splice(a2++, 0, {
                      fn: /[a-z]/i.test(i3.staticDefinitionSymbol || n4) ? new RegExp("[" + (i3.staticDefinitionSymbol || n4) + "]", i3.casing ? "i" : "") : null,
                      static: true,
                      optionality: false,
                      newBlockMarker: void 0 === o3 ? "master" : o3.def !== n4 && true !== o3.static,
                      casing: null,
                      def: i3.staticDefinitionSymbol || n4,
                      placeholder: void 0 !== i3.staticDefinitionSymbol ? n4 : void 0,
                      nativeDef: (p ? "'" : "") + n4
                    }), p = false);
                  }
                }
                function k() {
                  if (v.length > 0) {
                    if (y(l2 = v[v.length - 1], o2), l2.isAlternator) {
                      c = v.pop();
                      for (var e4 = 0; e4 < c.matches.length; e4++)
                        c.matches[e4].isGroup && (c.matches[e4].isGroup = false);
                      v.length > 0 ? (l2 = v[v.length - 1]).matches.push(c) : h.matches.push(c);
                    }
                  } else
                    y(h, o2);
                }
                function b(e4) {
                  var t4 = new a.default(true);
                  return t4.openGroup = false, t4.matches = e4, t4;
                }
                function x() {
                  if ((s2 = v.pop()).openGroup = false, void 0 !== s2)
                    if (v.length > 0) {
                      if ((l2 = v[v.length - 1]).matches.push(s2), l2.isAlternator) {
                        for (var e4 = (c = v.pop()).matches[0].matches ? c.matches[0].matches.length : 1, t4 = 0; t4 < c.matches.length; t4++)
                          c.matches[t4].isGroup = false, c.matches[t4].alternatorGroup = false, null === i3.keepStatic && e4 < (c.matches[t4].matches ? c.matches[t4].matches.length : 1) && (i3.keepStatic = true), e4 = c.matches[t4].matches ? c.matches[t4].matches.length : 1;
                        v.length > 0 ? (l2 = v[v.length - 1]).matches.push(c) : h.matches.push(c);
                      }
                    } else
                      h.matches.push(s2);
                  else
                    k();
                }
                function P(e4) {
                  var t4 = e4.pop();
                  return t4.isQuantifier && (t4 = b([e4.pop(), t4])), t4;
                }
                t3 && (i3.optionalmarker[0] = void 0, i3.optionalmarker[1] = void 0);
                for (; n3 = t3 ? d.exec(e3) : f.exec(e3); ) {
                  if (o2 = n3[0], t3) {
                    switch (o2.charAt(0)) {
                      case "?":
                        o2 = "{0,1}";
                        break;
                      case "+":
                      case "*":
                        o2 = "{" + o2 + "}";
                        break;
                      case "|":
                        if (0 === v.length) {
                          var w = b(h.matches);
                          w.openGroup = true, v.push(w), h.matches = [], g = true;
                        }
                    }
                    switch (o2) {
                      case "\\d":
                        o2 = "[0-9]";
                        break;
                      case "\\p":
                        o2 += d.exec(e3)[0], o2 += d.exec(e3)[0];
                    }
                  }
                  if (p)
                    k();
                  else
                    switch (o2.charAt(0)) {
                      case "$":
                      case "^":
                        t3 || k();
                        break;
                      case i3.escapeChar:
                        p = true, t3 && k();
                        break;
                      case i3.optionalmarker[1]:
                      case i3.groupmarker[1]:
                        x();
                        break;
                      case i3.optionalmarker[0]:
                        v.push(new a.default(false, true));
                        break;
                      case i3.groupmarker[0]:
                        v.push(new a.default(true));
                        break;
                      case i3.quantifiermarker[0]:
                        var S = new a.default(false, false, true), M = (o2 = o2.replace(/[{}?]/g, "")).split("|"), _ = M[0].split(","), O = isNaN(_[0]) ? _[0] : parseInt(_[0]), E = 1 === _.length ? O : isNaN(_[1]) ? _[1] : parseInt(_[1]), T = isNaN(M[1]) ? M[1] : parseInt(M[1]);
                        "*" !== O && "+" !== O || (O = "*" === E ? 0 : 1), S.quantifier = {
                          min: O,
                          max: E,
                          jit: T
                        };
                        var j = v.length > 0 ? v[v.length - 1].matches : h.matches;
                        (n3 = j.pop()).isGroup || (n3 = b([n3])), j.push(n3), j.push(S);
                        break;
                      case i3.alternatormarker:
                        if (v.length > 0) {
                          var A = (l2 = v[v.length - 1]).matches[l2.matches.length - 1];
                          u = l2.openGroup && (void 0 === A.matches || false === A.isGroup && false === A.isAlternator) ? v.pop() : P(l2.matches);
                        } else
                          u = P(h.matches);
                        if (u.isAlternator)
                          v.push(u);
                        else if (u.alternatorGroup ? (c = v.pop(), u.alternatorGroup = false) : c = new a.default(false, false, false, true), c.matches.push(u), v.push(c), u.openGroup) {
                          u.openGroup = false;
                          var D = new a.default(true);
                          D.alternatorGroup = true, v.push(D);
                        }
                        break;
                      default:
                        k();
                    }
                }
                g && x();
                for (; v.length > 0; )
                  s2 = v.pop(), h.matches.push(s2);
                h.matches.length > 0 && (!function e4(n4) {
                  n4 && n4.matches && n4.matches.forEach(function(a2, r2) {
                    var o3 = n4.matches[r2 + 1];
                    (void 0 === o3 || void 0 === o3.matches || false === o3.isQuantifier) && a2 && a2.isGroup && (a2.isGroup = false, t3 || (y(a2, i3.groupmarker[0], 0), true !== a2.openGroup && y(a2, i3.groupmarker[1]))), e4(a2);
                  });
                }(h), m.push(h));
                (i3.numericInput || i3.isRTL) && function e4(t4) {
                  for (var n4 in t4.matches = t4.matches.reverse(), t4.matches)
                    if (Object.prototype.hasOwnProperty.call(t4.matches, n4)) {
                      var a2 = parseInt(n4);
                      if (t4.matches[n4].isQuantifier && t4.matches[a2 + 1] && t4.matches[a2 + 1].isGroup) {
                        var r2 = t4.matches[n4];
                        t4.matches.splice(n4, 1), t4.matches.splice(a2 + 1, 0, r2);
                      }
                      void 0 !== t4.matches[n4].matches ? t4.matches[n4] = e4(t4.matches[n4]) : t4.matches[n4] = ((o3 = t4.matches[n4]) === i3.optionalmarker[0] ? o3 = i3.optionalmarker[1] : o3 === i3.optionalmarker[1] ? o3 = i3.optionalmarker[0] : o3 === i3.groupmarker[0] ? o3 = i3.groupmarker[1] : o3 === i3.groupmarker[1] && (o3 = i3.groupmarker[0]), o3);
                    }
                  var o3;
                  return t4;
                }(m[0]);
                return m;
              }, t2.generateMaskSet = function(e3, t3) {
                var i3;
                function a2(e4, t4) {
                  var i4 = t4.repeat, n3 = t4.groupmarker, a3 = t4.quantifiermarker, r2 = t4.keepStatic;
                  if (i4 > 0 || "*" === i4 || "+" === i4) {
                    var l3 = "*" === i4 ? 0 : "+" === i4 ? 1 : i4;
                    e4 = n3[0] + e4 + n3[1] + a3[0] + l3 + "," + i4 + a3[1];
                  }
                  if (true === r2) {
                    var c2 = e4.match(new RegExp("(.)\\[([^\\]]*)\\]", "g"));
                    c2 && c2.forEach(function(t5, i5) {
                      var n4 = function(e5, t6) {
                        return function(e6) {
                          if (Array.isArray(e6))
                            return e6;
                        }(e5) || function(e6, t7) {
                          var i6 = null == e6 ? null : "undefined" != typeof Symbol && e6[Symbol.iterator] || e6["@@iterator"];
                          if (null != i6) {
                            var n5, a5, r4, o2, s2 = [], l4 = true, c3 = false;
                            try {
                              if (r4 = (i6 = i6.call(e6)).next, 0 === t7) {
                                if (Object(i6) !== i6)
                                  return;
                                l4 = false;
                              } else
                                for (; !(l4 = (n5 = r4.call(i6)).done) && (s2.push(n5.value), s2.length !== t7); l4 = true)
                                  ;
                            } catch (e7) {
                              c3 = true, a5 = e7;
                            } finally {
                              try {
                                if (!l4 && null != i6.return && (o2 = i6.return(), Object(o2) !== o2))
                                  return;
                              } finally {
                                if (c3)
                                  throw a5;
                              }
                            }
                            return s2;
                          }
                        }(e5, t6) || function(e6, t7) {
                          if (!e6)
                            return;
                          if ("string" == typeof e6)
                            return s(e6, t7);
                          var i6 = Object.prototype.toString.call(e6).slice(8, -1);
                          "Object" === i6 && e6.constructor && (i6 = e6.constructor.name);
                          if ("Map" === i6 || "Set" === i6)
                            return Array.from(e6);
                          if ("Arguments" === i6 || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(i6))
                            return s(e6, t7);
                        }(e5, t6) || function() {
                          throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
                        }();
                      }(t5.split("["), 2), a4 = n4[0], r3 = n4[1];
                      r3 = r3.replace("]", ""), e4 = e4.replace(new RegExp("".concat((0, o.default)(a4), "\\[").concat((0, o.default)(r3), "\\]")), a4.charAt(0) === r3.charAt(0) ? "(".concat(a4, "|").concat(a4).concat(r3, ")") : "".concat(a4, "[").concat(r3, "]"));
                    });
                  }
                  return e4;
                }
                function l2(e4, i4, o2) {
                  var s2, l3, c2 = false;
                  return null !== e4 && "" !== e4 || ((c2 = null !== o2.regex) ? e4 = (e4 = o2.regex).replace(/^(\^)(.*)(\$)$/, "$2") : (c2 = true, e4 = ".*")), 1 === e4.length && false === o2.greedy && 0 !== o2.repeat && (o2.placeholder = ""), e4 = a2(e4, o2), l3 = c2 ? "regex_" + o2.regex : o2.numericInput ? e4.split("").reverse().join("") : e4, null !== o2.keepStatic && (l3 = "ks_" + o2.keepStatic + l3), void 0 === r.default.prototype.masksCache[l3] || true === t3 ? (s2 = {
                    mask: e4,
                    maskToken: r.default.prototype.analyseMask(e4, c2, o2),
                    validPositions: [],
                    _buffer: void 0,
                    buffer: void 0,
                    tests: {},
                    excludes: {},
                    metadata: i4,
                    maskLength: void 0,
                    jitOffset: {}
                  }, true !== t3 && (r.default.prototype.masksCache[l3] = s2, s2 = n2.default.extend(true, {}, r.default.prototype.masksCache[l3]))) : s2 = n2.default.extend(true, {}, r.default.prototype.masksCache[l3]), s2;
                }
                "function" == typeof e3.mask && (e3.mask = e3.mask(e3));
                if (Array.isArray(e3.mask)) {
                  if (e3.mask.length > 1) {
                    null === e3.keepStatic && (e3.keepStatic = true);
                    var c = e3.groupmarker[0];
                    return (e3.isRTL ? e3.mask.reverse() : e3.mask).forEach(function(t4) {
                      c.length > 1 && (c += e3.alternatormarker), void 0 !== t4.mask && "function" != typeof t4.mask ? c += t4.mask : c += t4;
                    }), l2(c += e3.groupmarker[1], e3.mask, e3);
                  }
                  e3.mask = e3.mask.pop();
                }
                i3 = e3.mask && void 0 !== e3.mask.mask && "function" != typeof e3.mask.mask ? l2(e3.mask.mask, e3.mask, e3) : l2(e3.mask, e3.mask, e3);
                null === e3.keepStatic && (e3.keepStatic = false);
                return i3;
              };
              var n2 = l(i2(4963)), a = l(i2(9695)), r = l(i2(2394)), o = l(i2(7184));
              function s(e3, t3) {
                (null == t3 || t3 > e3.length) && (t3 = e3.length);
                for (var i3 = 0, n3 = new Array(t3); i3 < t3; i3++)
                  n3[i3] = e3[i3];
                return n3;
              }
              function l(e3) {
                return e3 && e3.__esModule ? e3 : {
                  default: e3
                };
              }
            },
            157: function(e2, t2, i2) {
              Object.defineProperty(t2, "__esModule", {
                value: true
              }), t2.mask = function() {
                var e3 = this, t3 = this.opts, i3 = this.el, u = this.dependencyLib;
                o.EventRuler.off(i3);
                var f = function(t4, i4) {
                  "textarea" !== t4.tagName.toLowerCase() && i4.ignorables.push(n2.keys.Enter);
                  var s2 = t4.getAttribute("type"), l2 = "input" === t4.tagName.toLowerCase() && i4.supportsInputType.includes(s2) || t4.isContentEditable || "textarea" === t4.tagName.toLowerCase();
                  if (!l2)
                    if ("input" === t4.tagName.toLowerCase()) {
                      var c2 = document.createElement("input");
                      c2.setAttribute("type", s2), l2 = "text" === c2.type, c2 = null;
                    } else
                      l2 = "partial";
                  return false !== l2 ? function(t5) {
                    var n3, s3;
                    function l3() {
                      return this.inputmask ? this.inputmask.opts.autoUnmask ? this.inputmask.unmaskedvalue() : -1 !== a.getLastValidPosition.call(e3) || true !== i4.nullable ? (this.inputmask.shadowRoot || this.ownerDocument).activeElement === this && i4.clearMaskOnLostFocus ? (e3.isRTL ? r.clearOptionalTail.call(e3, a.getBuffer.call(e3).slice()).reverse() : r.clearOptionalTail.call(e3, a.getBuffer.call(e3).slice())).join("") : n3.call(this) : "" : n3.call(this);
                    }
                    function c3(e4) {
                      s3.call(this, e4), this.inputmask && (0, r.applyInputValue)(this, e4);
                    }
                    if (!t5.inputmask.__valueGet) {
                      if (true !== i4.noValuePatching) {
                        if (Object.getOwnPropertyDescriptor) {
                          var f2 = Object.getPrototypeOf ? Object.getOwnPropertyDescriptor(Object.getPrototypeOf(t5), "value") : void 0;
                          f2 && f2.get && f2.set ? (n3 = f2.get, s3 = f2.set, Object.defineProperty(t5, "value", {
                            get: l3,
                            set: c3,
                            configurable: true
                          })) : "input" !== t5.tagName.toLowerCase() && (n3 = function() {
                            return this.textContent;
                          }, s3 = function(e4) {
                            this.textContent = e4;
                          }, Object.defineProperty(t5, "value", {
                            get: l3,
                            set: c3,
                            configurable: true
                          }));
                        } else
                          document.__lookupGetter__ && t5.__lookupGetter__("value") && (n3 = t5.__lookupGetter__("value"), s3 = t5.__lookupSetter__("value"), t5.__defineGetter__("value", l3), t5.__defineSetter__("value", c3));
                        t5.inputmask.__valueGet = n3, t5.inputmask.__valueSet = s3;
                      }
                      t5.inputmask._valueGet = function(t6) {
                        return e3.isRTL && true !== t6 ? n3.call(this.el).split("").reverse().join("") : n3.call(this.el);
                      }, t5.inputmask._valueSet = function(t6, i5) {
                        s3.call(this.el, null == t6 ? "" : true !== i5 && e3.isRTL ? t6.split("").reverse().join("") : t6);
                      }, void 0 === n3 && (n3 = function() {
                        return this.value;
                      }, s3 = function(e4) {
                        this.value = e4;
                      }, function(t6) {
                        if (u.valHooks && (void 0 === u.valHooks[t6] || true !== u.valHooks[t6].inputmaskpatch)) {
                          var n4 = u.valHooks[t6] && u.valHooks[t6].get ? u.valHooks[t6].get : function(e4) {
                            return e4.value;
                          }, o2 = u.valHooks[t6] && u.valHooks[t6].set ? u.valHooks[t6].set : function(e4, t7) {
                            return e4.value = t7, e4;
                          };
                          u.valHooks[t6] = {
                            get: function(t7) {
                              if (t7.inputmask) {
                                if (t7.inputmask.opts.autoUnmask)
                                  return t7.inputmask.unmaskedvalue();
                                var r2 = n4(t7);
                                return -1 !== a.getLastValidPosition.call(e3, void 0, void 0, t7.inputmask.maskset.validPositions) || true !== i4.nullable ? r2 : "";
                              }
                              return n4(t7);
                            },
                            set: function(e4, t7) {
                              var i5 = o2(e4, t7);
                              return e4.inputmask && (0, r.applyInputValue)(e4, t7), i5;
                            },
                            inputmaskpatch: true
                          };
                        }
                      }(t5.type), function(e4) {
                        o.EventRuler.on(e4, "mouseenter", function() {
                          var e5 = this, t6 = e5.inputmask._valueGet(true);
                          t6 != (e5.inputmask.isRTL ? a.getBuffer.call(e5.inputmask).slice().reverse() : a.getBuffer.call(e5.inputmask)).join("") && (0, r.applyInputValue)(e5, t6);
                        });
                      }(t5));
                    }
                  }(t4) : t4.inputmask = void 0, l2;
                }(i3, t3);
                if (false !== f) {
                  e3.originalPlaceholder = i3.placeholder, e3.maxLength = void 0 !== i3 ? i3.maxLength : void 0, -1 === e3.maxLength && (e3.maxLength = void 0), "inputMode" in i3 && null === i3.getAttribute("inputmode") && (i3.inputMode = t3.inputmode, i3.setAttribute("inputmode", t3.inputmode)), true === f && (t3.showMaskOnFocus = t3.showMaskOnFocus && -1 === ["cc-number", "cc-exp"].indexOf(i3.autocomplete), s.iphone && (t3.insertModeVisual = false, i3.setAttribute("autocorrect", "off")), o.EventRuler.on(i3, "submit", c.EventHandlers.submitEvent), o.EventRuler.on(i3, "reset", c.EventHandlers.resetEvent), o.EventRuler.on(i3, "blur", c.EventHandlers.blurEvent), o.EventRuler.on(i3, "focus", c.EventHandlers.focusEvent), o.EventRuler.on(i3, "invalid", c.EventHandlers.invalidEvent), o.EventRuler.on(i3, "click", c.EventHandlers.clickEvent), o.EventRuler.on(i3, "mouseleave", c.EventHandlers.mouseleaveEvent), o.EventRuler.on(i3, "mouseenter", c.EventHandlers.mouseenterEvent), o.EventRuler.on(i3, "paste", c.EventHandlers.pasteEvent), o.EventRuler.on(i3, "cut", c.EventHandlers.cutEvent), o.EventRuler.on(i3, "complete", t3.oncomplete), o.EventRuler.on(i3, "incomplete", t3.onincomplete), o.EventRuler.on(i3, "cleared", t3.oncleared), true !== t3.inputEventOnly && o.EventRuler.on(i3, "keydown", c.EventHandlers.keyEvent), (s.mobile || t3.inputEventOnly) && i3.removeAttribute("maxLength"), o.EventRuler.on(i3, "input", c.EventHandlers.inputFallBackEvent)), o.EventRuler.on(i3, "setvalue", c.EventHandlers.setValueEvent), a.getBufferTemplate.call(e3).join(""), e3.undoValue = e3._valueGet(true);
                  var d = (i3.inputmask.shadowRoot || i3.ownerDocument).activeElement;
                  if ("" !== i3.inputmask._valueGet(true) || false === t3.clearMaskOnLostFocus || d === i3) {
                    (0, r.applyInputValue)(i3, i3.inputmask._valueGet(true), t3);
                    var p = a.getBuffer.call(e3).slice();
                    false === l.isComplete.call(e3, p) && t3.clearIncomplete && a.resetMaskSet.call(e3), t3.clearMaskOnLostFocus && d !== i3 && (-1 === a.getLastValidPosition.call(e3) ? p = [] : r.clearOptionalTail.call(e3, p)), (false === t3.clearMaskOnLostFocus || t3.showMaskOnFocus && d === i3 || "" !== i3.inputmask._valueGet(true)) && (0, r.writeBuffer)(i3, p), d === i3 && a.caret.call(e3, i3, a.seekNext.call(e3, a.getLastValidPosition.call(e3)));
                  }
                }
              };
              var n2 = i2(2839), a = i2(8711), r = i2(7760), o = i2(9716), s = i2(9845), l = i2(7215), c = i2(6030);
            },
            9695: function(e2, t2) {
              Object.defineProperty(t2, "__esModule", {
                value: true
              }), t2.default = function(e3, t3, i2, n2) {
                this.matches = [], this.openGroup = e3 || false, this.alternatorGroup = false, this.isGroup = e3 || false, this.isOptional = t3 || false, this.isQuantifier = i2 || false, this.isAlternator = n2 || false, this.quantifier = {
                  min: 1,
                  max: 1
                };
              };
            },
            3194: function() {
              Array.prototype.includes || Object.defineProperty(Array.prototype, "includes", {
                value: function(e2, t2) {
                  if (null == this)
                    throw new TypeError('"this" is null or not defined');
                  var i2 = Object(this), n2 = i2.length >>> 0;
                  if (0 === n2)
                    return false;
                  for (var a = 0 | t2, r = Math.max(a >= 0 ? a : n2 - Math.abs(a), 0); r < n2; ) {
                    if (i2[r] === e2)
                      return true;
                    r++;
                  }
                  return false;
                }
              });
            },
            9302: function() {
              var e2 = Function.bind.call(Function.call, Array.prototype.reduce), t2 = Function.bind.call(Function.call, Object.prototype.propertyIsEnumerable), i2 = Function.bind.call(Function.call, Array.prototype.concat), n2 = Object.keys;
              Object.entries || (Object.entries = function(a) {
                return e2(n2(a), function(e3, n3) {
                  return i2(e3, "string" == typeof n3 && t2(a, n3) ? [[n3, a[n3]]] : []);
                }, []);
              });
            },
            7149: function() {
              function e2(t2) {
                return e2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e3) {
                  return typeof e3;
                } : function(e3) {
                  return e3 && "function" == typeof Symbol && e3.constructor === Symbol && e3 !== Symbol.prototype ? "symbol" : typeof e3;
                }, e2(t2);
              }
              "function" != typeof Object.getPrototypeOf && (Object.getPrototypeOf = "object" === e2("test".__proto__) ? function(e3) {
                return e3.__proto__;
              } : function(e3) {
                return e3.constructor.prototype;
              });
            },
            4013: function() {
              String.prototype.includes || (String.prototype.includes = function(e2, t2) {
                return "number" != typeof t2 && (t2 = 0), !(t2 + e2.length > this.length) && -1 !== this.indexOf(e2, t2);
              });
            },
            8711: function(e2, t2, i2) {
              Object.defineProperty(t2, "__esModule", {
                value: true
              }), t2.caret = function(e3, t3, i3, n3, a2) {
                var r2, o2 = this, s2 = this.opts;
                if (void 0 === t3)
                  return "selectionStart" in e3 && "selectionEnd" in e3 ? (t3 = e3.selectionStart, i3 = e3.selectionEnd) : window.getSelection ? (r2 = window.getSelection().getRangeAt(0)).commonAncestorContainer.parentNode !== e3 && r2.commonAncestorContainer !== e3 || (t3 = r2.startOffset, i3 = r2.endOffset) : document.selection && document.selection.createRange && (i3 = (t3 = 0 - (r2 = document.selection.createRange()).duplicate().moveStart("character", -e3.inputmask._valueGet().length)) + r2.text.length), {
                    begin: n3 ? t3 : c.call(o2, t3),
                    end: n3 ? i3 : c.call(o2, i3)
                  };
                if (Array.isArray(t3) && (i3 = o2.isRTL ? t3[0] : t3[1], t3 = o2.isRTL ? t3[1] : t3[0]), void 0 !== t3.begin && (i3 = o2.isRTL ? t3.begin : t3.end, t3 = o2.isRTL ? t3.end : t3.begin), "number" == typeof t3) {
                  t3 = n3 ? t3 : c.call(o2, t3), i3 = "number" == typeof (i3 = n3 ? i3 : c.call(o2, i3)) ? i3 : t3;
                  var l2 = parseInt(((e3.ownerDocument.defaultView || window).getComputedStyle ? (e3.ownerDocument.defaultView || window).getComputedStyle(e3, null) : e3.currentStyle).fontSize) * i3;
                  if (e3.scrollLeft = l2 > e3.scrollWidth ? l2 : 0, e3.inputmask.caretPos = {
                    begin: t3,
                    end: i3
                  }, s2.insertModeVisual && false === s2.insertMode && t3 === i3 && (a2 || i3++), e3 === (e3.inputmask.shadowRoot || e3.ownerDocument).activeElement)
                    if ("setSelectionRange" in e3)
                      e3.setSelectionRange(t3, i3);
                    else if (window.getSelection) {
                      if (r2 = document.createRange(), void 0 === e3.firstChild || null === e3.firstChild) {
                        var u = document.createTextNode("");
                        e3.appendChild(u);
                      }
                      r2.setStart(e3.firstChild, t3 < e3.inputmask._valueGet().length ? t3 : e3.inputmask._valueGet().length), r2.setEnd(e3.firstChild, i3 < e3.inputmask._valueGet().length ? i3 : e3.inputmask._valueGet().length), r2.collapse(true);
                      var f = window.getSelection();
                      f.removeAllRanges(), f.addRange(r2);
                    } else
                      e3.createTextRange && ((r2 = e3.createTextRange()).collapse(true), r2.moveEnd("character", i3), r2.moveStart("character", t3), r2.select());
                }
              }, t2.determineLastRequiredPosition = function(e3) {
                var t3, i3, r2 = this, s2 = r2.maskset, l2 = r2.dependencyLib, c2 = n2.getMaskTemplate.call(r2, true, o.call(r2), true, true), u = c2.length, f = o.call(r2), d = {}, p = s2.validPositions[f], h = void 0 !== p ? p.locator.slice() : void 0;
                for (t3 = f + 1; t3 < c2.length; t3++)
                  h = (i3 = n2.getTestTemplate.call(r2, t3, h, t3 - 1)).locator.slice(), d[t3] = l2.extend(true, {}, i3);
                var v = p && void 0 !== p.alternation ? p.locator[p.alternation] : void 0;
                for (t3 = u - 1; t3 > f && (((i3 = d[t3]).match.optionality || i3.match.optionalQuantifier && i3.match.newBlockMarker || v && (v !== d[t3].locator[p.alternation] && 1 != i3.match.static || true === i3.match.static && i3.locator[p.alternation] && a.checkAlternationMatch.call(r2, i3.locator[p.alternation].toString().split(","), v.toString().split(",")) && "" !== n2.getTests.call(r2, t3)[0].def)) && c2[t3] === n2.getPlaceholder.call(r2, t3, i3.match)); t3--)
                  u--;
                return e3 ? {
                  l: u,
                  def: d[u] ? d[u].match : void 0
                } : u;
              }, t2.determineNewCaretPosition = function(e3, t3, i3) {
                var a2 = this, c2 = a2.maskset, u = a2.opts;
                t3 && (a2.isRTL ? e3.end = e3.begin : e3.begin = e3.end);
                if (e3.begin === e3.end) {
                  switch (i3 = i3 || u.positionCaretOnClick) {
                    case "none":
                      break;
                    case "select":
                      e3 = {
                        begin: 0,
                        end: r.call(a2).length
                      };
                      break;
                    case "ignore":
                      e3.end = e3.begin = l.call(a2, o.call(a2));
                      break;
                    case "radixFocus":
                      if (a2.clicked > 1 && 0 == c2.validPositions.length)
                        break;
                      if (function(e4) {
                        if ("" !== u.radixPoint && 0 !== u.digits) {
                          var t4 = c2.validPositions;
                          if (void 0 === t4[e4] || t4[e4].input === n2.getPlaceholder.call(a2, e4)) {
                            if (e4 < l.call(a2, -1))
                              return true;
                            var i4 = r.call(a2).indexOf(u.radixPoint);
                            if (-1 !== i4) {
                              for (var o2 = 0, s2 = t4.length; o2 < s2; o2++)
                                if (t4[o2] && i4 < o2 && t4[o2].input !== n2.getPlaceholder.call(a2, o2))
                                  return false;
                              return true;
                            }
                          }
                        }
                        return false;
                      }(e3.begin)) {
                        var f = r.call(a2).join("").indexOf(u.radixPoint);
                        e3.end = e3.begin = u.numericInput ? l.call(a2, f) : f;
                        break;
                      }
                    default:
                      var d = e3.begin, p = o.call(a2, d, true), h = l.call(a2, -1 !== p || s.call(a2, 0) ? p : -1);
                      if (d <= h)
                        e3.end = e3.begin = s.call(a2, d, false, true) ? d : l.call(a2, d);
                      else {
                        var v = c2.validPositions[p], m = n2.getTestTemplate.call(a2, h, v ? v.match.locator : void 0, v), g = n2.getPlaceholder.call(a2, h, m.match);
                        if ("" !== g && r.call(a2)[h] !== g && true !== m.match.optionalQuantifier && true !== m.match.newBlockMarker || !s.call(a2, h, u.keepStatic, true) && m.match.def === g) {
                          var y = l.call(a2, h);
                          (d >= y || d === h) && (h = y);
                        }
                        e3.end = e3.begin = h;
                      }
                  }
                  return e3;
                }
              }, t2.getBuffer = r, t2.getBufferTemplate = function() {
                var e3 = this.maskset;
                void 0 === e3._buffer && (e3._buffer = n2.getMaskTemplate.call(this, false, 1), void 0 === e3.buffer && (e3.buffer = e3._buffer.slice()));
                return e3._buffer;
              }, t2.getLastValidPosition = o, t2.isMask = s, t2.resetMaskSet = function(e3) {
                var t3 = this.maskset;
                t3.buffer = void 0, true !== e3 && (t3.validPositions = [], t3.p = 0);
              }, t2.seekNext = l, t2.seekPrevious = function(e3, t3) {
                var i3 = this, a2 = e3 - 1;
                if (e3 <= 0)
                  return 0;
                for (; a2 > 0 && (true === t3 && (true !== n2.getTest.call(i3, a2).match.newBlockMarker || !s.call(i3, a2, void 0, true)) || true !== t3 && !s.call(i3, a2, void 0, true)); )
                  a2--;
                return a2;
              }, t2.translatePosition = c;
              var n2 = i2(4713), a = i2(7215);
              function r(e3) {
                var t3 = this, i3 = t3.maskset;
                return void 0 !== i3.buffer && true !== e3 || (i3.buffer = n2.getMaskTemplate.call(t3, true, o.call(t3), true), void 0 === i3._buffer && (i3._buffer = i3.buffer.slice())), i3.buffer;
              }
              function o(e3, t3, i3) {
                var n3 = this.maskset, a2 = -1, r2 = -1, o2 = i3 || n3.validPositions;
                void 0 === e3 && (e3 = -1);
                for (var s2 = 0, l2 = o2.length; s2 < l2; s2++)
                  o2[s2] && (t3 || true !== o2[s2].generatedInput) && (s2 <= e3 && (a2 = s2), s2 >= e3 && (r2 = s2));
                return -1 === a2 || a2 == e3 ? r2 : -1 == r2 || e3 - a2 < r2 - e3 ? a2 : r2;
              }
              function s(e3, t3, i3) {
                var a2 = this, r2 = this.maskset, o2 = n2.getTestTemplate.call(a2, e3).match;
                if ("" === o2.def && (o2 = n2.getTest.call(a2, e3).match), true !== o2.static)
                  return o2.fn;
                if (true === i3 && void 0 !== r2.validPositions[e3] && true !== r2.validPositions[e3].generatedInput)
                  return true;
                if (true !== t3 && e3 > -1) {
                  if (i3) {
                    var s2 = n2.getTests.call(a2, e3);
                    return s2.length > 1 + ("" === s2[s2.length - 1].match.def ? 1 : 0);
                  }
                  var l2 = n2.determineTestTemplate.call(a2, e3, n2.getTests.call(a2, e3)), c2 = n2.getPlaceholder.call(a2, e3, l2.match);
                  return l2.match.def !== c2;
                }
                return false;
              }
              function l(e3, t3, i3) {
                var a2 = this;
                void 0 === i3 && (i3 = true);
                for (var r2 = e3 + 1; "" !== n2.getTest.call(a2, r2).match.def && (true === t3 && (true !== n2.getTest.call(a2, r2).match.newBlockMarker || !s.call(a2, r2, void 0, true)) || true !== t3 && !s.call(a2, r2, void 0, i3)); )
                  r2++;
                return r2;
              }
              function c(e3) {
                var t3 = this.opts, i3 = this.el;
                return !this.isRTL || "number" != typeof e3 || t3.greedy && "" === t3.placeholder || !i3 || (e3 = this._valueGet().length - e3) < 0 && (e3 = 0), e3;
              }
            },
            4713: function(e2, t2, i2) {
              Object.defineProperty(t2, "__esModule", {
                value: true
              }), t2.determineTestTemplate = c, t2.getDecisionTaker = o, t2.getMaskTemplate = function(e3, t3, i3, n3, a2) {
                var r2 = this, o2 = this.opts, u2 = this.maskset, f2 = o2.greedy;
                a2 && o2.greedy && (o2.greedy = false, r2.maskset.tests = {});
                t3 = t3 || 0;
                var p, h, v, m, g = [], y = 0;
                do {
                  if (true === e3 && u2.validPositions[y])
                    h = (v = a2 && u2.validPositions[y].match.optionality && void 0 === u2.validPositions[y + 1] && (true === u2.validPositions[y].generatedInput || u2.validPositions[y].input == o2.skipOptionalPartCharacter && y > 0) ? c.call(r2, y, d.call(r2, y, p, y - 1)) : u2.validPositions[y]).match, p = v.locator.slice(), g.push(true === i3 ? v.input : false === i3 ? h.nativeDef : s.call(r2, y, h));
                  else {
                    h = (v = l.call(r2, y, p, y - 1)).match, p = v.locator.slice();
                    var k = true !== n3 && (false !== o2.jitMasking ? o2.jitMasking : h.jit);
                    (m = (m && h.static && h.def !== o2.groupSeparator && null === h.fn || u2.validPositions[y - 1] && h.static && h.def !== o2.groupSeparator && null === h.fn) && u2.tests[y]) || false === k || void 0 === k || "number" == typeof k && isFinite(k) && k > y ? g.push(false === i3 ? h.nativeDef : s.call(r2, g.length, h)) : m = false;
                  }
                  y++;
                } while (true !== h.static || "" !== h.def || t3 > y);
                "" === g[g.length - 1] && g.pop();
                false === i3 && void 0 !== u2.maskLength || (u2.maskLength = y - 1);
                return o2.greedy = f2, g;
              }, t2.getPlaceholder = s, t2.getTest = u, t2.getTestTemplate = l, t2.getTests = d, t2.isSubsetOf = f;
              var n2, a = (n2 = i2(2394)) && n2.__esModule ? n2 : {
                default: n2
              };
              function r(e3, t3) {
                var i3 = (null != e3.alternation ? e3.mloc[o(e3)] : e3.locator).join("");
                if ("" !== i3)
                  for (; i3.length < t3; )
                    i3 += "0";
                return i3;
              }
              function o(e3) {
                var t3 = e3.locator[e3.alternation];
                return "string" == typeof t3 && t3.length > 0 && (t3 = t3.split(",")[0]), void 0 !== t3 ? t3.toString() : "";
              }
              function s(e3, t3, i3) {
                var n3 = this.opts, a2 = this.maskset;
                if (void 0 !== (t3 = t3 || u.call(this, e3).match).placeholder || true === i3)
                  return "function" == typeof t3.placeholder ? t3.placeholder(n3) : t3.placeholder;
                if (true === t3.static) {
                  if (e3 > -1 && void 0 === a2.validPositions[e3]) {
                    var r2, o2 = d.call(this, e3), s2 = [];
                    if (o2.length > 1 + ("" === o2[o2.length - 1].match.def ? 1 : 0)) {
                      for (var l2 = 0; l2 < o2.length; l2++)
                        if ("" !== o2[l2].match.def && true !== o2[l2].match.optionality && true !== o2[l2].match.optionalQuantifier && (true === o2[l2].match.static || void 0 === r2 || false !== o2[l2].match.fn.test(r2.match.def, a2, e3, true, n3)) && (s2.push(o2[l2]), true === o2[l2].match.static && (r2 = o2[l2]), s2.length > 1 && /[0-9a-bA-Z]/.test(s2[0].match.def)))
                          return n3.placeholder.charAt(e3 % n3.placeholder.length);
                    }
                  }
                  return t3.def;
                }
                return n3.placeholder.charAt(e3 % n3.placeholder.length);
              }
              function l(e3, t3, i3) {
                return this.maskset.validPositions[e3] || c.call(this, e3, d.call(this, e3, t3 ? t3.slice() : t3, i3));
              }
              function c(e3, t3) {
                var i3 = this.opts, n3 = 0, a2 = function(e4, t4) {
                  var i4 = 0, n4 = false;
                  t4.forEach(function(e5) {
                    e5.match.optionality && (0 !== i4 && i4 !== e5.match.optionality && (n4 = true), (0 === i4 || i4 > e5.match.optionality) && (i4 = e5.match.optionality));
                  }), i4 && (0 == e4 || 1 == t4.length ? i4 = 0 : n4 || (i4 = 0));
                  return i4;
                }(e3, t3);
                e3 = e3 > 0 ? e3 - 1 : 0;
                var o2, s2, l2, c2 = r(u.call(this, e3));
                i3.greedy && t3.length > 1 && "" === t3[t3.length - 1].match.def && (n3 = 1);
                for (var f2 = 0; f2 < t3.length - n3; f2++) {
                  var d2 = t3[f2];
                  o2 = r(d2, c2.length);
                  var p = Math.abs(o2 - c2);
                  (void 0 === s2 || "" !== o2 && p < s2 || l2 && !i3.greedy && l2.match.optionality && l2.match.optionality - a2 > 0 && "master" === l2.match.newBlockMarker && (!d2.match.optionality || d2.match.optionality - a2 < 1 || !d2.match.newBlockMarker) || l2 && !i3.greedy && l2.match.optionalQuantifier && !d2.match.optionalQuantifier) && (s2 = p, l2 = d2);
                }
                return l2;
              }
              function u(e3, t3) {
                var i3 = this.maskset;
                return i3.validPositions[e3] ? i3.validPositions[e3] : (t3 || d.call(this, e3))[0];
              }
              function f(e3, t3, i3) {
                function n3(e4) {
                  for (var t4, i4 = [], n4 = -1, a2 = 0, r2 = e4.length; a2 < r2; a2++)
                    if ("-" === e4.charAt(a2))
                      for (t4 = e4.charCodeAt(a2 + 1); ++n4 < t4; )
                        i4.push(String.fromCharCode(n4));
                    else
                      n4 = e4.charCodeAt(a2), i4.push(e4.charAt(a2));
                  return i4.join("");
                }
                return e3.match.def === t3.match.nativeDef || !(!(i3.regex || e3.match.fn instanceof RegExp && t3.match.fn instanceof RegExp) || true === e3.match.static || true === t3.match.static) && -1 !== n3(t3.match.fn.toString().replace(/[[\]/]/g, "")).indexOf(n3(e3.match.fn.toString().replace(/[[\]/]/g, "")));
              }
              function d(e3, t3, i3) {
                var n3, r2, o2 = this, s2 = this.dependencyLib, l2 = this.maskset, u2 = this.opts, d2 = this.el, p = l2.maskToken, h = t3 ? i3 : 0, v = t3 ? t3.slice() : [0], m = [], g = false, y = t3 ? t3.join("") : "";
                function k(t4, i4, r3, s3) {
                  function c2(r4, s4, p3) {
                    function v3(e4, t5) {
                      var i5 = 0 === t5.matches.indexOf(e4);
                      return i5 || t5.matches.every(function(n4, a2) {
                        return true === n4.isQuantifier ? i5 = v3(e4, t5.matches[a2 - 1]) : Object.prototype.hasOwnProperty.call(n4, "matches") && (i5 = v3(e4, n4)), !i5;
                      }), i5;
                    }
                    function x2(e4, t5, i5) {
                      var n4, a2;
                      if ((l2.tests[e4] || l2.validPositions[e4]) && (l2.tests[e4] || [l2.validPositions[e4]]).every(function(e5, r6) {
                        if (e5.mloc[t5])
                          return n4 = e5, false;
                        var o3 = void 0 !== i5 ? i5 : e5.alternation, s5 = void 0 !== e5.locator[o3] ? e5.locator[o3].toString().indexOf(t5) : -1;
                        return (void 0 === a2 || s5 < a2) && -1 !== s5 && (n4 = e5, a2 = s5), true;
                      }), n4) {
                        var r5 = n4.locator[n4.alternation];
                        return (n4.mloc[t5] || n4.mloc[r5] || n4.locator).slice((void 0 !== i5 ? i5 : n4.alternation) + 1);
                      }
                      return void 0 !== i5 ? x2(e4, t5) : void 0;
                    }
                    function P2(e4, t5) {
                      var i5 = e4.alternation, n4 = void 0 === t5 || i5 === t5.alternation && -1 === e4.locator[i5].toString().indexOf(t5.locator[i5]);
                      if (!n4 && i5 > t5.alternation) {
                        for (var a2 = t5.alternation; a2 < i5; a2++)
                          if (e4.locator[a2] !== t5.locator[a2]) {
                            i5 = a2, n4 = true;
                            break;
                          }
                      }
                      if (n4) {
                        e4.mloc = e4.mloc || {};
                        var r5 = e4.locator[i5];
                        if (void 0 !== r5) {
                          if ("string" == typeof r5 && (r5 = r5.split(",")[0]), void 0 === e4.mloc[r5] && (e4.mloc[r5] = e4.locator.slice()), void 0 !== t5) {
                            for (var o3 in t5.mloc)
                              "string" == typeof o3 && (o3 = o3.split(",")[0]), void 0 === e4.mloc[o3] && (e4.mloc[o3] = t5.mloc[o3]);
                            e4.locator[i5] = Object.keys(e4.mloc).join(",");
                          }
                          return true;
                        }
                        e4.alternation = void 0;
                      }
                      return false;
                    }
                    function w2(e4, t5) {
                      if (e4.locator.length !== t5.locator.length)
                        return false;
                      for (var i5 = e4.alternation + 1; i5 < e4.locator.length; i5++)
                        if (e4.locator[i5] !== t5.locator[i5])
                          return false;
                      return true;
                    }
                    if (h > e3 + u2._maxTestPos)
                      throw "Inputmask: There is probably an error in your mask definition or in the code. Create an issue on github with an example of the mask you are using. " + l2.mask;
                    if (h === e3 && void 0 === r4.matches) {
                      if (m.push({
                        match: r4,
                        locator: s4.reverse(),
                        cd: y,
                        mloc: {}
                      }), !r4.optionality || void 0 !== p3 || !(u2.definitions && u2.definitions[r4.nativeDef] && u2.definitions[r4.nativeDef].optional || a.default.prototype.definitions[r4.nativeDef] && a.default.prototype.definitions[r4.nativeDef].optional))
                        return true;
                      g = true, h = e3;
                    } else if (void 0 !== r4.matches) {
                      if (r4.isGroup && p3 !== r4)
                        return function() {
                          if (r4 = c2(t4.matches[t4.matches.indexOf(r4) + 1], s4, p3))
                            return true;
                        }();
                      if (r4.isOptional)
                        return function() {
                          var t5 = r4, a2 = m.length;
                          if (r4 = k(r4, i4, s4, p3), m.length > 0) {
                            if (m.forEach(function(e4, t6) {
                              t6 >= a2 && (e4.match.optionality = e4.match.optionality ? e4.match.optionality + 1 : 1);
                            }), n3 = m[m.length - 1].match, void 0 !== p3 || !v3(n3, t5))
                              return r4;
                            g = true, h = e3;
                          }
                        }();
                      if (r4.isAlternator)
                        return function() {
                          o2.hasAlternator = true;
                          var n4, a2, v4, y2 = r4, k2 = [], b2 = m.slice(), S = s4.length, M = false, _ = i4.length > 0 ? i4.shift() : -1;
                          if (-1 === _ || "string" == typeof _) {
                            var O, E = h, T = i4.slice(), j = [];
                            if ("string" == typeof _)
                              j = _.split(",");
                            else
                              for (O = 0; O < y2.matches.length; O++)
                                j.push(O.toString());
                            if (void 0 !== l2.excludes[e3]) {
                              for (var A = j.slice(), D = 0, B = l2.excludes[e3].length; D < B; D++) {
                                var C = l2.excludes[e3][D].toString().split(":");
                                s4.length == C[1] && j.splice(j.indexOf(C[0]), 1);
                              }
                              0 === j.length && (delete l2.excludes[e3], j = A);
                            }
                            (true === u2.keepStatic || isFinite(parseInt(u2.keepStatic)) && E >= u2.keepStatic) && (j = j.slice(0, 1));
                            for (var R = 0; R < j.length; R++) {
                              O = parseInt(j[R]), m = [], i4 = "string" == typeof _ && x2(h, O, S) || T.slice();
                              var L = y2.matches[O];
                              if (L && c2(L, [O].concat(s4), p3))
                                r4 = true;
                              else if (0 === R && (M = true), L && L.matches && L.matches.length > y2.matches[0].matches.length)
                                break;
                              n4 = m.slice(), h = E, m = [];
                              for (var F = 0; F < n4.length; F++) {
                                var I = n4[F], N = false;
                                I.match.jit = I.match.jit || M, I.alternation = I.alternation || S, P2(I);
                                for (var V = 0; V < k2.length; V++) {
                                  var G = k2[V];
                                  if ("string" != typeof _ || void 0 !== I.alternation && j.includes(I.locator[I.alternation].toString())) {
                                    if (I.match.nativeDef === G.match.nativeDef) {
                                      N = true, P2(G, I);
                                      break;
                                    }
                                    if (f(I, G, u2)) {
                                      P2(I, G) && (N = true, k2.splice(k2.indexOf(G), 0, I));
                                      break;
                                    }
                                    if (f(G, I, u2)) {
                                      P2(G, I);
                                      break;
                                    }
                                    if (v4 = G, true === (a2 = I).match.static && true !== v4.match.static && v4.match.fn.test(a2.match.def, l2, e3, false, u2, false)) {
                                      w2(I, G) || void 0 !== d2.inputmask.userOptions.keepStatic ? P2(I, G) && (N = true, k2.splice(k2.indexOf(G), 0, I)) : u2.keepStatic = true;
                                      break;
                                    }
                                  }
                                }
                                N || k2.push(I);
                              }
                            }
                            m = b2.concat(k2), h = e3, g = m.length > 0, r4 = k2.length > 0, i4 = T.slice();
                          } else
                            r4 = c2(y2.matches[_] || t4.matches[_], [_].concat(s4), p3);
                          if (r4)
                            return true;
                        }();
                      if (r4.isQuantifier && p3 !== t4.matches[t4.matches.indexOf(r4) - 1])
                        return function() {
                          for (var a2 = r4, o3 = false, f2 = i4.length > 0 ? i4.shift() : 0; f2 < (isNaN(a2.quantifier.max) ? f2 + 1 : a2.quantifier.max) && h <= e3; f2++) {
                            var d3 = t4.matches[t4.matches.indexOf(a2) - 1];
                            if (r4 = c2(d3, [f2].concat(s4), d3)) {
                              if (m.forEach(function(t5, i5) {
                                (n3 = b(d3, t5.match) ? t5.match : m[m.length - 1].match).optionalQuantifier = f2 >= a2.quantifier.min, n3.jit = (f2 + 1) * (d3.matches.indexOf(n3) + 1) > a2.quantifier.jit, n3.optionalQuantifier && v3(n3, d3) && (g = true, h = e3, u2.greedy && null == l2.validPositions[e3 - 1] && f2 > a2.quantifier.min && -1 != ["*", "+"].indexOf(a2.quantifier.max) && (m.pop(), y = void 0), o3 = true, r4 = false), !o3 && n3.jit && (l2.jitOffset[e3] = d3.matches.length - d3.matches.indexOf(n3));
                              }), o3)
                                break;
                              return true;
                            }
                          }
                        }();
                      if (r4 = k(r4, i4, s4, p3))
                        return true;
                    } else
                      h++;
                  }
                  for (var p2 = i4.length > 0 ? i4.shift() : 0; p2 < t4.matches.length; p2++)
                    if (true !== t4.matches[p2].isQuantifier) {
                      var v2 = c2(t4.matches[p2], [p2].concat(r3), s3);
                      if (v2 && h === e3)
                        return v2;
                      if (h > e3)
                        break;
                    }
                }
                function b(e4, t4) {
                  var i4 = -1 != e4.matches.indexOf(t4);
                  return i4 || e4.matches.forEach(function(e5, n4) {
                    void 0 === e5.matches || i4 || (i4 = b(e5, t4));
                  }), i4;
                }
                if (e3 > -1) {
                  if (void 0 === t3) {
                    for (var x, P = e3 - 1; void 0 === (x = l2.validPositions[P] || l2.tests[P]) && P > -1; )
                      P--;
                    void 0 !== x && P > -1 && (v = function(e4, t4) {
                      var i4, n4 = [];
                      return Array.isArray(t4) || (t4 = [t4]), t4.length > 0 && (void 0 === t4[0].alternation || true === u2.keepStatic ? 0 === (n4 = c.call(o2, e4, t4.slice()).locator.slice()).length && (n4 = t4[0].locator.slice()) : t4.forEach(function(e5) {
                        "" !== e5.def && (0 === n4.length ? (i4 = e5.alternation, n4 = e5.locator.slice()) : e5.locator[i4] && -1 === n4[i4].toString().indexOf(e5.locator[i4]) && (n4[i4] += "," + e5.locator[i4]));
                      })), n4;
                    }(P, x), y = v.join(""), h = P);
                  }
                  if (l2.tests[e3] && l2.tests[e3][0].cd === y)
                    return l2.tests[e3];
                  for (var w = v.shift(); w < p.length; w++) {
                    if (k(p[w], v, [w]) && h === e3 || h > e3)
                      break;
                  }
                }
                return (0 === m.length || g) && m.push({
                  match: {
                    fn: null,
                    static: true,
                    optionality: false,
                    casing: null,
                    def: "",
                    placeholder: ""
                  },
                  locator: [],
                  mloc: {},
                  cd: y
                }), void 0 !== t3 && l2.tests[e3] ? r2 = s2.extend(true, [], m) : (l2.tests[e3] = s2.extend(true, [], m), r2 = l2.tests[e3]), m.forEach(function(e4) {
                  e4.match.optionality = e4.match.defOptionality || false;
                }), r2;
              }
            },
            7215: function(e2, t2, i2) {
              Object.defineProperty(t2, "__esModule", {
                value: true
              }), t2.alternate = s, t2.checkAlternationMatch = function(e3, t3, i3) {
                for (var n3, a2 = this.opts.greedy ? t3 : t3.slice(0, 1), r2 = false, o2 = void 0 !== i3 ? i3.split(",") : [], s2 = 0; s2 < o2.length; s2++)
                  -1 !== (n3 = e3.indexOf(o2[s2])) && e3.splice(n3, 1);
                for (var l2 = 0; l2 < e3.length; l2++)
                  if (a2.includes(e3[l2])) {
                    r2 = true;
                    break;
                  }
                return r2;
              }, t2.handleRemove = function(e3, t3, i3, o2, l2) {
                var c2 = this, u2 = this.maskset, f2 = this.opts;
                if ((f2.numericInput || c2.isRTL) && (t3 === a.keys.Backspace ? t3 = a.keys.Delete : t3 === a.keys.Delete && (t3 = a.keys.Backspace), c2.isRTL)) {
                  var d2 = i3.end;
                  i3.end = i3.begin, i3.begin = d2;
                }
                var p2, h2 = r.getLastValidPosition.call(c2, void 0, true);
                i3.end >= r.getBuffer.call(c2).length && h2 >= i3.end && (i3.end = h2 + 1);
                t3 === a.keys.Backspace ? i3.end - i3.begin < 1 && (i3.begin = r.seekPrevious.call(c2, i3.begin)) : t3 === a.keys.Delete && i3.begin === i3.end && (i3.end = r.isMask.call(c2, i3.end, true, true) ? i3.end + 1 : r.seekNext.call(c2, i3.end) + 1);
                if (false !== (p2 = v.call(c2, i3))) {
                  if (true !== o2 && false !== f2.keepStatic || null !== f2.regex && -1 !== n2.getTest.call(c2, i3.begin).match.def.indexOf("|")) {
                    var m = s.call(c2, true);
                    if (m) {
                      var g = void 0 !== m.caret ? m.caret : m.pos ? r.seekNext.call(c2, m.pos.begin ? m.pos.begin : m.pos) : r.getLastValidPosition.call(c2, -1, true);
                      (t3 !== a.keys.Delete || i3.begin > g) && i3.begin;
                    }
                  }
                  true !== o2 && (u2.p = t3 === a.keys.Delete ? i3.begin + p2 : i3.begin, u2.p = r.determineNewCaretPosition.call(c2, {
                    begin: u2.p,
                    end: u2.p
                  }, false, false === f2.insertMode && t3 === a.keys.Backspace ? "none" : void 0).begin);
                }
              }, t2.isComplete = c, t2.isSelection = u, t2.isValid = f, t2.refreshFromBuffer = p, t2.revalidateMask = v;
              var n2 = i2(4713), a = i2(2839), r = i2(8711), o = i2(6030);
              function s(e3, t3, i3, a2, o2, l2) {
                var c2, u2, d2, p2, h2, v2, m, g, y, k, b, x = this, P = this.dependencyLib, w = this.opts, S = x.maskset, M = P.extend(true, [], S.validPositions), _ = P.extend(true, {}, S.tests), O = false, E = false, T = void 0 !== o2 ? o2 : r.getLastValidPosition.call(x);
                if (l2 && (k = l2.begin, b = l2.end, l2.begin > l2.end && (k = l2.end, b = l2.begin)), -1 === T && void 0 === o2)
                  c2 = 0, u2 = (p2 = n2.getTest.call(x, c2)).alternation;
                else
                  for (; T >= 0; T--)
                    if ((d2 = S.validPositions[T]) && void 0 !== d2.alternation) {
                      if (T <= (e3 || 0) && p2 && p2.locator[d2.alternation] !== d2.locator[d2.alternation])
                        break;
                      c2 = T, u2 = S.validPositions[c2].alternation, p2 = d2;
                    }
                if (void 0 !== u2) {
                  m = parseInt(c2), S.excludes[m] = S.excludes[m] || [], true !== e3 && S.excludes[m].push((0, n2.getDecisionTaker)(p2) + ":" + p2.alternation);
                  var j = [], A = -1;
                  for (h2 = m; h2 < r.getLastValidPosition.call(x, void 0, true) + 1; h2++)
                    -1 === A && e3 <= h2 && void 0 !== t3 && (j.push(t3), A = j.length - 1), (v2 = S.validPositions[h2]) && true !== v2.generatedInput && (void 0 === l2 || h2 < k || h2 >= b) && j.push(v2.input), delete S.validPositions[h2];
                  for (-1 === A && void 0 !== t3 && (j.push(t3), A = j.length - 1); void 0 !== S.excludes[m] && S.excludes[m].length < 10; ) {
                    for (S.tests = {}, r.resetMaskSet.call(x, true), O = true, h2 = 0; h2 < j.length && (g = O.caret || r.getLastValidPosition.call(x, void 0, true) + 1, y = j[h2], O = f.call(x, g, y, false, a2, true)); h2++)
                      h2 === A && (E = O), 1 == e3 && O && (E = {
                        caretPos: h2
                      });
                    if (O)
                      break;
                    if (r.resetMaskSet.call(x), p2 = n2.getTest.call(x, m), S.validPositions = P.extend(true, [], M), S.tests = P.extend(true, {}, _), !S.excludes[m]) {
                      E = s.call(x, e3, t3, i3, a2, m - 1, l2);
                      break;
                    }
                    var D = (0, n2.getDecisionTaker)(p2);
                    if (-1 !== S.excludes[m].indexOf(D + ":" + p2.alternation)) {
                      E = s.call(x, e3, t3, i3, a2, m - 1, l2);
                      break;
                    }
                    for (S.excludes[m].push(D + ":" + p2.alternation), h2 = m; h2 < r.getLastValidPosition.call(x, void 0, true) + 1; h2++)
                      delete S.validPositions[h2];
                  }
                }
                return E && false === w.keepStatic || delete S.excludes[m], E;
              }
              function l(e3, t3, i3) {
                var n3 = this.opts, r2 = this.maskset;
                switch (n3.casing || t3.casing) {
                  case "upper":
                    e3 = e3.toUpperCase();
                    break;
                  case "lower":
                    e3 = e3.toLowerCase();
                    break;
                  case "title":
                    var o2 = r2.validPositions[i3 - 1];
                    e3 = 0 === i3 || o2 && o2.input === String.fromCharCode(a.keyCode.Space) ? e3.toUpperCase() : e3.toLowerCase();
                    break;
                  default:
                    if ("function" == typeof n3.casing) {
                      var s2 = Array.prototype.slice.call(arguments);
                      s2.push(r2.validPositions), e3 = n3.casing.apply(this, s2);
                    }
                }
                return e3;
              }
              function c(e3) {
                var t3 = this, i3 = this.opts, a2 = this.maskset;
                if ("function" == typeof i3.isComplete)
                  return i3.isComplete(e3, i3);
                if ("*" !== i3.repeat) {
                  var o2 = false, s2 = r.determineLastRequiredPosition.call(t3, true), l2 = r.seekPrevious.call(t3, s2.l);
                  if (void 0 === s2.def || s2.def.newBlockMarker || s2.def.optionality || s2.def.optionalQuantifier) {
                    o2 = true;
                    for (var c2 = 0; c2 <= l2; c2++) {
                      var u2 = n2.getTestTemplate.call(t3, c2).match;
                      if (true !== u2.static && void 0 === a2.validPositions[c2] && true !== u2.optionality && true !== u2.optionalQuantifier || true === u2.static && e3[c2] !== n2.getPlaceholder.call(t3, c2, u2)) {
                        o2 = false;
                        break;
                      }
                    }
                  }
                  return o2;
                }
              }
              function u(e3) {
                var t3 = this.opts.insertMode ? 0 : 1;
                return this.isRTL ? e3.begin - e3.end > t3 : e3.end - e3.begin > t3;
              }
              function f(e3, t3, i3, a2, o2, d2, m) {
                var g = this, y = this.dependencyLib, k = this.opts, b = g.maskset;
                i3 = true === i3;
                var x = e3;
                function P(e4) {
                  if (void 0 !== e4) {
                    if (void 0 !== e4.remove && (Array.isArray(e4.remove) || (e4.remove = [e4.remove]), e4.remove.sort(function(e5, t5) {
                      return g.isRTL ? e5.pos - t5.pos : t5.pos - e5.pos;
                    }).forEach(function(e5) {
                      v.call(g, {
                        begin: e5,
                        end: e5 + 1
                      });
                    }), e4.remove = void 0), void 0 !== e4.insert && (Array.isArray(e4.insert) || (e4.insert = [e4.insert]), e4.insert.sort(function(e5, t5) {
                      return g.isRTL ? t5.pos - e5.pos : e5.pos - t5.pos;
                    }).forEach(function(e5) {
                      "" !== e5.c && f.call(g, e5.pos, e5.c, void 0 === e5.strict || e5.strict, void 0 !== e5.fromIsValid ? e5.fromIsValid : a2);
                    }), e4.insert = void 0), e4.refreshFromBuffer && e4.buffer) {
                      var t4 = e4.refreshFromBuffer;
                      p.call(g, true === t4 ? t4 : t4.start, t4.end, e4.buffer), e4.refreshFromBuffer = void 0;
                    }
                    void 0 !== e4.rewritePosition && (x = e4.rewritePosition, e4 = true);
                  }
                  return e4;
                }
                function w(t4, i4, o3) {
                  var s2 = false;
                  return n2.getTests.call(g, t4).every(function(c2, f2) {
                    var d3 = c2.match;
                    if (r.getBuffer.call(g, true), false !== (s2 = (!d3.jit || void 0 !== b.validPositions[r.seekPrevious.call(g, t4)]) && (null != d3.fn ? d3.fn.test(i4, b, t4, o3, k, u.call(g, e3)) : (i4 === d3.def || i4 === k.skipOptionalPartCharacter) && "" !== d3.def && {
                      c: n2.getPlaceholder.call(g, t4, d3, true) || d3.def,
                      pos: t4
                    }))) {
                      var p2 = void 0 !== s2.c ? s2.c : i4, h2 = t4;
                      return p2 = p2 === k.skipOptionalPartCharacter && true === d3.static ? n2.getPlaceholder.call(g, t4, d3, true) || d3.def : p2, true !== (s2 = P(s2)) && void 0 !== s2.pos && s2.pos !== t4 && (h2 = s2.pos), true !== s2 && void 0 === s2.pos && void 0 === s2.c ? false : (false === v.call(g, e3, y.extend({}, c2, {
                        input: l.call(g, p2, d3, h2)
                      }), a2, h2) && (s2 = false), false);
                    }
                    return true;
                  }), s2;
                }
                void 0 !== e3.begin && (x = g.isRTL ? e3.end : e3.begin);
                var S = true, M = y.extend(true, {}, b.validPositions);
                if (false === k.keepStatic && void 0 !== b.excludes[x] && true !== o2 && true !== a2)
                  for (var _ = x; _ < (g.isRTL ? e3.begin : e3.end); _++)
                    void 0 !== b.excludes[_] && (b.excludes[_] = void 0, delete b.tests[_]);
                if ("function" == typeof k.preValidation && true !== a2 && true !== d2 && (S = P(S = k.preValidation.call(g, r.getBuffer.call(g), x, t3, u.call(g, e3), k, b, e3, i3 || o2))), true === S) {
                  if (S = w(x, t3, i3), (!i3 || true === a2) && false === S && true !== d2) {
                    var O = b.validPositions[x];
                    if (!O || true !== O.match.static || O.match.def !== t3 && t3 !== k.skipOptionalPartCharacter) {
                      if (k.insertMode || void 0 === b.validPositions[r.seekNext.call(g, x)] || e3.end > x) {
                        var E = false;
                        if (b.jitOffset[x] && void 0 === b.validPositions[r.seekNext.call(g, x)] && false !== (S = f.call(g, x + b.jitOffset[x], t3, true, true)) && (true !== o2 && (S.caret = x), E = true), e3.end > x && (b.validPositions[x] = void 0), !E && !r.isMask.call(g, x, k.keepStatic && 0 === x)) {
                          for (var T = x + 1, j = r.seekNext.call(g, x, false, 0 !== x); T <= j; T++)
                            if (false !== (S = w(T, t3, i3))) {
                              S = h.call(g, x, void 0 !== S.pos ? S.pos : T) || S, x = T;
                              break;
                            }
                        }
                      }
                    } else
                      S = {
                        caret: r.seekNext.call(g, x)
                      };
                  }
                  g.hasAlternator && true !== o2 && !i3 && (false === S && k.keepStatic && (c.call(g, r.getBuffer.call(g)) || 0 === x) ? S = s.call(g, x, t3, i3, a2, void 0, e3) : (u.call(g, e3) && b.tests[x] && b.tests[x].length > 1 && k.keepStatic || 1 == S && true !== k.numericInput && b.tests[x] && b.tests[x].length > 1 && r.getLastValidPosition.call(g, void 0, true) > x) && (S = s.call(g, true))), true === S && (S = {
                    pos: x
                  });
                }
                if ("function" == typeof k.postValidation && true !== a2 && true !== d2) {
                  var A = k.postValidation.call(g, r.getBuffer.call(g, true), void 0 !== e3.begin ? g.isRTL ? e3.end : e3.begin : e3, t3, S, k, b, i3, m);
                  void 0 !== A && (S = true === A ? S : A);
                }
                S && void 0 === S.pos && (S.pos = x), false === S || true === d2 ? (r.resetMaskSet.call(g, true), b.validPositions = y.extend(true, [], M)) : h.call(g, void 0, x, true);
                var D = P(S);
                void 0 !== g.maxLength && (r.getBuffer.call(g).length > g.maxLength && !a2 && (r.resetMaskSet.call(g, true), b.validPositions = y.extend(true, [], M), D = false));
                return D;
              }
              function d(e3, t3, i3) {
                for (var a2 = this.maskset, r2 = false, o2 = n2.getTests.call(this, e3), s2 = 0; s2 < o2.length; s2++) {
                  if (o2[s2].match && (o2[s2].match.nativeDef === t3.match[i3.shiftPositions ? "def" : "nativeDef"] && (!i3.shiftPositions || !t3.match.static) || o2[s2].match.nativeDef === t3.match.nativeDef || i3.regex && !o2[s2].match.static && o2[s2].match.fn.test(t3.input, a2, e3, false, i3))) {
                    r2 = true;
                    break;
                  }
                  if (o2[s2].match && o2[s2].match.def === t3.match.nativeDef) {
                    r2 = void 0;
                    break;
                  }
                }
                return false === r2 && void 0 !== a2.jitOffset[e3] && (r2 = d.call(this, e3 + a2.jitOffset[e3], t3, i3)), r2;
              }
              function p(e3, t3, i3) {
                var n3, a2, s2 = this, l2 = this.maskset, c2 = this.opts, u2 = this.dependencyLib, f2 = c2.skipOptionalPartCharacter, d2 = s2.isRTL ? i3.slice().reverse() : i3;
                if (c2.skipOptionalPartCharacter = "", true === e3)
                  r.resetMaskSet.call(s2), l2.tests = {}, e3 = 0, t3 = i3.length, a2 = r.determineNewCaretPosition.call(s2, {
                    begin: 0,
                    end: 0
                  }, false).begin;
                else {
                  for (n3 = e3; n3 < t3; n3++)
                    delete l2.validPositions[n3];
                  a2 = e3;
                }
                var p2 = new u2.Event("keypress");
                for (n3 = e3; n3 < t3; n3++) {
                  p2.key = d2[n3].toString(), s2.ignorable = false;
                  var h2 = o.EventHandlers.keypressEvent.call(s2, p2, true, false, false, a2);
                  false !== h2 && void 0 !== h2 && (a2 = h2.forwardPosition);
                }
                c2.skipOptionalPartCharacter = f2;
              }
              function h(e3, t3, i3) {
                var a2 = this, o2 = this.maskset, s2 = this.dependencyLib;
                if (void 0 === e3)
                  for (e3 = t3 - 1; e3 > 0 && !o2.validPositions[e3]; e3--)
                    ;
                for (var l2 = e3; l2 < t3; l2++) {
                  if (void 0 === o2.validPositions[l2] && !r.isMask.call(a2, l2, false)) {
                    if (0 == l2 ? n2.getTest.call(a2, l2) : o2.validPositions[l2 - 1]) {
                      var c2 = n2.getTests.call(a2, l2).slice();
                      "" === c2[c2.length - 1].match.def && c2.pop();
                      var u2, d2 = n2.determineTestTemplate.call(a2, l2, c2);
                      if (d2 && (true !== d2.match.jit || "master" === d2.match.newBlockMarker && (u2 = o2.validPositions[l2 + 1]) && true === u2.match.optionalQuantifier) && ((d2 = s2.extend({}, d2, {
                        input: n2.getPlaceholder.call(a2, l2, d2.match, true) || d2.match.def
                      })).generatedInput = true, v.call(a2, l2, d2, true), true !== i3)) {
                        var p2 = o2.validPositions[t3].input;
                        return o2.validPositions[t3] = void 0, f.call(a2, t3, p2, true, true);
                      }
                    }
                  }
                }
              }
              function v(e3, t3, i3, a2) {
                var o2 = this, s2 = this.maskset, l2 = this.opts, c2 = this.dependencyLib;
                function u2(e4, t4, i4) {
                  var n3 = t4[e4];
                  if (void 0 !== n3 && true === n3.match.static && true !== n3.match.optionality && (void 0 === t4[0] || void 0 === t4[0].alternation)) {
                    var a3 = i4.begin <= e4 - 1 ? t4[e4 - 1] && true === t4[e4 - 1].match.static && t4[e4 - 1] : t4[e4 - 1], r2 = i4.end > e4 + 1 ? t4[e4 + 1] && true === t4[e4 + 1].match.static && t4[e4 + 1] : t4[e4 + 1];
                    return a3 && r2;
                  }
                  return false;
                }
                var p2 = 0, h2 = void 0 !== e3.begin ? e3.begin : e3, v2 = void 0 !== e3.end ? e3.end : e3, m = true;
                if (e3.begin > e3.end && (h2 = e3.end, v2 = e3.begin), a2 = void 0 !== a2 ? a2 : h2, void 0 === i3 && (h2 !== v2 || l2.insertMode && void 0 !== s2.validPositions[a2] || void 0 === t3 || t3.match.optionalQuantifier || t3.match.optionality)) {
                  var g, y = c2.extend(true, {}, s2.validPositions), k = r.getLastValidPosition.call(o2, void 0, true);
                  for (s2.p = h2, g = k; g >= h2; g--)
                    delete s2.validPositions[g], void 0 === t3 && delete s2.tests[g + 1];
                  var b, x, P = a2, w = P;
                  for (t3 && (s2.validPositions[a2] = c2.extend(true, {}, t3), w++, P++), g = t3 ? v2 : v2 - 1; g <= k; g++) {
                    if (void 0 !== (b = y[g]) && true !== b.generatedInput && (g >= v2 || g >= h2 && u2(g, y, {
                      begin: h2,
                      end: v2
                    }))) {
                      for (; "" !== n2.getTest.call(o2, w).match.def; ) {
                        if (false !== (x = d.call(o2, w, b, l2)) || "+" === b.match.def) {
                          "+" === b.match.def && r.getBuffer.call(o2, true);
                          var S = f.call(o2, w, b.input, "+" !== b.match.def, true);
                          if (m = false !== S, P = (S.pos || w) + 1, !m && x)
                            break;
                        } else
                          m = false;
                        if (m) {
                          void 0 === t3 && b.match.static && g === e3.begin && p2++;
                          break;
                        }
                        if (!m && r.getBuffer.call(o2), w > s2.maskLength)
                          break;
                        w++;
                      }
                      "" == n2.getTest.call(o2, w).match.def && (m = false), w = P;
                    }
                    if (!m)
                      break;
                  }
                  if (!m)
                    return s2.validPositions = c2.extend(true, [], y), r.resetMaskSet.call(o2, true), false;
                } else
                  t3 && n2.getTest.call(o2, a2).match.cd === t3.match.cd && (s2.validPositions[a2] = c2.extend(true, {}, t3));
                return r.resetMaskSet.call(o2, true), p2;
              }
            }
          }, t = {};
          function i(n2) {
            var a = t[n2];
            if (void 0 !== a)
              return a.exports;
            var r = t[n2] = {
              exports: {}
            };
            return e[n2](r, r.exports, i), r.exports;
          }
          var n = {};
          return function() {
            var e2, t2 = n;
            Object.defineProperty(t2, "__esModule", {
              value: true
            }), t2.default = void 0, i(7149), i(3194), i(9302), i(4013), i(3851), i(219), i(207), i(5296);
            var a = ((e2 = i(2394)) && e2.__esModule ? e2 : {
              default: e2
            }).default;
            t2.default = a;
          }(), n;
        }();
      });
    }
  });

  // node_modules/@hotwired/turbo/dist/turbo.es2017-esm.js
  var turbo_es2017_esm_exports = {};
  __export(turbo_es2017_esm_exports, {
    FrameElement: () => FrameElement,
    FrameLoadingStyle: () => FrameLoadingStyle,
    FrameRenderer: () => FrameRenderer,
    PageRenderer: () => PageRenderer,
    PageSnapshot: () => PageSnapshot,
    StreamActions: () => StreamActions,
    StreamElement: () => StreamElement,
    StreamSourceElement: () => StreamSourceElement,
    cache: () => cache,
    clearCache: () => clearCache,
    connectStreamSource: () => connectStreamSource,
    disconnectStreamSource: () => disconnectStreamSource,
    navigator: () => navigator$1,
    registerAdapter: () => registerAdapter,
    renderStreamMessage: () => renderStreamMessage,
    session: () => session,
    setConfirmMethod: () => setConfirmMethod,
    setFormMode: () => setFormMode,
    setProgressBarDelay: () => setProgressBarDelay,
    start: () => start,
    visit: () => visit
  });
  (function() {
    if (window.Reflect === void 0 || window.customElements === void 0 || window.customElements.polyfillWrapFlushCallback) {
      return;
    }
    const BuiltInHTMLElement = HTMLElement;
    const wrapperForTheName = {
      HTMLElement: function HTMLElement2() {
        return Reflect.construct(BuiltInHTMLElement, [], this.constructor);
      }
    };
    window.HTMLElement = wrapperForTheName["HTMLElement"];
    HTMLElement.prototype = BuiltInHTMLElement.prototype;
    HTMLElement.prototype.constructor = HTMLElement;
    Object.setPrototypeOf(HTMLElement, BuiltInHTMLElement);
  })();
  (function(prototype) {
    if (typeof prototype.requestSubmit == "function")
      return;
    prototype.requestSubmit = function(submitter) {
      if (submitter) {
        validateSubmitter(submitter, this);
        submitter.click();
      } else {
        submitter = document.createElement("input");
        submitter.type = "submit";
        submitter.hidden = true;
        this.appendChild(submitter);
        submitter.click();
        this.removeChild(submitter);
      }
    };
    function validateSubmitter(submitter, form) {
      submitter instanceof HTMLElement || raise(TypeError, "parameter 1 is not of type 'HTMLElement'");
      submitter.type == "submit" || raise(TypeError, "The specified element is not a submit button");
      submitter.form == form || raise(DOMException, "The specified element is not owned by this form element", "NotFoundError");
    }
    function raise(errorConstructor, message, name) {
      throw new errorConstructor("Failed to execute 'requestSubmit' on 'HTMLFormElement': " + message + ".", name);
    }
  })(HTMLFormElement.prototype);
  var submittersByForm = /* @__PURE__ */ new WeakMap();
  function findSubmitterFromClickTarget(target) {
    const element = target instanceof Element ? target : target instanceof Node ? target.parentElement : null;
    const candidate = element ? element.closest("input, button") : null;
    return (candidate === null || candidate === void 0 ? void 0 : candidate.type) == "submit" ? candidate : null;
  }
  function clickCaptured(event) {
    const submitter = findSubmitterFromClickTarget(event.target);
    if (submitter && submitter.form) {
      submittersByForm.set(submitter.form, submitter);
    }
  }
  (function() {
    if ("submitter" in Event.prototype)
      return;
    let prototype = window.Event.prototype;
    if ("SubmitEvent" in window && /Apple Computer/.test(navigator.vendor)) {
      prototype = window.SubmitEvent.prototype;
    } else if ("SubmitEvent" in window) {
      return;
    }
    addEventListener("click", clickCaptured, true);
    Object.defineProperty(prototype, "submitter", {
      get() {
        if (this.type == "submit" && this.target instanceof HTMLFormElement) {
          return submittersByForm.get(this.target);
        }
      }
    });
  })();
  var FrameLoadingStyle;
  (function(FrameLoadingStyle2) {
    FrameLoadingStyle2["eager"] = "eager";
    FrameLoadingStyle2["lazy"] = "lazy";
  })(FrameLoadingStyle || (FrameLoadingStyle = {}));
  var FrameElement = class extends HTMLElement {
    static get observedAttributes() {
      return ["disabled", "complete", "loading", "src"];
    }
    constructor() {
      super();
      this.loaded = Promise.resolve();
      this.delegate = new FrameElement.delegateConstructor(this);
    }
    connectedCallback() {
      this.delegate.connect();
    }
    disconnectedCallback() {
      this.delegate.disconnect();
    }
    reload() {
      return this.delegate.sourceURLReloaded();
    }
    attributeChangedCallback(name) {
      if (name == "loading") {
        this.delegate.loadingStyleChanged();
      } else if (name == "complete") {
        this.delegate.completeChanged();
      } else if (name == "src") {
        this.delegate.sourceURLChanged();
      } else {
        this.delegate.disabledChanged();
      }
    }
    get src() {
      return this.getAttribute("src");
    }
    set src(value) {
      if (value) {
        this.setAttribute("src", value);
      } else {
        this.removeAttribute("src");
      }
    }
    get loading() {
      return frameLoadingStyleFromString(this.getAttribute("loading") || "");
    }
    set loading(value) {
      if (value) {
        this.setAttribute("loading", value);
      } else {
        this.removeAttribute("loading");
      }
    }
    get disabled() {
      return this.hasAttribute("disabled");
    }
    set disabled(value) {
      if (value) {
        this.setAttribute("disabled", "");
      } else {
        this.removeAttribute("disabled");
      }
    }
    get autoscroll() {
      return this.hasAttribute("autoscroll");
    }
    set autoscroll(value) {
      if (value) {
        this.setAttribute("autoscroll", "");
      } else {
        this.removeAttribute("autoscroll");
      }
    }
    get complete() {
      return !this.delegate.isLoading;
    }
    get isActive() {
      return this.ownerDocument === document && !this.isPreview;
    }
    get isPreview() {
      var _a, _b;
      return (_b = (_a = this.ownerDocument) === null || _a === void 0 ? void 0 : _a.documentElement) === null || _b === void 0 ? void 0 : _b.hasAttribute("data-turbo-preview");
    }
  };
  function frameLoadingStyleFromString(style) {
    switch (style.toLowerCase()) {
      case "lazy":
        return FrameLoadingStyle.lazy;
      default:
        return FrameLoadingStyle.eager;
    }
  }
  function expandURL(locatable) {
    return new URL(locatable.toString(), document.baseURI);
  }
  function getAnchor(url) {
    let anchorMatch;
    if (url.hash) {
      return url.hash.slice(1);
    } else if (anchorMatch = url.href.match(/#(.*)$/)) {
      return anchorMatch[1];
    }
  }
  function getAction(form, submitter) {
    const action = (submitter === null || submitter === void 0 ? void 0 : submitter.getAttribute("formaction")) || form.getAttribute("action") || form.action;
    return expandURL(action);
  }
  function getExtension(url) {
    return (getLastPathComponent(url).match(/\.[^.]*$/) || [])[0] || "";
  }
  function isHTML(url) {
    return !!getExtension(url).match(/^(?:|\.(?:htm|html|xhtml|php))$/);
  }
  function isPrefixedBy(baseURL, url) {
    const prefix = getPrefix(url);
    return baseURL.href === expandURL(prefix).href || baseURL.href.startsWith(prefix);
  }
  function locationIsVisitable(location2, rootLocation) {
    return isPrefixedBy(location2, rootLocation) && isHTML(location2);
  }
  function getRequestURL(url) {
    const anchor = getAnchor(url);
    return anchor != null ? url.href.slice(0, -(anchor.length + 1)) : url.href;
  }
  function toCacheKey(url) {
    return getRequestURL(url);
  }
  function urlsAreEqual(left2, right2) {
    return expandURL(left2).href == expandURL(right2).href;
  }
  function getPathComponents(url) {
    return url.pathname.split("/").slice(1);
  }
  function getLastPathComponent(url) {
    return getPathComponents(url).slice(-1)[0];
  }
  function getPrefix(url) {
    return addTrailingSlash(url.origin + url.pathname);
  }
  function addTrailingSlash(value) {
    return value.endsWith("/") ? value : value + "/";
  }
  var FetchResponse = class {
    constructor(response) {
      this.response = response;
    }
    get succeeded() {
      return this.response.ok;
    }
    get failed() {
      return !this.succeeded;
    }
    get clientError() {
      return this.statusCode >= 400 && this.statusCode <= 499;
    }
    get serverError() {
      return this.statusCode >= 500 && this.statusCode <= 599;
    }
    get redirected() {
      return this.response.redirected;
    }
    get location() {
      return expandURL(this.response.url);
    }
    get isHTML() {
      return this.contentType && this.contentType.match(/^(?:text\/([^\s;,]+\b)?html|application\/xhtml\+xml)\b/);
    }
    get statusCode() {
      return this.response.status;
    }
    get contentType() {
      return this.header("Content-Type");
    }
    get responseText() {
      return this.response.clone().text();
    }
    get responseHTML() {
      if (this.isHTML) {
        return this.response.clone().text();
      } else {
        return Promise.resolve(void 0);
      }
    }
    header(name) {
      return this.response.headers.get(name);
    }
  };
  function activateScriptElement(element) {
    if (element.getAttribute("data-turbo-eval") == "false") {
      return element;
    } else {
      const createdScriptElement = document.createElement("script");
      const cspNonce = getMetaContent("csp-nonce");
      if (cspNonce) {
        createdScriptElement.nonce = cspNonce;
      }
      createdScriptElement.textContent = element.textContent;
      createdScriptElement.async = false;
      copyElementAttributes(createdScriptElement, element);
      return createdScriptElement;
    }
  }
  function copyElementAttributes(destinationElement, sourceElement) {
    for (const { name, value } of sourceElement.attributes) {
      destinationElement.setAttribute(name, value);
    }
  }
  function createDocumentFragment(html) {
    const template = document.createElement("template");
    template.innerHTML = html;
    return template.content;
  }
  function dispatch(eventName, { target, cancelable, detail } = {}) {
    const event = new CustomEvent(eventName, {
      cancelable,
      bubbles: true,
      composed: true,
      detail
    });
    if (target && target.isConnected) {
      target.dispatchEvent(event);
    } else {
      document.documentElement.dispatchEvent(event);
    }
    return event;
  }
  function nextAnimationFrame() {
    return new Promise((resolve) => requestAnimationFrame(() => resolve()));
  }
  function nextEventLoopTick() {
    return new Promise((resolve) => setTimeout(() => resolve(), 0));
  }
  function nextMicrotask() {
    return Promise.resolve();
  }
  function parseHTMLDocument(html = "") {
    return new DOMParser().parseFromString(html, "text/html");
  }
  function unindent(strings, ...values) {
    const lines = interpolate(strings, values).replace(/^\n/, "").split("\n");
    const match = lines[0].match(/^\s+/);
    const indent = match ? match[0].length : 0;
    return lines.map((line) => line.slice(indent)).join("\n");
  }
  function interpolate(strings, values) {
    return strings.reduce((result, string, i) => {
      const value = values[i] == void 0 ? "" : values[i];
      return result + string + value;
    }, "");
  }
  function uuid() {
    return Array.from({ length: 36 }).map((_, i) => {
      if (i == 8 || i == 13 || i == 18 || i == 23) {
        return "-";
      } else if (i == 14) {
        return "4";
      } else if (i == 19) {
        return (Math.floor(Math.random() * 4) + 8).toString(16);
      } else {
        return Math.floor(Math.random() * 15).toString(16);
      }
    }).join("");
  }
  function getAttribute(attributeName, ...elements) {
    for (const value of elements.map((element) => element === null || element === void 0 ? void 0 : element.getAttribute(attributeName))) {
      if (typeof value == "string")
        return value;
    }
    return null;
  }
  function hasAttribute(attributeName, ...elements) {
    return elements.some((element) => element && element.hasAttribute(attributeName));
  }
  function markAsBusy(...elements) {
    for (const element of elements) {
      if (element.localName == "turbo-frame") {
        element.setAttribute("busy", "");
      }
      element.setAttribute("aria-busy", "true");
    }
  }
  function clearBusyState(...elements) {
    for (const element of elements) {
      if (element.localName == "turbo-frame") {
        element.removeAttribute("busy");
      }
      element.removeAttribute("aria-busy");
    }
  }
  function waitForLoad(element, timeoutInMilliseconds = 2e3) {
    return new Promise((resolve) => {
      const onComplete = () => {
        element.removeEventListener("error", onComplete);
        element.removeEventListener("load", onComplete);
        resolve();
      };
      element.addEventListener("load", onComplete, { once: true });
      element.addEventListener("error", onComplete, { once: true });
      setTimeout(resolve, timeoutInMilliseconds);
    });
  }
  function getHistoryMethodForAction(action) {
    switch (action) {
      case "replace":
        return history.replaceState;
      case "advance":
      case "restore":
        return history.pushState;
    }
  }
  function isAction(action) {
    return action == "advance" || action == "replace" || action == "restore";
  }
  function getVisitAction(...elements) {
    const action = getAttribute("data-turbo-action", ...elements);
    return isAction(action) ? action : null;
  }
  function getMetaElement(name) {
    return document.querySelector(`meta[name="${name}"]`);
  }
  function getMetaContent(name) {
    const element = getMetaElement(name);
    return element && element.content;
  }
  function setMetaContent(name, content) {
    let element = getMetaElement(name);
    if (!element) {
      element = document.createElement("meta");
      element.setAttribute("name", name);
      document.head.appendChild(element);
    }
    element.setAttribute("content", content);
    return element;
  }
  function findClosestRecursively(element, selector) {
    var _a;
    if (element instanceof Element) {
      return element.closest(selector) || findClosestRecursively(element.assignedSlot || ((_a = element.getRootNode()) === null || _a === void 0 ? void 0 : _a.host), selector);
    }
  }
  var FetchMethod;
  (function(FetchMethod2) {
    FetchMethod2[FetchMethod2["get"] = 0] = "get";
    FetchMethod2[FetchMethod2["post"] = 1] = "post";
    FetchMethod2[FetchMethod2["put"] = 2] = "put";
    FetchMethod2[FetchMethod2["patch"] = 3] = "patch";
    FetchMethod2[FetchMethod2["delete"] = 4] = "delete";
  })(FetchMethod || (FetchMethod = {}));
  function fetchMethodFromString(method) {
    switch (method.toLowerCase()) {
      case "get":
        return FetchMethod.get;
      case "post":
        return FetchMethod.post;
      case "put":
        return FetchMethod.put;
      case "patch":
        return FetchMethod.patch;
      case "delete":
        return FetchMethod.delete;
    }
  }
  var FetchRequest = class {
    constructor(delegate, method, location2, body = new URLSearchParams(), target = null) {
      this.abortController = new AbortController();
      this.resolveRequestPromise = (_value) => {
      };
      this.delegate = delegate;
      this.method = method;
      this.headers = this.defaultHeaders;
      this.body = body;
      this.url = location2;
      this.target = target;
    }
    get location() {
      return this.url;
    }
    get params() {
      return this.url.searchParams;
    }
    get entries() {
      return this.body ? Array.from(this.body.entries()) : [];
    }
    cancel() {
      this.abortController.abort();
    }
    async perform() {
      const { fetchOptions } = this;
      this.delegate.prepareRequest(this);
      await this.allowRequestToBeIntercepted(fetchOptions);
      try {
        this.delegate.requestStarted(this);
        const response = await fetch(this.url.href, fetchOptions);
        return await this.receive(response);
      } catch (error2) {
        if (error2.name !== "AbortError") {
          if (this.willDelegateErrorHandling(error2)) {
            this.delegate.requestErrored(this, error2);
          }
          throw error2;
        }
      } finally {
        this.delegate.requestFinished(this);
      }
    }
    async receive(response) {
      const fetchResponse = new FetchResponse(response);
      const event = dispatch("turbo:before-fetch-response", {
        cancelable: true,
        detail: { fetchResponse },
        target: this.target
      });
      if (event.defaultPrevented) {
        this.delegate.requestPreventedHandlingResponse(this, fetchResponse);
      } else if (fetchResponse.succeeded) {
        this.delegate.requestSucceededWithResponse(this, fetchResponse);
      } else {
        this.delegate.requestFailedWithResponse(this, fetchResponse);
      }
      return fetchResponse;
    }
    get fetchOptions() {
      var _a;
      return {
        method: FetchMethod[this.method].toUpperCase(),
        credentials: "same-origin",
        headers: this.headers,
        redirect: "follow",
        body: this.isSafe ? null : this.body,
        signal: this.abortSignal,
        referrer: (_a = this.delegate.referrer) === null || _a === void 0 ? void 0 : _a.href
      };
    }
    get defaultHeaders() {
      return {
        Accept: "text/html, application/xhtml+xml"
      };
    }
    get isSafe() {
      return this.method === FetchMethod.get;
    }
    get abortSignal() {
      return this.abortController.signal;
    }
    acceptResponseType(mimeType) {
      this.headers["Accept"] = [mimeType, this.headers["Accept"]].join(", ");
    }
    async allowRequestToBeIntercepted(fetchOptions) {
      const requestInterception = new Promise((resolve) => this.resolveRequestPromise = resolve);
      const event = dispatch("turbo:before-fetch-request", {
        cancelable: true,
        detail: {
          fetchOptions,
          url: this.url,
          resume: this.resolveRequestPromise
        },
        target: this.target
      });
      if (event.defaultPrevented)
        await requestInterception;
    }
    willDelegateErrorHandling(error2) {
      const event = dispatch("turbo:fetch-request-error", {
        target: this.target,
        cancelable: true,
        detail: { request: this, error: error2 }
      });
      return !event.defaultPrevented;
    }
  };
  var AppearanceObserver = class {
    constructor(delegate, element) {
      this.started = false;
      this.intersect = (entries) => {
        const lastEntry = entries.slice(-1)[0];
        if (lastEntry === null || lastEntry === void 0 ? void 0 : lastEntry.isIntersecting) {
          this.delegate.elementAppearedInViewport(this.element);
        }
      };
      this.delegate = delegate;
      this.element = element;
      this.intersectionObserver = new IntersectionObserver(this.intersect);
    }
    start() {
      if (!this.started) {
        this.started = true;
        this.intersectionObserver.observe(this.element);
      }
    }
    stop() {
      if (this.started) {
        this.started = false;
        this.intersectionObserver.unobserve(this.element);
      }
    }
  };
  var StreamMessage = class {
    static wrap(message) {
      if (typeof message == "string") {
        return new this(createDocumentFragment(message));
      } else {
        return message;
      }
    }
    constructor(fragment) {
      this.fragment = importStreamElements(fragment);
    }
  };
  StreamMessage.contentType = "text/vnd.turbo-stream.html";
  function importStreamElements(fragment) {
    for (const element of fragment.querySelectorAll("turbo-stream")) {
      const streamElement = document.importNode(element, true);
      for (const inertScriptElement of streamElement.templateElement.content.querySelectorAll("script")) {
        inertScriptElement.replaceWith(activateScriptElement(inertScriptElement));
      }
      element.replaceWith(streamElement);
    }
    return fragment;
  }
  var FormSubmissionState;
  (function(FormSubmissionState2) {
    FormSubmissionState2[FormSubmissionState2["initialized"] = 0] = "initialized";
    FormSubmissionState2[FormSubmissionState2["requesting"] = 1] = "requesting";
    FormSubmissionState2[FormSubmissionState2["waiting"] = 2] = "waiting";
    FormSubmissionState2[FormSubmissionState2["receiving"] = 3] = "receiving";
    FormSubmissionState2[FormSubmissionState2["stopping"] = 4] = "stopping";
    FormSubmissionState2[FormSubmissionState2["stopped"] = 5] = "stopped";
  })(FormSubmissionState || (FormSubmissionState = {}));
  var FormEnctype;
  (function(FormEnctype2) {
    FormEnctype2["urlEncoded"] = "application/x-www-form-urlencoded";
    FormEnctype2["multipart"] = "multipart/form-data";
    FormEnctype2["plain"] = "text/plain";
  })(FormEnctype || (FormEnctype = {}));
  function formEnctypeFromString(encoding) {
    switch (encoding.toLowerCase()) {
      case FormEnctype.multipart:
        return FormEnctype.multipart;
      case FormEnctype.plain:
        return FormEnctype.plain;
      default:
        return FormEnctype.urlEncoded;
    }
  }
  var FormSubmission = class {
    static confirmMethod(message, _element, _submitter) {
      return Promise.resolve(confirm(message));
    }
    constructor(delegate, formElement, submitter, mustRedirect = false) {
      this.state = FormSubmissionState.initialized;
      this.delegate = delegate;
      this.formElement = formElement;
      this.submitter = submitter;
      this.formData = buildFormData(formElement, submitter);
      this.location = expandURL(this.action);
      if (this.method == FetchMethod.get) {
        mergeFormDataEntries(this.location, [...this.body.entries()]);
      }
      this.fetchRequest = new FetchRequest(this, this.method, this.location, this.body, this.formElement);
      this.mustRedirect = mustRedirect;
    }
    get method() {
      var _a;
      const method = ((_a = this.submitter) === null || _a === void 0 ? void 0 : _a.getAttribute("formmethod")) || this.formElement.getAttribute("method") || "";
      return fetchMethodFromString(method.toLowerCase()) || FetchMethod.get;
    }
    get action() {
      var _a;
      const formElementAction = typeof this.formElement.action === "string" ? this.formElement.action : null;
      if ((_a = this.submitter) === null || _a === void 0 ? void 0 : _a.hasAttribute("formaction")) {
        return this.submitter.getAttribute("formaction") || "";
      } else {
        return this.formElement.getAttribute("action") || formElementAction || "";
      }
    }
    get body() {
      if (this.enctype == FormEnctype.urlEncoded || this.method == FetchMethod.get) {
        return new URLSearchParams(this.stringFormData);
      } else {
        return this.formData;
      }
    }
    get enctype() {
      var _a;
      return formEnctypeFromString(((_a = this.submitter) === null || _a === void 0 ? void 0 : _a.getAttribute("formenctype")) || this.formElement.enctype);
    }
    get isSafe() {
      return this.fetchRequest.isSafe;
    }
    get stringFormData() {
      return [...this.formData].reduce((entries, [name, value]) => {
        return entries.concat(typeof value == "string" ? [[name, value]] : []);
      }, []);
    }
    async start() {
      const { initialized, requesting } = FormSubmissionState;
      const confirmationMessage = getAttribute("data-turbo-confirm", this.submitter, this.formElement);
      if (typeof confirmationMessage === "string") {
        const answer = await FormSubmission.confirmMethod(confirmationMessage, this.formElement, this.submitter);
        if (!answer) {
          return;
        }
      }
      if (this.state == initialized) {
        this.state = requesting;
        return this.fetchRequest.perform();
      }
    }
    stop() {
      const { stopping, stopped } = FormSubmissionState;
      if (this.state != stopping && this.state != stopped) {
        this.state = stopping;
        this.fetchRequest.cancel();
        return true;
      }
    }
    prepareRequest(request) {
      if (!request.isSafe) {
        const token = getCookieValue(getMetaContent("csrf-param")) || getMetaContent("csrf-token");
        if (token) {
          request.headers["X-CSRF-Token"] = token;
        }
      }
      if (this.requestAcceptsTurboStreamResponse(request)) {
        request.acceptResponseType(StreamMessage.contentType);
      }
    }
    requestStarted(_request) {
      var _a;
      this.state = FormSubmissionState.waiting;
      (_a = this.submitter) === null || _a === void 0 ? void 0 : _a.setAttribute("disabled", "");
      this.setSubmitsWith();
      dispatch("turbo:submit-start", {
        target: this.formElement,
        detail: { formSubmission: this }
      });
      this.delegate.formSubmissionStarted(this);
    }
    requestPreventedHandlingResponse(request, response) {
      this.result = { success: response.succeeded, fetchResponse: response };
    }
    requestSucceededWithResponse(request, response) {
      if (response.clientError || response.serverError) {
        this.delegate.formSubmissionFailedWithResponse(this, response);
      } else if (this.requestMustRedirect(request) && responseSucceededWithoutRedirect(response)) {
        const error2 = new Error("Form responses must redirect to another location");
        this.delegate.formSubmissionErrored(this, error2);
      } else {
        this.state = FormSubmissionState.receiving;
        this.result = { success: true, fetchResponse: response };
        this.delegate.formSubmissionSucceededWithResponse(this, response);
      }
    }
    requestFailedWithResponse(request, response) {
      this.result = { success: false, fetchResponse: response };
      this.delegate.formSubmissionFailedWithResponse(this, response);
    }
    requestErrored(request, error2) {
      this.result = { success: false, error: error2 };
      this.delegate.formSubmissionErrored(this, error2);
    }
    requestFinished(_request) {
      var _a;
      this.state = FormSubmissionState.stopped;
      (_a = this.submitter) === null || _a === void 0 ? void 0 : _a.removeAttribute("disabled");
      this.resetSubmitterText();
      dispatch("turbo:submit-end", {
        target: this.formElement,
        detail: Object.assign({ formSubmission: this }, this.result)
      });
      this.delegate.formSubmissionFinished(this);
    }
    setSubmitsWith() {
      if (!this.submitter || !this.submitsWith)
        return;
      if (this.submitter.matches("button")) {
        this.originalSubmitText = this.submitter.innerHTML;
        this.submitter.innerHTML = this.submitsWith;
      } else if (this.submitter.matches("input")) {
        const input = this.submitter;
        this.originalSubmitText = input.value;
        input.value = this.submitsWith;
      }
    }
    resetSubmitterText() {
      if (!this.submitter || !this.originalSubmitText)
        return;
      if (this.submitter.matches("button")) {
        this.submitter.innerHTML = this.originalSubmitText;
      } else if (this.submitter.matches("input")) {
        const input = this.submitter;
        input.value = this.originalSubmitText;
      }
    }
    requestMustRedirect(request) {
      return !request.isSafe && this.mustRedirect;
    }
    requestAcceptsTurboStreamResponse(request) {
      return !request.isSafe || hasAttribute("data-turbo-stream", this.submitter, this.formElement);
    }
    get submitsWith() {
      var _a;
      return (_a = this.submitter) === null || _a === void 0 ? void 0 : _a.getAttribute("data-turbo-submits-with");
    }
  };
  function buildFormData(formElement, submitter) {
    const formData = new FormData(formElement);
    const name = submitter === null || submitter === void 0 ? void 0 : submitter.getAttribute("name");
    const value = submitter === null || submitter === void 0 ? void 0 : submitter.getAttribute("value");
    if (name) {
      formData.append(name, value || "");
    }
    return formData;
  }
  function getCookieValue(cookieName) {
    if (cookieName != null) {
      const cookies = document.cookie ? document.cookie.split("; ") : [];
      const cookie = cookies.find((cookie2) => cookie2.startsWith(cookieName));
      if (cookie) {
        const value = cookie.split("=").slice(1).join("=");
        return value ? decodeURIComponent(value) : void 0;
      }
    }
  }
  function responseSucceededWithoutRedirect(response) {
    return response.statusCode == 200 && !response.redirected;
  }
  function mergeFormDataEntries(url, entries) {
    const searchParams = new URLSearchParams();
    for (const [name, value] of entries) {
      if (value instanceof File)
        continue;
      searchParams.append(name, value);
    }
    url.search = searchParams.toString();
    return url;
  }
  var Snapshot = class {
    constructor(element) {
      this.element = element;
    }
    get activeElement() {
      return this.element.ownerDocument.activeElement;
    }
    get children() {
      return [...this.element.children];
    }
    hasAnchor(anchor) {
      return this.getElementForAnchor(anchor) != null;
    }
    getElementForAnchor(anchor) {
      return anchor ? this.element.querySelector(`[id='${anchor}'], a[name='${anchor}']`) : null;
    }
    get isConnected() {
      return this.element.isConnected;
    }
    get firstAutofocusableElement() {
      const inertDisabledOrHidden = "[inert], :disabled, [hidden], details:not([open]), dialog:not([open])";
      for (const element of this.element.querySelectorAll("[autofocus]")) {
        if (element.closest(inertDisabledOrHidden) == null)
          return element;
        else
          continue;
      }
      return null;
    }
    get permanentElements() {
      return queryPermanentElementsAll(this.element);
    }
    getPermanentElementById(id) {
      return getPermanentElementById(this.element, id);
    }
    getPermanentElementMapForSnapshot(snapshot) {
      const permanentElementMap = {};
      for (const currentPermanentElement of this.permanentElements) {
        const { id } = currentPermanentElement;
        const newPermanentElement = snapshot.getPermanentElementById(id);
        if (newPermanentElement) {
          permanentElementMap[id] = [currentPermanentElement, newPermanentElement];
        }
      }
      return permanentElementMap;
    }
  };
  function getPermanentElementById(node, id) {
    return node.querySelector(`#${id}[data-turbo-permanent]`);
  }
  function queryPermanentElementsAll(node) {
    return node.querySelectorAll("[id][data-turbo-permanent]");
  }
  var FormSubmitObserver = class {
    constructor(delegate, eventTarget) {
      this.started = false;
      this.submitCaptured = () => {
        this.eventTarget.removeEventListener("submit", this.submitBubbled, false);
        this.eventTarget.addEventListener("submit", this.submitBubbled, false);
      };
      this.submitBubbled = (event) => {
        if (!event.defaultPrevented) {
          const form = event.target instanceof HTMLFormElement ? event.target : void 0;
          const submitter = event.submitter || void 0;
          if (form && submissionDoesNotDismissDialog(form, submitter) && submissionDoesNotTargetIFrame(form, submitter) && this.delegate.willSubmitForm(form, submitter)) {
            event.preventDefault();
            event.stopImmediatePropagation();
            this.delegate.formSubmitted(form, submitter);
          }
        }
      };
      this.delegate = delegate;
      this.eventTarget = eventTarget;
    }
    start() {
      if (!this.started) {
        this.eventTarget.addEventListener("submit", this.submitCaptured, true);
        this.started = true;
      }
    }
    stop() {
      if (this.started) {
        this.eventTarget.removeEventListener("submit", this.submitCaptured, true);
        this.started = false;
      }
    }
  };
  function submissionDoesNotDismissDialog(form, submitter) {
    const method = (submitter === null || submitter === void 0 ? void 0 : submitter.getAttribute("formmethod")) || form.getAttribute("method");
    return method != "dialog";
  }
  function submissionDoesNotTargetIFrame(form, submitter) {
    if ((submitter === null || submitter === void 0 ? void 0 : submitter.hasAttribute("formtarget")) || form.hasAttribute("target")) {
      const target = (submitter === null || submitter === void 0 ? void 0 : submitter.getAttribute("formtarget")) || form.target;
      for (const element of document.getElementsByName(target)) {
        if (element instanceof HTMLIFrameElement)
          return false;
      }
      return true;
    } else {
      return true;
    }
  }
  var View = class {
    constructor(delegate, element) {
      this.resolveRenderPromise = (_value) => {
      };
      this.resolveInterceptionPromise = (_value) => {
      };
      this.delegate = delegate;
      this.element = element;
    }
    scrollToAnchor(anchor) {
      const element = this.snapshot.getElementForAnchor(anchor);
      if (element) {
        this.scrollToElement(element);
        this.focusElement(element);
      } else {
        this.scrollToPosition({ x: 0, y: 0 });
      }
    }
    scrollToAnchorFromLocation(location2) {
      this.scrollToAnchor(getAnchor(location2));
    }
    scrollToElement(element) {
      element.scrollIntoView();
    }
    focusElement(element) {
      if (element instanceof HTMLElement) {
        if (element.hasAttribute("tabindex")) {
          element.focus();
        } else {
          element.setAttribute("tabindex", "-1");
          element.focus();
          element.removeAttribute("tabindex");
        }
      }
    }
    scrollToPosition({ x, y }) {
      this.scrollRoot.scrollTo(x, y);
    }
    scrollToTop() {
      this.scrollToPosition({ x: 0, y: 0 });
    }
    get scrollRoot() {
      return window;
    }
    async render(renderer) {
      const { isPreview, shouldRender, newSnapshot: snapshot } = renderer;
      if (shouldRender) {
        try {
          this.renderPromise = new Promise((resolve) => this.resolveRenderPromise = resolve);
          this.renderer = renderer;
          await this.prepareToRenderSnapshot(renderer);
          const renderInterception = new Promise((resolve) => this.resolveInterceptionPromise = resolve);
          const options = { resume: this.resolveInterceptionPromise, render: this.renderer.renderElement };
          const immediateRender = this.delegate.allowsImmediateRender(snapshot, options);
          if (!immediateRender)
            await renderInterception;
          await this.renderSnapshot(renderer);
          this.delegate.viewRenderedSnapshot(snapshot, isPreview);
          this.delegate.preloadOnLoadLinksForView(this.element);
          this.finishRenderingSnapshot(renderer);
        } finally {
          delete this.renderer;
          this.resolveRenderPromise(void 0);
          delete this.renderPromise;
        }
      } else {
        this.invalidate(renderer.reloadReason);
      }
    }
    invalidate(reason) {
      this.delegate.viewInvalidated(reason);
    }
    async prepareToRenderSnapshot(renderer) {
      this.markAsPreview(renderer.isPreview);
      await renderer.prepareToRender();
    }
    markAsPreview(isPreview) {
      if (isPreview) {
        this.element.setAttribute("data-turbo-preview", "");
      } else {
        this.element.removeAttribute("data-turbo-preview");
      }
    }
    async renderSnapshot(renderer) {
      await renderer.render();
    }
    finishRenderingSnapshot(renderer) {
      renderer.finishRendering();
    }
  };
  var FrameView = class extends View {
    missing() {
      this.element.innerHTML = `<strong class="turbo-frame-error">Content missing</strong>`;
    }
    get snapshot() {
      return new Snapshot(this.element);
    }
  };
  var LinkInterceptor = class {
    constructor(delegate, element) {
      this.clickBubbled = (event) => {
        if (this.respondsToEventTarget(event.target)) {
          this.clickEvent = event;
        } else {
          delete this.clickEvent;
        }
      };
      this.linkClicked = (event) => {
        if (this.clickEvent && this.respondsToEventTarget(event.target) && event.target instanceof Element) {
          if (this.delegate.shouldInterceptLinkClick(event.target, event.detail.url, event.detail.originalEvent)) {
            this.clickEvent.preventDefault();
            event.preventDefault();
            this.delegate.linkClickIntercepted(event.target, event.detail.url, event.detail.originalEvent);
          }
        }
        delete this.clickEvent;
      };
      this.willVisit = (_event) => {
        delete this.clickEvent;
      };
      this.delegate = delegate;
      this.element = element;
    }
    start() {
      this.element.addEventListener("click", this.clickBubbled);
      document.addEventListener("turbo:click", this.linkClicked);
      document.addEventListener("turbo:before-visit", this.willVisit);
    }
    stop() {
      this.element.removeEventListener("click", this.clickBubbled);
      document.removeEventListener("turbo:click", this.linkClicked);
      document.removeEventListener("turbo:before-visit", this.willVisit);
    }
    respondsToEventTarget(target) {
      const element = target instanceof Element ? target : target instanceof Node ? target.parentElement : null;
      return element && element.closest("turbo-frame, html") == this.element;
    }
  };
  var LinkClickObserver = class {
    constructor(delegate, eventTarget) {
      this.started = false;
      this.clickCaptured = () => {
        this.eventTarget.removeEventListener("click", this.clickBubbled, false);
        this.eventTarget.addEventListener("click", this.clickBubbled, false);
      };
      this.clickBubbled = (event) => {
        if (event instanceof MouseEvent && this.clickEventIsSignificant(event)) {
          const target = event.composedPath && event.composedPath()[0] || event.target;
          const link = this.findLinkFromClickTarget(target);
          if (link && doesNotTargetIFrame(link)) {
            const location2 = this.getLocationForLink(link);
            if (this.delegate.willFollowLinkToLocation(link, location2, event)) {
              event.preventDefault();
              this.delegate.followedLinkToLocation(link, location2);
            }
          }
        }
      };
      this.delegate = delegate;
      this.eventTarget = eventTarget;
    }
    start() {
      if (!this.started) {
        this.eventTarget.addEventListener("click", this.clickCaptured, true);
        this.started = true;
      }
    }
    stop() {
      if (this.started) {
        this.eventTarget.removeEventListener("click", this.clickCaptured, true);
        this.started = false;
      }
    }
    clickEventIsSignificant(event) {
      return !(event.target && event.target.isContentEditable || event.defaultPrevented || event.which > 1 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey);
    }
    findLinkFromClickTarget(target) {
      return findClosestRecursively(target, "a[href]:not([target^=_]):not([download])");
    }
    getLocationForLink(link) {
      return expandURL(link.getAttribute("href") || "");
    }
  };
  function doesNotTargetIFrame(anchor) {
    if (anchor.hasAttribute("target")) {
      for (const element of document.getElementsByName(anchor.target)) {
        if (element instanceof HTMLIFrameElement)
          return false;
      }
      return true;
    } else {
      return true;
    }
  }
  var FormLinkClickObserver = class {
    constructor(delegate, element) {
      this.delegate = delegate;
      this.linkInterceptor = new LinkClickObserver(this, element);
    }
    start() {
      this.linkInterceptor.start();
    }
    stop() {
      this.linkInterceptor.stop();
    }
    willFollowLinkToLocation(link, location2, originalEvent) {
      return this.delegate.willSubmitFormLinkToLocation(link, location2, originalEvent) && link.hasAttribute("data-turbo-method");
    }
    followedLinkToLocation(link, location2) {
      const form = document.createElement("form");
      const type = "hidden";
      for (const [name, value] of location2.searchParams) {
        form.append(Object.assign(document.createElement("input"), { type, name, value }));
      }
      const action = Object.assign(location2, { search: "" });
      form.setAttribute("data-turbo", "true");
      form.setAttribute("action", action.href);
      form.setAttribute("hidden", "");
      const method = link.getAttribute("data-turbo-method");
      if (method)
        form.setAttribute("method", method);
      const turboFrame = link.getAttribute("data-turbo-frame");
      if (turboFrame)
        form.setAttribute("data-turbo-frame", turboFrame);
      const turboAction = getVisitAction(link);
      if (turboAction)
        form.setAttribute("data-turbo-action", turboAction);
      const turboConfirm = link.getAttribute("data-turbo-confirm");
      if (turboConfirm)
        form.setAttribute("data-turbo-confirm", turboConfirm);
      const turboStream = link.hasAttribute("data-turbo-stream");
      if (turboStream)
        form.setAttribute("data-turbo-stream", "");
      this.delegate.submittedFormLinkToLocation(link, location2, form);
      document.body.appendChild(form);
      form.addEventListener("turbo:submit-end", () => form.remove(), { once: true });
      requestAnimationFrame(() => form.requestSubmit());
    }
  };
  var Bardo = class {
    static async preservingPermanentElements(delegate, permanentElementMap, callback) {
      const bardo = new this(delegate, permanentElementMap);
      bardo.enter();
      await callback();
      bardo.leave();
    }
    constructor(delegate, permanentElementMap) {
      this.delegate = delegate;
      this.permanentElementMap = permanentElementMap;
    }
    enter() {
      for (const id in this.permanentElementMap) {
        const [currentPermanentElement, newPermanentElement] = this.permanentElementMap[id];
        this.delegate.enteringBardo(currentPermanentElement, newPermanentElement);
        this.replaceNewPermanentElementWithPlaceholder(newPermanentElement);
      }
    }
    leave() {
      for (const id in this.permanentElementMap) {
        const [currentPermanentElement] = this.permanentElementMap[id];
        this.replaceCurrentPermanentElementWithClone(currentPermanentElement);
        this.replacePlaceholderWithPermanentElement(currentPermanentElement);
        this.delegate.leavingBardo(currentPermanentElement);
      }
    }
    replaceNewPermanentElementWithPlaceholder(permanentElement) {
      const placeholder = createPlaceholderForPermanentElement(permanentElement);
      permanentElement.replaceWith(placeholder);
    }
    replaceCurrentPermanentElementWithClone(permanentElement) {
      const clone = permanentElement.cloneNode(true);
      permanentElement.replaceWith(clone);
    }
    replacePlaceholderWithPermanentElement(permanentElement) {
      const placeholder = this.getPlaceholderById(permanentElement.id);
      placeholder === null || placeholder === void 0 ? void 0 : placeholder.replaceWith(permanentElement);
    }
    getPlaceholderById(id) {
      return this.placeholders.find((element) => element.content == id);
    }
    get placeholders() {
      return [...document.querySelectorAll("meta[name=turbo-permanent-placeholder][content]")];
    }
  };
  function createPlaceholderForPermanentElement(permanentElement) {
    const element = document.createElement("meta");
    element.setAttribute("name", "turbo-permanent-placeholder");
    element.setAttribute("content", permanentElement.id);
    return element;
  }
  var Renderer = class {
    constructor(currentSnapshot, newSnapshot, renderElement, isPreview, willRender = true) {
      this.activeElement = null;
      this.currentSnapshot = currentSnapshot;
      this.newSnapshot = newSnapshot;
      this.isPreview = isPreview;
      this.willRender = willRender;
      this.renderElement = renderElement;
      this.promise = new Promise((resolve, reject) => this.resolvingFunctions = { resolve, reject });
    }
    get shouldRender() {
      return true;
    }
    get reloadReason() {
      return;
    }
    prepareToRender() {
      return;
    }
    finishRendering() {
      if (this.resolvingFunctions) {
        this.resolvingFunctions.resolve();
        delete this.resolvingFunctions;
      }
    }
    async preservingPermanentElements(callback) {
      await Bardo.preservingPermanentElements(this, this.permanentElementMap, callback);
    }
    focusFirstAutofocusableElement() {
      const element = this.connectedSnapshot.firstAutofocusableElement;
      if (elementIsFocusable(element)) {
        element.focus();
      }
    }
    enteringBardo(currentPermanentElement) {
      if (this.activeElement)
        return;
      if (currentPermanentElement.contains(this.currentSnapshot.activeElement)) {
        this.activeElement = this.currentSnapshot.activeElement;
      }
    }
    leavingBardo(currentPermanentElement) {
      if (currentPermanentElement.contains(this.activeElement) && this.activeElement instanceof HTMLElement) {
        this.activeElement.focus();
        this.activeElement = null;
      }
    }
    get connectedSnapshot() {
      return this.newSnapshot.isConnected ? this.newSnapshot : this.currentSnapshot;
    }
    get currentElement() {
      return this.currentSnapshot.element;
    }
    get newElement() {
      return this.newSnapshot.element;
    }
    get permanentElementMap() {
      return this.currentSnapshot.getPermanentElementMapForSnapshot(this.newSnapshot);
    }
  };
  function elementIsFocusable(element) {
    return element && typeof element.focus == "function";
  }
  var FrameRenderer = class extends Renderer {
    static renderElement(currentElement, newElement) {
      var _a;
      const destinationRange = document.createRange();
      destinationRange.selectNodeContents(currentElement);
      destinationRange.deleteContents();
      const frameElement = newElement;
      const sourceRange = (_a = frameElement.ownerDocument) === null || _a === void 0 ? void 0 : _a.createRange();
      if (sourceRange) {
        sourceRange.selectNodeContents(frameElement);
        currentElement.appendChild(sourceRange.extractContents());
      }
    }
    constructor(delegate, currentSnapshot, newSnapshot, renderElement, isPreview, willRender = true) {
      super(currentSnapshot, newSnapshot, renderElement, isPreview, willRender);
      this.delegate = delegate;
    }
    get shouldRender() {
      return true;
    }
    async render() {
      await nextAnimationFrame();
      this.preservingPermanentElements(() => {
        this.loadFrameElement();
      });
      this.scrollFrameIntoView();
      await nextAnimationFrame();
      this.focusFirstAutofocusableElement();
      await nextAnimationFrame();
      this.activateScriptElements();
    }
    loadFrameElement() {
      this.delegate.willRenderFrame(this.currentElement, this.newElement);
      this.renderElement(this.currentElement, this.newElement);
    }
    scrollFrameIntoView() {
      if (this.currentElement.autoscroll || this.newElement.autoscroll) {
        const element = this.currentElement.firstElementChild;
        const block = readScrollLogicalPosition(this.currentElement.getAttribute("data-autoscroll-block"), "end");
        const behavior = readScrollBehavior(this.currentElement.getAttribute("data-autoscroll-behavior"), "auto");
        if (element) {
          element.scrollIntoView({ block, behavior });
          return true;
        }
      }
      return false;
    }
    activateScriptElements() {
      for (const inertScriptElement of this.newScriptElements) {
        const activatedScriptElement = activateScriptElement(inertScriptElement);
        inertScriptElement.replaceWith(activatedScriptElement);
      }
    }
    get newScriptElements() {
      return this.currentElement.querySelectorAll("script");
    }
  };
  function readScrollLogicalPosition(value, defaultValue) {
    if (value == "end" || value == "start" || value == "center" || value == "nearest") {
      return value;
    } else {
      return defaultValue;
    }
  }
  function readScrollBehavior(value, defaultValue) {
    if (value == "auto" || value == "smooth") {
      return value;
    } else {
      return defaultValue;
    }
  }
  var ProgressBar = class {
    static get defaultCSS() {
      return unindent`
      .turbo-progress-bar {
        position: fixed;
        display: block;
        top: 0;
        left: 0;
        height: 3px;
        background: #0076ff;
        z-index: 2147483647;
        transition:
          width ${ProgressBar.animationDuration}ms ease-out,
          opacity ${ProgressBar.animationDuration / 2}ms ${ProgressBar.animationDuration / 2}ms ease-in;
        transform: translate3d(0, 0, 0);
      }
    `;
    }
    constructor() {
      this.hiding = false;
      this.value = 0;
      this.visible = false;
      this.trickle = () => {
        this.setValue(this.value + Math.random() / 100);
      };
      this.stylesheetElement = this.createStylesheetElement();
      this.progressElement = this.createProgressElement();
      this.installStylesheetElement();
      this.setValue(0);
    }
    show() {
      if (!this.visible) {
        this.visible = true;
        this.installProgressElement();
        this.startTrickling();
      }
    }
    hide() {
      if (this.visible && !this.hiding) {
        this.hiding = true;
        this.fadeProgressElement(() => {
          this.uninstallProgressElement();
          this.stopTrickling();
          this.visible = false;
          this.hiding = false;
        });
      }
    }
    setValue(value) {
      this.value = value;
      this.refresh();
    }
    installStylesheetElement() {
      document.head.insertBefore(this.stylesheetElement, document.head.firstChild);
    }
    installProgressElement() {
      this.progressElement.style.width = "0";
      this.progressElement.style.opacity = "1";
      document.documentElement.insertBefore(this.progressElement, document.body);
      this.refresh();
    }
    fadeProgressElement(callback) {
      this.progressElement.style.opacity = "0";
      setTimeout(callback, ProgressBar.animationDuration * 1.5);
    }
    uninstallProgressElement() {
      if (this.progressElement.parentNode) {
        document.documentElement.removeChild(this.progressElement);
      }
    }
    startTrickling() {
      if (!this.trickleInterval) {
        this.trickleInterval = window.setInterval(this.trickle, ProgressBar.animationDuration);
      }
    }
    stopTrickling() {
      window.clearInterval(this.trickleInterval);
      delete this.trickleInterval;
    }
    refresh() {
      requestAnimationFrame(() => {
        this.progressElement.style.width = `${10 + this.value * 90}%`;
      });
    }
    createStylesheetElement() {
      const element = document.createElement("style");
      element.type = "text/css";
      element.textContent = ProgressBar.defaultCSS;
      if (this.cspNonce) {
        element.nonce = this.cspNonce;
      }
      return element;
    }
    createProgressElement() {
      const element = document.createElement("div");
      element.className = "turbo-progress-bar";
      return element;
    }
    get cspNonce() {
      return getMetaContent("csp-nonce");
    }
  };
  ProgressBar.animationDuration = 300;
  var HeadSnapshot = class extends Snapshot {
    constructor() {
      super(...arguments);
      this.detailsByOuterHTML = this.children.filter((element) => !elementIsNoscript(element)).map((element) => elementWithoutNonce(element)).reduce((result, element) => {
        const { outerHTML } = element;
        const details = outerHTML in result ? result[outerHTML] : {
          type: elementType(element),
          tracked: elementIsTracked(element),
          elements: []
        };
        return Object.assign(Object.assign({}, result), { [outerHTML]: Object.assign(Object.assign({}, details), { elements: [...details.elements, element] }) });
      }, {});
    }
    get trackedElementSignature() {
      return Object.keys(this.detailsByOuterHTML).filter((outerHTML) => this.detailsByOuterHTML[outerHTML].tracked).join("");
    }
    getScriptElementsNotInSnapshot(snapshot) {
      return this.getElementsMatchingTypeNotInSnapshot("script", snapshot);
    }
    getStylesheetElementsNotInSnapshot(snapshot) {
      return this.getElementsMatchingTypeNotInSnapshot("stylesheet", snapshot);
    }
    getElementsMatchingTypeNotInSnapshot(matchedType, snapshot) {
      return Object.keys(this.detailsByOuterHTML).filter((outerHTML) => !(outerHTML in snapshot.detailsByOuterHTML)).map((outerHTML) => this.detailsByOuterHTML[outerHTML]).filter(({ type }) => type == matchedType).map(({ elements: [element] }) => element);
    }
    get provisionalElements() {
      return Object.keys(this.detailsByOuterHTML).reduce((result, outerHTML) => {
        const { type, tracked, elements } = this.detailsByOuterHTML[outerHTML];
        if (type == null && !tracked) {
          return [...result, ...elements];
        } else if (elements.length > 1) {
          return [...result, ...elements.slice(1)];
        } else {
          return result;
        }
      }, []);
    }
    getMetaValue(name) {
      const element = this.findMetaElementByName(name);
      return element ? element.getAttribute("content") : null;
    }
    findMetaElementByName(name) {
      return Object.keys(this.detailsByOuterHTML).reduce((result, outerHTML) => {
        const { elements: [element] } = this.detailsByOuterHTML[outerHTML];
        return elementIsMetaElementWithName(element, name) ? element : result;
      }, void 0);
    }
  };
  function elementType(element) {
    if (elementIsScript(element)) {
      return "script";
    } else if (elementIsStylesheet(element)) {
      return "stylesheet";
    }
  }
  function elementIsTracked(element) {
    return element.getAttribute("data-turbo-track") == "reload";
  }
  function elementIsScript(element) {
    const tagName = element.localName;
    return tagName == "script";
  }
  function elementIsNoscript(element) {
    const tagName = element.localName;
    return tagName == "noscript";
  }
  function elementIsStylesheet(element) {
    const tagName = element.localName;
    return tagName == "style" || tagName == "link" && element.getAttribute("rel") == "stylesheet";
  }
  function elementIsMetaElementWithName(element, name) {
    const tagName = element.localName;
    return tagName == "meta" && element.getAttribute("name") == name;
  }
  function elementWithoutNonce(element) {
    if (element.hasAttribute("nonce")) {
      element.setAttribute("nonce", "");
    }
    return element;
  }
  var PageSnapshot = class extends Snapshot {
    static fromHTMLString(html = "") {
      return this.fromDocument(parseHTMLDocument(html));
    }
    static fromElement(element) {
      return this.fromDocument(element.ownerDocument);
    }
    static fromDocument({ head, body }) {
      return new this(body, new HeadSnapshot(head));
    }
    constructor(element, headSnapshot) {
      super(element);
      this.headSnapshot = headSnapshot;
    }
    clone() {
      const clonedElement = this.element.cloneNode(true);
      const selectElements = this.element.querySelectorAll("select");
      const clonedSelectElements = clonedElement.querySelectorAll("select");
      for (const [index, source] of selectElements.entries()) {
        const clone = clonedSelectElements[index];
        for (const option of clone.selectedOptions)
          option.selected = false;
        for (const option of source.selectedOptions)
          clone.options[option.index].selected = true;
      }
      for (const clonedPasswordInput of clonedElement.querySelectorAll('input[type="password"]')) {
        clonedPasswordInput.value = "";
      }
      return new PageSnapshot(clonedElement, this.headSnapshot);
    }
    get headElement() {
      return this.headSnapshot.element;
    }
    get rootLocation() {
      var _a;
      const root = (_a = this.getSetting("root")) !== null && _a !== void 0 ? _a : "/";
      return expandURL(root);
    }
    get cacheControlValue() {
      return this.getSetting("cache-control");
    }
    get isPreviewable() {
      return this.cacheControlValue != "no-preview";
    }
    get isCacheable() {
      return this.cacheControlValue != "no-cache";
    }
    get isVisitable() {
      return this.getSetting("visit-control") != "reload";
    }
    getSetting(name) {
      return this.headSnapshot.getMetaValue(`turbo-${name}`);
    }
  };
  var TimingMetric;
  (function(TimingMetric2) {
    TimingMetric2["visitStart"] = "visitStart";
    TimingMetric2["requestStart"] = "requestStart";
    TimingMetric2["requestEnd"] = "requestEnd";
    TimingMetric2["visitEnd"] = "visitEnd";
  })(TimingMetric || (TimingMetric = {}));
  var VisitState;
  (function(VisitState2) {
    VisitState2["initialized"] = "initialized";
    VisitState2["started"] = "started";
    VisitState2["canceled"] = "canceled";
    VisitState2["failed"] = "failed";
    VisitState2["completed"] = "completed";
  })(VisitState || (VisitState = {}));
  var defaultOptions = {
    action: "advance",
    historyChanged: false,
    visitCachedSnapshot: () => {
    },
    willRender: true,
    updateHistory: true,
    shouldCacheSnapshot: true,
    acceptsStreamResponse: false
  };
  var SystemStatusCode;
  (function(SystemStatusCode2) {
    SystemStatusCode2[SystemStatusCode2["networkFailure"] = 0] = "networkFailure";
    SystemStatusCode2[SystemStatusCode2["timeoutFailure"] = -1] = "timeoutFailure";
    SystemStatusCode2[SystemStatusCode2["contentTypeMismatch"] = -2] = "contentTypeMismatch";
  })(SystemStatusCode || (SystemStatusCode = {}));
  var Visit = class {
    constructor(delegate, location2, restorationIdentifier, options = {}) {
      this.identifier = uuid();
      this.timingMetrics = {};
      this.followedRedirect = false;
      this.historyChanged = false;
      this.scrolled = false;
      this.shouldCacheSnapshot = true;
      this.acceptsStreamResponse = false;
      this.snapshotCached = false;
      this.state = VisitState.initialized;
      this.delegate = delegate;
      this.location = location2;
      this.restorationIdentifier = restorationIdentifier || uuid();
      const { action, historyChanged, referrer, snapshot, snapshotHTML, response, visitCachedSnapshot, willRender, updateHistory, shouldCacheSnapshot, acceptsStreamResponse } = Object.assign(Object.assign({}, defaultOptions), options);
      this.action = action;
      this.historyChanged = historyChanged;
      this.referrer = referrer;
      this.snapshot = snapshot;
      this.snapshotHTML = snapshotHTML;
      this.response = response;
      this.isSamePage = this.delegate.locationWithActionIsSamePage(this.location, this.action);
      this.visitCachedSnapshot = visitCachedSnapshot;
      this.willRender = willRender;
      this.updateHistory = updateHistory;
      this.scrolled = !willRender;
      this.shouldCacheSnapshot = shouldCacheSnapshot;
      this.acceptsStreamResponse = acceptsStreamResponse;
    }
    get adapter() {
      return this.delegate.adapter;
    }
    get view() {
      return this.delegate.view;
    }
    get history() {
      return this.delegate.history;
    }
    get restorationData() {
      return this.history.getRestorationDataForIdentifier(this.restorationIdentifier);
    }
    get silent() {
      return this.isSamePage;
    }
    start() {
      if (this.state == VisitState.initialized) {
        this.recordTimingMetric(TimingMetric.visitStart);
        this.state = VisitState.started;
        this.adapter.visitStarted(this);
        this.delegate.visitStarted(this);
      }
    }
    cancel() {
      if (this.state == VisitState.started) {
        if (this.request) {
          this.request.cancel();
        }
        this.cancelRender();
        this.state = VisitState.canceled;
      }
    }
    complete() {
      if (this.state == VisitState.started) {
        this.recordTimingMetric(TimingMetric.visitEnd);
        this.state = VisitState.completed;
        this.followRedirect();
        if (!this.followedRedirect) {
          this.adapter.visitCompleted(this);
          this.delegate.visitCompleted(this);
        }
      }
    }
    fail() {
      if (this.state == VisitState.started) {
        this.state = VisitState.failed;
        this.adapter.visitFailed(this);
      }
    }
    changeHistory() {
      var _a;
      if (!this.historyChanged && this.updateHistory) {
        const actionForHistory = this.location.href === ((_a = this.referrer) === null || _a === void 0 ? void 0 : _a.href) ? "replace" : this.action;
        const method = getHistoryMethodForAction(actionForHistory);
        this.history.update(method, this.location, this.restorationIdentifier);
        this.historyChanged = true;
      }
    }
    issueRequest() {
      if (this.hasPreloadedResponse()) {
        this.simulateRequest();
      } else if (this.shouldIssueRequest() && !this.request) {
        this.request = new FetchRequest(this, FetchMethod.get, this.location);
        this.request.perform();
      }
    }
    simulateRequest() {
      if (this.response) {
        this.startRequest();
        this.recordResponse();
        this.finishRequest();
      }
    }
    startRequest() {
      this.recordTimingMetric(TimingMetric.requestStart);
      this.adapter.visitRequestStarted(this);
    }
    recordResponse(response = this.response) {
      this.response = response;
      if (response) {
        const { statusCode } = response;
        if (isSuccessful(statusCode)) {
          this.adapter.visitRequestCompleted(this);
        } else {
          this.adapter.visitRequestFailedWithStatusCode(this, statusCode);
        }
      }
    }
    finishRequest() {
      this.recordTimingMetric(TimingMetric.requestEnd);
      this.adapter.visitRequestFinished(this);
    }
    loadResponse() {
      if (this.response) {
        const { statusCode, responseHTML } = this.response;
        this.render(async () => {
          if (this.shouldCacheSnapshot)
            this.cacheSnapshot();
          if (this.view.renderPromise)
            await this.view.renderPromise;
          if (isSuccessful(statusCode) && responseHTML != null) {
            await this.view.renderPage(PageSnapshot.fromHTMLString(responseHTML), false, this.willRender, this);
            this.performScroll();
            this.adapter.visitRendered(this);
            this.complete();
          } else {
            await this.view.renderError(PageSnapshot.fromHTMLString(responseHTML), this);
            this.adapter.visitRendered(this);
            this.fail();
          }
        });
      }
    }
    getCachedSnapshot() {
      const snapshot = this.view.getCachedSnapshotForLocation(this.location) || this.getPreloadedSnapshot();
      if (snapshot && (!getAnchor(this.location) || snapshot.hasAnchor(getAnchor(this.location)))) {
        if (this.action == "restore" || snapshot.isPreviewable) {
          return snapshot;
        }
      }
    }
    getPreloadedSnapshot() {
      if (this.snapshotHTML) {
        return PageSnapshot.fromHTMLString(this.snapshotHTML);
      }
    }
    hasCachedSnapshot() {
      return this.getCachedSnapshot() != null;
    }
    loadCachedSnapshot() {
      const snapshot = this.getCachedSnapshot();
      if (snapshot) {
        const isPreview = this.shouldIssueRequest();
        this.render(async () => {
          this.cacheSnapshot();
          if (this.isSamePage) {
            this.adapter.visitRendered(this);
          } else {
            if (this.view.renderPromise)
              await this.view.renderPromise;
            await this.view.renderPage(snapshot, isPreview, this.willRender, this);
            this.performScroll();
            this.adapter.visitRendered(this);
            if (!isPreview) {
              this.complete();
            }
          }
        });
      }
    }
    followRedirect() {
      var _a;
      if (this.redirectedToLocation && !this.followedRedirect && ((_a = this.response) === null || _a === void 0 ? void 0 : _a.redirected)) {
        this.adapter.visitProposedToLocation(this.redirectedToLocation, {
          action: "replace",
          response: this.response,
          shouldCacheSnapshot: false,
          willRender: false
        });
        this.followedRedirect = true;
      }
    }
    goToSamePageAnchor() {
      if (this.isSamePage) {
        this.render(async () => {
          this.cacheSnapshot();
          this.performScroll();
          this.changeHistory();
          this.adapter.visitRendered(this);
        });
      }
    }
    prepareRequest(request) {
      if (this.acceptsStreamResponse) {
        request.acceptResponseType(StreamMessage.contentType);
      }
    }
    requestStarted() {
      this.startRequest();
    }
    requestPreventedHandlingResponse(_request, _response) {
    }
    async requestSucceededWithResponse(request, response) {
      const responseHTML = await response.responseHTML;
      const { redirected, statusCode } = response;
      if (responseHTML == void 0) {
        this.recordResponse({
          statusCode: SystemStatusCode.contentTypeMismatch,
          redirected
        });
      } else {
        this.redirectedToLocation = response.redirected ? response.location : void 0;
        this.recordResponse({ statusCode, responseHTML, redirected });
      }
    }
    async requestFailedWithResponse(request, response) {
      const responseHTML = await response.responseHTML;
      const { redirected, statusCode } = response;
      if (responseHTML == void 0) {
        this.recordResponse({
          statusCode: SystemStatusCode.contentTypeMismatch,
          redirected
        });
      } else {
        this.recordResponse({ statusCode, responseHTML, redirected });
      }
    }
    requestErrored(_request, _error) {
      this.recordResponse({
        statusCode: SystemStatusCode.networkFailure,
        redirected: false
      });
    }
    requestFinished() {
      this.finishRequest();
    }
    performScroll() {
      if (!this.scrolled && !this.view.forceReloaded) {
        if (this.action == "restore") {
          this.scrollToRestoredPosition() || this.scrollToAnchor() || this.view.scrollToTop();
        } else {
          this.scrollToAnchor() || this.view.scrollToTop();
        }
        if (this.isSamePage) {
          this.delegate.visitScrolledToSamePageLocation(this.view.lastRenderedLocation, this.location);
        }
        this.scrolled = true;
      }
    }
    scrollToRestoredPosition() {
      const { scrollPosition } = this.restorationData;
      if (scrollPosition) {
        this.view.scrollToPosition(scrollPosition);
        return true;
      }
    }
    scrollToAnchor() {
      const anchor = getAnchor(this.location);
      if (anchor != null) {
        this.view.scrollToAnchor(anchor);
        return true;
      }
    }
    recordTimingMetric(metric) {
      this.timingMetrics[metric] = new Date().getTime();
    }
    getTimingMetrics() {
      return Object.assign({}, this.timingMetrics);
    }
    getHistoryMethodForAction(action) {
      switch (action) {
        case "replace":
          return history.replaceState;
        case "advance":
        case "restore":
          return history.pushState;
      }
    }
    hasPreloadedResponse() {
      return typeof this.response == "object";
    }
    shouldIssueRequest() {
      if (this.isSamePage) {
        return false;
      } else if (this.action == "restore") {
        return !this.hasCachedSnapshot();
      } else {
        return this.willRender;
      }
    }
    cacheSnapshot() {
      if (!this.snapshotCached) {
        this.view.cacheSnapshot(this.snapshot).then((snapshot) => snapshot && this.visitCachedSnapshot(snapshot));
        this.snapshotCached = true;
      }
    }
    async render(callback) {
      this.cancelRender();
      await new Promise((resolve) => {
        this.frame = requestAnimationFrame(() => resolve());
      });
      await callback();
      delete this.frame;
    }
    cancelRender() {
      if (this.frame) {
        cancelAnimationFrame(this.frame);
        delete this.frame;
      }
    }
  };
  function isSuccessful(statusCode) {
    return statusCode >= 200 && statusCode < 300;
  }
  var BrowserAdapter = class {
    constructor(session2) {
      this.progressBar = new ProgressBar();
      this.showProgressBar = () => {
        this.progressBar.show();
      };
      this.session = session2;
    }
    visitProposedToLocation(location2, options) {
      this.navigator.startVisit(location2, (options === null || options === void 0 ? void 0 : options.restorationIdentifier) || uuid(), options);
    }
    visitStarted(visit2) {
      this.location = visit2.location;
      visit2.loadCachedSnapshot();
      visit2.issueRequest();
      visit2.goToSamePageAnchor();
    }
    visitRequestStarted(visit2) {
      this.progressBar.setValue(0);
      if (visit2.hasCachedSnapshot() || visit2.action != "restore") {
        this.showVisitProgressBarAfterDelay();
      } else {
        this.showProgressBar();
      }
    }
    visitRequestCompleted(visit2) {
      visit2.loadResponse();
    }
    visitRequestFailedWithStatusCode(visit2, statusCode) {
      switch (statusCode) {
        case SystemStatusCode.networkFailure:
        case SystemStatusCode.timeoutFailure:
        case SystemStatusCode.contentTypeMismatch:
          return this.reload({
            reason: "request_failed",
            context: {
              statusCode
            }
          });
        default:
          return visit2.loadResponse();
      }
    }
    visitRequestFinished(_visit) {
      this.progressBar.setValue(1);
      this.hideVisitProgressBar();
    }
    visitCompleted(_visit) {
    }
    pageInvalidated(reason) {
      this.reload(reason);
    }
    visitFailed(_visit) {
    }
    visitRendered(_visit) {
    }
    formSubmissionStarted(_formSubmission) {
      this.progressBar.setValue(0);
      this.showFormProgressBarAfterDelay();
    }
    formSubmissionFinished(_formSubmission) {
      this.progressBar.setValue(1);
      this.hideFormProgressBar();
    }
    showVisitProgressBarAfterDelay() {
      this.visitProgressBarTimeout = window.setTimeout(this.showProgressBar, this.session.progressBarDelay);
    }
    hideVisitProgressBar() {
      this.progressBar.hide();
      if (this.visitProgressBarTimeout != null) {
        window.clearTimeout(this.visitProgressBarTimeout);
        delete this.visitProgressBarTimeout;
      }
    }
    showFormProgressBarAfterDelay() {
      if (this.formProgressBarTimeout == null) {
        this.formProgressBarTimeout = window.setTimeout(this.showProgressBar, this.session.progressBarDelay);
      }
    }
    hideFormProgressBar() {
      this.progressBar.hide();
      if (this.formProgressBarTimeout != null) {
        window.clearTimeout(this.formProgressBarTimeout);
        delete this.formProgressBarTimeout;
      }
    }
    reload(reason) {
      var _a;
      dispatch("turbo:reload", { detail: reason });
      window.location.href = ((_a = this.location) === null || _a === void 0 ? void 0 : _a.toString()) || window.location.href;
    }
    get navigator() {
      return this.session.navigator;
    }
  };
  var CacheObserver = class {
    constructor() {
      this.selector = "[data-turbo-temporary]";
      this.deprecatedSelector = "[data-turbo-cache=false]";
      this.started = false;
      this.removeTemporaryElements = (_event) => {
        for (const element of this.temporaryElements) {
          element.remove();
        }
      };
    }
    start() {
      if (!this.started) {
        this.started = true;
        addEventListener("turbo:before-cache", this.removeTemporaryElements, false);
      }
    }
    stop() {
      if (this.started) {
        this.started = false;
        removeEventListener("turbo:before-cache", this.removeTemporaryElements, false);
      }
    }
    get temporaryElements() {
      return [...document.querySelectorAll(this.selector), ...this.temporaryElementsWithDeprecation];
    }
    get temporaryElementsWithDeprecation() {
      const elements = document.querySelectorAll(this.deprecatedSelector);
      if (elements.length) {
        console.warn(`The ${this.deprecatedSelector} selector is deprecated and will be removed in a future version. Use ${this.selector} instead.`);
      }
      return [...elements];
    }
  };
  var FrameRedirector = class {
    constructor(session2, element) {
      this.session = session2;
      this.element = element;
      this.linkInterceptor = new LinkInterceptor(this, element);
      this.formSubmitObserver = new FormSubmitObserver(this, element);
    }
    start() {
      this.linkInterceptor.start();
      this.formSubmitObserver.start();
    }
    stop() {
      this.linkInterceptor.stop();
      this.formSubmitObserver.stop();
    }
    shouldInterceptLinkClick(element, _location, _event) {
      return this.shouldRedirect(element);
    }
    linkClickIntercepted(element, url, event) {
      const frame = this.findFrameElement(element);
      if (frame) {
        frame.delegate.linkClickIntercepted(element, url, event);
      }
    }
    willSubmitForm(element, submitter) {
      return element.closest("turbo-frame") == null && this.shouldSubmit(element, submitter) && this.shouldRedirect(element, submitter);
    }
    formSubmitted(element, submitter) {
      const frame = this.findFrameElement(element, submitter);
      if (frame) {
        frame.delegate.formSubmitted(element, submitter);
      }
    }
    shouldSubmit(form, submitter) {
      var _a;
      const action = getAction(form, submitter);
      const meta = this.element.ownerDocument.querySelector(`meta[name="turbo-root"]`);
      const rootLocation = expandURL((_a = meta === null || meta === void 0 ? void 0 : meta.content) !== null && _a !== void 0 ? _a : "/");
      return this.shouldRedirect(form, submitter) && locationIsVisitable(action, rootLocation);
    }
    shouldRedirect(element, submitter) {
      const isNavigatable = element instanceof HTMLFormElement ? this.session.submissionIsNavigatable(element, submitter) : this.session.elementIsNavigatable(element);
      if (isNavigatable) {
        const frame = this.findFrameElement(element, submitter);
        return frame ? frame != element.closest("turbo-frame") : false;
      } else {
        return false;
      }
    }
    findFrameElement(element, submitter) {
      const id = (submitter === null || submitter === void 0 ? void 0 : submitter.getAttribute("data-turbo-frame")) || element.getAttribute("data-turbo-frame");
      if (id && id != "_top") {
        const frame = this.element.querySelector(`#${id}:not([disabled])`);
        if (frame instanceof FrameElement) {
          return frame;
        }
      }
    }
  };
  var History = class {
    constructor(delegate) {
      this.restorationIdentifier = uuid();
      this.restorationData = {};
      this.started = false;
      this.pageLoaded = false;
      this.onPopState = (event) => {
        if (this.shouldHandlePopState()) {
          const { turbo } = event.state || {};
          if (turbo) {
            this.location = new URL(window.location.href);
            const { restorationIdentifier } = turbo;
            this.restorationIdentifier = restorationIdentifier;
            this.delegate.historyPoppedToLocationWithRestorationIdentifier(this.location, restorationIdentifier);
          }
        }
      };
      this.onPageLoad = async (_event) => {
        await nextMicrotask();
        this.pageLoaded = true;
      };
      this.delegate = delegate;
    }
    start() {
      if (!this.started) {
        addEventListener("popstate", this.onPopState, false);
        addEventListener("load", this.onPageLoad, false);
        this.started = true;
        this.replace(new URL(window.location.href));
      }
    }
    stop() {
      if (this.started) {
        removeEventListener("popstate", this.onPopState, false);
        removeEventListener("load", this.onPageLoad, false);
        this.started = false;
      }
    }
    push(location2, restorationIdentifier) {
      this.update(history.pushState, location2, restorationIdentifier);
    }
    replace(location2, restorationIdentifier) {
      this.update(history.replaceState, location2, restorationIdentifier);
    }
    update(method, location2, restorationIdentifier = uuid()) {
      const state = { turbo: { restorationIdentifier } };
      method.call(history, state, "", location2.href);
      this.location = location2;
      this.restorationIdentifier = restorationIdentifier;
    }
    getRestorationDataForIdentifier(restorationIdentifier) {
      return this.restorationData[restorationIdentifier] || {};
    }
    updateRestorationData(additionalData) {
      const { restorationIdentifier } = this;
      const restorationData = this.restorationData[restorationIdentifier];
      this.restorationData[restorationIdentifier] = Object.assign(Object.assign({}, restorationData), additionalData);
    }
    assumeControlOfScrollRestoration() {
      var _a;
      if (!this.previousScrollRestoration) {
        this.previousScrollRestoration = (_a = history.scrollRestoration) !== null && _a !== void 0 ? _a : "auto";
        history.scrollRestoration = "manual";
      }
    }
    relinquishControlOfScrollRestoration() {
      if (this.previousScrollRestoration) {
        history.scrollRestoration = this.previousScrollRestoration;
        delete this.previousScrollRestoration;
      }
    }
    shouldHandlePopState() {
      return this.pageIsLoaded();
    }
    pageIsLoaded() {
      return this.pageLoaded || document.readyState == "complete";
    }
  };
  var Navigator = class {
    constructor(delegate) {
      this.delegate = delegate;
    }
    proposeVisit(location2, options = {}) {
      if (this.delegate.allowsVisitingLocationWithAction(location2, options.action)) {
        if (locationIsVisitable(location2, this.view.snapshot.rootLocation)) {
          this.delegate.visitProposedToLocation(location2, options);
        } else {
          window.location.href = location2.toString();
        }
      }
    }
    startVisit(locatable, restorationIdentifier, options = {}) {
      this.stop();
      this.currentVisit = new Visit(this, expandURL(locatable), restorationIdentifier, Object.assign({ referrer: this.location }, options));
      this.currentVisit.start();
    }
    submitForm(form, submitter) {
      this.stop();
      this.formSubmission = new FormSubmission(this, form, submitter, true);
      this.formSubmission.start();
    }
    stop() {
      if (this.formSubmission) {
        this.formSubmission.stop();
        delete this.formSubmission;
      }
      if (this.currentVisit) {
        this.currentVisit.cancel();
        delete this.currentVisit;
      }
    }
    get adapter() {
      return this.delegate.adapter;
    }
    get view() {
      return this.delegate.view;
    }
    get history() {
      return this.delegate.history;
    }
    formSubmissionStarted(formSubmission) {
      if (typeof this.adapter.formSubmissionStarted === "function") {
        this.adapter.formSubmissionStarted(formSubmission);
      }
    }
    async formSubmissionSucceededWithResponse(formSubmission, fetchResponse) {
      if (formSubmission == this.formSubmission) {
        const responseHTML = await fetchResponse.responseHTML;
        if (responseHTML) {
          const shouldCacheSnapshot = formSubmission.isSafe;
          if (!shouldCacheSnapshot) {
            this.view.clearSnapshotCache();
          }
          const { statusCode, redirected } = fetchResponse;
          const action = this.getActionForFormSubmission(formSubmission);
          const visitOptions = {
            action,
            shouldCacheSnapshot,
            response: { statusCode, responseHTML, redirected }
          };
          this.proposeVisit(fetchResponse.location, visitOptions);
        }
      }
    }
    async formSubmissionFailedWithResponse(formSubmission, fetchResponse) {
      const responseHTML = await fetchResponse.responseHTML;
      if (responseHTML) {
        const snapshot = PageSnapshot.fromHTMLString(responseHTML);
        if (fetchResponse.serverError) {
          await this.view.renderError(snapshot, this.currentVisit);
        } else {
          await this.view.renderPage(snapshot, false, true, this.currentVisit);
        }
        this.view.scrollToTop();
        this.view.clearSnapshotCache();
      }
    }
    formSubmissionErrored(formSubmission, error2) {
      console.error(error2);
    }
    formSubmissionFinished(formSubmission) {
      if (typeof this.adapter.formSubmissionFinished === "function") {
        this.adapter.formSubmissionFinished(formSubmission);
      }
    }
    visitStarted(visit2) {
      this.delegate.visitStarted(visit2);
    }
    visitCompleted(visit2) {
      this.delegate.visitCompleted(visit2);
    }
    locationWithActionIsSamePage(location2, action) {
      const anchor = getAnchor(location2);
      const currentAnchor = getAnchor(this.view.lastRenderedLocation);
      const isRestorationToTop = action === "restore" && typeof anchor === "undefined";
      return action !== "replace" && getRequestURL(location2) === getRequestURL(this.view.lastRenderedLocation) && (isRestorationToTop || anchor != null && anchor !== currentAnchor);
    }
    visitScrolledToSamePageLocation(oldURL, newURL) {
      this.delegate.visitScrolledToSamePageLocation(oldURL, newURL);
    }
    get location() {
      return this.history.location;
    }
    get restorationIdentifier() {
      return this.history.restorationIdentifier;
    }
    getActionForFormSubmission({ submitter, formElement }) {
      return getVisitAction(submitter, formElement) || "advance";
    }
  };
  var PageStage;
  (function(PageStage2) {
    PageStage2[PageStage2["initial"] = 0] = "initial";
    PageStage2[PageStage2["loading"] = 1] = "loading";
    PageStage2[PageStage2["interactive"] = 2] = "interactive";
    PageStage2[PageStage2["complete"] = 3] = "complete";
  })(PageStage || (PageStage = {}));
  var PageObserver = class {
    constructor(delegate) {
      this.stage = PageStage.initial;
      this.started = false;
      this.interpretReadyState = () => {
        const { readyState } = this;
        if (readyState == "interactive") {
          this.pageIsInteractive();
        } else if (readyState == "complete") {
          this.pageIsComplete();
        }
      };
      this.pageWillUnload = () => {
        this.delegate.pageWillUnload();
      };
      this.delegate = delegate;
    }
    start() {
      if (!this.started) {
        if (this.stage == PageStage.initial) {
          this.stage = PageStage.loading;
        }
        document.addEventListener("readystatechange", this.interpretReadyState, false);
        addEventListener("pagehide", this.pageWillUnload, false);
        this.started = true;
      }
    }
    stop() {
      if (this.started) {
        document.removeEventListener("readystatechange", this.interpretReadyState, false);
        removeEventListener("pagehide", this.pageWillUnload, false);
        this.started = false;
      }
    }
    pageIsInteractive() {
      if (this.stage == PageStage.loading) {
        this.stage = PageStage.interactive;
        this.delegate.pageBecameInteractive();
      }
    }
    pageIsComplete() {
      this.pageIsInteractive();
      if (this.stage == PageStage.interactive) {
        this.stage = PageStage.complete;
        this.delegate.pageLoaded();
      }
    }
    get readyState() {
      return document.readyState;
    }
  };
  var ScrollObserver = class {
    constructor(delegate) {
      this.started = false;
      this.onScroll = () => {
        this.updatePosition({ x: window.pageXOffset, y: window.pageYOffset });
      };
      this.delegate = delegate;
    }
    start() {
      if (!this.started) {
        addEventListener("scroll", this.onScroll, false);
        this.onScroll();
        this.started = true;
      }
    }
    stop() {
      if (this.started) {
        removeEventListener("scroll", this.onScroll, false);
        this.started = false;
      }
    }
    updatePosition(position) {
      this.delegate.scrollPositionChanged(position);
    }
  };
  var StreamMessageRenderer = class {
    render({ fragment }) {
      Bardo.preservingPermanentElements(this, getPermanentElementMapForFragment(fragment), () => document.documentElement.appendChild(fragment));
    }
    enteringBardo(currentPermanentElement, newPermanentElement) {
      newPermanentElement.replaceWith(currentPermanentElement.cloneNode(true));
    }
    leavingBardo() {
    }
  };
  function getPermanentElementMapForFragment(fragment) {
    const permanentElementsInDocument = queryPermanentElementsAll(document.documentElement);
    const permanentElementMap = {};
    for (const permanentElementInDocument of permanentElementsInDocument) {
      const { id } = permanentElementInDocument;
      for (const streamElement of fragment.querySelectorAll("turbo-stream")) {
        const elementInStream = getPermanentElementById(streamElement.templateElement.content, id);
        if (elementInStream) {
          permanentElementMap[id] = [permanentElementInDocument, elementInStream];
        }
      }
    }
    return permanentElementMap;
  }
  var StreamObserver = class {
    constructor(delegate) {
      this.sources = /* @__PURE__ */ new Set();
      this.started = false;
      this.inspectFetchResponse = (event) => {
        const response = fetchResponseFromEvent(event);
        if (response && fetchResponseIsStream(response)) {
          event.preventDefault();
          this.receiveMessageResponse(response);
        }
      };
      this.receiveMessageEvent = (event) => {
        if (this.started && typeof event.data == "string") {
          this.receiveMessageHTML(event.data);
        }
      };
      this.delegate = delegate;
    }
    start() {
      if (!this.started) {
        this.started = true;
        addEventListener("turbo:before-fetch-response", this.inspectFetchResponse, false);
      }
    }
    stop() {
      if (this.started) {
        this.started = false;
        removeEventListener("turbo:before-fetch-response", this.inspectFetchResponse, false);
      }
    }
    connectStreamSource(source) {
      if (!this.streamSourceIsConnected(source)) {
        this.sources.add(source);
        source.addEventListener("message", this.receiveMessageEvent, false);
      }
    }
    disconnectStreamSource(source) {
      if (this.streamSourceIsConnected(source)) {
        this.sources.delete(source);
        source.removeEventListener("message", this.receiveMessageEvent, false);
      }
    }
    streamSourceIsConnected(source) {
      return this.sources.has(source);
    }
    async receiveMessageResponse(response) {
      const html = await response.responseHTML;
      if (html) {
        this.receiveMessageHTML(html);
      }
    }
    receiveMessageHTML(html) {
      this.delegate.receivedMessageFromStream(StreamMessage.wrap(html));
    }
  };
  function fetchResponseFromEvent(event) {
    var _a;
    const fetchResponse = (_a = event.detail) === null || _a === void 0 ? void 0 : _a.fetchResponse;
    if (fetchResponse instanceof FetchResponse) {
      return fetchResponse;
    }
  }
  function fetchResponseIsStream(response) {
    var _a;
    const contentType = (_a = response.contentType) !== null && _a !== void 0 ? _a : "";
    return contentType.startsWith(StreamMessage.contentType);
  }
  var ErrorRenderer = class extends Renderer {
    static renderElement(currentElement, newElement) {
      const { documentElement, body } = document;
      documentElement.replaceChild(newElement, body);
    }
    async render() {
      this.replaceHeadAndBody();
      this.activateScriptElements();
    }
    replaceHeadAndBody() {
      const { documentElement, head } = document;
      documentElement.replaceChild(this.newHead, head);
      this.renderElement(this.currentElement, this.newElement);
    }
    activateScriptElements() {
      for (const replaceableElement of this.scriptElements) {
        const parentNode = replaceableElement.parentNode;
        if (parentNode) {
          const element = activateScriptElement(replaceableElement);
          parentNode.replaceChild(element, replaceableElement);
        }
      }
    }
    get newHead() {
      return this.newSnapshot.headSnapshot.element;
    }
    get scriptElements() {
      return document.documentElement.querySelectorAll("script");
    }
  };
  var PageRenderer = class extends Renderer {
    static renderElement(currentElement, newElement) {
      if (document.body && newElement instanceof HTMLBodyElement) {
        document.body.replaceWith(newElement);
      } else {
        document.documentElement.appendChild(newElement);
      }
    }
    get shouldRender() {
      return this.newSnapshot.isVisitable && this.trackedElementsAreIdentical;
    }
    get reloadReason() {
      if (!this.newSnapshot.isVisitable) {
        return {
          reason: "turbo_visit_control_is_reload"
        };
      }
      if (!this.trackedElementsAreIdentical) {
        return {
          reason: "tracked_element_mismatch"
        };
      }
    }
    async prepareToRender() {
      await this.mergeHead();
    }
    async render() {
      if (this.willRender) {
        await this.replaceBody();
      }
    }
    finishRendering() {
      super.finishRendering();
      if (!this.isPreview) {
        this.focusFirstAutofocusableElement();
      }
    }
    get currentHeadSnapshot() {
      return this.currentSnapshot.headSnapshot;
    }
    get newHeadSnapshot() {
      return this.newSnapshot.headSnapshot;
    }
    get newElement() {
      return this.newSnapshot.element;
    }
    async mergeHead() {
      const mergedHeadElements = this.mergeProvisionalElements();
      const newStylesheetElements = this.copyNewHeadStylesheetElements();
      this.copyNewHeadScriptElements();
      await mergedHeadElements;
      await newStylesheetElements;
    }
    async replaceBody() {
      await this.preservingPermanentElements(async () => {
        this.activateNewBody();
        await this.assignNewBody();
      });
    }
    get trackedElementsAreIdentical() {
      return this.currentHeadSnapshot.trackedElementSignature == this.newHeadSnapshot.trackedElementSignature;
    }
    async copyNewHeadStylesheetElements() {
      const loadingElements = [];
      for (const element of this.newHeadStylesheetElements) {
        loadingElements.push(waitForLoad(element));
        document.head.appendChild(element);
      }
      await Promise.all(loadingElements);
    }
    copyNewHeadScriptElements() {
      for (const element of this.newHeadScriptElements) {
        document.head.appendChild(activateScriptElement(element));
      }
    }
    async mergeProvisionalElements() {
      const newHeadElements = [...this.newHeadProvisionalElements];
      for (const element of this.currentHeadProvisionalElements) {
        if (!this.isCurrentElementInElementList(element, newHeadElements)) {
          document.head.removeChild(element);
        }
      }
      for (const element of newHeadElements) {
        document.head.appendChild(element);
      }
    }
    isCurrentElementInElementList(element, elementList) {
      for (const [index, newElement] of elementList.entries()) {
        if (element.tagName == "TITLE") {
          if (newElement.tagName != "TITLE") {
            continue;
          }
          if (element.innerHTML == newElement.innerHTML) {
            elementList.splice(index, 1);
            return true;
          }
        }
        if (newElement.isEqualNode(element)) {
          elementList.splice(index, 1);
          return true;
        }
      }
      return false;
    }
    removeCurrentHeadProvisionalElements() {
      for (const element of this.currentHeadProvisionalElements) {
        document.head.removeChild(element);
      }
    }
    copyNewHeadProvisionalElements() {
      for (const element of this.newHeadProvisionalElements) {
        document.head.appendChild(element);
      }
    }
    activateNewBody() {
      document.adoptNode(this.newElement);
      this.activateNewBodyScriptElements();
    }
    activateNewBodyScriptElements() {
      for (const inertScriptElement of this.newBodyScriptElements) {
        const activatedScriptElement = activateScriptElement(inertScriptElement);
        inertScriptElement.replaceWith(activatedScriptElement);
      }
    }
    async assignNewBody() {
      await this.renderElement(this.currentElement, this.newElement);
    }
    get newHeadStylesheetElements() {
      return this.newHeadSnapshot.getStylesheetElementsNotInSnapshot(this.currentHeadSnapshot);
    }
    get newHeadScriptElements() {
      return this.newHeadSnapshot.getScriptElementsNotInSnapshot(this.currentHeadSnapshot);
    }
    get currentHeadProvisionalElements() {
      return this.currentHeadSnapshot.provisionalElements;
    }
    get newHeadProvisionalElements() {
      return this.newHeadSnapshot.provisionalElements;
    }
    get newBodyScriptElements() {
      return this.newElement.querySelectorAll("script");
    }
  };
  var SnapshotCache = class {
    constructor(size) {
      this.keys = [];
      this.snapshots = {};
      this.size = size;
    }
    has(location2) {
      return toCacheKey(location2) in this.snapshots;
    }
    get(location2) {
      if (this.has(location2)) {
        const snapshot = this.read(location2);
        this.touch(location2);
        return snapshot;
      }
    }
    put(location2, snapshot) {
      this.write(location2, snapshot);
      this.touch(location2);
      return snapshot;
    }
    clear() {
      this.snapshots = {};
    }
    read(location2) {
      return this.snapshots[toCacheKey(location2)];
    }
    write(location2, snapshot) {
      this.snapshots[toCacheKey(location2)] = snapshot;
    }
    touch(location2) {
      const key = toCacheKey(location2);
      const index = this.keys.indexOf(key);
      if (index > -1)
        this.keys.splice(index, 1);
      this.keys.unshift(key);
      this.trim();
    }
    trim() {
      for (const key of this.keys.splice(this.size)) {
        delete this.snapshots[key];
      }
    }
  };
  var PageView = class extends View {
    constructor() {
      super(...arguments);
      this.snapshotCache = new SnapshotCache(10);
      this.lastRenderedLocation = new URL(location.href);
      this.forceReloaded = false;
    }
    renderPage(snapshot, isPreview = false, willRender = true, visit2) {
      const renderer = new PageRenderer(this.snapshot, snapshot, PageRenderer.renderElement, isPreview, willRender);
      if (!renderer.shouldRender) {
        this.forceReloaded = true;
      } else {
        visit2 === null || visit2 === void 0 ? void 0 : visit2.changeHistory();
      }
      return this.render(renderer);
    }
    renderError(snapshot, visit2) {
      visit2 === null || visit2 === void 0 ? void 0 : visit2.changeHistory();
      const renderer = new ErrorRenderer(this.snapshot, snapshot, ErrorRenderer.renderElement, false);
      return this.render(renderer);
    }
    clearSnapshotCache() {
      this.snapshotCache.clear();
    }
    async cacheSnapshot(snapshot = this.snapshot) {
      if (snapshot.isCacheable) {
        this.delegate.viewWillCacheSnapshot();
        const { lastRenderedLocation: location2 } = this;
        await nextEventLoopTick();
        const cachedSnapshot = snapshot.clone();
        this.snapshotCache.put(location2, cachedSnapshot);
        return cachedSnapshot;
      }
    }
    getCachedSnapshotForLocation(location2) {
      return this.snapshotCache.get(location2);
    }
    get snapshot() {
      return PageSnapshot.fromElement(this.element);
    }
  };
  var Preloader = class {
    constructor(delegate) {
      this.selector = "a[data-turbo-preload]";
      this.delegate = delegate;
    }
    get snapshotCache() {
      return this.delegate.navigator.view.snapshotCache;
    }
    start() {
      if (document.readyState === "loading") {
        return document.addEventListener("DOMContentLoaded", () => {
          this.preloadOnLoadLinksForView(document.body);
        });
      } else {
        this.preloadOnLoadLinksForView(document.body);
      }
    }
    preloadOnLoadLinksForView(element) {
      for (const link of element.querySelectorAll(this.selector)) {
        this.preloadURL(link);
      }
    }
    async preloadURL(link) {
      const location2 = new URL(link.href);
      if (this.snapshotCache.has(location2)) {
        return;
      }
      try {
        const response = await fetch(location2.toString(), { headers: { "VND.PREFETCH": "true", Accept: "text/html" } });
        const responseText = await response.text();
        const snapshot = PageSnapshot.fromHTMLString(responseText);
        this.snapshotCache.put(location2, snapshot);
      } catch (_) {
      }
    }
  };
  var Session = class {
    constructor() {
      this.navigator = new Navigator(this);
      this.history = new History(this);
      this.preloader = new Preloader(this);
      this.view = new PageView(this, document.documentElement);
      this.adapter = new BrowserAdapter(this);
      this.pageObserver = new PageObserver(this);
      this.cacheObserver = new CacheObserver();
      this.linkClickObserver = new LinkClickObserver(this, window);
      this.formSubmitObserver = new FormSubmitObserver(this, document);
      this.scrollObserver = new ScrollObserver(this);
      this.streamObserver = new StreamObserver(this);
      this.formLinkClickObserver = new FormLinkClickObserver(this, document.documentElement);
      this.frameRedirector = new FrameRedirector(this, document.documentElement);
      this.streamMessageRenderer = new StreamMessageRenderer();
      this.drive = true;
      this.enabled = true;
      this.progressBarDelay = 500;
      this.started = false;
      this.formMode = "on";
    }
    start() {
      if (!this.started) {
        this.pageObserver.start();
        this.cacheObserver.start();
        this.formLinkClickObserver.start();
        this.linkClickObserver.start();
        this.formSubmitObserver.start();
        this.scrollObserver.start();
        this.streamObserver.start();
        this.frameRedirector.start();
        this.history.start();
        this.preloader.start();
        this.started = true;
        this.enabled = true;
      }
    }
    disable() {
      this.enabled = false;
    }
    stop() {
      if (this.started) {
        this.pageObserver.stop();
        this.cacheObserver.stop();
        this.formLinkClickObserver.stop();
        this.linkClickObserver.stop();
        this.formSubmitObserver.stop();
        this.scrollObserver.stop();
        this.streamObserver.stop();
        this.frameRedirector.stop();
        this.history.stop();
        this.started = false;
      }
    }
    registerAdapter(adapter) {
      this.adapter = adapter;
    }
    visit(location2, options = {}) {
      const frameElement = options.frame ? document.getElementById(options.frame) : null;
      if (frameElement instanceof FrameElement) {
        frameElement.src = location2.toString();
        frameElement.loaded;
      } else {
        this.navigator.proposeVisit(expandURL(location2), options);
      }
    }
    connectStreamSource(source) {
      this.streamObserver.connectStreamSource(source);
    }
    disconnectStreamSource(source) {
      this.streamObserver.disconnectStreamSource(source);
    }
    renderStreamMessage(message) {
      this.streamMessageRenderer.render(StreamMessage.wrap(message));
    }
    clearCache() {
      this.view.clearSnapshotCache();
    }
    setProgressBarDelay(delay) {
      this.progressBarDelay = delay;
    }
    setFormMode(mode) {
      this.formMode = mode;
    }
    get location() {
      return this.history.location;
    }
    get restorationIdentifier() {
      return this.history.restorationIdentifier;
    }
    historyPoppedToLocationWithRestorationIdentifier(location2, restorationIdentifier) {
      if (this.enabled) {
        this.navigator.startVisit(location2, restorationIdentifier, {
          action: "restore",
          historyChanged: true
        });
      } else {
        this.adapter.pageInvalidated({
          reason: "turbo_disabled"
        });
      }
    }
    scrollPositionChanged(position) {
      this.history.updateRestorationData({ scrollPosition: position });
    }
    willSubmitFormLinkToLocation(link, location2) {
      return this.elementIsNavigatable(link) && locationIsVisitable(location2, this.snapshot.rootLocation);
    }
    submittedFormLinkToLocation() {
    }
    willFollowLinkToLocation(link, location2, event) {
      return this.elementIsNavigatable(link) && locationIsVisitable(location2, this.snapshot.rootLocation) && this.applicationAllowsFollowingLinkToLocation(link, location2, event);
    }
    followedLinkToLocation(link, location2) {
      const action = this.getActionForLink(link);
      const acceptsStreamResponse = link.hasAttribute("data-turbo-stream");
      this.visit(location2.href, { action, acceptsStreamResponse });
    }
    allowsVisitingLocationWithAction(location2, action) {
      return this.locationWithActionIsSamePage(location2, action) || this.applicationAllowsVisitingLocation(location2);
    }
    visitProposedToLocation(location2, options) {
      extendURLWithDeprecatedProperties(location2);
      this.adapter.visitProposedToLocation(location2, options);
    }
    visitStarted(visit2) {
      if (!visit2.acceptsStreamResponse) {
        markAsBusy(document.documentElement);
      }
      extendURLWithDeprecatedProperties(visit2.location);
      if (!visit2.silent) {
        this.notifyApplicationAfterVisitingLocation(visit2.location, visit2.action);
      }
    }
    visitCompleted(visit2) {
      clearBusyState(document.documentElement);
      this.notifyApplicationAfterPageLoad(visit2.getTimingMetrics());
    }
    locationWithActionIsSamePage(location2, action) {
      return this.navigator.locationWithActionIsSamePage(location2, action);
    }
    visitScrolledToSamePageLocation(oldURL, newURL) {
      this.notifyApplicationAfterVisitingSamePageLocation(oldURL, newURL);
    }
    willSubmitForm(form, submitter) {
      const action = getAction(form, submitter);
      return this.submissionIsNavigatable(form, submitter) && locationIsVisitable(expandURL(action), this.snapshot.rootLocation);
    }
    formSubmitted(form, submitter) {
      this.navigator.submitForm(form, submitter);
    }
    pageBecameInteractive() {
      this.view.lastRenderedLocation = this.location;
      this.notifyApplicationAfterPageLoad();
    }
    pageLoaded() {
      this.history.assumeControlOfScrollRestoration();
    }
    pageWillUnload() {
      this.history.relinquishControlOfScrollRestoration();
    }
    receivedMessageFromStream(message) {
      this.renderStreamMessage(message);
    }
    viewWillCacheSnapshot() {
      var _a;
      if (!((_a = this.navigator.currentVisit) === null || _a === void 0 ? void 0 : _a.silent)) {
        this.notifyApplicationBeforeCachingSnapshot();
      }
    }
    allowsImmediateRender({ element }, options) {
      const event = this.notifyApplicationBeforeRender(element, options);
      const { defaultPrevented, detail: { render } } = event;
      if (this.view.renderer && render) {
        this.view.renderer.renderElement = render;
      }
      return !defaultPrevented;
    }
    viewRenderedSnapshot(_snapshot, _isPreview) {
      this.view.lastRenderedLocation = this.history.location;
      this.notifyApplicationAfterRender();
    }
    preloadOnLoadLinksForView(element) {
      this.preloader.preloadOnLoadLinksForView(element);
    }
    viewInvalidated(reason) {
      this.adapter.pageInvalidated(reason);
    }
    frameLoaded(frame) {
      this.notifyApplicationAfterFrameLoad(frame);
    }
    frameRendered(fetchResponse, frame) {
      this.notifyApplicationAfterFrameRender(fetchResponse, frame);
    }
    applicationAllowsFollowingLinkToLocation(link, location2, ev) {
      const event = this.notifyApplicationAfterClickingLinkToLocation(link, location2, ev);
      return !event.defaultPrevented;
    }
    applicationAllowsVisitingLocation(location2) {
      const event = this.notifyApplicationBeforeVisitingLocation(location2);
      return !event.defaultPrevented;
    }
    notifyApplicationAfterClickingLinkToLocation(link, location2, event) {
      return dispatch("turbo:click", {
        target: link,
        detail: { url: location2.href, originalEvent: event },
        cancelable: true
      });
    }
    notifyApplicationBeforeVisitingLocation(location2) {
      return dispatch("turbo:before-visit", {
        detail: { url: location2.href },
        cancelable: true
      });
    }
    notifyApplicationAfterVisitingLocation(location2, action) {
      return dispatch("turbo:visit", { detail: { url: location2.href, action } });
    }
    notifyApplicationBeforeCachingSnapshot() {
      return dispatch("turbo:before-cache");
    }
    notifyApplicationBeforeRender(newBody, options) {
      return dispatch("turbo:before-render", {
        detail: Object.assign({ newBody }, options),
        cancelable: true
      });
    }
    notifyApplicationAfterRender() {
      return dispatch("turbo:render");
    }
    notifyApplicationAfterPageLoad(timing = {}) {
      return dispatch("turbo:load", {
        detail: { url: this.location.href, timing }
      });
    }
    notifyApplicationAfterVisitingSamePageLocation(oldURL, newURL) {
      dispatchEvent(new HashChangeEvent("hashchange", {
        oldURL: oldURL.toString(),
        newURL: newURL.toString()
      }));
    }
    notifyApplicationAfterFrameLoad(frame) {
      return dispatch("turbo:frame-load", { target: frame });
    }
    notifyApplicationAfterFrameRender(fetchResponse, frame) {
      return dispatch("turbo:frame-render", {
        detail: { fetchResponse },
        target: frame,
        cancelable: true
      });
    }
    submissionIsNavigatable(form, submitter) {
      if (this.formMode == "off") {
        return false;
      } else {
        const submitterIsNavigatable = submitter ? this.elementIsNavigatable(submitter) : true;
        if (this.formMode == "optin") {
          return submitterIsNavigatable && form.closest('[data-turbo="true"]') != null;
        } else {
          return submitterIsNavigatable && this.elementIsNavigatable(form);
        }
      }
    }
    elementIsNavigatable(element) {
      const container = findClosestRecursively(element, "[data-turbo]");
      const withinFrame = findClosestRecursively(element, "turbo-frame");
      if (this.drive || withinFrame) {
        if (container) {
          return container.getAttribute("data-turbo") != "false";
        } else {
          return true;
        }
      } else {
        if (container) {
          return container.getAttribute("data-turbo") == "true";
        } else {
          return false;
        }
      }
    }
    getActionForLink(link) {
      return getVisitAction(link) || "advance";
    }
    get snapshot() {
      return this.view.snapshot;
    }
  };
  function extendURLWithDeprecatedProperties(url) {
    Object.defineProperties(url, deprecatedLocationPropertyDescriptors);
  }
  var deprecatedLocationPropertyDescriptors = {
    absoluteURL: {
      get() {
        return this.toString();
      }
    }
  };
  var Cache = class {
    constructor(session2) {
      this.session = session2;
    }
    clear() {
      this.session.clearCache();
    }
    resetCacheControl() {
      this.setCacheControl("");
    }
    exemptPageFromCache() {
      this.setCacheControl("no-cache");
    }
    exemptPageFromPreview() {
      this.setCacheControl("no-preview");
    }
    setCacheControl(value) {
      setMetaContent("turbo-cache-control", value);
    }
  };
  var StreamActions = {
    after() {
      this.targetElements.forEach((e) => {
        var _a;
        return (_a = e.parentElement) === null || _a === void 0 ? void 0 : _a.insertBefore(this.templateContent, e.nextSibling);
      });
    },
    append() {
      this.removeDuplicateTargetChildren();
      this.targetElements.forEach((e) => e.append(this.templateContent));
    },
    before() {
      this.targetElements.forEach((e) => {
        var _a;
        return (_a = e.parentElement) === null || _a === void 0 ? void 0 : _a.insertBefore(this.templateContent, e);
      });
    },
    prepend() {
      this.removeDuplicateTargetChildren();
      this.targetElements.forEach((e) => e.prepend(this.templateContent));
    },
    remove() {
      this.targetElements.forEach((e) => e.remove());
    },
    replace() {
      this.targetElements.forEach((e) => e.replaceWith(this.templateContent));
    },
    update() {
      this.targetElements.forEach((targetElement) => {
        targetElement.innerHTML = "";
        targetElement.append(this.templateContent);
      });
    }
  };
  var session = new Session();
  var cache = new Cache(session);
  var { navigator: navigator$1 } = session;
  function start() {
    session.start();
  }
  function registerAdapter(adapter) {
    session.registerAdapter(adapter);
  }
  function visit(location2, options) {
    session.visit(location2, options);
  }
  function connectStreamSource(source) {
    session.connectStreamSource(source);
  }
  function disconnectStreamSource(source) {
    session.disconnectStreamSource(source);
  }
  function renderStreamMessage(message) {
    session.renderStreamMessage(message);
  }
  function clearCache() {
    console.warn("Please replace `Turbo.clearCache()` with `Turbo.cache.clear()`. The top-level function is deprecated and will be removed in a future version of Turbo.`");
    session.clearCache();
  }
  function setProgressBarDelay(delay) {
    session.setProgressBarDelay(delay);
  }
  function setConfirmMethod(confirmMethod) {
    FormSubmission.confirmMethod = confirmMethod;
  }
  function setFormMode(mode) {
    session.setFormMode(mode);
  }
  var Turbo2 = /* @__PURE__ */ Object.freeze({
    __proto__: null,
    navigator: navigator$1,
    session,
    cache,
    PageRenderer,
    PageSnapshot,
    FrameRenderer,
    start,
    registerAdapter,
    visit,
    connectStreamSource,
    disconnectStreamSource,
    renderStreamMessage,
    clearCache,
    setProgressBarDelay,
    setConfirmMethod,
    setFormMode,
    StreamActions
  });
  var TurboFrameMissingError = class extends Error {
  };
  var FrameController = class {
    constructor(element) {
      this.fetchResponseLoaded = (_fetchResponse) => {
      };
      this.currentFetchRequest = null;
      this.resolveVisitPromise = () => {
      };
      this.connected = false;
      this.hasBeenLoaded = false;
      this.ignoredAttributes = /* @__PURE__ */ new Set();
      this.action = null;
      this.visitCachedSnapshot = ({ element: element2 }) => {
        const frame = element2.querySelector("#" + this.element.id);
        if (frame && this.previousFrameElement) {
          frame.replaceChildren(...this.previousFrameElement.children);
        }
        delete this.previousFrameElement;
      };
      this.element = element;
      this.view = new FrameView(this, this.element);
      this.appearanceObserver = new AppearanceObserver(this, this.element);
      this.formLinkClickObserver = new FormLinkClickObserver(this, this.element);
      this.linkInterceptor = new LinkInterceptor(this, this.element);
      this.restorationIdentifier = uuid();
      this.formSubmitObserver = new FormSubmitObserver(this, this.element);
    }
    connect() {
      if (!this.connected) {
        this.connected = true;
        if (this.loadingStyle == FrameLoadingStyle.lazy) {
          this.appearanceObserver.start();
        } else {
          this.loadSourceURL();
        }
        this.formLinkClickObserver.start();
        this.linkInterceptor.start();
        this.formSubmitObserver.start();
      }
    }
    disconnect() {
      if (this.connected) {
        this.connected = false;
        this.appearanceObserver.stop();
        this.formLinkClickObserver.stop();
        this.linkInterceptor.stop();
        this.formSubmitObserver.stop();
      }
    }
    disabledChanged() {
      if (this.loadingStyle == FrameLoadingStyle.eager) {
        this.loadSourceURL();
      }
    }
    sourceURLChanged() {
      if (this.isIgnoringChangesTo("src"))
        return;
      if (this.element.isConnected) {
        this.complete = false;
      }
      if (this.loadingStyle == FrameLoadingStyle.eager || this.hasBeenLoaded) {
        this.loadSourceURL();
      }
    }
    sourceURLReloaded() {
      const { src } = this.element;
      this.ignoringChangesToAttribute("complete", () => {
        this.element.removeAttribute("complete");
      });
      this.element.src = null;
      this.element.src = src;
      return this.element.loaded;
    }
    completeChanged() {
      if (this.isIgnoringChangesTo("complete"))
        return;
      this.loadSourceURL();
    }
    loadingStyleChanged() {
      if (this.loadingStyle == FrameLoadingStyle.lazy) {
        this.appearanceObserver.start();
      } else {
        this.appearanceObserver.stop();
        this.loadSourceURL();
      }
    }
    async loadSourceURL() {
      if (this.enabled && this.isActive && !this.complete && this.sourceURL) {
        this.element.loaded = this.visit(expandURL(this.sourceURL));
        this.appearanceObserver.stop();
        await this.element.loaded;
        this.hasBeenLoaded = true;
      }
    }
    async loadResponse(fetchResponse) {
      if (fetchResponse.redirected || fetchResponse.succeeded && fetchResponse.isHTML) {
        this.sourceURL = fetchResponse.response.url;
      }
      try {
        const html = await fetchResponse.responseHTML;
        if (html) {
          const document2 = parseHTMLDocument(html);
          const pageSnapshot = PageSnapshot.fromDocument(document2);
          if (pageSnapshot.isVisitable) {
            await this.loadFrameResponse(fetchResponse, document2);
          } else {
            await this.handleUnvisitableFrameResponse(fetchResponse);
          }
        }
      } finally {
        this.fetchResponseLoaded = () => {
        };
      }
    }
    elementAppearedInViewport(element) {
      this.proposeVisitIfNavigatedWithAction(element, element);
      this.loadSourceURL();
    }
    willSubmitFormLinkToLocation(link) {
      return this.shouldInterceptNavigation(link);
    }
    submittedFormLinkToLocation(link, _location, form) {
      const frame = this.findFrameElement(link);
      if (frame)
        form.setAttribute("data-turbo-frame", frame.id);
    }
    shouldInterceptLinkClick(element, _location, _event) {
      return this.shouldInterceptNavigation(element);
    }
    linkClickIntercepted(element, location2) {
      this.navigateFrame(element, location2);
    }
    willSubmitForm(element, submitter) {
      return element.closest("turbo-frame") == this.element && this.shouldInterceptNavigation(element, submitter);
    }
    formSubmitted(element, submitter) {
      if (this.formSubmission) {
        this.formSubmission.stop();
      }
      this.formSubmission = new FormSubmission(this, element, submitter);
      const { fetchRequest } = this.formSubmission;
      this.prepareRequest(fetchRequest);
      this.formSubmission.start();
    }
    prepareRequest(request) {
      var _a;
      request.headers["Turbo-Frame"] = this.id;
      if ((_a = this.currentNavigationElement) === null || _a === void 0 ? void 0 : _a.hasAttribute("data-turbo-stream")) {
        request.acceptResponseType(StreamMessage.contentType);
      }
    }
    requestStarted(_request) {
      markAsBusy(this.element);
    }
    requestPreventedHandlingResponse(_request, _response) {
      this.resolveVisitPromise();
    }
    async requestSucceededWithResponse(request, response) {
      await this.loadResponse(response);
      this.resolveVisitPromise();
    }
    async requestFailedWithResponse(request, response) {
      await this.loadResponse(response);
      this.resolveVisitPromise();
    }
    requestErrored(request, error2) {
      console.error(error2);
      this.resolveVisitPromise();
    }
    requestFinished(_request) {
      clearBusyState(this.element);
    }
    formSubmissionStarted({ formElement }) {
      markAsBusy(formElement, this.findFrameElement(formElement));
    }
    formSubmissionSucceededWithResponse(formSubmission, response) {
      const frame = this.findFrameElement(formSubmission.formElement, formSubmission.submitter);
      frame.delegate.proposeVisitIfNavigatedWithAction(frame, formSubmission.formElement, formSubmission.submitter);
      frame.delegate.loadResponse(response);
      if (!formSubmission.isSafe) {
        session.clearCache();
      }
    }
    formSubmissionFailedWithResponse(formSubmission, fetchResponse) {
      this.element.delegate.loadResponse(fetchResponse);
      session.clearCache();
    }
    formSubmissionErrored(formSubmission, error2) {
      console.error(error2);
    }
    formSubmissionFinished({ formElement }) {
      clearBusyState(formElement, this.findFrameElement(formElement));
    }
    allowsImmediateRender({ element: newFrame }, options) {
      const event = dispatch("turbo:before-frame-render", {
        target: this.element,
        detail: Object.assign({ newFrame }, options),
        cancelable: true
      });
      const { defaultPrevented, detail: { render } } = event;
      if (this.view.renderer && render) {
        this.view.renderer.renderElement = render;
      }
      return !defaultPrevented;
    }
    viewRenderedSnapshot(_snapshot, _isPreview) {
    }
    preloadOnLoadLinksForView(element) {
      session.preloadOnLoadLinksForView(element);
    }
    viewInvalidated() {
    }
    willRenderFrame(currentElement, _newElement) {
      this.previousFrameElement = currentElement.cloneNode(true);
    }
    async loadFrameResponse(fetchResponse, document2) {
      const newFrameElement = await this.extractForeignFrameElement(document2.body);
      if (newFrameElement) {
        const snapshot = new Snapshot(newFrameElement);
        const renderer = new FrameRenderer(this, this.view.snapshot, snapshot, FrameRenderer.renderElement, false, false);
        if (this.view.renderPromise)
          await this.view.renderPromise;
        this.changeHistory();
        await this.view.render(renderer);
        this.complete = true;
        session.frameRendered(fetchResponse, this.element);
        session.frameLoaded(this.element);
        this.fetchResponseLoaded(fetchResponse);
      } else if (this.willHandleFrameMissingFromResponse(fetchResponse)) {
        this.handleFrameMissingFromResponse(fetchResponse);
      }
    }
    async visit(url) {
      var _a;
      const request = new FetchRequest(this, FetchMethod.get, url, new URLSearchParams(), this.element);
      (_a = this.currentFetchRequest) === null || _a === void 0 ? void 0 : _a.cancel();
      this.currentFetchRequest = request;
      return new Promise((resolve) => {
        this.resolveVisitPromise = () => {
          this.resolveVisitPromise = () => {
          };
          this.currentFetchRequest = null;
          resolve();
        };
        request.perform();
      });
    }
    navigateFrame(element, url, submitter) {
      const frame = this.findFrameElement(element, submitter);
      frame.delegate.proposeVisitIfNavigatedWithAction(frame, element, submitter);
      this.withCurrentNavigationElement(element, () => {
        frame.src = url;
      });
    }
    proposeVisitIfNavigatedWithAction(frame, element, submitter) {
      this.action = getVisitAction(submitter, element, frame);
      if (this.action) {
        const pageSnapshot = PageSnapshot.fromElement(frame).clone();
        const { visitCachedSnapshot } = frame.delegate;
        frame.delegate.fetchResponseLoaded = (fetchResponse) => {
          if (frame.src) {
            const { statusCode, redirected } = fetchResponse;
            const responseHTML = frame.ownerDocument.documentElement.outerHTML;
            const response = { statusCode, redirected, responseHTML };
            const options = {
              response,
              visitCachedSnapshot,
              willRender: false,
              updateHistory: false,
              restorationIdentifier: this.restorationIdentifier,
              snapshot: pageSnapshot
            };
            if (this.action)
              options.action = this.action;
            session.visit(frame.src, options);
          }
        };
      }
    }
    changeHistory() {
      if (this.action) {
        const method = getHistoryMethodForAction(this.action);
        session.history.update(method, expandURL(this.element.src || ""), this.restorationIdentifier);
      }
    }
    async handleUnvisitableFrameResponse(fetchResponse) {
      console.warn(`The response (${fetchResponse.statusCode}) from <turbo-frame id="${this.element.id}"> is performing a full page visit due to turbo-visit-control.`);
      await this.visitResponse(fetchResponse.response);
    }
    willHandleFrameMissingFromResponse(fetchResponse) {
      this.element.setAttribute("complete", "");
      const response = fetchResponse.response;
      const visit2 = async (url, options = {}) => {
        if (url instanceof Response) {
          this.visitResponse(url);
        } else {
          session.visit(url, options);
        }
      };
      const event = dispatch("turbo:frame-missing", {
        target: this.element,
        detail: { response, visit: visit2 },
        cancelable: true
      });
      return !event.defaultPrevented;
    }
    handleFrameMissingFromResponse(fetchResponse) {
      this.view.missing();
      this.throwFrameMissingError(fetchResponse);
    }
    throwFrameMissingError(fetchResponse) {
      const message = `The response (${fetchResponse.statusCode}) did not contain the expected <turbo-frame id="${this.element.id}"> and will be ignored. To perform a full page visit instead, set turbo-visit-control to reload.`;
      throw new TurboFrameMissingError(message);
    }
    async visitResponse(response) {
      const wrapped = new FetchResponse(response);
      const responseHTML = await wrapped.responseHTML;
      const { location: location2, redirected, statusCode } = wrapped;
      return session.visit(location2, { response: { redirected, statusCode, responseHTML } });
    }
    findFrameElement(element, submitter) {
      var _a;
      const id = getAttribute("data-turbo-frame", submitter, element) || this.element.getAttribute("target");
      return (_a = getFrameElementById(id)) !== null && _a !== void 0 ? _a : this.element;
    }
    async extractForeignFrameElement(container) {
      let element;
      const id = CSS.escape(this.id);
      try {
        element = activateElement(container.querySelector(`turbo-frame#${id}`), this.sourceURL);
        if (element) {
          return element;
        }
        element = activateElement(container.querySelector(`turbo-frame[src][recurse~=${id}]`), this.sourceURL);
        if (element) {
          await element.loaded;
          return await this.extractForeignFrameElement(element);
        }
      } catch (error2) {
        console.error(error2);
        return new FrameElement();
      }
      return null;
    }
    formActionIsVisitable(form, submitter) {
      const action = getAction(form, submitter);
      return locationIsVisitable(expandURL(action), this.rootLocation);
    }
    shouldInterceptNavigation(element, submitter) {
      const id = getAttribute("data-turbo-frame", submitter, element) || this.element.getAttribute("target");
      if (element instanceof HTMLFormElement && !this.formActionIsVisitable(element, submitter)) {
        return false;
      }
      if (!this.enabled || id == "_top") {
        return false;
      }
      if (id) {
        const frameElement = getFrameElementById(id);
        if (frameElement) {
          return !frameElement.disabled;
        }
      }
      if (!session.elementIsNavigatable(element)) {
        return false;
      }
      if (submitter && !session.elementIsNavigatable(submitter)) {
        return false;
      }
      return true;
    }
    get id() {
      return this.element.id;
    }
    get enabled() {
      return !this.element.disabled;
    }
    get sourceURL() {
      if (this.element.src) {
        return this.element.src;
      }
    }
    set sourceURL(sourceURL) {
      this.ignoringChangesToAttribute("src", () => {
        this.element.src = sourceURL !== null && sourceURL !== void 0 ? sourceURL : null;
      });
    }
    get loadingStyle() {
      return this.element.loading;
    }
    get isLoading() {
      return this.formSubmission !== void 0 || this.resolveVisitPromise() !== void 0;
    }
    get complete() {
      return this.element.hasAttribute("complete");
    }
    set complete(value) {
      this.ignoringChangesToAttribute("complete", () => {
        if (value) {
          this.element.setAttribute("complete", "");
        } else {
          this.element.removeAttribute("complete");
        }
      });
    }
    get isActive() {
      return this.element.isActive && this.connected;
    }
    get rootLocation() {
      var _a;
      const meta = this.element.ownerDocument.querySelector(`meta[name="turbo-root"]`);
      const root = (_a = meta === null || meta === void 0 ? void 0 : meta.content) !== null && _a !== void 0 ? _a : "/";
      return expandURL(root);
    }
    isIgnoringChangesTo(attributeName) {
      return this.ignoredAttributes.has(attributeName);
    }
    ignoringChangesToAttribute(attributeName, callback) {
      this.ignoredAttributes.add(attributeName);
      callback();
      this.ignoredAttributes.delete(attributeName);
    }
    withCurrentNavigationElement(element, callback) {
      this.currentNavigationElement = element;
      callback();
      delete this.currentNavigationElement;
    }
  };
  function getFrameElementById(id) {
    if (id != null) {
      const element = document.getElementById(id);
      if (element instanceof FrameElement) {
        return element;
      }
    }
  }
  function activateElement(element, currentURL) {
    if (element) {
      const src = element.getAttribute("src");
      if (src != null && currentURL != null && urlsAreEqual(src, currentURL)) {
        throw new Error(`Matching <turbo-frame id="${element.id}"> element has a source URL which references itself`);
      }
      if (element.ownerDocument !== document) {
        element = document.importNode(element, true);
      }
      if (element instanceof FrameElement) {
        element.connectedCallback();
        element.disconnectedCallback();
        return element;
      }
    }
  }
  var StreamElement = class extends HTMLElement {
    static async renderElement(newElement) {
      await newElement.performAction();
    }
    async connectedCallback() {
      try {
        await this.render();
      } catch (error2) {
        console.error(error2);
      } finally {
        this.disconnect();
      }
    }
    async render() {
      var _a;
      return (_a = this.renderPromise) !== null && _a !== void 0 ? _a : this.renderPromise = (async () => {
        const event = this.beforeRenderEvent;
        if (this.dispatchEvent(event)) {
          await nextAnimationFrame();
          await event.detail.render(this);
        }
      })();
    }
    disconnect() {
      try {
        this.remove();
      } catch (_a) {
      }
    }
    removeDuplicateTargetChildren() {
      this.duplicateChildren.forEach((c) => c.remove());
    }
    get duplicateChildren() {
      var _a;
      const existingChildren = this.targetElements.flatMap((e) => [...e.children]).filter((c) => !!c.id);
      const newChildrenIds = [...((_a = this.templateContent) === null || _a === void 0 ? void 0 : _a.children) || []].filter((c) => !!c.id).map((c) => c.id);
      return existingChildren.filter((c) => newChildrenIds.includes(c.id));
    }
    get performAction() {
      if (this.action) {
        const actionFunction = StreamActions[this.action];
        if (actionFunction) {
          return actionFunction;
        }
        this.raise("unknown action");
      }
      this.raise("action attribute is missing");
    }
    get targetElements() {
      if (this.target) {
        return this.targetElementsById;
      } else if (this.targets) {
        return this.targetElementsByQuery;
      } else {
        this.raise("target or targets attribute is missing");
      }
    }
    get templateContent() {
      return this.templateElement.content.cloneNode(true);
    }
    get templateElement() {
      if (this.firstElementChild === null) {
        const template = this.ownerDocument.createElement("template");
        this.appendChild(template);
        return template;
      } else if (this.firstElementChild instanceof HTMLTemplateElement) {
        return this.firstElementChild;
      }
      this.raise("first child element must be a <template> element");
    }
    get action() {
      return this.getAttribute("action");
    }
    get target() {
      return this.getAttribute("target");
    }
    get targets() {
      return this.getAttribute("targets");
    }
    raise(message) {
      throw new Error(`${this.description}: ${message}`);
    }
    get description() {
      var _a, _b;
      return (_b = ((_a = this.outerHTML.match(/<[^>]+>/)) !== null && _a !== void 0 ? _a : [])[0]) !== null && _b !== void 0 ? _b : "<turbo-stream>";
    }
    get beforeRenderEvent() {
      return new CustomEvent("turbo:before-stream-render", {
        bubbles: true,
        cancelable: true,
        detail: { newStream: this, render: StreamElement.renderElement }
      });
    }
    get targetElementsById() {
      var _a;
      const element = (_a = this.ownerDocument) === null || _a === void 0 ? void 0 : _a.getElementById(this.target);
      if (element !== null) {
        return [element];
      } else {
        return [];
      }
    }
    get targetElementsByQuery() {
      var _a;
      const elements = (_a = this.ownerDocument) === null || _a === void 0 ? void 0 : _a.querySelectorAll(this.targets);
      if (elements.length !== 0) {
        return Array.prototype.slice.call(elements);
      } else {
        return [];
      }
    }
  };
  var StreamSourceElement = class extends HTMLElement {
    constructor() {
      super(...arguments);
      this.streamSource = null;
    }
    connectedCallback() {
      this.streamSource = this.src.match(/^ws{1,2}:/) ? new WebSocket(this.src) : new EventSource(this.src);
      connectStreamSource(this.streamSource);
    }
    disconnectedCallback() {
      if (this.streamSource) {
        disconnectStreamSource(this.streamSource);
      }
    }
    get src() {
      return this.getAttribute("src") || "";
    }
  };
  FrameElement.delegateConstructor = FrameController;
  if (customElements.get("turbo-frame") === void 0) {
    customElements.define("turbo-frame", FrameElement);
  }
  if (customElements.get("turbo-stream") === void 0) {
    customElements.define("turbo-stream", StreamElement);
  }
  if (customElements.get("turbo-stream-source") === void 0) {
    customElements.define("turbo-stream-source", StreamSourceElement);
  }
  (() => {
    let element = document.currentScript;
    if (!element)
      return;
    if (element.hasAttribute("data-turbo-suppress-warning"))
      return;
    element = element.parentElement;
    while (element) {
      if (element == document.body) {
        return console.warn(unindent`
        You are loading Turbo from a <script> element inside the <body> element. This is probably not what you meant to do!

        Load your application’s JavaScript bundle inside the <head> element instead. <script> elements in <body> are evaluated with each page change.

        For more information, see: https://turbo.hotwired.dev/handbook/building#working-with-script-elements

        ——
        Suppress this warning by adding a "data-turbo-suppress-warning" attribute to: %s
      `, element.outerHTML);
      }
      element = element.parentElement;
    }
  })();
  window.Turbo = Turbo2;
  start();

  // node_modules/@hotwired/turbo-rails/app/javascript/turbo/cable.js
  var consumer;
  async function getConsumer() {
    return consumer || setConsumer(createConsumer2().then(setConsumer));
  }
  function setConsumer(newConsumer) {
    return consumer = newConsumer;
  }
  async function createConsumer2() {
    const { createConsumer: createConsumer3 } = await Promise.resolve().then(() => (init_src(), src_exports));
    return createConsumer3();
  }
  async function subscribeTo(channel, mixin) {
    const { subscriptions } = await getConsumer();
    return subscriptions.create(channel, mixin);
  }

  // node_modules/@hotwired/turbo-rails/app/javascript/turbo/snakeize.js
  function walk(obj) {
    if (!obj || typeof obj !== "object")
      return obj;
    if (obj instanceof Date || obj instanceof RegExp)
      return obj;
    if (Array.isArray(obj))
      return obj.map(walk);
    return Object.keys(obj).reduce(function(acc, key) {
      var camel = key[0].toLowerCase() + key.slice(1).replace(/([A-Z]+)/g, function(m, x) {
        return "_" + x.toLowerCase();
      });
      acc[camel] = walk(obj[key]);
      return acc;
    }, {});
  }

  // node_modules/@hotwired/turbo-rails/app/javascript/turbo/cable_stream_source_element.js
  var TurboCableStreamSourceElement = class extends HTMLElement {
    async connectedCallback() {
      connectStreamSource(this);
      this.subscription = await subscribeTo(this.channel, {
        received: this.dispatchMessageEvent.bind(this),
        connected: this.subscriptionConnected.bind(this),
        disconnected: this.subscriptionDisconnected.bind(this)
      });
    }
    disconnectedCallback() {
      disconnectStreamSource(this);
      if (this.subscription)
        this.subscription.unsubscribe();
    }
    dispatchMessageEvent(data) {
      const event = new MessageEvent("message", { data });
      return this.dispatchEvent(event);
    }
    subscriptionConnected() {
      this.setAttribute("connected", "");
    }
    subscriptionDisconnected() {
      this.removeAttribute("connected");
    }
    get channel() {
      const channel = this.getAttribute("channel");
      const signed_stream_name = this.getAttribute("signed-stream-name");
      return { channel, signed_stream_name, ...walk({ ...this.dataset }) };
    }
  };
  if (customElements.get("turbo-cable-stream-source") === void 0) {
    customElements.define("turbo-cable-stream-source", TurboCableStreamSourceElement);
  }

  // node_modules/@hotwired/turbo-rails/app/javascript/turbo/fetch_requests.js
  function encodeMethodIntoRequestBody(event) {
    if (event.target instanceof HTMLFormElement) {
      const { target: form, detail: { fetchOptions } } = event;
      form.addEventListener("turbo:submit-start", ({ detail: { formSubmission: { submitter } } }) => {
        const body = isBodyInit(fetchOptions.body) ? fetchOptions.body : new URLSearchParams();
        const method = determineFetchMethod(submitter, body, form);
        if (!/get/i.test(method)) {
          if (/post/i.test(method)) {
            body.delete("_method");
          } else {
            body.set("_method", method);
          }
          fetchOptions.method = "post";
        }
      }, { once: true });
    }
  }
  function determineFetchMethod(submitter, body, form) {
    const formMethod = determineFormMethod(submitter);
    const overrideMethod = body.get("_method");
    const method = form.getAttribute("method") || "get";
    if (typeof formMethod == "string") {
      return formMethod;
    } else if (typeof overrideMethod == "string") {
      return overrideMethod;
    } else {
      return method;
    }
  }
  function determineFormMethod(submitter) {
    if (submitter instanceof HTMLButtonElement || submitter instanceof HTMLInputElement) {
      if (submitter.hasAttribute("formmethod")) {
        return submitter.formMethod;
      } else {
        return null;
      }
    } else {
      return null;
    }
  }
  function isBodyInit(body) {
    return body instanceof FormData || body instanceof URLSearchParams;
  }

  // node_modules/@hotwired/turbo-rails/app/javascript/turbo/index.js
  addEventListener("turbo:before-fetch-request", encodeMethodIntoRequestBody);

  // node_modules/@hotwired/stimulus/dist/stimulus.js
  var EventListener = class {
    constructor(eventTarget, eventName, eventOptions) {
      this.eventTarget = eventTarget;
      this.eventName = eventName;
      this.eventOptions = eventOptions;
      this.unorderedBindings = /* @__PURE__ */ new Set();
    }
    connect() {
      this.eventTarget.addEventListener(this.eventName, this, this.eventOptions);
    }
    disconnect() {
      this.eventTarget.removeEventListener(this.eventName, this, this.eventOptions);
    }
    bindingConnected(binding) {
      this.unorderedBindings.add(binding);
    }
    bindingDisconnected(binding) {
      this.unorderedBindings.delete(binding);
    }
    handleEvent(event) {
      const extendedEvent = extendEvent(event);
      for (const binding of this.bindings) {
        if (extendedEvent.immediatePropagationStopped) {
          break;
        } else {
          binding.handleEvent(extendedEvent);
        }
      }
    }
    hasBindings() {
      return this.unorderedBindings.size > 0;
    }
    get bindings() {
      return Array.from(this.unorderedBindings).sort((left2, right2) => {
        const leftIndex = left2.index, rightIndex = right2.index;
        return leftIndex < rightIndex ? -1 : leftIndex > rightIndex ? 1 : 0;
      });
    }
  };
  function extendEvent(event) {
    if ("immediatePropagationStopped" in event) {
      return event;
    } else {
      const { stopImmediatePropagation } = event;
      return Object.assign(event, {
        immediatePropagationStopped: false,
        stopImmediatePropagation() {
          this.immediatePropagationStopped = true;
          stopImmediatePropagation.call(this);
        }
      });
    }
  }
  var Dispatcher = class {
    constructor(application2) {
      this.application = application2;
      this.eventListenerMaps = /* @__PURE__ */ new Map();
      this.started = false;
    }
    start() {
      if (!this.started) {
        this.started = true;
        this.eventListeners.forEach((eventListener) => eventListener.connect());
      }
    }
    stop() {
      if (this.started) {
        this.started = false;
        this.eventListeners.forEach((eventListener) => eventListener.disconnect());
      }
    }
    get eventListeners() {
      return Array.from(this.eventListenerMaps.values()).reduce((listeners, map) => listeners.concat(Array.from(map.values())), []);
    }
    bindingConnected(binding) {
      this.fetchEventListenerForBinding(binding).bindingConnected(binding);
    }
    bindingDisconnected(binding, clearEventListeners = false) {
      this.fetchEventListenerForBinding(binding).bindingDisconnected(binding);
      if (clearEventListeners)
        this.clearEventListenersForBinding(binding);
    }
    handleError(error2, message, detail = {}) {
      this.application.handleError(error2, `Error ${message}`, detail);
    }
    clearEventListenersForBinding(binding) {
      const eventListener = this.fetchEventListenerForBinding(binding);
      if (!eventListener.hasBindings()) {
        eventListener.disconnect();
        this.removeMappedEventListenerFor(binding);
      }
    }
    removeMappedEventListenerFor(binding) {
      const { eventTarget, eventName, eventOptions } = binding;
      const eventListenerMap = this.fetchEventListenerMapForEventTarget(eventTarget);
      const cacheKey = this.cacheKey(eventName, eventOptions);
      eventListenerMap.delete(cacheKey);
      if (eventListenerMap.size == 0)
        this.eventListenerMaps.delete(eventTarget);
    }
    fetchEventListenerForBinding(binding) {
      const { eventTarget, eventName, eventOptions } = binding;
      return this.fetchEventListener(eventTarget, eventName, eventOptions);
    }
    fetchEventListener(eventTarget, eventName, eventOptions) {
      const eventListenerMap = this.fetchEventListenerMapForEventTarget(eventTarget);
      const cacheKey = this.cacheKey(eventName, eventOptions);
      let eventListener = eventListenerMap.get(cacheKey);
      if (!eventListener) {
        eventListener = this.createEventListener(eventTarget, eventName, eventOptions);
        eventListenerMap.set(cacheKey, eventListener);
      }
      return eventListener;
    }
    createEventListener(eventTarget, eventName, eventOptions) {
      const eventListener = new EventListener(eventTarget, eventName, eventOptions);
      if (this.started) {
        eventListener.connect();
      }
      return eventListener;
    }
    fetchEventListenerMapForEventTarget(eventTarget) {
      let eventListenerMap = this.eventListenerMaps.get(eventTarget);
      if (!eventListenerMap) {
        eventListenerMap = /* @__PURE__ */ new Map();
        this.eventListenerMaps.set(eventTarget, eventListenerMap);
      }
      return eventListenerMap;
    }
    cacheKey(eventName, eventOptions) {
      const parts = [eventName];
      Object.keys(eventOptions).sort().forEach((key) => {
        parts.push(`${eventOptions[key] ? "" : "!"}${key}`);
      });
      return parts.join(":");
    }
  };
  var defaultActionDescriptorFilters = {
    stop({ event, value }) {
      if (value)
        event.stopPropagation();
      return true;
    },
    prevent({ event, value }) {
      if (value)
        event.preventDefault();
      return true;
    },
    self({ event, value, element }) {
      if (value) {
        return element === event.target;
      } else {
        return true;
      }
    }
  };
  var descriptorPattern = /^(?:(?:([^.]+?)\+)?(.+?)(?:\.(.+?))?(?:@(window|document))?->)?(.+?)(?:#([^:]+?))(?::(.+))?$/;
  function parseActionDescriptorString(descriptorString) {
    const source = descriptorString.trim();
    const matches = source.match(descriptorPattern) || [];
    let eventName = matches[2];
    let keyFilter = matches[3];
    if (keyFilter && !["keydown", "keyup", "keypress"].includes(eventName)) {
      eventName += `.${keyFilter}`;
      keyFilter = "";
    }
    return {
      eventTarget: parseEventTarget(matches[4]),
      eventName,
      eventOptions: matches[7] ? parseEventOptions(matches[7]) : {},
      identifier: matches[5],
      methodName: matches[6],
      keyFilter: matches[1] || keyFilter
    };
  }
  function parseEventTarget(eventTargetName) {
    if (eventTargetName == "window") {
      return window;
    } else if (eventTargetName == "document") {
      return document;
    }
  }
  function parseEventOptions(eventOptions) {
    return eventOptions.split(":").reduce((options, token) => Object.assign(options, { [token.replace(/^!/, "")]: !/^!/.test(token) }), {});
  }
  function stringifyEventTarget(eventTarget) {
    if (eventTarget == window) {
      return "window";
    } else if (eventTarget == document) {
      return "document";
    }
  }
  function camelize(value) {
    return value.replace(/(?:[_-])([a-z0-9])/g, (_, char) => char.toUpperCase());
  }
  function namespaceCamelize(value) {
    return camelize(value.replace(/--/g, "-").replace(/__/g, "_"));
  }
  function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
  function dasherize(value) {
    return value.replace(/([A-Z])/g, (_, char) => `-${char.toLowerCase()}`);
  }
  function tokenize(value) {
    return value.match(/[^\s]+/g) || [];
  }
  function isSomething(object) {
    return object !== null && object !== void 0;
  }
  function hasProperty(object, property) {
    return Object.prototype.hasOwnProperty.call(object, property);
  }
  var allModifiers = ["meta", "ctrl", "alt", "shift"];
  var Action = class {
    constructor(element, index, descriptor, schema) {
      this.element = element;
      this.index = index;
      this.eventTarget = descriptor.eventTarget || element;
      this.eventName = descriptor.eventName || getDefaultEventNameForElement(element) || error("missing event name");
      this.eventOptions = descriptor.eventOptions || {};
      this.identifier = descriptor.identifier || error("missing identifier");
      this.methodName = descriptor.methodName || error("missing method name");
      this.keyFilter = descriptor.keyFilter || "";
      this.schema = schema;
    }
    static forToken(token, schema) {
      return new this(token.element, token.index, parseActionDescriptorString(token.content), schema);
    }
    toString() {
      const eventFilter = this.keyFilter ? `.${this.keyFilter}` : "";
      const eventTarget = this.eventTargetName ? `@${this.eventTargetName}` : "";
      return `${this.eventName}${eventFilter}${eventTarget}->${this.identifier}#${this.methodName}`;
    }
    shouldIgnoreKeyboardEvent(event) {
      if (!this.keyFilter) {
        return false;
      }
      const filters = this.keyFilter.split("+");
      if (this.keyFilterDissatisfied(event, filters)) {
        return true;
      }
      const standardFilter = filters.filter((key) => !allModifiers.includes(key))[0];
      if (!standardFilter) {
        return false;
      }
      if (!hasProperty(this.keyMappings, standardFilter)) {
        error(`contains unknown key filter: ${this.keyFilter}`);
      }
      return this.keyMappings[standardFilter].toLowerCase() !== event.key.toLowerCase();
    }
    shouldIgnoreMouseEvent(event) {
      if (!this.keyFilter) {
        return false;
      }
      const filters = [this.keyFilter];
      if (this.keyFilterDissatisfied(event, filters)) {
        return true;
      }
      return false;
    }
    get params() {
      const params = {};
      const pattern = new RegExp(`^data-${this.identifier}-(.+)-param$`, "i");
      for (const { name, value } of Array.from(this.element.attributes)) {
        const match = name.match(pattern);
        const key = match && match[1];
        if (key) {
          params[camelize(key)] = typecast(value);
        }
      }
      return params;
    }
    get eventTargetName() {
      return stringifyEventTarget(this.eventTarget);
    }
    get keyMappings() {
      return this.schema.keyMappings;
    }
    keyFilterDissatisfied(event, filters) {
      const [meta, ctrl, alt, shift] = allModifiers.map((modifier) => filters.includes(modifier));
      return event.metaKey !== meta || event.ctrlKey !== ctrl || event.altKey !== alt || event.shiftKey !== shift;
    }
  };
  var defaultEventNames = {
    a: () => "click",
    button: () => "click",
    form: () => "submit",
    details: () => "toggle",
    input: (e) => e.getAttribute("type") == "submit" ? "click" : "input",
    select: () => "change",
    textarea: () => "input"
  };
  function getDefaultEventNameForElement(element) {
    const tagName = element.tagName.toLowerCase();
    if (tagName in defaultEventNames) {
      return defaultEventNames[tagName](element);
    }
  }
  function error(message) {
    throw new Error(message);
  }
  function typecast(value) {
    try {
      return JSON.parse(value);
    } catch (o_O) {
      return value;
    }
  }
  var Binding = class {
    constructor(context, action) {
      this.context = context;
      this.action = action;
    }
    get index() {
      return this.action.index;
    }
    get eventTarget() {
      return this.action.eventTarget;
    }
    get eventOptions() {
      return this.action.eventOptions;
    }
    get identifier() {
      return this.context.identifier;
    }
    handleEvent(event) {
      const actionEvent = this.prepareActionEvent(event);
      if (this.willBeInvokedByEvent(event) && this.applyEventModifiers(actionEvent)) {
        this.invokeWithEvent(actionEvent);
      }
    }
    get eventName() {
      return this.action.eventName;
    }
    get method() {
      const method = this.controller[this.methodName];
      if (typeof method == "function") {
        return method;
      }
      throw new Error(`Action "${this.action}" references undefined method "${this.methodName}"`);
    }
    applyEventModifiers(event) {
      const { element } = this.action;
      const { actionDescriptorFilters } = this.context.application;
      const { controller } = this.context;
      let passes = true;
      for (const [name, value] of Object.entries(this.eventOptions)) {
        if (name in actionDescriptorFilters) {
          const filter = actionDescriptorFilters[name];
          passes = passes && filter({ name, value, event, element, controller });
        } else {
          continue;
        }
      }
      return passes;
    }
    prepareActionEvent(event) {
      return Object.assign(event, { params: this.action.params });
    }
    invokeWithEvent(event) {
      const { target, currentTarget } = event;
      try {
        this.method.call(this.controller, event);
        this.context.logDebugActivity(this.methodName, { event, target, currentTarget, action: this.methodName });
      } catch (error2) {
        const { identifier, controller, element, index } = this;
        const detail = { identifier, controller, element, index, event };
        this.context.handleError(error2, `invoking action "${this.action}"`, detail);
      }
    }
    willBeInvokedByEvent(event) {
      const eventTarget = event.target;
      if (event instanceof KeyboardEvent && this.action.shouldIgnoreKeyboardEvent(event)) {
        return false;
      }
      if (event instanceof MouseEvent && this.action.shouldIgnoreMouseEvent(event)) {
        return false;
      }
      if (this.element === eventTarget) {
        return true;
      } else if (eventTarget instanceof Element && this.element.contains(eventTarget)) {
        return this.scope.containsElement(eventTarget);
      } else {
        return this.scope.containsElement(this.action.element);
      }
    }
    get controller() {
      return this.context.controller;
    }
    get methodName() {
      return this.action.methodName;
    }
    get element() {
      return this.scope.element;
    }
    get scope() {
      return this.context.scope;
    }
  };
  var ElementObserver = class {
    constructor(element, delegate) {
      this.mutationObserverInit = { attributes: true, childList: true, subtree: true };
      this.element = element;
      this.started = false;
      this.delegate = delegate;
      this.elements = /* @__PURE__ */ new Set();
      this.mutationObserver = new MutationObserver((mutations) => this.processMutations(mutations));
    }
    start() {
      if (!this.started) {
        this.started = true;
        this.mutationObserver.observe(this.element, this.mutationObserverInit);
        this.refresh();
      }
    }
    pause(callback) {
      if (this.started) {
        this.mutationObserver.disconnect();
        this.started = false;
      }
      callback();
      if (!this.started) {
        this.mutationObserver.observe(this.element, this.mutationObserverInit);
        this.started = true;
      }
    }
    stop() {
      if (this.started) {
        this.mutationObserver.takeRecords();
        this.mutationObserver.disconnect();
        this.started = false;
      }
    }
    refresh() {
      if (this.started) {
        const matches = new Set(this.matchElementsInTree());
        for (const element of Array.from(this.elements)) {
          if (!matches.has(element)) {
            this.removeElement(element);
          }
        }
        for (const element of Array.from(matches)) {
          this.addElement(element);
        }
      }
    }
    processMutations(mutations) {
      if (this.started) {
        for (const mutation of mutations) {
          this.processMutation(mutation);
        }
      }
    }
    processMutation(mutation) {
      if (mutation.type == "attributes") {
        this.processAttributeChange(mutation.target, mutation.attributeName);
      } else if (mutation.type == "childList") {
        this.processRemovedNodes(mutation.removedNodes);
        this.processAddedNodes(mutation.addedNodes);
      }
    }
    processAttributeChange(element, attributeName) {
      if (this.elements.has(element)) {
        if (this.delegate.elementAttributeChanged && this.matchElement(element)) {
          this.delegate.elementAttributeChanged(element, attributeName);
        } else {
          this.removeElement(element);
        }
      } else if (this.matchElement(element)) {
        this.addElement(element);
      }
    }
    processRemovedNodes(nodes) {
      for (const node of Array.from(nodes)) {
        const element = this.elementFromNode(node);
        if (element) {
          this.processTree(element, this.removeElement);
        }
      }
    }
    processAddedNodes(nodes) {
      for (const node of Array.from(nodes)) {
        const element = this.elementFromNode(node);
        if (element && this.elementIsActive(element)) {
          this.processTree(element, this.addElement);
        }
      }
    }
    matchElement(element) {
      return this.delegate.matchElement(element);
    }
    matchElementsInTree(tree = this.element) {
      return this.delegate.matchElementsInTree(tree);
    }
    processTree(tree, processor) {
      for (const element of this.matchElementsInTree(tree)) {
        processor.call(this, element);
      }
    }
    elementFromNode(node) {
      if (node.nodeType == Node.ELEMENT_NODE) {
        return node;
      }
    }
    elementIsActive(element) {
      if (element.isConnected != this.element.isConnected) {
        return false;
      } else {
        return this.element.contains(element);
      }
    }
    addElement(element) {
      if (!this.elements.has(element)) {
        if (this.elementIsActive(element)) {
          this.elements.add(element);
          if (this.delegate.elementMatched) {
            this.delegate.elementMatched(element);
          }
        }
      }
    }
    removeElement(element) {
      if (this.elements.has(element)) {
        this.elements.delete(element);
        if (this.delegate.elementUnmatched) {
          this.delegate.elementUnmatched(element);
        }
      }
    }
  };
  var AttributeObserver = class {
    constructor(element, attributeName, delegate) {
      this.attributeName = attributeName;
      this.delegate = delegate;
      this.elementObserver = new ElementObserver(element, this);
    }
    get element() {
      return this.elementObserver.element;
    }
    get selector() {
      return `[${this.attributeName}]`;
    }
    start() {
      this.elementObserver.start();
    }
    pause(callback) {
      this.elementObserver.pause(callback);
    }
    stop() {
      this.elementObserver.stop();
    }
    refresh() {
      this.elementObserver.refresh();
    }
    get started() {
      return this.elementObserver.started;
    }
    matchElement(element) {
      return element.hasAttribute(this.attributeName);
    }
    matchElementsInTree(tree) {
      const match = this.matchElement(tree) ? [tree] : [];
      const matches = Array.from(tree.querySelectorAll(this.selector));
      return match.concat(matches);
    }
    elementMatched(element) {
      if (this.delegate.elementMatchedAttribute) {
        this.delegate.elementMatchedAttribute(element, this.attributeName);
      }
    }
    elementUnmatched(element) {
      if (this.delegate.elementUnmatchedAttribute) {
        this.delegate.elementUnmatchedAttribute(element, this.attributeName);
      }
    }
    elementAttributeChanged(element, attributeName) {
      if (this.delegate.elementAttributeValueChanged && this.attributeName == attributeName) {
        this.delegate.elementAttributeValueChanged(element, attributeName);
      }
    }
  };
  function add(map, key, value) {
    fetch2(map, key).add(value);
  }
  function del(map, key, value) {
    fetch2(map, key).delete(value);
    prune(map, key);
  }
  function fetch2(map, key) {
    let values = map.get(key);
    if (!values) {
      values = /* @__PURE__ */ new Set();
      map.set(key, values);
    }
    return values;
  }
  function prune(map, key) {
    const values = map.get(key);
    if (values != null && values.size == 0) {
      map.delete(key);
    }
  }
  var Multimap = class {
    constructor() {
      this.valuesByKey = /* @__PURE__ */ new Map();
    }
    get keys() {
      return Array.from(this.valuesByKey.keys());
    }
    get values() {
      const sets = Array.from(this.valuesByKey.values());
      return sets.reduce((values, set) => values.concat(Array.from(set)), []);
    }
    get size() {
      const sets = Array.from(this.valuesByKey.values());
      return sets.reduce((size, set) => size + set.size, 0);
    }
    add(key, value) {
      add(this.valuesByKey, key, value);
    }
    delete(key, value) {
      del(this.valuesByKey, key, value);
    }
    has(key, value) {
      const values = this.valuesByKey.get(key);
      return values != null && values.has(value);
    }
    hasKey(key) {
      return this.valuesByKey.has(key);
    }
    hasValue(value) {
      const sets = Array.from(this.valuesByKey.values());
      return sets.some((set) => set.has(value));
    }
    getValuesForKey(key) {
      const values = this.valuesByKey.get(key);
      return values ? Array.from(values) : [];
    }
    getKeysForValue(value) {
      return Array.from(this.valuesByKey).filter(([_key, values]) => values.has(value)).map(([key, _values]) => key);
    }
  };
  var SelectorObserver = class {
    constructor(element, selector, delegate, details) {
      this._selector = selector;
      this.details = details;
      this.elementObserver = new ElementObserver(element, this);
      this.delegate = delegate;
      this.matchesByElement = new Multimap();
    }
    get started() {
      return this.elementObserver.started;
    }
    get selector() {
      return this._selector;
    }
    set selector(selector) {
      this._selector = selector;
      this.refresh();
    }
    start() {
      this.elementObserver.start();
    }
    pause(callback) {
      this.elementObserver.pause(callback);
    }
    stop() {
      this.elementObserver.stop();
    }
    refresh() {
      this.elementObserver.refresh();
    }
    get element() {
      return this.elementObserver.element;
    }
    matchElement(element) {
      const { selector } = this;
      if (selector) {
        const matches = element.matches(selector);
        if (this.delegate.selectorMatchElement) {
          return matches && this.delegate.selectorMatchElement(element, this.details);
        }
        return matches;
      } else {
        return false;
      }
    }
    matchElementsInTree(tree) {
      const { selector } = this;
      if (selector) {
        const match = this.matchElement(tree) ? [tree] : [];
        const matches = Array.from(tree.querySelectorAll(selector)).filter((match2) => this.matchElement(match2));
        return match.concat(matches);
      } else {
        return [];
      }
    }
    elementMatched(element) {
      const { selector } = this;
      if (selector) {
        this.selectorMatched(element, selector);
      }
    }
    elementUnmatched(element) {
      const selectors = this.matchesByElement.getKeysForValue(element);
      for (const selector of selectors) {
        this.selectorUnmatched(element, selector);
      }
    }
    elementAttributeChanged(element, _attributeName) {
      const { selector } = this;
      if (selector) {
        const matches = this.matchElement(element);
        const matchedBefore = this.matchesByElement.has(selector, element);
        if (matches && !matchedBefore) {
          this.selectorMatched(element, selector);
        } else if (!matches && matchedBefore) {
          this.selectorUnmatched(element, selector);
        }
      }
    }
    selectorMatched(element, selector) {
      this.delegate.selectorMatched(element, selector, this.details);
      this.matchesByElement.add(selector, element);
    }
    selectorUnmatched(element, selector) {
      this.delegate.selectorUnmatched(element, selector, this.details);
      this.matchesByElement.delete(selector, element);
    }
  };
  var StringMapObserver = class {
    constructor(element, delegate) {
      this.element = element;
      this.delegate = delegate;
      this.started = false;
      this.stringMap = /* @__PURE__ */ new Map();
      this.mutationObserver = new MutationObserver((mutations) => this.processMutations(mutations));
    }
    start() {
      if (!this.started) {
        this.started = true;
        this.mutationObserver.observe(this.element, { attributes: true, attributeOldValue: true });
        this.refresh();
      }
    }
    stop() {
      if (this.started) {
        this.mutationObserver.takeRecords();
        this.mutationObserver.disconnect();
        this.started = false;
      }
    }
    refresh() {
      if (this.started) {
        for (const attributeName of this.knownAttributeNames) {
          this.refreshAttribute(attributeName, null);
        }
      }
    }
    processMutations(mutations) {
      if (this.started) {
        for (const mutation of mutations) {
          this.processMutation(mutation);
        }
      }
    }
    processMutation(mutation) {
      const attributeName = mutation.attributeName;
      if (attributeName) {
        this.refreshAttribute(attributeName, mutation.oldValue);
      }
    }
    refreshAttribute(attributeName, oldValue) {
      const key = this.delegate.getStringMapKeyForAttribute(attributeName);
      if (key != null) {
        if (!this.stringMap.has(attributeName)) {
          this.stringMapKeyAdded(key, attributeName);
        }
        const value = this.element.getAttribute(attributeName);
        if (this.stringMap.get(attributeName) != value) {
          this.stringMapValueChanged(value, key, oldValue);
        }
        if (value == null) {
          const oldValue2 = this.stringMap.get(attributeName);
          this.stringMap.delete(attributeName);
          if (oldValue2)
            this.stringMapKeyRemoved(key, attributeName, oldValue2);
        } else {
          this.stringMap.set(attributeName, value);
        }
      }
    }
    stringMapKeyAdded(key, attributeName) {
      if (this.delegate.stringMapKeyAdded) {
        this.delegate.stringMapKeyAdded(key, attributeName);
      }
    }
    stringMapValueChanged(value, key, oldValue) {
      if (this.delegate.stringMapValueChanged) {
        this.delegate.stringMapValueChanged(value, key, oldValue);
      }
    }
    stringMapKeyRemoved(key, attributeName, oldValue) {
      if (this.delegate.stringMapKeyRemoved) {
        this.delegate.stringMapKeyRemoved(key, attributeName, oldValue);
      }
    }
    get knownAttributeNames() {
      return Array.from(new Set(this.currentAttributeNames.concat(this.recordedAttributeNames)));
    }
    get currentAttributeNames() {
      return Array.from(this.element.attributes).map((attribute) => attribute.name);
    }
    get recordedAttributeNames() {
      return Array.from(this.stringMap.keys());
    }
  };
  var TokenListObserver = class {
    constructor(element, attributeName, delegate) {
      this.attributeObserver = new AttributeObserver(element, attributeName, this);
      this.delegate = delegate;
      this.tokensByElement = new Multimap();
    }
    get started() {
      return this.attributeObserver.started;
    }
    start() {
      this.attributeObserver.start();
    }
    pause(callback) {
      this.attributeObserver.pause(callback);
    }
    stop() {
      this.attributeObserver.stop();
    }
    refresh() {
      this.attributeObserver.refresh();
    }
    get element() {
      return this.attributeObserver.element;
    }
    get attributeName() {
      return this.attributeObserver.attributeName;
    }
    elementMatchedAttribute(element) {
      this.tokensMatched(this.readTokensForElement(element));
    }
    elementAttributeValueChanged(element) {
      const [unmatchedTokens, matchedTokens] = this.refreshTokensForElement(element);
      this.tokensUnmatched(unmatchedTokens);
      this.tokensMatched(matchedTokens);
    }
    elementUnmatchedAttribute(element) {
      this.tokensUnmatched(this.tokensByElement.getValuesForKey(element));
    }
    tokensMatched(tokens) {
      tokens.forEach((token) => this.tokenMatched(token));
    }
    tokensUnmatched(tokens) {
      tokens.forEach((token) => this.tokenUnmatched(token));
    }
    tokenMatched(token) {
      this.delegate.tokenMatched(token);
      this.tokensByElement.add(token.element, token);
    }
    tokenUnmatched(token) {
      this.delegate.tokenUnmatched(token);
      this.tokensByElement.delete(token.element, token);
    }
    refreshTokensForElement(element) {
      const previousTokens = this.tokensByElement.getValuesForKey(element);
      const currentTokens = this.readTokensForElement(element);
      const firstDifferingIndex = zip(previousTokens, currentTokens).findIndex(([previousToken, currentToken]) => !tokensAreEqual(previousToken, currentToken));
      if (firstDifferingIndex == -1) {
        return [[], []];
      } else {
        return [previousTokens.slice(firstDifferingIndex), currentTokens.slice(firstDifferingIndex)];
      }
    }
    readTokensForElement(element) {
      const attributeName = this.attributeName;
      const tokenString = element.getAttribute(attributeName) || "";
      return parseTokenString(tokenString, element, attributeName);
    }
  };
  function parseTokenString(tokenString, element, attributeName) {
    return tokenString.trim().split(/\s+/).filter((content) => content.length).map((content, index) => ({ element, attributeName, content, index }));
  }
  function zip(left2, right2) {
    const length = Math.max(left2.length, right2.length);
    return Array.from({ length }, (_, index) => [left2[index], right2[index]]);
  }
  function tokensAreEqual(left2, right2) {
    return left2 && right2 && left2.index == right2.index && left2.content == right2.content;
  }
  var ValueListObserver = class {
    constructor(element, attributeName, delegate) {
      this.tokenListObserver = new TokenListObserver(element, attributeName, this);
      this.delegate = delegate;
      this.parseResultsByToken = /* @__PURE__ */ new WeakMap();
      this.valuesByTokenByElement = /* @__PURE__ */ new WeakMap();
    }
    get started() {
      return this.tokenListObserver.started;
    }
    start() {
      this.tokenListObserver.start();
    }
    stop() {
      this.tokenListObserver.stop();
    }
    refresh() {
      this.tokenListObserver.refresh();
    }
    get element() {
      return this.tokenListObserver.element;
    }
    get attributeName() {
      return this.tokenListObserver.attributeName;
    }
    tokenMatched(token) {
      const { element } = token;
      const { value } = this.fetchParseResultForToken(token);
      if (value) {
        this.fetchValuesByTokenForElement(element).set(token, value);
        this.delegate.elementMatchedValue(element, value);
      }
    }
    tokenUnmatched(token) {
      const { element } = token;
      const { value } = this.fetchParseResultForToken(token);
      if (value) {
        this.fetchValuesByTokenForElement(element).delete(token);
        this.delegate.elementUnmatchedValue(element, value);
      }
    }
    fetchParseResultForToken(token) {
      let parseResult = this.parseResultsByToken.get(token);
      if (!parseResult) {
        parseResult = this.parseToken(token);
        this.parseResultsByToken.set(token, parseResult);
      }
      return parseResult;
    }
    fetchValuesByTokenForElement(element) {
      let valuesByToken = this.valuesByTokenByElement.get(element);
      if (!valuesByToken) {
        valuesByToken = /* @__PURE__ */ new Map();
        this.valuesByTokenByElement.set(element, valuesByToken);
      }
      return valuesByToken;
    }
    parseToken(token) {
      try {
        const value = this.delegate.parseValueForToken(token);
        return { value };
      } catch (error2) {
        return { error: error2 };
      }
    }
  };
  var BindingObserver = class {
    constructor(context, delegate) {
      this.context = context;
      this.delegate = delegate;
      this.bindingsByAction = /* @__PURE__ */ new Map();
    }
    start() {
      if (!this.valueListObserver) {
        this.valueListObserver = new ValueListObserver(this.element, this.actionAttribute, this);
        this.valueListObserver.start();
      }
    }
    stop() {
      if (this.valueListObserver) {
        this.valueListObserver.stop();
        delete this.valueListObserver;
        this.disconnectAllActions();
      }
    }
    get element() {
      return this.context.element;
    }
    get identifier() {
      return this.context.identifier;
    }
    get actionAttribute() {
      return this.schema.actionAttribute;
    }
    get schema() {
      return this.context.schema;
    }
    get bindings() {
      return Array.from(this.bindingsByAction.values());
    }
    connectAction(action) {
      const binding = new Binding(this.context, action);
      this.bindingsByAction.set(action, binding);
      this.delegate.bindingConnected(binding);
    }
    disconnectAction(action) {
      const binding = this.bindingsByAction.get(action);
      if (binding) {
        this.bindingsByAction.delete(action);
        this.delegate.bindingDisconnected(binding);
      }
    }
    disconnectAllActions() {
      this.bindings.forEach((binding) => this.delegate.bindingDisconnected(binding, true));
      this.bindingsByAction.clear();
    }
    parseValueForToken(token) {
      const action = Action.forToken(token, this.schema);
      if (action.identifier == this.identifier) {
        return action;
      }
    }
    elementMatchedValue(element, action) {
      this.connectAction(action);
    }
    elementUnmatchedValue(element, action) {
      this.disconnectAction(action);
    }
  };
  var ValueObserver = class {
    constructor(context, receiver) {
      this.context = context;
      this.receiver = receiver;
      this.stringMapObserver = new StringMapObserver(this.element, this);
      this.valueDescriptorMap = this.controller.valueDescriptorMap;
    }
    start() {
      this.stringMapObserver.start();
      this.invokeChangedCallbacksForDefaultValues();
    }
    stop() {
      this.stringMapObserver.stop();
    }
    get element() {
      return this.context.element;
    }
    get controller() {
      return this.context.controller;
    }
    getStringMapKeyForAttribute(attributeName) {
      if (attributeName in this.valueDescriptorMap) {
        return this.valueDescriptorMap[attributeName].name;
      }
    }
    stringMapKeyAdded(key, attributeName) {
      const descriptor = this.valueDescriptorMap[attributeName];
      if (!this.hasValue(key)) {
        this.invokeChangedCallback(key, descriptor.writer(this.receiver[key]), descriptor.writer(descriptor.defaultValue));
      }
    }
    stringMapValueChanged(value, name, oldValue) {
      const descriptor = this.valueDescriptorNameMap[name];
      if (value === null)
        return;
      if (oldValue === null) {
        oldValue = descriptor.writer(descriptor.defaultValue);
      }
      this.invokeChangedCallback(name, value, oldValue);
    }
    stringMapKeyRemoved(key, attributeName, oldValue) {
      const descriptor = this.valueDescriptorNameMap[key];
      if (this.hasValue(key)) {
        this.invokeChangedCallback(key, descriptor.writer(this.receiver[key]), oldValue);
      } else {
        this.invokeChangedCallback(key, descriptor.writer(descriptor.defaultValue), oldValue);
      }
    }
    invokeChangedCallbacksForDefaultValues() {
      for (const { key, name, defaultValue, writer } of this.valueDescriptors) {
        if (defaultValue != void 0 && !this.controller.data.has(key)) {
          this.invokeChangedCallback(name, writer(defaultValue), void 0);
        }
      }
    }
    invokeChangedCallback(name, rawValue, rawOldValue) {
      const changedMethodName = `${name}Changed`;
      const changedMethod = this.receiver[changedMethodName];
      if (typeof changedMethod == "function") {
        const descriptor = this.valueDescriptorNameMap[name];
        try {
          const value = descriptor.reader(rawValue);
          let oldValue = rawOldValue;
          if (rawOldValue) {
            oldValue = descriptor.reader(rawOldValue);
          }
          changedMethod.call(this.receiver, value, oldValue);
        } catch (error2) {
          if (error2 instanceof TypeError) {
            error2.message = `Stimulus Value "${this.context.identifier}.${descriptor.name}" - ${error2.message}`;
          }
          throw error2;
        }
      }
    }
    get valueDescriptors() {
      const { valueDescriptorMap } = this;
      return Object.keys(valueDescriptorMap).map((key) => valueDescriptorMap[key]);
    }
    get valueDescriptorNameMap() {
      const descriptors = {};
      Object.keys(this.valueDescriptorMap).forEach((key) => {
        const descriptor = this.valueDescriptorMap[key];
        descriptors[descriptor.name] = descriptor;
      });
      return descriptors;
    }
    hasValue(attributeName) {
      const descriptor = this.valueDescriptorNameMap[attributeName];
      const hasMethodName = `has${capitalize(descriptor.name)}`;
      return this.receiver[hasMethodName];
    }
  };
  var TargetObserver = class {
    constructor(context, delegate) {
      this.context = context;
      this.delegate = delegate;
      this.targetsByName = new Multimap();
    }
    start() {
      if (!this.tokenListObserver) {
        this.tokenListObserver = new TokenListObserver(this.element, this.attributeName, this);
        this.tokenListObserver.start();
      }
    }
    stop() {
      if (this.tokenListObserver) {
        this.disconnectAllTargets();
        this.tokenListObserver.stop();
        delete this.tokenListObserver;
      }
    }
    tokenMatched({ element, content: name }) {
      if (this.scope.containsElement(element)) {
        this.connectTarget(element, name);
      }
    }
    tokenUnmatched({ element, content: name }) {
      this.disconnectTarget(element, name);
    }
    connectTarget(element, name) {
      var _a;
      if (!this.targetsByName.has(name, element)) {
        this.targetsByName.add(name, element);
        (_a = this.tokenListObserver) === null || _a === void 0 ? void 0 : _a.pause(() => this.delegate.targetConnected(element, name));
      }
    }
    disconnectTarget(element, name) {
      var _a;
      if (this.targetsByName.has(name, element)) {
        this.targetsByName.delete(name, element);
        (_a = this.tokenListObserver) === null || _a === void 0 ? void 0 : _a.pause(() => this.delegate.targetDisconnected(element, name));
      }
    }
    disconnectAllTargets() {
      for (const name of this.targetsByName.keys) {
        for (const element of this.targetsByName.getValuesForKey(name)) {
          this.disconnectTarget(element, name);
        }
      }
    }
    get attributeName() {
      return `data-${this.context.identifier}-target`;
    }
    get element() {
      return this.context.element;
    }
    get scope() {
      return this.context.scope;
    }
  };
  function readInheritableStaticArrayValues(constructor, propertyName) {
    const ancestors = getAncestorsForConstructor(constructor);
    return Array.from(ancestors.reduce((values, constructor2) => {
      getOwnStaticArrayValues(constructor2, propertyName).forEach((name) => values.add(name));
      return values;
    }, /* @__PURE__ */ new Set()));
  }
  function readInheritableStaticObjectPairs(constructor, propertyName) {
    const ancestors = getAncestorsForConstructor(constructor);
    return ancestors.reduce((pairs, constructor2) => {
      pairs.push(...getOwnStaticObjectPairs(constructor2, propertyName));
      return pairs;
    }, []);
  }
  function getAncestorsForConstructor(constructor) {
    const ancestors = [];
    while (constructor) {
      ancestors.push(constructor);
      constructor = Object.getPrototypeOf(constructor);
    }
    return ancestors.reverse();
  }
  function getOwnStaticArrayValues(constructor, propertyName) {
    const definition = constructor[propertyName];
    return Array.isArray(definition) ? definition : [];
  }
  function getOwnStaticObjectPairs(constructor, propertyName) {
    const definition = constructor[propertyName];
    return definition ? Object.keys(definition).map((key) => [key, definition[key]]) : [];
  }
  var OutletObserver = class {
    constructor(context, delegate) {
      this.started = false;
      this.context = context;
      this.delegate = delegate;
      this.outletsByName = new Multimap();
      this.outletElementsByName = new Multimap();
      this.selectorObserverMap = /* @__PURE__ */ new Map();
      this.attributeObserverMap = /* @__PURE__ */ new Map();
    }
    start() {
      if (!this.started) {
        this.outletDefinitions.forEach((outletName) => {
          this.setupSelectorObserverForOutlet(outletName);
          this.setupAttributeObserverForOutlet(outletName);
        });
        this.started = true;
        this.dependentContexts.forEach((context) => context.refresh());
      }
    }
    refresh() {
      this.selectorObserverMap.forEach((observer) => observer.refresh());
      this.attributeObserverMap.forEach((observer) => observer.refresh());
    }
    stop() {
      if (this.started) {
        this.started = false;
        this.disconnectAllOutlets();
        this.stopSelectorObservers();
        this.stopAttributeObservers();
      }
    }
    stopSelectorObservers() {
      if (this.selectorObserverMap.size > 0) {
        this.selectorObserverMap.forEach((observer) => observer.stop());
        this.selectorObserverMap.clear();
      }
    }
    stopAttributeObservers() {
      if (this.attributeObserverMap.size > 0) {
        this.attributeObserverMap.forEach((observer) => observer.stop());
        this.attributeObserverMap.clear();
      }
    }
    selectorMatched(element, _selector, { outletName }) {
      const outlet = this.getOutlet(element, outletName);
      if (outlet) {
        this.connectOutlet(outlet, element, outletName);
      }
    }
    selectorUnmatched(element, _selector, { outletName }) {
      const outlet = this.getOutletFromMap(element, outletName);
      if (outlet) {
        this.disconnectOutlet(outlet, element, outletName);
      }
    }
    selectorMatchElement(element, { outletName }) {
      const selector = this.selector(outletName);
      const hasOutlet = this.hasOutlet(element, outletName);
      const hasOutletController = element.matches(`[${this.schema.controllerAttribute}~=${outletName}]`);
      if (selector) {
        return hasOutlet && hasOutletController && element.matches(selector);
      } else {
        return false;
      }
    }
    elementMatchedAttribute(_element, attributeName) {
      const outletName = this.getOutletNameFromOutletAttributeName(attributeName);
      if (outletName) {
        this.updateSelectorObserverForOutlet(outletName);
      }
    }
    elementAttributeValueChanged(_element, attributeName) {
      const outletName = this.getOutletNameFromOutletAttributeName(attributeName);
      if (outletName) {
        this.updateSelectorObserverForOutlet(outletName);
      }
    }
    elementUnmatchedAttribute(_element, attributeName) {
      const outletName = this.getOutletNameFromOutletAttributeName(attributeName);
      if (outletName) {
        this.updateSelectorObserverForOutlet(outletName);
      }
    }
    connectOutlet(outlet, element, outletName) {
      var _a;
      if (!this.outletElementsByName.has(outletName, element)) {
        this.outletsByName.add(outletName, outlet);
        this.outletElementsByName.add(outletName, element);
        (_a = this.selectorObserverMap.get(outletName)) === null || _a === void 0 ? void 0 : _a.pause(() => this.delegate.outletConnected(outlet, element, outletName));
      }
    }
    disconnectOutlet(outlet, element, outletName) {
      var _a;
      if (this.outletElementsByName.has(outletName, element)) {
        this.outletsByName.delete(outletName, outlet);
        this.outletElementsByName.delete(outletName, element);
        (_a = this.selectorObserverMap.get(outletName)) === null || _a === void 0 ? void 0 : _a.pause(() => this.delegate.outletDisconnected(outlet, element, outletName));
      }
    }
    disconnectAllOutlets() {
      for (const outletName of this.outletElementsByName.keys) {
        for (const element of this.outletElementsByName.getValuesForKey(outletName)) {
          for (const outlet of this.outletsByName.getValuesForKey(outletName)) {
            this.disconnectOutlet(outlet, element, outletName);
          }
        }
      }
    }
    updateSelectorObserverForOutlet(outletName) {
      const observer = this.selectorObserverMap.get(outletName);
      if (observer) {
        observer.selector = this.selector(outletName);
      }
    }
    setupSelectorObserverForOutlet(outletName) {
      const selector = this.selector(outletName);
      const selectorObserver = new SelectorObserver(document.body, selector, this, { outletName });
      this.selectorObserverMap.set(outletName, selectorObserver);
      selectorObserver.start();
    }
    setupAttributeObserverForOutlet(outletName) {
      const attributeName = this.attributeNameForOutletName(outletName);
      const attributeObserver = new AttributeObserver(this.scope.element, attributeName, this);
      this.attributeObserverMap.set(outletName, attributeObserver);
      attributeObserver.start();
    }
    selector(outletName) {
      return this.scope.outlets.getSelectorForOutletName(outletName);
    }
    attributeNameForOutletName(outletName) {
      return this.scope.schema.outletAttributeForScope(this.identifier, outletName);
    }
    getOutletNameFromOutletAttributeName(attributeName) {
      return this.outletDefinitions.find((outletName) => this.attributeNameForOutletName(outletName) === attributeName);
    }
    get outletDependencies() {
      const dependencies = new Multimap();
      this.router.modules.forEach((module) => {
        const constructor = module.definition.controllerConstructor;
        const outlets = readInheritableStaticArrayValues(constructor, "outlets");
        outlets.forEach((outlet) => dependencies.add(outlet, module.identifier));
      });
      return dependencies;
    }
    get outletDefinitions() {
      return this.outletDependencies.getKeysForValue(this.identifier);
    }
    get dependentControllerIdentifiers() {
      return this.outletDependencies.getValuesForKey(this.identifier);
    }
    get dependentContexts() {
      const identifiers = this.dependentControllerIdentifiers;
      return this.router.contexts.filter((context) => identifiers.includes(context.identifier));
    }
    hasOutlet(element, outletName) {
      return !!this.getOutlet(element, outletName) || !!this.getOutletFromMap(element, outletName);
    }
    getOutlet(element, outletName) {
      return this.application.getControllerForElementAndIdentifier(element, outletName);
    }
    getOutletFromMap(element, outletName) {
      return this.outletsByName.getValuesForKey(outletName).find((outlet) => outlet.element === element);
    }
    get scope() {
      return this.context.scope;
    }
    get schema() {
      return this.context.schema;
    }
    get identifier() {
      return this.context.identifier;
    }
    get application() {
      return this.context.application;
    }
    get router() {
      return this.application.router;
    }
  };
  var Context = class {
    constructor(module, scope) {
      this.logDebugActivity = (functionName, detail = {}) => {
        const { identifier, controller, element } = this;
        detail = Object.assign({ identifier, controller, element }, detail);
        this.application.logDebugActivity(this.identifier, functionName, detail);
      };
      this.module = module;
      this.scope = scope;
      this.controller = new module.controllerConstructor(this);
      this.bindingObserver = new BindingObserver(this, this.dispatcher);
      this.valueObserver = new ValueObserver(this, this.controller);
      this.targetObserver = new TargetObserver(this, this);
      this.outletObserver = new OutletObserver(this, this);
      try {
        this.controller.initialize();
        this.logDebugActivity("initialize");
      } catch (error2) {
        this.handleError(error2, "initializing controller");
      }
    }
    connect() {
      this.bindingObserver.start();
      this.valueObserver.start();
      this.targetObserver.start();
      this.outletObserver.start();
      try {
        this.controller.connect();
        this.logDebugActivity("connect");
      } catch (error2) {
        this.handleError(error2, "connecting controller");
      }
    }
    refresh() {
      this.outletObserver.refresh();
    }
    disconnect() {
      try {
        this.controller.disconnect();
        this.logDebugActivity("disconnect");
      } catch (error2) {
        this.handleError(error2, "disconnecting controller");
      }
      this.outletObserver.stop();
      this.targetObserver.stop();
      this.valueObserver.stop();
      this.bindingObserver.stop();
    }
    get application() {
      return this.module.application;
    }
    get identifier() {
      return this.module.identifier;
    }
    get schema() {
      return this.application.schema;
    }
    get dispatcher() {
      return this.application.dispatcher;
    }
    get element() {
      return this.scope.element;
    }
    get parentElement() {
      return this.element.parentElement;
    }
    handleError(error2, message, detail = {}) {
      const { identifier, controller, element } = this;
      detail = Object.assign({ identifier, controller, element }, detail);
      this.application.handleError(error2, `Error ${message}`, detail);
    }
    targetConnected(element, name) {
      this.invokeControllerMethod(`${name}TargetConnected`, element);
    }
    targetDisconnected(element, name) {
      this.invokeControllerMethod(`${name}TargetDisconnected`, element);
    }
    outletConnected(outlet, element, name) {
      this.invokeControllerMethod(`${namespaceCamelize(name)}OutletConnected`, outlet, element);
    }
    outletDisconnected(outlet, element, name) {
      this.invokeControllerMethod(`${namespaceCamelize(name)}OutletDisconnected`, outlet, element);
    }
    invokeControllerMethod(methodName, ...args) {
      const controller = this.controller;
      if (typeof controller[methodName] == "function") {
        controller[methodName](...args);
      }
    }
  };
  function bless(constructor) {
    return shadow(constructor, getBlessedProperties(constructor));
  }
  function shadow(constructor, properties) {
    const shadowConstructor = extend2(constructor);
    const shadowProperties = getShadowProperties(constructor.prototype, properties);
    Object.defineProperties(shadowConstructor.prototype, shadowProperties);
    return shadowConstructor;
  }
  function getBlessedProperties(constructor) {
    const blessings = readInheritableStaticArrayValues(constructor, "blessings");
    return blessings.reduce((blessedProperties, blessing) => {
      const properties = blessing(constructor);
      for (const key in properties) {
        const descriptor = blessedProperties[key] || {};
        blessedProperties[key] = Object.assign(descriptor, properties[key]);
      }
      return blessedProperties;
    }, {});
  }
  function getShadowProperties(prototype, properties) {
    return getOwnKeys(properties).reduce((shadowProperties, key) => {
      const descriptor = getShadowedDescriptor(prototype, properties, key);
      if (descriptor) {
        Object.assign(shadowProperties, { [key]: descriptor });
      }
      return shadowProperties;
    }, {});
  }
  function getShadowedDescriptor(prototype, properties, key) {
    const shadowingDescriptor = Object.getOwnPropertyDescriptor(prototype, key);
    const shadowedByValue = shadowingDescriptor && "value" in shadowingDescriptor;
    if (!shadowedByValue) {
      const descriptor = Object.getOwnPropertyDescriptor(properties, key).value;
      if (shadowingDescriptor) {
        descriptor.get = shadowingDescriptor.get || descriptor.get;
        descriptor.set = shadowingDescriptor.set || descriptor.set;
      }
      return descriptor;
    }
  }
  var getOwnKeys = (() => {
    if (typeof Object.getOwnPropertySymbols == "function") {
      return (object) => [...Object.getOwnPropertyNames(object), ...Object.getOwnPropertySymbols(object)];
    } else {
      return Object.getOwnPropertyNames;
    }
  })();
  var extend2 = (() => {
    function extendWithReflect(constructor) {
      function extended() {
        return Reflect.construct(constructor, arguments, new.target);
      }
      extended.prototype = Object.create(constructor.prototype, {
        constructor: { value: extended }
      });
      Reflect.setPrototypeOf(extended, constructor);
      return extended;
    }
    function testReflectExtension() {
      const a = function() {
        this.a.call(this);
      };
      const b = extendWithReflect(a);
      b.prototype.a = function() {
      };
      return new b();
    }
    try {
      testReflectExtension();
      return extendWithReflect;
    } catch (error2) {
      return (constructor) => class extended extends constructor {
      };
    }
  })();
  function blessDefinition(definition) {
    return {
      identifier: definition.identifier,
      controllerConstructor: bless(definition.controllerConstructor)
    };
  }
  var Module = class {
    constructor(application2, definition) {
      this.application = application2;
      this.definition = blessDefinition(definition);
      this.contextsByScope = /* @__PURE__ */ new WeakMap();
      this.connectedContexts = /* @__PURE__ */ new Set();
    }
    get identifier() {
      return this.definition.identifier;
    }
    get controllerConstructor() {
      return this.definition.controllerConstructor;
    }
    get contexts() {
      return Array.from(this.connectedContexts);
    }
    connectContextForScope(scope) {
      const context = this.fetchContextForScope(scope);
      this.connectedContexts.add(context);
      context.connect();
    }
    disconnectContextForScope(scope) {
      const context = this.contextsByScope.get(scope);
      if (context) {
        this.connectedContexts.delete(context);
        context.disconnect();
      }
    }
    fetchContextForScope(scope) {
      let context = this.contextsByScope.get(scope);
      if (!context) {
        context = new Context(this, scope);
        this.contextsByScope.set(scope, context);
      }
      return context;
    }
  };
  var ClassMap = class {
    constructor(scope) {
      this.scope = scope;
    }
    has(name) {
      return this.data.has(this.getDataKey(name));
    }
    get(name) {
      return this.getAll(name)[0];
    }
    getAll(name) {
      const tokenString = this.data.get(this.getDataKey(name)) || "";
      return tokenize(tokenString);
    }
    getAttributeName(name) {
      return this.data.getAttributeNameForKey(this.getDataKey(name));
    }
    getDataKey(name) {
      return `${name}-class`;
    }
    get data() {
      return this.scope.data;
    }
  };
  var DataMap = class {
    constructor(scope) {
      this.scope = scope;
    }
    get element() {
      return this.scope.element;
    }
    get identifier() {
      return this.scope.identifier;
    }
    get(key) {
      const name = this.getAttributeNameForKey(key);
      return this.element.getAttribute(name);
    }
    set(key, value) {
      const name = this.getAttributeNameForKey(key);
      this.element.setAttribute(name, value);
      return this.get(key);
    }
    has(key) {
      const name = this.getAttributeNameForKey(key);
      return this.element.hasAttribute(name);
    }
    delete(key) {
      if (this.has(key)) {
        const name = this.getAttributeNameForKey(key);
        this.element.removeAttribute(name);
        return true;
      } else {
        return false;
      }
    }
    getAttributeNameForKey(key) {
      return `data-${this.identifier}-${dasherize(key)}`;
    }
  };
  var Guide = class {
    constructor(logger) {
      this.warnedKeysByObject = /* @__PURE__ */ new WeakMap();
      this.logger = logger;
    }
    warn(object, key, message) {
      let warnedKeys = this.warnedKeysByObject.get(object);
      if (!warnedKeys) {
        warnedKeys = /* @__PURE__ */ new Set();
        this.warnedKeysByObject.set(object, warnedKeys);
      }
      if (!warnedKeys.has(key)) {
        warnedKeys.add(key);
        this.logger.warn(message, object);
      }
    }
  };
  function attributeValueContainsToken(attributeName, token) {
    return `[${attributeName}~="${token}"]`;
  }
  var TargetSet = class {
    constructor(scope) {
      this.scope = scope;
    }
    get element() {
      return this.scope.element;
    }
    get identifier() {
      return this.scope.identifier;
    }
    get schema() {
      return this.scope.schema;
    }
    has(targetName) {
      return this.find(targetName) != null;
    }
    find(...targetNames) {
      return targetNames.reduce((target, targetName) => target || this.findTarget(targetName) || this.findLegacyTarget(targetName), void 0);
    }
    findAll(...targetNames) {
      return targetNames.reduce((targets, targetName) => [
        ...targets,
        ...this.findAllTargets(targetName),
        ...this.findAllLegacyTargets(targetName)
      ], []);
    }
    findTarget(targetName) {
      const selector = this.getSelectorForTargetName(targetName);
      return this.scope.findElement(selector);
    }
    findAllTargets(targetName) {
      const selector = this.getSelectorForTargetName(targetName);
      return this.scope.findAllElements(selector);
    }
    getSelectorForTargetName(targetName) {
      const attributeName = this.schema.targetAttributeForScope(this.identifier);
      return attributeValueContainsToken(attributeName, targetName);
    }
    findLegacyTarget(targetName) {
      const selector = this.getLegacySelectorForTargetName(targetName);
      return this.deprecate(this.scope.findElement(selector), targetName);
    }
    findAllLegacyTargets(targetName) {
      const selector = this.getLegacySelectorForTargetName(targetName);
      return this.scope.findAllElements(selector).map((element) => this.deprecate(element, targetName));
    }
    getLegacySelectorForTargetName(targetName) {
      const targetDescriptor = `${this.identifier}.${targetName}`;
      return attributeValueContainsToken(this.schema.targetAttribute, targetDescriptor);
    }
    deprecate(element, targetName) {
      if (element) {
        const { identifier } = this;
        const attributeName = this.schema.targetAttribute;
        const revisedAttributeName = this.schema.targetAttributeForScope(identifier);
        this.guide.warn(element, `target:${targetName}`, `Please replace ${attributeName}="${identifier}.${targetName}" with ${revisedAttributeName}="${targetName}". The ${attributeName} attribute is deprecated and will be removed in a future version of Stimulus.`);
      }
      return element;
    }
    get guide() {
      return this.scope.guide;
    }
  };
  var OutletSet = class {
    constructor(scope, controllerElement) {
      this.scope = scope;
      this.controllerElement = controllerElement;
    }
    get element() {
      return this.scope.element;
    }
    get identifier() {
      return this.scope.identifier;
    }
    get schema() {
      return this.scope.schema;
    }
    has(outletName) {
      return this.find(outletName) != null;
    }
    find(...outletNames) {
      return outletNames.reduce((outlet, outletName) => outlet || this.findOutlet(outletName), void 0);
    }
    findAll(...outletNames) {
      return outletNames.reduce((outlets, outletName) => [...outlets, ...this.findAllOutlets(outletName)], []);
    }
    getSelectorForOutletName(outletName) {
      const attributeName = this.schema.outletAttributeForScope(this.identifier, outletName);
      return this.controllerElement.getAttribute(attributeName);
    }
    findOutlet(outletName) {
      const selector = this.getSelectorForOutletName(outletName);
      if (selector)
        return this.findElement(selector, outletName);
    }
    findAllOutlets(outletName) {
      const selector = this.getSelectorForOutletName(outletName);
      return selector ? this.findAllElements(selector, outletName) : [];
    }
    findElement(selector, outletName) {
      const elements = this.scope.queryElements(selector);
      return elements.filter((element) => this.matchesElement(element, selector, outletName))[0];
    }
    findAllElements(selector, outletName) {
      const elements = this.scope.queryElements(selector);
      return elements.filter((element) => this.matchesElement(element, selector, outletName));
    }
    matchesElement(element, selector, outletName) {
      const controllerAttribute = element.getAttribute(this.scope.schema.controllerAttribute) || "";
      return element.matches(selector) && controllerAttribute.split(" ").includes(outletName);
    }
  };
  var Scope = class {
    constructor(schema, element, identifier, logger) {
      this.targets = new TargetSet(this);
      this.classes = new ClassMap(this);
      this.data = new DataMap(this);
      this.containsElement = (element2) => {
        return element2.closest(this.controllerSelector) === this.element;
      };
      this.schema = schema;
      this.element = element;
      this.identifier = identifier;
      this.guide = new Guide(logger);
      this.outlets = new OutletSet(this.documentScope, element);
    }
    findElement(selector) {
      return this.element.matches(selector) ? this.element : this.queryElements(selector).find(this.containsElement);
    }
    findAllElements(selector) {
      return [
        ...this.element.matches(selector) ? [this.element] : [],
        ...this.queryElements(selector).filter(this.containsElement)
      ];
    }
    queryElements(selector) {
      return Array.from(this.element.querySelectorAll(selector));
    }
    get controllerSelector() {
      return attributeValueContainsToken(this.schema.controllerAttribute, this.identifier);
    }
    get isDocumentScope() {
      return this.element === document.documentElement;
    }
    get documentScope() {
      return this.isDocumentScope ? this : new Scope(this.schema, document.documentElement, this.identifier, this.guide.logger);
    }
  };
  var ScopeObserver = class {
    constructor(element, schema, delegate) {
      this.element = element;
      this.schema = schema;
      this.delegate = delegate;
      this.valueListObserver = new ValueListObserver(this.element, this.controllerAttribute, this);
      this.scopesByIdentifierByElement = /* @__PURE__ */ new WeakMap();
      this.scopeReferenceCounts = /* @__PURE__ */ new WeakMap();
    }
    start() {
      this.valueListObserver.start();
    }
    stop() {
      this.valueListObserver.stop();
    }
    get controllerAttribute() {
      return this.schema.controllerAttribute;
    }
    parseValueForToken(token) {
      const { element, content: identifier } = token;
      return this.parseValueForElementAndIdentifier(element, identifier);
    }
    parseValueForElementAndIdentifier(element, identifier) {
      const scopesByIdentifier = this.fetchScopesByIdentifierForElement(element);
      let scope = scopesByIdentifier.get(identifier);
      if (!scope) {
        scope = this.delegate.createScopeForElementAndIdentifier(element, identifier);
        scopesByIdentifier.set(identifier, scope);
      }
      return scope;
    }
    elementMatchedValue(element, value) {
      const referenceCount = (this.scopeReferenceCounts.get(value) || 0) + 1;
      this.scopeReferenceCounts.set(value, referenceCount);
      if (referenceCount == 1) {
        this.delegate.scopeConnected(value);
      }
    }
    elementUnmatchedValue(element, value) {
      const referenceCount = this.scopeReferenceCounts.get(value);
      if (referenceCount) {
        this.scopeReferenceCounts.set(value, referenceCount - 1);
        if (referenceCount == 1) {
          this.delegate.scopeDisconnected(value);
        }
      }
    }
    fetchScopesByIdentifierForElement(element) {
      let scopesByIdentifier = this.scopesByIdentifierByElement.get(element);
      if (!scopesByIdentifier) {
        scopesByIdentifier = /* @__PURE__ */ new Map();
        this.scopesByIdentifierByElement.set(element, scopesByIdentifier);
      }
      return scopesByIdentifier;
    }
  };
  var Router = class {
    constructor(application2) {
      this.application = application2;
      this.scopeObserver = new ScopeObserver(this.element, this.schema, this);
      this.scopesByIdentifier = new Multimap();
      this.modulesByIdentifier = /* @__PURE__ */ new Map();
    }
    get element() {
      return this.application.element;
    }
    get schema() {
      return this.application.schema;
    }
    get logger() {
      return this.application.logger;
    }
    get controllerAttribute() {
      return this.schema.controllerAttribute;
    }
    get modules() {
      return Array.from(this.modulesByIdentifier.values());
    }
    get contexts() {
      return this.modules.reduce((contexts, module) => contexts.concat(module.contexts), []);
    }
    start() {
      this.scopeObserver.start();
    }
    stop() {
      this.scopeObserver.stop();
    }
    loadDefinition(definition) {
      this.unloadIdentifier(definition.identifier);
      const module = new Module(this.application, definition);
      this.connectModule(module);
      const afterLoad = definition.controllerConstructor.afterLoad;
      if (afterLoad) {
        afterLoad.call(definition.controllerConstructor, definition.identifier, this.application);
      }
    }
    unloadIdentifier(identifier) {
      const module = this.modulesByIdentifier.get(identifier);
      if (module) {
        this.disconnectModule(module);
      }
    }
    getContextForElementAndIdentifier(element, identifier) {
      const module = this.modulesByIdentifier.get(identifier);
      if (module) {
        return module.contexts.find((context) => context.element == element);
      }
    }
    proposeToConnectScopeForElementAndIdentifier(element, identifier) {
      const scope = this.scopeObserver.parseValueForElementAndIdentifier(element, identifier);
      if (scope) {
        this.scopeObserver.elementMatchedValue(scope.element, scope);
      } else {
        console.error(`Couldn't find or create scope for identifier: "${identifier}" and element:`, element);
      }
    }
    handleError(error2, message, detail) {
      this.application.handleError(error2, message, detail);
    }
    createScopeForElementAndIdentifier(element, identifier) {
      return new Scope(this.schema, element, identifier, this.logger);
    }
    scopeConnected(scope) {
      this.scopesByIdentifier.add(scope.identifier, scope);
      const module = this.modulesByIdentifier.get(scope.identifier);
      if (module) {
        module.connectContextForScope(scope);
      }
    }
    scopeDisconnected(scope) {
      this.scopesByIdentifier.delete(scope.identifier, scope);
      const module = this.modulesByIdentifier.get(scope.identifier);
      if (module) {
        module.disconnectContextForScope(scope);
      }
    }
    connectModule(module) {
      this.modulesByIdentifier.set(module.identifier, module);
      const scopes = this.scopesByIdentifier.getValuesForKey(module.identifier);
      scopes.forEach((scope) => module.connectContextForScope(scope));
    }
    disconnectModule(module) {
      this.modulesByIdentifier.delete(module.identifier);
      const scopes = this.scopesByIdentifier.getValuesForKey(module.identifier);
      scopes.forEach((scope) => module.disconnectContextForScope(scope));
    }
  };
  var defaultSchema = {
    controllerAttribute: "data-controller",
    actionAttribute: "data-action",
    targetAttribute: "data-target",
    targetAttributeForScope: (identifier) => `data-${identifier}-target`,
    outletAttributeForScope: (identifier, outlet) => `data-${identifier}-${outlet}-outlet`,
    keyMappings: Object.assign(Object.assign({ enter: "Enter", tab: "Tab", esc: "Escape", space: " ", up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight", home: "Home", end: "End", page_up: "PageUp", page_down: "PageDown" }, objectFromEntries("abcdefghijklmnopqrstuvwxyz".split("").map((c) => [c, c]))), objectFromEntries("0123456789".split("").map((n) => [n, n])))
  };
  function objectFromEntries(array) {
    return array.reduce((memo, [k, v]) => Object.assign(Object.assign({}, memo), { [k]: v }), {});
  }
  var Application = class {
    constructor(element = document.documentElement, schema = defaultSchema) {
      this.logger = console;
      this.debug = false;
      this.logDebugActivity = (identifier, functionName, detail = {}) => {
        if (this.debug) {
          this.logFormattedMessage(identifier, functionName, detail);
        }
      };
      this.element = element;
      this.schema = schema;
      this.dispatcher = new Dispatcher(this);
      this.router = new Router(this);
      this.actionDescriptorFilters = Object.assign({}, defaultActionDescriptorFilters);
    }
    static start(element, schema) {
      const application2 = new this(element, schema);
      application2.start();
      return application2;
    }
    async start() {
      await domReady();
      this.logDebugActivity("application", "starting");
      this.dispatcher.start();
      this.router.start();
      this.logDebugActivity("application", "start");
    }
    stop() {
      this.logDebugActivity("application", "stopping");
      this.dispatcher.stop();
      this.router.stop();
      this.logDebugActivity("application", "stop");
    }
    register(identifier, controllerConstructor) {
      this.load({ identifier, controllerConstructor });
    }
    registerActionOption(name, filter) {
      this.actionDescriptorFilters[name] = filter;
    }
    load(head, ...rest) {
      const definitions = Array.isArray(head) ? head : [head, ...rest];
      definitions.forEach((definition) => {
        if (definition.controllerConstructor.shouldLoad) {
          this.router.loadDefinition(definition);
        }
      });
    }
    unload(head, ...rest) {
      const identifiers = Array.isArray(head) ? head : [head, ...rest];
      identifiers.forEach((identifier) => this.router.unloadIdentifier(identifier));
    }
    get controllers() {
      return this.router.contexts.map((context) => context.controller);
    }
    getControllerForElementAndIdentifier(element, identifier) {
      const context = this.router.getContextForElementAndIdentifier(element, identifier);
      return context ? context.controller : null;
    }
    handleError(error2, message, detail) {
      var _a;
      this.logger.error(`%s

%o

%o`, message, error2, detail);
      (_a = window.onerror) === null || _a === void 0 ? void 0 : _a.call(window, message, "", 0, 0, error2);
    }
    logFormattedMessage(identifier, functionName, detail = {}) {
      detail = Object.assign({ application: this }, detail);
      this.logger.groupCollapsed(`${identifier} #${functionName}`);
      this.logger.log("details:", Object.assign({}, detail));
      this.logger.groupEnd();
    }
  };
  function domReady() {
    return new Promise((resolve) => {
      if (document.readyState == "loading") {
        document.addEventListener("DOMContentLoaded", () => resolve());
      } else {
        resolve();
      }
    });
  }
  function ClassPropertiesBlessing(constructor) {
    const classes = readInheritableStaticArrayValues(constructor, "classes");
    return classes.reduce((properties, classDefinition) => {
      return Object.assign(properties, propertiesForClassDefinition(classDefinition));
    }, {});
  }
  function propertiesForClassDefinition(key) {
    return {
      [`${key}Class`]: {
        get() {
          const { classes } = this;
          if (classes.has(key)) {
            return classes.get(key);
          } else {
            const attribute = classes.getAttributeName(key);
            throw new Error(`Missing attribute "${attribute}"`);
          }
        }
      },
      [`${key}Classes`]: {
        get() {
          return this.classes.getAll(key);
        }
      },
      [`has${capitalize(key)}Class`]: {
        get() {
          return this.classes.has(key);
        }
      }
    };
  }
  function OutletPropertiesBlessing(constructor) {
    const outlets = readInheritableStaticArrayValues(constructor, "outlets");
    return outlets.reduce((properties, outletDefinition) => {
      return Object.assign(properties, propertiesForOutletDefinition(outletDefinition));
    }, {});
  }
  function getOutletController(controller, element, identifier) {
    return controller.application.getControllerForElementAndIdentifier(element, identifier);
  }
  function getControllerAndEnsureConnectedScope(controller, element, outletName) {
    let outletController = getOutletController(controller, element, outletName);
    if (outletController)
      return outletController;
    controller.application.router.proposeToConnectScopeForElementAndIdentifier(element, outletName);
    outletController = getOutletController(controller, element, outletName);
    if (outletController)
      return outletController;
  }
  function propertiesForOutletDefinition(name) {
    const camelizedName = namespaceCamelize(name);
    return {
      [`${camelizedName}Outlet`]: {
        get() {
          const outletElement = this.outlets.find(name);
          const selector = this.outlets.getSelectorForOutletName(name);
          if (outletElement) {
            const outletController = getControllerAndEnsureConnectedScope(this, outletElement, name);
            if (outletController)
              return outletController;
            throw new Error(`The provided outlet element is missing an outlet controller "${name}" instance for host controller "${this.identifier}"`);
          }
          throw new Error(`Missing outlet element "${name}" for host controller "${this.identifier}". Stimulus couldn't find a matching outlet element using selector "${selector}".`);
        }
      },
      [`${camelizedName}Outlets`]: {
        get() {
          const outlets = this.outlets.findAll(name);
          if (outlets.length > 0) {
            return outlets.map((outletElement) => {
              const outletController = getControllerAndEnsureConnectedScope(this, outletElement, name);
              if (outletController)
                return outletController;
              console.warn(`The provided outlet element is missing an outlet controller "${name}" instance for host controller "${this.identifier}"`, outletElement);
            }).filter((controller) => controller);
          }
          return [];
        }
      },
      [`${camelizedName}OutletElement`]: {
        get() {
          const outletElement = this.outlets.find(name);
          const selector = this.outlets.getSelectorForOutletName(name);
          if (outletElement) {
            return outletElement;
          } else {
            throw new Error(`Missing outlet element "${name}" for host controller "${this.identifier}". Stimulus couldn't find a matching outlet element using selector "${selector}".`);
          }
        }
      },
      [`${camelizedName}OutletElements`]: {
        get() {
          return this.outlets.findAll(name);
        }
      },
      [`has${capitalize(camelizedName)}Outlet`]: {
        get() {
          return this.outlets.has(name);
        }
      }
    };
  }
  function TargetPropertiesBlessing(constructor) {
    const targets = readInheritableStaticArrayValues(constructor, "targets");
    return targets.reduce((properties, targetDefinition) => {
      return Object.assign(properties, propertiesForTargetDefinition(targetDefinition));
    }, {});
  }
  function propertiesForTargetDefinition(name) {
    return {
      [`${name}Target`]: {
        get() {
          const target = this.targets.find(name);
          if (target) {
            return target;
          } else {
            throw new Error(`Missing target element "${name}" for "${this.identifier}" controller`);
          }
        }
      },
      [`${name}Targets`]: {
        get() {
          return this.targets.findAll(name);
        }
      },
      [`has${capitalize(name)}Target`]: {
        get() {
          return this.targets.has(name);
        }
      }
    };
  }
  function ValuePropertiesBlessing(constructor) {
    const valueDefinitionPairs = readInheritableStaticObjectPairs(constructor, "values");
    const propertyDescriptorMap = {
      valueDescriptorMap: {
        get() {
          return valueDefinitionPairs.reduce((result, valueDefinitionPair) => {
            const valueDescriptor = parseValueDefinitionPair(valueDefinitionPair, this.identifier);
            const attributeName = this.data.getAttributeNameForKey(valueDescriptor.key);
            return Object.assign(result, { [attributeName]: valueDescriptor });
          }, {});
        }
      }
    };
    return valueDefinitionPairs.reduce((properties, valueDefinitionPair) => {
      return Object.assign(properties, propertiesForValueDefinitionPair(valueDefinitionPair));
    }, propertyDescriptorMap);
  }
  function propertiesForValueDefinitionPair(valueDefinitionPair, controller) {
    const definition = parseValueDefinitionPair(valueDefinitionPair, controller);
    const { key, name, reader: read2, writer: write2 } = definition;
    return {
      [name]: {
        get() {
          const value = this.data.get(key);
          if (value !== null) {
            return read2(value);
          } else {
            return definition.defaultValue;
          }
        },
        set(value) {
          if (value === void 0) {
            this.data.delete(key);
          } else {
            this.data.set(key, write2(value));
          }
        }
      },
      [`has${capitalize(name)}`]: {
        get() {
          return this.data.has(key) || definition.hasCustomDefaultValue;
        }
      }
    };
  }
  function parseValueDefinitionPair([token, typeDefinition], controller) {
    return valueDescriptorForTokenAndTypeDefinition({
      controller,
      token,
      typeDefinition
    });
  }
  function parseValueTypeConstant(constant) {
    switch (constant) {
      case Array:
        return "array";
      case Boolean:
        return "boolean";
      case Number:
        return "number";
      case Object:
        return "object";
      case String:
        return "string";
    }
  }
  function parseValueTypeDefault(defaultValue) {
    switch (typeof defaultValue) {
      case "boolean":
        return "boolean";
      case "number":
        return "number";
      case "string":
        return "string";
    }
    if (Array.isArray(defaultValue))
      return "array";
    if (Object.prototype.toString.call(defaultValue) === "[object Object]")
      return "object";
  }
  function parseValueTypeObject(payload) {
    const { controller, token, typeObject } = payload;
    const hasType = isSomething(typeObject.type);
    const hasDefault = isSomething(typeObject.default);
    const fullObject = hasType && hasDefault;
    const onlyType = hasType && !hasDefault;
    const onlyDefault = !hasType && hasDefault;
    const typeFromObject = parseValueTypeConstant(typeObject.type);
    const typeFromDefaultValue = parseValueTypeDefault(payload.typeObject.default);
    if (onlyType)
      return typeFromObject;
    if (onlyDefault)
      return typeFromDefaultValue;
    if (typeFromObject !== typeFromDefaultValue) {
      const propertyPath = controller ? `${controller}.${token}` : token;
      throw new Error(`The specified default value for the Stimulus Value "${propertyPath}" must match the defined type "${typeFromObject}". The provided default value of "${typeObject.default}" is of type "${typeFromDefaultValue}".`);
    }
    if (fullObject)
      return typeFromObject;
  }
  function parseValueTypeDefinition(payload) {
    const { controller, token, typeDefinition } = payload;
    const typeObject = { controller, token, typeObject: typeDefinition };
    const typeFromObject = parseValueTypeObject(typeObject);
    const typeFromDefaultValue = parseValueTypeDefault(typeDefinition);
    const typeFromConstant = parseValueTypeConstant(typeDefinition);
    const type = typeFromObject || typeFromDefaultValue || typeFromConstant;
    if (type)
      return type;
    const propertyPath = controller ? `${controller}.${typeDefinition}` : token;
    throw new Error(`Unknown value type "${propertyPath}" for "${token}" value`);
  }
  function defaultValueForDefinition(typeDefinition) {
    const constant = parseValueTypeConstant(typeDefinition);
    if (constant)
      return defaultValuesByType[constant];
    const hasDefault = hasProperty(typeDefinition, "default");
    const hasType = hasProperty(typeDefinition, "type");
    const typeObject = typeDefinition;
    if (hasDefault)
      return typeObject.default;
    if (hasType) {
      const { type } = typeObject;
      const constantFromType = parseValueTypeConstant(type);
      if (constantFromType)
        return defaultValuesByType[constantFromType];
    }
    return typeDefinition;
  }
  function valueDescriptorForTokenAndTypeDefinition(payload) {
    const { token, typeDefinition } = payload;
    const key = `${dasherize(token)}-value`;
    const type = parseValueTypeDefinition(payload);
    return {
      type,
      key,
      name: camelize(key),
      get defaultValue() {
        return defaultValueForDefinition(typeDefinition);
      },
      get hasCustomDefaultValue() {
        return parseValueTypeDefault(typeDefinition) !== void 0;
      },
      reader: readers[type],
      writer: writers[type] || writers.default
    };
  }
  var defaultValuesByType = {
    get array() {
      return [];
    },
    boolean: false,
    number: 0,
    get object() {
      return {};
    },
    string: ""
  };
  var readers = {
    array(value) {
      const array = JSON.parse(value);
      if (!Array.isArray(array)) {
        throw new TypeError(`expected value of type "array" but instead got value "${value}" of type "${parseValueTypeDefault(array)}"`);
      }
      return array;
    },
    boolean(value) {
      return !(value == "0" || String(value).toLowerCase() == "false");
    },
    number(value) {
      return Number(value.replace(/_/g, ""));
    },
    object(value) {
      const object = JSON.parse(value);
      if (object === null || typeof object != "object" || Array.isArray(object)) {
        throw new TypeError(`expected value of type "object" but instead got value "${value}" of type "${parseValueTypeDefault(object)}"`);
      }
      return object;
    },
    string(value) {
      return value;
    }
  };
  var writers = {
    default: writeString,
    array: writeJSON,
    object: writeJSON
  };
  function writeJSON(value) {
    return JSON.stringify(value);
  }
  function writeString(value) {
    return `${value}`;
  }
  var Controller = class {
    constructor(context) {
      this.context = context;
    }
    static get shouldLoad() {
      return true;
    }
    static afterLoad(_identifier, _application) {
      return;
    }
    get application() {
      return this.context.application;
    }
    get scope() {
      return this.context.scope;
    }
    get element() {
      return this.scope.element;
    }
    get identifier() {
      return this.scope.identifier;
    }
    get targets() {
      return this.scope.targets;
    }
    get outlets() {
      return this.scope.outlets;
    }
    get classes() {
      return this.scope.classes;
    }
    get data() {
      return this.scope.data;
    }
    initialize() {
    }
    connect() {
    }
    disconnect() {
    }
    dispatch(eventName, { target = this.element, detail = {}, prefix = this.identifier, bubbles = true, cancelable = true } = {}) {
      const type = prefix ? `${prefix}:${eventName}` : eventName;
      const event = new CustomEvent(type, { detail, bubbles, cancelable });
      target.dispatchEvent(event);
      return event;
    }
  };
  Controller.blessings = [
    ClassPropertiesBlessing,
    TargetPropertiesBlessing,
    ValuePropertiesBlessing,
    OutletPropertiesBlessing
  ];
  Controller.targets = [];
  Controller.outlets = [];
  Controller.values = {};

  // app/javascript/controllers/application.js
  var application = Application.start();
  application.debug = false;
  window.Stimulus = application;

  // app/javascript/controllers/admin_modal_controller.js
  var admin_modal_controller_default = class extends Controller {
    connect() {
      console.log("iniciando o controller admim modal");
      this.element.setAttribute("data-action", "admin-modal#click_modal");
    }
    click_modal(e) {
      console.log(e);
      e.preventDefault();
      this.url = this.element.getAttribute("href");
      console.log(this.url);
      fetch(this.url, {
        headers: {
          Accept: "text/vnd.turbo-stream.html"
        }
      }).then((response) => response.text()).then((html) => turbo_es2017_esm_exports.renderStreamMessage(html));
    }
  };

  // app/javascript/controllers/hello_controller.js
  var hello_controller_default = class extends Controller {
    connect() {
      this.element.textContent = "Hello World!";
    }
  };

  // app/javascript/controllers/modal_controller.js
  var modal_controller_default = class extends Controller {
    connect() {
      console.log("conecta no modal controller");
      this.modal = new bootstrap.Modal(this.element, {
        keyboard: false
      });
      this.modal.show();
    }
    disconnect() {
      this.modal.hide();
      this.modal.dispose();
      Turbo.destroyFrame(this.element.closest("[id^='turbo-frame']"));
    }
  };

  // app/javascript/controllers/index.js
  application.register("admin-modal", admin_modal_controller_default);
  application.register("hello", hello_controller_default);
  application.register("modal", modal_controller_default);

  // node_modules/@popperjs/core/lib/index.js
  var lib_exports = {};
  __export(lib_exports, {
    afterMain: () => afterMain,
    afterRead: () => afterRead,
    afterWrite: () => afterWrite,
    applyStyles: () => applyStyles_default,
    arrow: () => arrow_default,
    auto: () => auto,
    basePlacements: () => basePlacements,
    beforeMain: () => beforeMain,
    beforeRead: () => beforeRead,
    beforeWrite: () => beforeWrite,
    bottom: () => bottom,
    clippingParents: () => clippingParents,
    computeStyles: () => computeStyles_default,
    createPopper: () => createPopper3,
    createPopperBase: () => createPopper,
    createPopperLite: () => createPopper2,
    detectOverflow: () => detectOverflow,
    end: () => end,
    eventListeners: () => eventListeners_default,
    flip: () => flip_default,
    hide: () => hide_default,
    left: () => left,
    main: () => main,
    modifierPhases: () => modifierPhases,
    offset: () => offset_default,
    placements: () => placements,
    popper: () => popper,
    popperGenerator: () => popperGenerator,
    popperOffsets: () => popperOffsets_default,
    preventOverflow: () => preventOverflow_default,
    read: () => read,
    reference: () => reference,
    right: () => right,
    start: () => start2,
    top: () => top,
    variationPlacements: () => variationPlacements,
    viewport: () => viewport,
    write: () => write
  });

  // node_modules/@popperjs/core/lib/enums.js
  var top = "top";
  var bottom = "bottom";
  var right = "right";
  var left = "left";
  var auto = "auto";
  var basePlacements = [top, bottom, right, left];
  var start2 = "start";
  var end = "end";
  var clippingParents = "clippingParents";
  var viewport = "viewport";
  var popper = "popper";
  var reference = "reference";
  var variationPlacements = /* @__PURE__ */ basePlacements.reduce(function(acc, placement) {
    return acc.concat([placement + "-" + start2, placement + "-" + end]);
  }, []);
  var placements = /* @__PURE__ */ [].concat(basePlacements, [auto]).reduce(function(acc, placement) {
    return acc.concat([placement, placement + "-" + start2, placement + "-" + end]);
  }, []);
  var beforeRead = "beforeRead";
  var read = "read";
  var afterRead = "afterRead";
  var beforeMain = "beforeMain";
  var main = "main";
  var afterMain = "afterMain";
  var beforeWrite = "beforeWrite";
  var write = "write";
  var afterWrite = "afterWrite";
  var modifierPhases = [beforeRead, read, afterRead, beforeMain, main, afterMain, beforeWrite, write, afterWrite];

  // node_modules/@popperjs/core/lib/dom-utils/getNodeName.js
  function getNodeName(element) {
    return element ? (element.nodeName || "").toLowerCase() : null;
  }

  // node_modules/@popperjs/core/lib/dom-utils/getWindow.js
  function getWindow(node) {
    if (node == null) {
      return window;
    }
    if (node.toString() !== "[object Window]") {
      var ownerDocument = node.ownerDocument;
      return ownerDocument ? ownerDocument.defaultView || window : window;
    }
    return node;
  }

  // node_modules/@popperjs/core/lib/dom-utils/instanceOf.js
  function isElement(node) {
    var OwnElement = getWindow(node).Element;
    return node instanceof OwnElement || node instanceof Element;
  }
  function isHTMLElement(node) {
    var OwnElement = getWindow(node).HTMLElement;
    return node instanceof OwnElement || node instanceof HTMLElement;
  }
  function isShadowRoot(node) {
    if (typeof ShadowRoot === "undefined") {
      return false;
    }
    var OwnElement = getWindow(node).ShadowRoot;
    return node instanceof OwnElement || node instanceof ShadowRoot;
  }

  // node_modules/@popperjs/core/lib/modifiers/applyStyles.js
  function applyStyles(_ref) {
    var state = _ref.state;
    Object.keys(state.elements).forEach(function(name) {
      var style = state.styles[name] || {};
      var attributes = state.attributes[name] || {};
      var element = state.elements[name];
      if (!isHTMLElement(element) || !getNodeName(element)) {
        return;
      }
      Object.assign(element.style, style);
      Object.keys(attributes).forEach(function(name2) {
        var value = attributes[name2];
        if (value === false) {
          element.removeAttribute(name2);
        } else {
          element.setAttribute(name2, value === true ? "" : value);
        }
      });
    });
  }
  function effect(_ref2) {
    var state = _ref2.state;
    var initialStyles = {
      popper: {
        position: state.options.strategy,
        left: "0",
        top: "0",
        margin: "0"
      },
      arrow: {
        position: "absolute"
      },
      reference: {}
    };
    Object.assign(state.elements.popper.style, initialStyles.popper);
    state.styles = initialStyles;
    if (state.elements.arrow) {
      Object.assign(state.elements.arrow.style, initialStyles.arrow);
    }
    return function() {
      Object.keys(state.elements).forEach(function(name) {
        var element = state.elements[name];
        var attributes = state.attributes[name] || {};
        var styleProperties = Object.keys(state.styles.hasOwnProperty(name) ? state.styles[name] : initialStyles[name]);
        var style = styleProperties.reduce(function(style2, property) {
          style2[property] = "";
          return style2;
        }, {});
        if (!isHTMLElement(element) || !getNodeName(element)) {
          return;
        }
        Object.assign(element.style, style);
        Object.keys(attributes).forEach(function(attribute) {
          element.removeAttribute(attribute);
        });
      });
    };
  }
  var applyStyles_default = {
    name: "applyStyles",
    enabled: true,
    phase: "write",
    fn: applyStyles,
    effect,
    requires: ["computeStyles"]
  };

  // node_modules/@popperjs/core/lib/utils/getBasePlacement.js
  function getBasePlacement(placement) {
    return placement.split("-")[0];
  }

  // node_modules/@popperjs/core/lib/utils/math.js
  var max = Math.max;
  var min = Math.min;
  var round = Math.round;

  // node_modules/@popperjs/core/lib/utils/userAgent.js
  function getUAString() {
    var uaData = navigator.userAgentData;
    if (uaData != null && uaData.brands && Array.isArray(uaData.brands)) {
      return uaData.brands.map(function(item) {
        return item.brand + "/" + item.version;
      }).join(" ");
    }
    return navigator.userAgent;
  }

  // node_modules/@popperjs/core/lib/dom-utils/isLayoutViewport.js
  function isLayoutViewport() {
    return !/^((?!chrome|android).)*safari/i.test(getUAString());
  }

  // node_modules/@popperjs/core/lib/dom-utils/getBoundingClientRect.js
  function getBoundingClientRect(element, includeScale, isFixedStrategy) {
    if (includeScale === void 0) {
      includeScale = false;
    }
    if (isFixedStrategy === void 0) {
      isFixedStrategy = false;
    }
    var clientRect = element.getBoundingClientRect();
    var scaleX = 1;
    var scaleY = 1;
    if (includeScale && isHTMLElement(element)) {
      scaleX = element.offsetWidth > 0 ? round(clientRect.width) / element.offsetWidth || 1 : 1;
      scaleY = element.offsetHeight > 0 ? round(clientRect.height) / element.offsetHeight || 1 : 1;
    }
    var _ref = isElement(element) ? getWindow(element) : window, visualViewport = _ref.visualViewport;
    var addVisualOffsets = !isLayoutViewport() && isFixedStrategy;
    var x = (clientRect.left + (addVisualOffsets && visualViewport ? visualViewport.offsetLeft : 0)) / scaleX;
    var y = (clientRect.top + (addVisualOffsets && visualViewport ? visualViewport.offsetTop : 0)) / scaleY;
    var width = clientRect.width / scaleX;
    var height = clientRect.height / scaleY;
    return {
      width,
      height,
      top: y,
      right: x + width,
      bottom: y + height,
      left: x,
      x,
      y
    };
  }

  // node_modules/@popperjs/core/lib/dom-utils/getLayoutRect.js
  function getLayoutRect(element) {
    var clientRect = getBoundingClientRect(element);
    var width = element.offsetWidth;
    var height = element.offsetHeight;
    if (Math.abs(clientRect.width - width) <= 1) {
      width = clientRect.width;
    }
    if (Math.abs(clientRect.height - height) <= 1) {
      height = clientRect.height;
    }
    return {
      x: element.offsetLeft,
      y: element.offsetTop,
      width,
      height
    };
  }

  // node_modules/@popperjs/core/lib/dom-utils/contains.js
  function contains(parent, child) {
    var rootNode = child.getRootNode && child.getRootNode();
    if (parent.contains(child)) {
      return true;
    } else if (rootNode && isShadowRoot(rootNode)) {
      var next = child;
      do {
        if (next && parent.isSameNode(next)) {
          return true;
        }
        next = next.parentNode || next.host;
      } while (next);
    }
    return false;
  }

  // node_modules/@popperjs/core/lib/dom-utils/getComputedStyle.js
  function getComputedStyle2(element) {
    return getWindow(element).getComputedStyle(element);
  }

  // node_modules/@popperjs/core/lib/dom-utils/isTableElement.js
  function isTableElement(element) {
    return ["table", "td", "th"].indexOf(getNodeName(element)) >= 0;
  }

  // node_modules/@popperjs/core/lib/dom-utils/getDocumentElement.js
  function getDocumentElement(element) {
    return ((isElement(element) ? element.ownerDocument : element.document) || window.document).documentElement;
  }

  // node_modules/@popperjs/core/lib/dom-utils/getParentNode.js
  function getParentNode(element) {
    if (getNodeName(element) === "html") {
      return element;
    }
    return element.assignedSlot || element.parentNode || (isShadowRoot(element) ? element.host : null) || getDocumentElement(element);
  }

  // node_modules/@popperjs/core/lib/dom-utils/getOffsetParent.js
  function getTrueOffsetParent(element) {
    if (!isHTMLElement(element) || getComputedStyle2(element).position === "fixed") {
      return null;
    }
    return element.offsetParent;
  }
  function getContainingBlock(element) {
    var isFirefox = /firefox/i.test(getUAString());
    var isIE = /Trident/i.test(getUAString());
    if (isIE && isHTMLElement(element)) {
      var elementCss = getComputedStyle2(element);
      if (elementCss.position === "fixed") {
        return null;
      }
    }
    var currentNode = getParentNode(element);
    if (isShadowRoot(currentNode)) {
      currentNode = currentNode.host;
    }
    while (isHTMLElement(currentNode) && ["html", "body"].indexOf(getNodeName(currentNode)) < 0) {
      var css = getComputedStyle2(currentNode);
      if (css.transform !== "none" || css.perspective !== "none" || css.contain === "paint" || ["transform", "perspective"].indexOf(css.willChange) !== -1 || isFirefox && css.willChange === "filter" || isFirefox && css.filter && css.filter !== "none") {
        return currentNode;
      } else {
        currentNode = currentNode.parentNode;
      }
    }
    return null;
  }
  function getOffsetParent(element) {
    var window2 = getWindow(element);
    var offsetParent = getTrueOffsetParent(element);
    while (offsetParent && isTableElement(offsetParent) && getComputedStyle2(offsetParent).position === "static") {
      offsetParent = getTrueOffsetParent(offsetParent);
    }
    if (offsetParent && (getNodeName(offsetParent) === "html" || getNodeName(offsetParent) === "body" && getComputedStyle2(offsetParent).position === "static")) {
      return window2;
    }
    return offsetParent || getContainingBlock(element) || window2;
  }

  // node_modules/@popperjs/core/lib/utils/getMainAxisFromPlacement.js
  function getMainAxisFromPlacement(placement) {
    return ["top", "bottom"].indexOf(placement) >= 0 ? "x" : "y";
  }

  // node_modules/@popperjs/core/lib/utils/within.js
  function within(min2, value, max2) {
    return max(min2, min(value, max2));
  }
  function withinMaxClamp(min2, value, max2) {
    var v = within(min2, value, max2);
    return v > max2 ? max2 : v;
  }

  // node_modules/@popperjs/core/lib/utils/getFreshSideObject.js
  function getFreshSideObject() {
    return {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    };
  }

  // node_modules/@popperjs/core/lib/utils/mergePaddingObject.js
  function mergePaddingObject(paddingObject) {
    return Object.assign({}, getFreshSideObject(), paddingObject);
  }

  // node_modules/@popperjs/core/lib/utils/expandToHashMap.js
  function expandToHashMap(value, keys) {
    return keys.reduce(function(hashMap, key) {
      hashMap[key] = value;
      return hashMap;
    }, {});
  }

  // node_modules/@popperjs/core/lib/modifiers/arrow.js
  var toPaddingObject = function toPaddingObject2(padding, state) {
    padding = typeof padding === "function" ? padding(Object.assign({}, state.rects, {
      placement: state.placement
    })) : padding;
    return mergePaddingObject(typeof padding !== "number" ? padding : expandToHashMap(padding, basePlacements));
  };
  function arrow(_ref) {
    var _state$modifiersData$;
    var state = _ref.state, name = _ref.name, options = _ref.options;
    var arrowElement = state.elements.arrow;
    var popperOffsets2 = state.modifiersData.popperOffsets;
    var basePlacement = getBasePlacement(state.placement);
    var axis = getMainAxisFromPlacement(basePlacement);
    var isVertical = [left, right].indexOf(basePlacement) >= 0;
    var len = isVertical ? "height" : "width";
    if (!arrowElement || !popperOffsets2) {
      return;
    }
    var paddingObject = toPaddingObject(options.padding, state);
    var arrowRect = getLayoutRect(arrowElement);
    var minProp = axis === "y" ? top : left;
    var maxProp = axis === "y" ? bottom : right;
    var endDiff = state.rects.reference[len] + state.rects.reference[axis] - popperOffsets2[axis] - state.rects.popper[len];
    var startDiff = popperOffsets2[axis] - state.rects.reference[axis];
    var arrowOffsetParent = getOffsetParent(arrowElement);
    var clientSize = arrowOffsetParent ? axis === "y" ? arrowOffsetParent.clientHeight || 0 : arrowOffsetParent.clientWidth || 0 : 0;
    var centerToReference = endDiff / 2 - startDiff / 2;
    var min2 = paddingObject[minProp];
    var max2 = clientSize - arrowRect[len] - paddingObject[maxProp];
    var center = clientSize / 2 - arrowRect[len] / 2 + centerToReference;
    var offset2 = within(min2, center, max2);
    var axisProp = axis;
    state.modifiersData[name] = (_state$modifiersData$ = {}, _state$modifiersData$[axisProp] = offset2, _state$modifiersData$.centerOffset = offset2 - center, _state$modifiersData$);
  }
  function effect2(_ref2) {
    var state = _ref2.state, options = _ref2.options;
    var _options$element = options.element, arrowElement = _options$element === void 0 ? "[data-popper-arrow]" : _options$element;
    if (arrowElement == null) {
      return;
    }
    if (typeof arrowElement === "string") {
      arrowElement = state.elements.popper.querySelector(arrowElement);
      if (!arrowElement) {
        return;
      }
    }
    if (!contains(state.elements.popper, arrowElement)) {
      return;
    }
    state.elements.arrow = arrowElement;
  }
  var arrow_default = {
    name: "arrow",
    enabled: true,
    phase: "main",
    fn: arrow,
    effect: effect2,
    requires: ["popperOffsets"],
    requiresIfExists: ["preventOverflow"]
  };

  // node_modules/@popperjs/core/lib/utils/getVariation.js
  function getVariation(placement) {
    return placement.split("-")[1];
  }

  // node_modules/@popperjs/core/lib/modifiers/computeStyles.js
  var unsetSides = {
    top: "auto",
    right: "auto",
    bottom: "auto",
    left: "auto"
  };
  function roundOffsetsByDPR(_ref, win) {
    var x = _ref.x, y = _ref.y;
    var dpr = win.devicePixelRatio || 1;
    return {
      x: round(x * dpr) / dpr || 0,
      y: round(y * dpr) / dpr || 0
    };
  }
  function mapToStyles(_ref2) {
    var _Object$assign2;
    var popper2 = _ref2.popper, popperRect = _ref2.popperRect, placement = _ref2.placement, variation = _ref2.variation, offsets = _ref2.offsets, position = _ref2.position, gpuAcceleration = _ref2.gpuAcceleration, adaptive = _ref2.adaptive, roundOffsets = _ref2.roundOffsets, isFixed = _ref2.isFixed;
    var _offsets$x = offsets.x, x = _offsets$x === void 0 ? 0 : _offsets$x, _offsets$y = offsets.y, y = _offsets$y === void 0 ? 0 : _offsets$y;
    var _ref3 = typeof roundOffsets === "function" ? roundOffsets({
      x,
      y
    }) : {
      x,
      y
    };
    x = _ref3.x;
    y = _ref3.y;
    var hasX = offsets.hasOwnProperty("x");
    var hasY = offsets.hasOwnProperty("y");
    var sideX = left;
    var sideY = top;
    var win = window;
    if (adaptive) {
      var offsetParent = getOffsetParent(popper2);
      var heightProp = "clientHeight";
      var widthProp = "clientWidth";
      if (offsetParent === getWindow(popper2)) {
        offsetParent = getDocumentElement(popper2);
        if (getComputedStyle2(offsetParent).position !== "static" && position === "absolute") {
          heightProp = "scrollHeight";
          widthProp = "scrollWidth";
        }
      }
      offsetParent = offsetParent;
      if (placement === top || (placement === left || placement === right) && variation === end) {
        sideY = bottom;
        var offsetY = isFixed && offsetParent === win && win.visualViewport ? win.visualViewport.height : offsetParent[heightProp];
        y -= offsetY - popperRect.height;
        y *= gpuAcceleration ? 1 : -1;
      }
      if (placement === left || (placement === top || placement === bottom) && variation === end) {
        sideX = right;
        var offsetX = isFixed && offsetParent === win && win.visualViewport ? win.visualViewport.width : offsetParent[widthProp];
        x -= offsetX - popperRect.width;
        x *= gpuAcceleration ? 1 : -1;
      }
    }
    var commonStyles = Object.assign({
      position
    }, adaptive && unsetSides);
    var _ref4 = roundOffsets === true ? roundOffsetsByDPR({
      x,
      y
    }, getWindow(popper2)) : {
      x,
      y
    };
    x = _ref4.x;
    y = _ref4.y;
    if (gpuAcceleration) {
      var _Object$assign;
      return Object.assign({}, commonStyles, (_Object$assign = {}, _Object$assign[sideY] = hasY ? "0" : "", _Object$assign[sideX] = hasX ? "0" : "", _Object$assign.transform = (win.devicePixelRatio || 1) <= 1 ? "translate(" + x + "px, " + y + "px)" : "translate3d(" + x + "px, " + y + "px, 0)", _Object$assign));
    }
    return Object.assign({}, commonStyles, (_Object$assign2 = {}, _Object$assign2[sideY] = hasY ? y + "px" : "", _Object$assign2[sideX] = hasX ? x + "px" : "", _Object$assign2.transform = "", _Object$assign2));
  }
  function computeStyles(_ref5) {
    var state = _ref5.state, options = _ref5.options;
    var _options$gpuAccelerat = options.gpuAcceleration, gpuAcceleration = _options$gpuAccelerat === void 0 ? true : _options$gpuAccelerat, _options$adaptive = options.adaptive, adaptive = _options$adaptive === void 0 ? true : _options$adaptive, _options$roundOffsets = options.roundOffsets, roundOffsets = _options$roundOffsets === void 0 ? true : _options$roundOffsets;
    var commonStyles = {
      placement: getBasePlacement(state.placement),
      variation: getVariation(state.placement),
      popper: state.elements.popper,
      popperRect: state.rects.popper,
      gpuAcceleration,
      isFixed: state.options.strategy === "fixed"
    };
    if (state.modifiersData.popperOffsets != null) {
      state.styles.popper = Object.assign({}, state.styles.popper, mapToStyles(Object.assign({}, commonStyles, {
        offsets: state.modifiersData.popperOffsets,
        position: state.options.strategy,
        adaptive,
        roundOffsets
      })));
    }
    if (state.modifiersData.arrow != null) {
      state.styles.arrow = Object.assign({}, state.styles.arrow, mapToStyles(Object.assign({}, commonStyles, {
        offsets: state.modifiersData.arrow,
        position: "absolute",
        adaptive: false,
        roundOffsets
      })));
    }
    state.attributes.popper = Object.assign({}, state.attributes.popper, {
      "data-popper-placement": state.placement
    });
  }
  var computeStyles_default = {
    name: "computeStyles",
    enabled: true,
    phase: "beforeWrite",
    fn: computeStyles,
    data: {}
  };

  // node_modules/@popperjs/core/lib/modifiers/eventListeners.js
  var passive = {
    passive: true
  };
  function effect3(_ref) {
    var state = _ref.state, instance = _ref.instance, options = _ref.options;
    var _options$scroll = options.scroll, scroll = _options$scroll === void 0 ? true : _options$scroll, _options$resize = options.resize, resize = _options$resize === void 0 ? true : _options$resize;
    var window2 = getWindow(state.elements.popper);
    var scrollParents = [].concat(state.scrollParents.reference, state.scrollParents.popper);
    if (scroll) {
      scrollParents.forEach(function(scrollParent) {
        scrollParent.addEventListener("scroll", instance.update, passive);
      });
    }
    if (resize) {
      window2.addEventListener("resize", instance.update, passive);
    }
    return function() {
      if (scroll) {
        scrollParents.forEach(function(scrollParent) {
          scrollParent.removeEventListener("scroll", instance.update, passive);
        });
      }
      if (resize) {
        window2.removeEventListener("resize", instance.update, passive);
      }
    };
  }
  var eventListeners_default = {
    name: "eventListeners",
    enabled: true,
    phase: "write",
    fn: function fn() {
    },
    effect: effect3,
    data: {}
  };

  // node_modules/@popperjs/core/lib/utils/getOppositePlacement.js
  var hash = {
    left: "right",
    right: "left",
    bottom: "top",
    top: "bottom"
  };
  function getOppositePlacement(placement) {
    return placement.replace(/left|right|bottom|top/g, function(matched) {
      return hash[matched];
    });
  }

  // node_modules/@popperjs/core/lib/utils/getOppositeVariationPlacement.js
  var hash2 = {
    start: "end",
    end: "start"
  };
  function getOppositeVariationPlacement(placement) {
    return placement.replace(/start|end/g, function(matched) {
      return hash2[matched];
    });
  }

  // node_modules/@popperjs/core/lib/dom-utils/getWindowScroll.js
  function getWindowScroll(node) {
    var win = getWindow(node);
    var scrollLeft = win.pageXOffset;
    var scrollTop = win.pageYOffset;
    return {
      scrollLeft,
      scrollTop
    };
  }

  // node_modules/@popperjs/core/lib/dom-utils/getWindowScrollBarX.js
  function getWindowScrollBarX(element) {
    return getBoundingClientRect(getDocumentElement(element)).left + getWindowScroll(element).scrollLeft;
  }

  // node_modules/@popperjs/core/lib/dom-utils/getViewportRect.js
  function getViewportRect(element, strategy) {
    var win = getWindow(element);
    var html = getDocumentElement(element);
    var visualViewport = win.visualViewport;
    var width = html.clientWidth;
    var height = html.clientHeight;
    var x = 0;
    var y = 0;
    if (visualViewport) {
      width = visualViewport.width;
      height = visualViewport.height;
      var layoutViewport = isLayoutViewport();
      if (layoutViewport || !layoutViewport && strategy === "fixed") {
        x = visualViewport.offsetLeft;
        y = visualViewport.offsetTop;
      }
    }
    return {
      width,
      height,
      x: x + getWindowScrollBarX(element),
      y
    };
  }

  // node_modules/@popperjs/core/lib/dom-utils/getDocumentRect.js
  function getDocumentRect(element) {
    var _element$ownerDocumen;
    var html = getDocumentElement(element);
    var winScroll = getWindowScroll(element);
    var body = (_element$ownerDocumen = element.ownerDocument) == null ? void 0 : _element$ownerDocumen.body;
    var width = max(html.scrollWidth, html.clientWidth, body ? body.scrollWidth : 0, body ? body.clientWidth : 0);
    var height = max(html.scrollHeight, html.clientHeight, body ? body.scrollHeight : 0, body ? body.clientHeight : 0);
    var x = -winScroll.scrollLeft + getWindowScrollBarX(element);
    var y = -winScroll.scrollTop;
    if (getComputedStyle2(body || html).direction === "rtl") {
      x += max(html.clientWidth, body ? body.clientWidth : 0) - width;
    }
    return {
      width,
      height,
      x,
      y
    };
  }

  // node_modules/@popperjs/core/lib/dom-utils/isScrollParent.js
  function isScrollParent(element) {
    var _getComputedStyle = getComputedStyle2(element), overflow = _getComputedStyle.overflow, overflowX = _getComputedStyle.overflowX, overflowY = _getComputedStyle.overflowY;
    return /auto|scroll|overlay|hidden/.test(overflow + overflowY + overflowX);
  }

  // node_modules/@popperjs/core/lib/dom-utils/getScrollParent.js
  function getScrollParent(node) {
    if (["html", "body", "#document"].indexOf(getNodeName(node)) >= 0) {
      return node.ownerDocument.body;
    }
    if (isHTMLElement(node) && isScrollParent(node)) {
      return node;
    }
    return getScrollParent(getParentNode(node));
  }

  // node_modules/@popperjs/core/lib/dom-utils/listScrollParents.js
  function listScrollParents(element, list) {
    var _element$ownerDocumen;
    if (list === void 0) {
      list = [];
    }
    var scrollParent = getScrollParent(element);
    var isBody = scrollParent === ((_element$ownerDocumen = element.ownerDocument) == null ? void 0 : _element$ownerDocumen.body);
    var win = getWindow(scrollParent);
    var target = isBody ? [win].concat(win.visualViewport || [], isScrollParent(scrollParent) ? scrollParent : []) : scrollParent;
    var updatedList = list.concat(target);
    return isBody ? updatedList : updatedList.concat(listScrollParents(getParentNode(target)));
  }

  // node_modules/@popperjs/core/lib/utils/rectToClientRect.js
  function rectToClientRect(rect) {
    return Object.assign({}, rect, {
      left: rect.x,
      top: rect.y,
      right: rect.x + rect.width,
      bottom: rect.y + rect.height
    });
  }

  // node_modules/@popperjs/core/lib/dom-utils/getClippingRect.js
  function getInnerBoundingClientRect(element, strategy) {
    var rect = getBoundingClientRect(element, false, strategy === "fixed");
    rect.top = rect.top + element.clientTop;
    rect.left = rect.left + element.clientLeft;
    rect.bottom = rect.top + element.clientHeight;
    rect.right = rect.left + element.clientWidth;
    rect.width = element.clientWidth;
    rect.height = element.clientHeight;
    rect.x = rect.left;
    rect.y = rect.top;
    return rect;
  }
  function getClientRectFromMixedType(element, clippingParent, strategy) {
    return clippingParent === viewport ? rectToClientRect(getViewportRect(element, strategy)) : isElement(clippingParent) ? getInnerBoundingClientRect(clippingParent, strategy) : rectToClientRect(getDocumentRect(getDocumentElement(element)));
  }
  function getClippingParents(element) {
    var clippingParents2 = listScrollParents(getParentNode(element));
    var canEscapeClipping = ["absolute", "fixed"].indexOf(getComputedStyle2(element).position) >= 0;
    var clipperElement = canEscapeClipping && isHTMLElement(element) ? getOffsetParent(element) : element;
    if (!isElement(clipperElement)) {
      return [];
    }
    return clippingParents2.filter(function(clippingParent) {
      return isElement(clippingParent) && contains(clippingParent, clipperElement) && getNodeName(clippingParent) !== "body";
    });
  }
  function getClippingRect(element, boundary, rootBoundary, strategy) {
    var mainClippingParents = boundary === "clippingParents" ? getClippingParents(element) : [].concat(boundary);
    var clippingParents2 = [].concat(mainClippingParents, [rootBoundary]);
    var firstClippingParent = clippingParents2[0];
    var clippingRect = clippingParents2.reduce(function(accRect, clippingParent) {
      var rect = getClientRectFromMixedType(element, clippingParent, strategy);
      accRect.top = max(rect.top, accRect.top);
      accRect.right = min(rect.right, accRect.right);
      accRect.bottom = min(rect.bottom, accRect.bottom);
      accRect.left = max(rect.left, accRect.left);
      return accRect;
    }, getClientRectFromMixedType(element, firstClippingParent, strategy));
    clippingRect.width = clippingRect.right - clippingRect.left;
    clippingRect.height = clippingRect.bottom - clippingRect.top;
    clippingRect.x = clippingRect.left;
    clippingRect.y = clippingRect.top;
    return clippingRect;
  }

  // node_modules/@popperjs/core/lib/utils/computeOffsets.js
  function computeOffsets(_ref) {
    var reference2 = _ref.reference, element = _ref.element, placement = _ref.placement;
    var basePlacement = placement ? getBasePlacement(placement) : null;
    var variation = placement ? getVariation(placement) : null;
    var commonX = reference2.x + reference2.width / 2 - element.width / 2;
    var commonY = reference2.y + reference2.height / 2 - element.height / 2;
    var offsets;
    switch (basePlacement) {
      case top:
        offsets = {
          x: commonX,
          y: reference2.y - element.height
        };
        break;
      case bottom:
        offsets = {
          x: commonX,
          y: reference2.y + reference2.height
        };
        break;
      case right:
        offsets = {
          x: reference2.x + reference2.width,
          y: commonY
        };
        break;
      case left:
        offsets = {
          x: reference2.x - element.width,
          y: commonY
        };
        break;
      default:
        offsets = {
          x: reference2.x,
          y: reference2.y
        };
    }
    var mainAxis = basePlacement ? getMainAxisFromPlacement(basePlacement) : null;
    if (mainAxis != null) {
      var len = mainAxis === "y" ? "height" : "width";
      switch (variation) {
        case start2:
          offsets[mainAxis] = offsets[mainAxis] - (reference2[len] / 2 - element[len] / 2);
          break;
        case end:
          offsets[mainAxis] = offsets[mainAxis] + (reference2[len] / 2 - element[len] / 2);
          break;
        default:
      }
    }
    return offsets;
  }

  // node_modules/@popperjs/core/lib/utils/detectOverflow.js
  function detectOverflow(state, options) {
    if (options === void 0) {
      options = {};
    }
    var _options = options, _options$placement = _options.placement, placement = _options$placement === void 0 ? state.placement : _options$placement, _options$strategy = _options.strategy, strategy = _options$strategy === void 0 ? state.strategy : _options$strategy, _options$boundary = _options.boundary, boundary = _options$boundary === void 0 ? clippingParents : _options$boundary, _options$rootBoundary = _options.rootBoundary, rootBoundary = _options$rootBoundary === void 0 ? viewport : _options$rootBoundary, _options$elementConte = _options.elementContext, elementContext = _options$elementConte === void 0 ? popper : _options$elementConte, _options$altBoundary = _options.altBoundary, altBoundary = _options$altBoundary === void 0 ? false : _options$altBoundary, _options$padding = _options.padding, padding = _options$padding === void 0 ? 0 : _options$padding;
    var paddingObject = mergePaddingObject(typeof padding !== "number" ? padding : expandToHashMap(padding, basePlacements));
    var altContext = elementContext === popper ? reference : popper;
    var popperRect = state.rects.popper;
    var element = state.elements[altBoundary ? altContext : elementContext];
    var clippingClientRect = getClippingRect(isElement(element) ? element : element.contextElement || getDocumentElement(state.elements.popper), boundary, rootBoundary, strategy);
    var referenceClientRect = getBoundingClientRect(state.elements.reference);
    var popperOffsets2 = computeOffsets({
      reference: referenceClientRect,
      element: popperRect,
      strategy: "absolute",
      placement
    });
    var popperClientRect = rectToClientRect(Object.assign({}, popperRect, popperOffsets2));
    var elementClientRect = elementContext === popper ? popperClientRect : referenceClientRect;
    var overflowOffsets = {
      top: clippingClientRect.top - elementClientRect.top + paddingObject.top,
      bottom: elementClientRect.bottom - clippingClientRect.bottom + paddingObject.bottom,
      left: clippingClientRect.left - elementClientRect.left + paddingObject.left,
      right: elementClientRect.right - clippingClientRect.right + paddingObject.right
    };
    var offsetData = state.modifiersData.offset;
    if (elementContext === popper && offsetData) {
      var offset2 = offsetData[placement];
      Object.keys(overflowOffsets).forEach(function(key) {
        var multiply = [right, bottom].indexOf(key) >= 0 ? 1 : -1;
        var axis = [top, bottom].indexOf(key) >= 0 ? "y" : "x";
        overflowOffsets[key] += offset2[axis] * multiply;
      });
    }
    return overflowOffsets;
  }

  // node_modules/@popperjs/core/lib/utils/computeAutoPlacement.js
  function computeAutoPlacement(state, options) {
    if (options === void 0) {
      options = {};
    }
    var _options = options, placement = _options.placement, boundary = _options.boundary, rootBoundary = _options.rootBoundary, padding = _options.padding, flipVariations = _options.flipVariations, _options$allowedAutoP = _options.allowedAutoPlacements, allowedAutoPlacements = _options$allowedAutoP === void 0 ? placements : _options$allowedAutoP;
    var variation = getVariation(placement);
    var placements2 = variation ? flipVariations ? variationPlacements : variationPlacements.filter(function(placement2) {
      return getVariation(placement2) === variation;
    }) : basePlacements;
    var allowedPlacements = placements2.filter(function(placement2) {
      return allowedAutoPlacements.indexOf(placement2) >= 0;
    });
    if (allowedPlacements.length === 0) {
      allowedPlacements = placements2;
    }
    var overflows = allowedPlacements.reduce(function(acc, placement2) {
      acc[placement2] = detectOverflow(state, {
        placement: placement2,
        boundary,
        rootBoundary,
        padding
      })[getBasePlacement(placement2)];
      return acc;
    }, {});
    return Object.keys(overflows).sort(function(a, b) {
      return overflows[a] - overflows[b];
    });
  }

  // node_modules/@popperjs/core/lib/modifiers/flip.js
  function getExpandedFallbackPlacements(placement) {
    if (getBasePlacement(placement) === auto) {
      return [];
    }
    var oppositePlacement = getOppositePlacement(placement);
    return [getOppositeVariationPlacement(placement), oppositePlacement, getOppositeVariationPlacement(oppositePlacement)];
  }
  function flip(_ref) {
    var state = _ref.state, options = _ref.options, name = _ref.name;
    if (state.modifiersData[name]._skip) {
      return;
    }
    var _options$mainAxis = options.mainAxis, checkMainAxis = _options$mainAxis === void 0 ? true : _options$mainAxis, _options$altAxis = options.altAxis, checkAltAxis = _options$altAxis === void 0 ? true : _options$altAxis, specifiedFallbackPlacements = options.fallbackPlacements, padding = options.padding, boundary = options.boundary, rootBoundary = options.rootBoundary, altBoundary = options.altBoundary, _options$flipVariatio = options.flipVariations, flipVariations = _options$flipVariatio === void 0 ? true : _options$flipVariatio, allowedAutoPlacements = options.allowedAutoPlacements;
    var preferredPlacement = state.options.placement;
    var basePlacement = getBasePlacement(preferredPlacement);
    var isBasePlacement = basePlacement === preferredPlacement;
    var fallbackPlacements = specifiedFallbackPlacements || (isBasePlacement || !flipVariations ? [getOppositePlacement(preferredPlacement)] : getExpandedFallbackPlacements(preferredPlacement));
    var placements2 = [preferredPlacement].concat(fallbackPlacements).reduce(function(acc, placement2) {
      return acc.concat(getBasePlacement(placement2) === auto ? computeAutoPlacement(state, {
        placement: placement2,
        boundary,
        rootBoundary,
        padding,
        flipVariations,
        allowedAutoPlacements
      }) : placement2);
    }, []);
    var referenceRect = state.rects.reference;
    var popperRect = state.rects.popper;
    var checksMap = /* @__PURE__ */ new Map();
    var makeFallbackChecks = true;
    var firstFittingPlacement = placements2[0];
    for (var i = 0; i < placements2.length; i++) {
      var placement = placements2[i];
      var _basePlacement = getBasePlacement(placement);
      var isStartVariation = getVariation(placement) === start2;
      var isVertical = [top, bottom].indexOf(_basePlacement) >= 0;
      var len = isVertical ? "width" : "height";
      var overflow = detectOverflow(state, {
        placement,
        boundary,
        rootBoundary,
        altBoundary,
        padding
      });
      var mainVariationSide = isVertical ? isStartVariation ? right : left : isStartVariation ? bottom : top;
      if (referenceRect[len] > popperRect[len]) {
        mainVariationSide = getOppositePlacement(mainVariationSide);
      }
      var altVariationSide = getOppositePlacement(mainVariationSide);
      var checks = [];
      if (checkMainAxis) {
        checks.push(overflow[_basePlacement] <= 0);
      }
      if (checkAltAxis) {
        checks.push(overflow[mainVariationSide] <= 0, overflow[altVariationSide] <= 0);
      }
      if (checks.every(function(check) {
        return check;
      })) {
        firstFittingPlacement = placement;
        makeFallbackChecks = false;
        break;
      }
      checksMap.set(placement, checks);
    }
    if (makeFallbackChecks) {
      var numberOfChecks = flipVariations ? 3 : 1;
      var _loop = function _loop2(_i2) {
        var fittingPlacement = placements2.find(function(placement2) {
          var checks2 = checksMap.get(placement2);
          if (checks2) {
            return checks2.slice(0, _i2).every(function(check) {
              return check;
            });
          }
        });
        if (fittingPlacement) {
          firstFittingPlacement = fittingPlacement;
          return "break";
        }
      };
      for (var _i = numberOfChecks; _i > 0; _i--) {
        var _ret = _loop(_i);
        if (_ret === "break")
          break;
      }
    }
    if (state.placement !== firstFittingPlacement) {
      state.modifiersData[name]._skip = true;
      state.placement = firstFittingPlacement;
      state.reset = true;
    }
  }
  var flip_default = {
    name: "flip",
    enabled: true,
    phase: "main",
    fn: flip,
    requiresIfExists: ["offset"],
    data: {
      _skip: false
    }
  };

  // node_modules/@popperjs/core/lib/modifiers/hide.js
  function getSideOffsets(overflow, rect, preventedOffsets) {
    if (preventedOffsets === void 0) {
      preventedOffsets = {
        x: 0,
        y: 0
      };
    }
    return {
      top: overflow.top - rect.height - preventedOffsets.y,
      right: overflow.right - rect.width + preventedOffsets.x,
      bottom: overflow.bottom - rect.height + preventedOffsets.y,
      left: overflow.left - rect.width - preventedOffsets.x
    };
  }
  function isAnySideFullyClipped(overflow) {
    return [top, right, bottom, left].some(function(side) {
      return overflow[side] >= 0;
    });
  }
  function hide(_ref) {
    var state = _ref.state, name = _ref.name;
    var referenceRect = state.rects.reference;
    var popperRect = state.rects.popper;
    var preventedOffsets = state.modifiersData.preventOverflow;
    var referenceOverflow = detectOverflow(state, {
      elementContext: "reference"
    });
    var popperAltOverflow = detectOverflow(state, {
      altBoundary: true
    });
    var referenceClippingOffsets = getSideOffsets(referenceOverflow, referenceRect);
    var popperEscapeOffsets = getSideOffsets(popperAltOverflow, popperRect, preventedOffsets);
    var isReferenceHidden = isAnySideFullyClipped(referenceClippingOffsets);
    var hasPopperEscaped = isAnySideFullyClipped(popperEscapeOffsets);
    state.modifiersData[name] = {
      referenceClippingOffsets,
      popperEscapeOffsets,
      isReferenceHidden,
      hasPopperEscaped
    };
    state.attributes.popper = Object.assign({}, state.attributes.popper, {
      "data-popper-reference-hidden": isReferenceHidden,
      "data-popper-escaped": hasPopperEscaped
    });
  }
  var hide_default = {
    name: "hide",
    enabled: true,
    phase: "main",
    requiresIfExists: ["preventOverflow"],
    fn: hide
  };

  // node_modules/@popperjs/core/lib/modifiers/offset.js
  function distanceAndSkiddingToXY(placement, rects, offset2) {
    var basePlacement = getBasePlacement(placement);
    var invertDistance = [left, top].indexOf(basePlacement) >= 0 ? -1 : 1;
    var _ref = typeof offset2 === "function" ? offset2(Object.assign({}, rects, {
      placement
    })) : offset2, skidding = _ref[0], distance = _ref[1];
    skidding = skidding || 0;
    distance = (distance || 0) * invertDistance;
    return [left, right].indexOf(basePlacement) >= 0 ? {
      x: distance,
      y: skidding
    } : {
      x: skidding,
      y: distance
    };
  }
  function offset(_ref2) {
    var state = _ref2.state, options = _ref2.options, name = _ref2.name;
    var _options$offset = options.offset, offset2 = _options$offset === void 0 ? [0, 0] : _options$offset;
    var data = placements.reduce(function(acc, placement) {
      acc[placement] = distanceAndSkiddingToXY(placement, state.rects, offset2);
      return acc;
    }, {});
    var _data$state$placement = data[state.placement], x = _data$state$placement.x, y = _data$state$placement.y;
    if (state.modifiersData.popperOffsets != null) {
      state.modifiersData.popperOffsets.x += x;
      state.modifiersData.popperOffsets.y += y;
    }
    state.modifiersData[name] = data;
  }
  var offset_default = {
    name: "offset",
    enabled: true,
    phase: "main",
    requires: ["popperOffsets"],
    fn: offset
  };

  // node_modules/@popperjs/core/lib/modifiers/popperOffsets.js
  function popperOffsets(_ref) {
    var state = _ref.state, name = _ref.name;
    state.modifiersData[name] = computeOffsets({
      reference: state.rects.reference,
      element: state.rects.popper,
      strategy: "absolute",
      placement: state.placement
    });
  }
  var popperOffsets_default = {
    name: "popperOffsets",
    enabled: true,
    phase: "read",
    fn: popperOffsets,
    data: {}
  };

  // node_modules/@popperjs/core/lib/utils/getAltAxis.js
  function getAltAxis(axis) {
    return axis === "x" ? "y" : "x";
  }

  // node_modules/@popperjs/core/lib/modifiers/preventOverflow.js
  function preventOverflow(_ref) {
    var state = _ref.state, options = _ref.options, name = _ref.name;
    var _options$mainAxis = options.mainAxis, checkMainAxis = _options$mainAxis === void 0 ? true : _options$mainAxis, _options$altAxis = options.altAxis, checkAltAxis = _options$altAxis === void 0 ? false : _options$altAxis, boundary = options.boundary, rootBoundary = options.rootBoundary, altBoundary = options.altBoundary, padding = options.padding, _options$tether = options.tether, tether = _options$tether === void 0 ? true : _options$tether, _options$tetherOffset = options.tetherOffset, tetherOffset = _options$tetherOffset === void 0 ? 0 : _options$tetherOffset;
    var overflow = detectOverflow(state, {
      boundary,
      rootBoundary,
      padding,
      altBoundary
    });
    var basePlacement = getBasePlacement(state.placement);
    var variation = getVariation(state.placement);
    var isBasePlacement = !variation;
    var mainAxis = getMainAxisFromPlacement(basePlacement);
    var altAxis = getAltAxis(mainAxis);
    var popperOffsets2 = state.modifiersData.popperOffsets;
    var referenceRect = state.rects.reference;
    var popperRect = state.rects.popper;
    var tetherOffsetValue = typeof tetherOffset === "function" ? tetherOffset(Object.assign({}, state.rects, {
      placement: state.placement
    })) : tetherOffset;
    var normalizedTetherOffsetValue = typeof tetherOffsetValue === "number" ? {
      mainAxis: tetherOffsetValue,
      altAxis: tetherOffsetValue
    } : Object.assign({
      mainAxis: 0,
      altAxis: 0
    }, tetherOffsetValue);
    var offsetModifierState = state.modifiersData.offset ? state.modifiersData.offset[state.placement] : null;
    var data = {
      x: 0,
      y: 0
    };
    if (!popperOffsets2) {
      return;
    }
    if (checkMainAxis) {
      var _offsetModifierState$;
      var mainSide = mainAxis === "y" ? top : left;
      var altSide = mainAxis === "y" ? bottom : right;
      var len = mainAxis === "y" ? "height" : "width";
      var offset2 = popperOffsets2[mainAxis];
      var min2 = offset2 + overflow[mainSide];
      var max2 = offset2 - overflow[altSide];
      var additive = tether ? -popperRect[len] / 2 : 0;
      var minLen = variation === start2 ? referenceRect[len] : popperRect[len];
      var maxLen = variation === start2 ? -popperRect[len] : -referenceRect[len];
      var arrowElement = state.elements.arrow;
      var arrowRect = tether && arrowElement ? getLayoutRect(arrowElement) : {
        width: 0,
        height: 0
      };
      var arrowPaddingObject = state.modifiersData["arrow#persistent"] ? state.modifiersData["arrow#persistent"].padding : getFreshSideObject();
      var arrowPaddingMin = arrowPaddingObject[mainSide];
      var arrowPaddingMax = arrowPaddingObject[altSide];
      var arrowLen = within(0, referenceRect[len], arrowRect[len]);
      var minOffset = isBasePlacement ? referenceRect[len] / 2 - additive - arrowLen - arrowPaddingMin - normalizedTetherOffsetValue.mainAxis : minLen - arrowLen - arrowPaddingMin - normalizedTetherOffsetValue.mainAxis;
      var maxOffset = isBasePlacement ? -referenceRect[len] / 2 + additive + arrowLen + arrowPaddingMax + normalizedTetherOffsetValue.mainAxis : maxLen + arrowLen + arrowPaddingMax + normalizedTetherOffsetValue.mainAxis;
      var arrowOffsetParent = state.elements.arrow && getOffsetParent(state.elements.arrow);
      var clientOffset = arrowOffsetParent ? mainAxis === "y" ? arrowOffsetParent.clientTop || 0 : arrowOffsetParent.clientLeft || 0 : 0;
      var offsetModifierValue = (_offsetModifierState$ = offsetModifierState == null ? void 0 : offsetModifierState[mainAxis]) != null ? _offsetModifierState$ : 0;
      var tetherMin = offset2 + minOffset - offsetModifierValue - clientOffset;
      var tetherMax = offset2 + maxOffset - offsetModifierValue;
      var preventedOffset = within(tether ? min(min2, tetherMin) : min2, offset2, tether ? max(max2, tetherMax) : max2);
      popperOffsets2[mainAxis] = preventedOffset;
      data[mainAxis] = preventedOffset - offset2;
    }
    if (checkAltAxis) {
      var _offsetModifierState$2;
      var _mainSide = mainAxis === "x" ? top : left;
      var _altSide = mainAxis === "x" ? bottom : right;
      var _offset = popperOffsets2[altAxis];
      var _len = altAxis === "y" ? "height" : "width";
      var _min = _offset + overflow[_mainSide];
      var _max = _offset - overflow[_altSide];
      var isOriginSide = [top, left].indexOf(basePlacement) !== -1;
      var _offsetModifierValue = (_offsetModifierState$2 = offsetModifierState == null ? void 0 : offsetModifierState[altAxis]) != null ? _offsetModifierState$2 : 0;
      var _tetherMin = isOriginSide ? _min : _offset - referenceRect[_len] - popperRect[_len] - _offsetModifierValue + normalizedTetherOffsetValue.altAxis;
      var _tetherMax = isOriginSide ? _offset + referenceRect[_len] + popperRect[_len] - _offsetModifierValue - normalizedTetherOffsetValue.altAxis : _max;
      var _preventedOffset = tether && isOriginSide ? withinMaxClamp(_tetherMin, _offset, _tetherMax) : within(tether ? _tetherMin : _min, _offset, tether ? _tetherMax : _max);
      popperOffsets2[altAxis] = _preventedOffset;
      data[altAxis] = _preventedOffset - _offset;
    }
    state.modifiersData[name] = data;
  }
  var preventOverflow_default = {
    name: "preventOverflow",
    enabled: true,
    phase: "main",
    fn: preventOverflow,
    requiresIfExists: ["offset"]
  };

  // node_modules/@popperjs/core/lib/dom-utils/getHTMLElementScroll.js
  function getHTMLElementScroll(element) {
    return {
      scrollLeft: element.scrollLeft,
      scrollTop: element.scrollTop
    };
  }

  // node_modules/@popperjs/core/lib/dom-utils/getNodeScroll.js
  function getNodeScroll(node) {
    if (node === getWindow(node) || !isHTMLElement(node)) {
      return getWindowScroll(node);
    } else {
      return getHTMLElementScroll(node);
    }
  }

  // node_modules/@popperjs/core/lib/dom-utils/getCompositeRect.js
  function isElementScaled(element) {
    var rect = element.getBoundingClientRect();
    var scaleX = round(rect.width) / element.offsetWidth || 1;
    var scaleY = round(rect.height) / element.offsetHeight || 1;
    return scaleX !== 1 || scaleY !== 1;
  }
  function getCompositeRect(elementOrVirtualElement, offsetParent, isFixed) {
    if (isFixed === void 0) {
      isFixed = false;
    }
    var isOffsetParentAnElement = isHTMLElement(offsetParent);
    var offsetParentIsScaled = isHTMLElement(offsetParent) && isElementScaled(offsetParent);
    var documentElement = getDocumentElement(offsetParent);
    var rect = getBoundingClientRect(elementOrVirtualElement, offsetParentIsScaled, isFixed);
    var scroll = {
      scrollLeft: 0,
      scrollTop: 0
    };
    var offsets = {
      x: 0,
      y: 0
    };
    if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
      if (getNodeName(offsetParent) !== "body" || isScrollParent(documentElement)) {
        scroll = getNodeScroll(offsetParent);
      }
      if (isHTMLElement(offsetParent)) {
        offsets = getBoundingClientRect(offsetParent, true);
        offsets.x += offsetParent.clientLeft;
        offsets.y += offsetParent.clientTop;
      } else if (documentElement) {
        offsets.x = getWindowScrollBarX(documentElement);
      }
    }
    return {
      x: rect.left + scroll.scrollLeft - offsets.x,
      y: rect.top + scroll.scrollTop - offsets.y,
      width: rect.width,
      height: rect.height
    };
  }

  // node_modules/@popperjs/core/lib/utils/orderModifiers.js
  function order(modifiers) {
    var map = /* @__PURE__ */ new Map();
    var visited = /* @__PURE__ */ new Set();
    var result = [];
    modifiers.forEach(function(modifier) {
      map.set(modifier.name, modifier);
    });
    function sort(modifier) {
      visited.add(modifier.name);
      var requires = [].concat(modifier.requires || [], modifier.requiresIfExists || []);
      requires.forEach(function(dep) {
        if (!visited.has(dep)) {
          var depModifier = map.get(dep);
          if (depModifier) {
            sort(depModifier);
          }
        }
      });
      result.push(modifier);
    }
    modifiers.forEach(function(modifier) {
      if (!visited.has(modifier.name)) {
        sort(modifier);
      }
    });
    return result;
  }
  function orderModifiers(modifiers) {
    var orderedModifiers = order(modifiers);
    return modifierPhases.reduce(function(acc, phase) {
      return acc.concat(orderedModifiers.filter(function(modifier) {
        return modifier.phase === phase;
      }));
    }, []);
  }

  // node_modules/@popperjs/core/lib/utils/debounce.js
  function debounce(fn2) {
    var pending;
    return function() {
      if (!pending) {
        pending = new Promise(function(resolve) {
          Promise.resolve().then(function() {
            pending = void 0;
            resolve(fn2());
          });
        });
      }
      return pending;
    };
  }

  // node_modules/@popperjs/core/lib/utils/mergeByName.js
  function mergeByName(modifiers) {
    var merged = modifiers.reduce(function(merged2, current) {
      var existing = merged2[current.name];
      merged2[current.name] = existing ? Object.assign({}, existing, current, {
        options: Object.assign({}, existing.options, current.options),
        data: Object.assign({}, existing.data, current.data)
      }) : current;
      return merged2;
    }, {});
    return Object.keys(merged).map(function(key) {
      return merged[key];
    });
  }

  // node_modules/@popperjs/core/lib/createPopper.js
  var DEFAULT_OPTIONS = {
    placement: "bottom",
    modifiers: [],
    strategy: "absolute"
  };
  function areValidElements() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    return !args.some(function(element) {
      return !(element && typeof element.getBoundingClientRect === "function");
    });
  }
  function popperGenerator(generatorOptions) {
    if (generatorOptions === void 0) {
      generatorOptions = {};
    }
    var _generatorOptions = generatorOptions, _generatorOptions$def = _generatorOptions.defaultModifiers, defaultModifiers3 = _generatorOptions$def === void 0 ? [] : _generatorOptions$def, _generatorOptions$def2 = _generatorOptions.defaultOptions, defaultOptions2 = _generatorOptions$def2 === void 0 ? DEFAULT_OPTIONS : _generatorOptions$def2;
    return function createPopper4(reference2, popper2, options) {
      if (options === void 0) {
        options = defaultOptions2;
      }
      var state = {
        placement: "bottom",
        orderedModifiers: [],
        options: Object.assign({}, DEFAULT_OPTIONS, defaultOptions2),
        modifiersData: {},
        elements: {
          reference: reference2,
          popper: popper2
        },
        attributes: {},
        styles: {}
      };
      var effectCleanupFns = [];
      var isDestroyed = false;
      var instance = {
        state,
        setOptions: function setOptions(setOptionsAction) {
          var options2 = typeof setOptionsAction === "function" ? setOptionsAction(state.options) : setOptionsAction;
          cleanupModifierEffects();
          state.options = Object.assign({}, defaultOptions2, state.options, options2);
          state.scrollParents = {
            reference: isElement(reference2) ? listScrollParents(reference2) : reference2.contextElement ? listScrollParents(reference2.contextElement) : [],
            popper: listScrollParents(popper2)
          };
          var orderedModifiers = orderModifiers(mergeByName([].concat(defaultModifiers3, state.options.modifiers)));
          state.orderedModifiers = orderedModifiers.filter(function(m) {
            return m.enabled;
          });
          runModifierEffects();
          return instance.update();
        },
        forceUpdate: function forceUpdate() {
          if (isDestroyed) {
            return;
          }
          var _state$elements = state.elements, reference3 = _state$elements.reference, popper3 = _state$elements.popper;
          if (!areValidElements(reference3, popper3)) {
            return;
          }
          state.rects = {
            reference: getCompositeRect(reference3, getOffsetParent(popper3), state.options.strategy === "fixed"),
            popper: getLayoutRect(popper3)
          };
          state.reset = false;
          state.placement = state.options.placement;
          state.orderedModifiers.forEach(function(modifier) {
            return state.modifiersData[modifier.name] = Object.assign({}, modifier.data);
          });
          for (var index = 0; index < state.orderedModifiers.length; index++) {
            if (state.reset === true) {
              state.reset = false;
              index = -1;
              continue;
            }
            var _state$orderedModifie = state.orderedModifiers[index], fn2 = _state$orderedModifie.fn, _state$orderedModifie2 = _state$orderedModifie.options, _options = _state$orderedModifie2 === void 0 ? {} : _state$orderedModifie2, name = _state$orderedModifie.name;
            if (typeof fn2 === "function") {
              state = fn2({
                state,
                options: _options,
                name,
                instance
              }) || state;
            }
          }
        },
        update: debounce(function() {
          return new Promise(function(resolve) {
            instance.forceUpdate();
            resolve(state);
          });
        }),
        destroy: function destroy() {
          cleanupModifierEffects();
          isDestroyed = true;
        }
      };
      if (!areValidElements(reference2, popper2)) {
        return instance;
      }
      instance.setOptions(options).then(function(state2) {
        if (!isDestroyed && options.onFirstUpdate) {
          options.onFirstUpdate(state2);
        }
      });
      function runModifierEffects() {
        state.orderedModifiers.forEach(function(_ref) {
          var name = _ref.name, _ref$options = _ref.options, options2 = _ref$options === void 0 ? {} : _ref$options, effect4 = _ref.effect;
          if (typeof effect4 === "function") {
            var cleanupFn = effect4({
              state,
              name,
              instance,
              options: options2
            });
            var noopFn = function noopFn2() {
            };
            effectCleanupFns.push(cleanupFn || noopFn);
          }
        });
      }
      function cleanupModifierEffects() {
        effectCleanupFns.forEach(function(fn2) {
          return fn2();
        });
        effectCleanupFns = [];
      }
      return instance;
    };
  }
  var createPopper = /* @__PURE__ */ popperGenerator();

  // node_modules/@popperjs/core/lib/popper-lite.js
  var defaultModifiers = [eventListeners_default, popperOffsets_default, computeStyles_default, applyStyles_default];
  var createPopper2 = /* @__PURE__ */ popperGenerator({
    defaultModifiers
  });

  // node_modules/@popperjs/core/lib/popper.js
  var defaultModifiers2 = [eventListeners_default, popperOffsets_default, computeStyles_default, applyStyles_default, offset_default, flip_default, preventOverflow_default, arrow_default, hide_default];
  var createPopper3 = /* @__PURE__ */ popperGenerator({
    defaultModifiers: defaultModifiers2
  });

  // node_modules/bootstrap/dist/js/bootstrap.esm.js
  var elementMap = /* @__PURE__ */ new Map();
  var Data = {
    set(element, key, instance) {
      if (!elementMap.has(element)) {
        elementMap.set(element, /* @__PURE__ */ new Map());
      }
      const instanceMap = elementMap.get(element);
      if (!instanceMap.has(key) && instanceMap.size !== 0) {
        console.error(`Bootstrap doesn't allow more than one instance per element. Bound instance: ${Array.from(instanceMap.keys())[0]}.`);
        return;
      }
      instanceMap.set(key, instance);
    },
    get(element, key) {
      if (elementMap.has(element)) {
        return elementMap.get(element).get(key) || null;
      }
      return null;
    },
    remove(element, key) {
      if (!elementMap.has(element)) {
        return;
      }
      const instanceMap = elementMap.get(element);
      instanceMap.delete(key);
      if (instanceMap.size === 0) {
        elementMap.delete(element);
      }
    }
  };
  var MAX_UID = 1e6;
  var MILLISECONDS_MULTIPLIER = 1e3;
  var TRANSITION_END = "transitionend";
  var parseSelector = (selector) => {
    if (selector && window.CSS && window.CSS.escape) {
      selector = selector.replace(/#([^\s"#']+)/g, (match, id) => `#${CSS.escape(id)}`);
    }
    return selector;
  };
  var toType = (object) => {
    if (object === null || object === void 0) {
      return `${object}`;
    }
    return Object.prototype.toString.call(object).match(/\s([a-z]+)/i)[1].toLowerCase();
  };
  var getUID = (prefix) => {
    do {
      prefix += Math.floor(Math.random() * MAX_UID);
    } while (document.getElementById(prefix));
    return prefix;
  };
  var getTransitionDurationFromElement = (element) => {
    if (!element) {
      return 0;
    }
    let {
      transitionDuration,
      transitionDelay
    } = window.getComputedStyle(element);
    const floatTransitionDuration = Number.parseFloat(transitionDuration);
    const floatTransitionDelay = Number.parseFloat(transitionDelay);
    if (!floatTransitionDuration && !floatTransitionDelay) {
      return 0;
    }
    transitionDuration = transitionDuration.split(",")[0];
    transitionDelay = transitionDelay.split(",")[0];
    return (Number.parseFloat(transitionDuration) + Number.parseFloat(transitionDelay)) * MILLISECONDS_MULTIPLIER;
  };
  var triggerTransitionEnd = (element) => {
    element.dispatchEvent(new Event(TRANSITION_END));
  };
  var isElement2 = (object) => {
    if (!object || typeof object !== "object") {
      return false;
    }
    if (typeof object.jquery !== "undefined") {
      object = object[0];
    }
    return typeof object.nodeType !== "undefined";
  };
  var getElement = (object) => {
    if (isElement2(object)) {
      return object.jquery ? object[0] : object;
    }
    if (typeof object === "string" && object.length > 0) {
      return document.querySelector(parseSelector(object));
    }
    return null;
  };
  var isVisible = (element) => {
    if (!isElement2(element) || element.getClientRects().length === 0) {
      return false;
    }
    const elementIsVisible = getComputedStyle(element).getPropertyValue("visibility") === "visible";
    const closedDetails = element.closest("details:not([open])");
    if (!closedDetails) {
      return elementIsVisible;
    }
    if (closedDetails !== element) {
      const summary = element.closest("summary");
      if (summary && summary.parentNode !== closedDetails) {
        return false;
      }
      if (summary === null) {
        return false;
      }
    }
    return elementIsVisible;
  };
  var isDisabled = (element) => {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) {
      return true;
    }
    if (element.classList.contains("disabled")) {
      return true;
    }
    if (typeof element.disabled !== "undefined") {
      return element.disabled;
    }
    return element.hasAttribute("disabled") && element.getAttribute("disabled") !== "false";
  };
  var findShadowRoot = (element) => {
    if (!document.documentElement.attachShadow) {
      return null;
    }
    if (typeof element.getRootNode === "function") {
      const root = element.getRootNode();
      return root instanceof ShadowRoot ? root : null;
    }
    if (element instanceof ShadowRoot) {
      return element;
    }
    if (!element.parentNode) {
      return null;
    }
    return findShadowRoot(element.parentNode);
  };
  var noop = () => {
  };
  var reflow = (element) => {
    element.offsetHeight;
  };
  var getjQuery = () => {
    if (window.jQuery && !document.body.hasAttribute("data-bs-no-jquery")) {
      return window.jQuery;
    }
    return null;
  };
  var DOMContentLoadedCallbacks = [];
  var onDOMContentLoaded = (callback) => {
    if (document.readyState === "loading") {
      if (!DOMContentLoadedCallbacks.length) {
        document.addEventListener("DOMContentLoaded", () => {
          for (const callback2 of DOMContentLoadedCallbacks) {
            callback2();
          }
        });
      }
      DOMContentLoadedCallbacks.push(callback);
    } else {
      callback();
    }
  };
  var isRTL = () => document.documentElement.dir === "rtl";
  var defineJQueryPlugin = (plugin) => {
    onDOMContentLoaded(() => {
      const $ = getjQuery();
      if ($) {
        const name = plugin.NAME;
        const JQUERY_NO_CONFLICT = $.fn[name];
        $.fn[name] = plugin.jQueryInterface;
        $.fn[name].Constructor = plugin;
        $.fn[name].noConflict = () => {
          $.fn[name] = JQUERY_NO_CONFLICT;
          return plugin.jQueryInterface;
        };
      }
    });
  };
  var execute = (possibleCallback, args = [], defaultValue = possibleCallback) => {
    return typeof possibleCallback === "function" ? possibleCallback(...args) : defaultValue;
  };
  var executeAfterTransition = (callback, transitionElement, waitForTransition = true) => {
    if (!waitForTransition) {
      execute(callback);
      return;
    }
    const durationPadding = 5;
    const emulatedDuration = getTransitionDurationFromElement(transitionElement) + durationPadding;
    let called = false;
    const handler = ({
      target
    }) => {
      if (target !== transitionElement) {
        return;
      }
      called = true;
      transitionElement.removeEventListener(TRANSITION_END, handler);
      execute(callback);
    };
    transitionElement.addEventListener(TRANSITION_END, handler);
    setTimeout(() => {
      if (!called) {
        triggerTransitionEnd(transitionElement);
      }
    }, emulatedDuration);
  };
  var getNextActiveElement = (list, activeElement, shouldGetNext, isCycleAllowed) => {
    const listLength = list.length;
    let index = list.indexOf(activeElement);
    if (index === -1) {
      return !shouldGetNext && isCycleAllowed ? list[listLength - 1] : list[0];
    }
    index += shouldGetNext ? 1 : -1;
    if (isCycleAllowed) {
      index = (index + listLength) % listLength;
    }
    return list[Math.max(0, Math.min(index, listLength - 1))];
  };
  var namespaceRegex = /[^.]*(?=\..*)\.|.*/;
  var stripNameRegex = /\..*/;
  var stripUidRegex = /::\d+$/;
  var eventRegistry = {};
  var uidEvent = 1;
  var customEvents = {
    mouseenter: "mouseover",
    mouseleave: "mouseout"
  };
  var nativeEvents = /* @__PURE__ */ new Set(["click", "dblclick", "mouseup", "mousedown", "contextmenu", "mousewheel", "DOMMouseScroll", "mouseover", "mouseout", "mousemove", "selectstart", "selectend", "keydown", "keypress", "keyup", "orientationchange", "touchstart", "touchmove", "touchend", "touchcancel", "pointerdown", "pointermove", "pointerup", "pointerleave", "pointercancel", "gesturestart", "gesturechange", "gestureend", "focus", "blur", "change", "reset", "select", "submit", "focusin", "focusout", "load", "unload", "beforeunload", "resize", "move", "DOMContentLoaded", "readystatechange", "error", "abort", "scroll"]);
  function makeEventUid(element, uid) {
    return uid && `${uid}::${uidEvent++}` || element.uidEvent || uidEvent++;
  }
  function getElementEvents(element) {
    const uid = makeEventUid(element);
    element.uidEvent = uid;
    eventRegistry[uid] = eventRegistry[uid] || {};
    return eventRegistry[uid];
  }
  function bootstrapHandler(element, fn2) {
    return function handler(event) {
      hydrateObj(event, {
        delegateTarget: element
      });
      if (handler.oneOff) {
        EventHandler.off(element, event.type, fn2);
      }
      return fn2.apply(element, [event]);
    };
  }
  function bootstrapDelegationHandler(element, selector, fn2) {
    return function handler(event) {
      const domElements = element.querySelectorAll(selector);
      for (let {
        target
      } = event; target && target !== this; target = target.parentNode) {
        for (const domElement of domElements) {
          if (domElement !== target) {
            continue;
          }
          hydrateObj(event, {
            delegateTarget: target
          });
          if (handler.oneOff) {
            EventHandler.off(element, event.type, selector, fn2);
          }
          return fn2.apply(target, [event]);
        }
      }
    };
  }
  function findHandler(events, callable, delegationSelector = null) {
    return Object.values(events).find((event) => event.callable === callable && event.delegationSelector === delegationSelector);
  }
  function normalizeParameters(originalTypeEvent, handler, delegationFunction) {
    const isDelegated = typeof handler === "string";
    const callable = isDelegated ? delegationFunction : handler || delegationFunction;
    let typeEvent = getTypeEvent(originalTypeEvent);
    if (!nativeEvents.has(typeEvent)) {
      typeEvent = originalTypeEvent;
    }
    return [isDelegated, callable, typeEvent];
  }
  function addHandler(element, originalTypeEvent, handler, delegationFunction, oneOff) {
    if (typeof originalTypeEvent !== "string" || !element) {
      return;
    }
    let [isDelegated, callable, typeEvent] = normalizeParameters(originalTypeEvent, handler, delegationFunction);
    if (originalTypeEvent in customEvents) {
      const wrapFunction = (fn3) => {
        return function(event) {
          if (!event.relatedTarget || event.relatedTarget !== event.delegateTarget && !event.delegateTarget.contains(event.relatedTarget)) {
            return fn3.call(this, event);
          }
        };
      };
      callable = wrapFunction(callable);
    }
    const events = getElementEvents(element);
    const handlers = events[typeEvent] || (events[typeEvent] = {});
    const previousFunction = findHandler(handlers, callable, isDelegated ? handler : null);
    if (previousFunction) {
      previousFunction.oneOff = previousFunction.oneOff && oneOff;
      return;
    }
    const uid = makeEventUid(callable, originalTypeEvent.replace(namespaceRegex, ""));
    const fn2 = isDelegated ? bootstrapDelegationHandler(element, handler, callable) : bootstrapHandler(element, callable);
    fn2.delegationSelector = isDelegated ? handler : null;
    fn2.callable = callable;
    fn2.oneOff = oneOff;
    fn2.uidEvent = uid;
    handlers[uid] = fn2;
    element.addEventListener(typeEvent, fn2, isDelegated);
  }
  function removeHandler(element, events, typeEvent, handler, delegationSelector) {
    const fn2 = findHandler(events[typeEvent], handler, delegationSelector);
    if (!fn2) {
      return;
    }
    element.removeEventListener(typeEvent, fn2, Boolean(delegationSelector));
    delete events[typeEvent][fn2.uidEvent];
  }
  function removeNamespacedHandlers(element, events, typeEvent, namespace) {
    const storeElementEvent = events[typeEvent] || {};
    for (const [handlerKey, event] of Object.entries(storeElementEvent)) {
      if (handlerKey.includes(namespace)) {
        removeHandler(element, events, typeEvent, event.callable, event.delegationSelector);
      }
    }
  }
  function getTypeEvent(event) {
    event = event.replace(stripNameRegex, "");
    return customEvents[event] || event;
  }
  var EventHandler = {
    on(element, event, handler, delegationFunction) {
      addHandler(element, event, handler, delegationFunction, false);
    },
    one(element, event, handler, delegationFunction) {
      addHandler(element, event, handler, delegationFunction, true);
    },
    off(element, originalTypeEvent, handler, delegationFunction) {
      if (typeof originalTypeEvent !== "string" || !element) {
        return;
      }
      const [isDelegated, callable, typeEvent] = normalizeParameters(originalTypeEvent, handler, delegationFunction);
      const inNamespace = typeEvent !== originalTypeEvent;
      const events = getElementEvents(element);
      const storeElementEvent = events[typeEvent] || {};
      const isNamespace = originalTypeEvent.startsWith(".");
      if (typeof callable !== "undefined") {
        if (!Object.keys(storeElementEvent).length) {
          return;
        }
        removeHandler(element, events, typeEvent, callable, isDelegated ? handler : null);
        return;
      }
      if (isNamespace) {
        for (const elementEvent of Object.keys(events)) {
          removeNamespacedHandlers(element, events, elementEvent, originalTypeEvent.slice(1));
        }
      }
      for (const [keyHandlers, event] of Object.entries(storeElementEvent)) {
        const handlerKey = keyHandlers.replace(stripUidRegex, "");
        if (!inNamespace || originalTypeEvent.includes(handlerKey)) {
          removeHandler(element, events, typeEvent, event.callable, event.delegationSelector);
        }
      }
    },
    trigger(element, event, args) {
      if (typeof event !== "string" || !element) {
        return null;
      }
      const $ = getjQuery();
      const typeEvent = getTypeEvent(event);
      const inNamespace = event !== typeEvent;
      let jQueryEvent = null;
      let bubbles = true;
      let nativeDispatch = true;
      let defaultPrevented = false;
      if (inNamespace && $) {
        jQueryEvent = $.Event(event, args);
        $(element).trigger(jQueryEvent);
        bubbles = !jQueryEvent.isPropagationStopped();
        nativeDispatch = !jQueryEvent.isImmediatePropagationStopped();
        defaultPrevented = jQueryEvent.isDefaultPrevented();
      }
      const evt = hydrateObj(new Event(event, {
        bubbles,
        cancelable: true
      }), args);
      if (defaultPrevented) {
        evt.preventDefault();
      }
      if (nativeDispatch) {
        element.dispatchEvent(evt);
      }
      if (evt.defaultPrevented && jQueryEvent) {
        jQueryEvent.preventDefault();
      }
      return evt;
    }
  };
  function hydrateObj(obj, meta = {}) {
    for (const [key, value] of Object.entries(meta)) {
      try {
        obj[key] = value;
      } catch (_unused) {
        Object.defineProperty(obj, key, {
          configurable: true,
          get() {
            return value;
          }
        });
      }
    }
    return obj;
  }
  function normalizeData(value) {
    if (value === "true") {
      return true;
    }
    if (value === "false") {
      return false;
    }
    if (value === Number(value).toString()) {
      return Number(value);
    }
    if (value === "" || value === "null") {
      return null;
    }
    if (typeof value !== "string") {
      return value;
    }
    try {
      return JSON.parse(decodeURIComponent(value));
    } catch (_unused) {
      return value;
    }
  }
  function normalizeDataKey(key) {
    return key.replace(/[A-Z]/g, (chr) => `-${chr.toLowerCase()}`);
  }
  var Manipulator = {
    setDataAttribute(element, key, value) {
      element.setAttribute(`data-bs-${normalizeDataKey(key)}`, value);
    },
    removeDataAttribute(element, key) {
      element.removeAttribute(`data-bs-${normalizeDataKey(key)}`);
    },
    getDataAttributes(element) {
      if (!element) {
        return {};
      }
      const attributes = {};
      const bsKeys = Object.keys(element.dataset).filter((key) => key.startsWith("bs") && !key.startsWith("bsConfig"));
      for (const key of bsKeys) {
        let pureKey = key.replace(/^bs/, "");
        pureKey = pureKey.charAt(0).toLowerCase() + pureKey.slice(1, pureKey.length);
        attributes[pureKey] = normalizeData(element.dataset[key]);
      }
      return attributes;
    },
    getDataAttribute(element, key) {
      return normalizeData(element.getAttribute(`data-bs-${normalizeDataKey(key)}`));
    }
  };
  var Config = class {
    static get Default() {
      return {};
    }
    static get DefaultType() {
      return {};
    }
    static get NAME() {
      throw new Error('You have to implement the static method "NAME", for each component!');
    }
    _getConfig(config) {
      config = this._mergeConfigObj(config);
      config = this._configAfterMerge(config);
      this._typeCheckConfig(config);
      return config;
    }
    _configAfterMerge(config) {
      return config;
    }
    _mergeConfigObj(config, element) {
      const jsonConfig = isElement2(element) ? Manipulator.getDataAttribute(element, "config") : {};
      return {
        ...this.constructor.Default,
        ...typeof jsonConfig === "object" ? jsonConfig : {},
        ...isElement2(element) ? Manipulator.getDataAttributes(element) : {},
        ...typeof config === "object" ? config : {}
      };
    }
    _typeCheckConfig(config, configTypes = this.constructor.DefaultType) {
      for (const [property, expectedTypes] of Object.entries(configTypes)) {
        const value = config[property];
        const valueType = isElement2(value) ? "element" : toType(value);
        if (!new RegExp(expectedTypes).test(valueType)) {
          throw new TypeError(`${this.constructor.NAME.toUpperCase()}: Option "${property}" provided type "${valueType}" but expected type "${expectedTypes}".`);
        }
      }
    }
  };
  var VERSION = "5.3.2";
  var BaseComponent = class extends Config {
    constructor(element, config) {
      super();
      element = getElement(element);
      if (!element) {
        return;
      }
      this._element = element;
      this._config = this._getConfig(config);
      Data.set(this._element, this.constructor.DATA_KEY, this);
    }
    dispose() {
      Data.remove(this._element, this.constructor.DATA_KEY);
      EventHandler.off(this._element, this.constructor.EVENT_KEY);
      for (const propertyName of Object.getOwnPropertyNames(this)) {
        this[propertyName] = null;
      }
    }
    _queueCallback(callback, element, isAnimated = true) {
      executeAfterTransition(callback, element, isAnimated);
    }
    _getConfig(config) {
      config = this._mergeConfigObj(config, this._element);
      config = this._configAfterMerge(config);
      this._typeCheckConfig(config);
      return config;
    }
    static getInstance(element) {
      return Data.get(getElement(element), this.DATA_KEY);
    }
    static getOrCreateInstance(element, config = {}) {
      return this.getInstance(element) || new this(element, typeof config === "object" ? config : null);
    }
    static get VERSION() {
      return VERSION;
    }
    static get DATA_KEY() {
      return `bs.${this.NAME}`;
    }
    static get EVENT_KEY() {
      return `.${this.DATA_KEY}`;
    }
    static eventName(name) {
      return `${name}${this.EVENT_KEY}`;
    }
  };
  var getSelector = (element) => {
    let selector = element.getAttribute("data-bs-target");
    if (!selector || selector === "#") {
      let hrefAttribute = element.getAttribute("href");
      if (!hrefAttribute || !hrefAttribute.includes("#") && !hrefAttribute.startsWith(".")) {
        return null;
      }
      if (hrefAttribute.includes("#") && !hrefAttribute.startsWith("#")) {
        hrefAttribute = `#${hrefAttribute.split("#")[1]}`;
      }
      selector = hrefAttribute && hrefAttribute !== "#" ? parseSelector(hrefAttribute.trim()) : null;
    }
    return selector;
  };
  var SelectorEngine = {
    find(selector, element = document.documentElement) {
      return [].concat(...Element.prototype.querySelectorAll.call(element, selector));
    },
    findOne(selector, element = document.documentElement) {
      return Element.prototype.querySelector.call(element, selector);
    },
    children(element, selector) {
      return [].concat(...element.children).filter((child) => child.matches(selector));
    },
    parents(element, selector) {
      const parents = [];
      let ancestor = element.parentNode.closest(selector);
      while (ancestor) {
        parents.push(ancestor);
        ancestor = ancestor.parentNode.closest(selector);
      }
      return parents;
    },
    prev(element, selector) {
      let previous = element.previousElementSibling;
      while (previous) {
        if (previous.matches(selector)) {
          return [previous];
        }
        previous = previous.previousElementSibling;
      }
      return [];
    },
    next(element, selector) {
      let next = element.nextElementSibling;
      while (next) {
        if (next.matches(selector)) {
          return [next];
        }
        next = next.nextElementSibling;
      }
      return [];
    },
    focusableChildren(element) {
      const focusables = ["a", "button", "input", "textarea", "select", "details", "[tabindex]", '[contenteditable="true"]'].map((selector) => `${selector}:not([tabindex^="-"])`).join(",");
      return this.find(focusables, element).filter((el) => !isDisabled(el) && isVisible(el));
    },
    getSelectorFromElement(element) {
      const selector = getSelector(element);
      if (selector) {
        return SelectorEngine.findOne(selector) ? selector : null;
      }
      return null;
    },
    getElementFromSelector(element) {
      const selector = getSelector(element);
      return selector ? SelectorEngine.findOne(selector) : null;
    },
    getMultipleElementsFromSelector(element) {
      const selector = getSelector(element);
      return selector ? SelectorEngine.find(selector) : [];
    }
  };
  var enableDismissTrigger = (component, method = "hide") => {
    const clickEvent = `click.dismiss${component.EVENT_KEY}`;
    const name = component.NAME;
    EventHandler.on(document, clickEvent, `[data-bs-dismiss="${name}"]`, function(event) {
      if (["A", "AREA"].includes(this.tagName)) {
        event.preventDefault();
      }
      if (isDisabled(this)) {
        return;
      }
      const target = SelectorEngine.getElementFromSelector(this) || this.closest(`.${name}`);
      const instance = component.getOrCreateInstance(target);
      instance[method]();
    });
  };
  var NAME$f = "alert";
  var DATA_KEY$a = "bs.alert";
  var EVENT_KEY$b = `.${DATA_KEY$a}`;
  var EVENT_CLOSE = `close${EVENT_KEY$b}`;
  var EVENT_CLOSED = `closed${EVENT_KEY$b}`;
  var CLASS_NAME_FADE$5 = "fade";
  var CLASS_NAME_SHOW$8 = "show";
  var Alert = class extends BaseComponent {
    static get NAME() {
      return NAME$f;
    }
    close() {
      const closeEvent = EventHandler.trigger(this._element, EVENT_CLOSE);
      if (closeEvent.defaultPrevented) {
        return;
      }
      this._element.classList.remove(CLASS_NAME_SHOW$8);
      const isAnimated = this._element.classList.contains(CLASS_NAME_FADE$5);
      this._queueCallback(() => this._destroyElement(), this._element, isAnimated);
    }
    _destroyElement() {
      this._element.remove();
      EventHandler.trigger(this._element, EVENT_CLOSED);
      this.dispose();
    }
    static jQueryInterface(config) {
      return this.each(function() {
        const data = Alert.getOrCreateInstance(this);
        if (typeof config !== "string") {
          return;
        }
        if (data[config] === void 0 || config.startsWith("_") || config === "constructor") {
          throw new TypeError(`No method named "${config}"`);
        }
        data[config](this);
      });
    }
  };
  enableDismissTrigger(Alert, "close");
  defineJQueryPlugin(Alert);
  var NAME$e = "button";
  var DATA_KEY$9 = "bs.button";
  var EVENT_KEY$a = `.${DATA_KEY$9}`;
  var DATA_API_KEY$6 = ".data-api";
  var CLASS_NAME_ACTIVE$3 = "active";
  var SELECTOR_DATA_TOGGLE$5 = '[data-bs-toggle="button"]';
  var EVENT_CLICK_DATA_API$6 = `click${EVENT_KEY$a}${DATA_API_KEY$6}`;
  var Button = class extends BaseComponent {
    static get NAME() {
      return NAME$e;
    }
    toggle() {
      this._element.setAttribute("aria-pressed", this._element.classList.toggle(CLASS_NAME_ACTIVE$3));
    }
    static jQueryInterface(config) {
      return this.each(function() {
        const data = Button.getOrCreateInstance(this);
        if (config === "toggle") {
          data[config]();
        }
      });
    }
  };
  EventHandler.on(document, EVENT_CLICK_DATA_API$6, SELECTOR_DATA_TOGGLE$5, (event) => {
    event.preventDefault();
    const button = event.target.closest(SELECTOR_DATA_TOGGLE$5);
    const data = Button.getOrCreateInstance(button);
    data.toggle();
  });
  defineJQueryPlugin(Button);
  var NAME$d = "swipe";
  var EVENT_KEY$9 = ".bs.swipe";
  var EVENT_TOUCHSTART = `touchstart${EVENT_KEY$9}`;
  var EVENT_TOUCHMOVE = `touchmove${EVENT_KEY$9}`;
  var EVENT_TOUCHEND = `touchend${EVENT_KEY$9}`;
  var EVENT_POINTERDOWN = `pointerdown${EVENT_KEY$9}`;
  var EVENT_POINTERUP = `pointerup${EVENT_KEY$9}`;
  var POINTER_TYPE_TOUCH = "touch";
  var POINTER_TYPE_PEN = "pen";
  var CLASS_NAME_POINTER_EVENT = "pointer-event";
  var SWIPE_THRESHOLD = 40;
  var Default$c = {
    endCallback: null,
    leftCallback: null,
    rightCallback: null
  };
  var DefaultType$c = {
    endCallback: "(function|null)",
    leftCallback: "(function|null)",
    rightCallback: "(function|null)"
  };
  var Swipe = class extends Config {
    constructor(element, config) {
      super();
      this._element = element;
      if (!element || !Swipe.isSupported()) {
        return;
      }
      this._config = this._getConfig(config);
      this._deltaX = 0;
      this._supportPointerEvents = Boolean(window.PointerEvent);
      this._initEvents();
    }
    static get Default() {
      return Default$c;
    }
    static get DefaultType() {
      return DefaultType$c;
    }
    static get NAME() {
      return NAME$d;
    }
    dispose() {
      EventHandler.off(this._element, EVENT_KEY$9);
    }
    _start(event) {
      if (!this._supportPointerEvents) {
        this._deltaX = event.touches[0].clientX;
        return;
      }
      if (this._eventIsPointerPenTouch(event)) {
        this._deltaX = event.clientX;
      }
    }
    _end(event) {
      if (this._eventIsPointerPenTouch(event)) {
        this._deltaX = event.clientX - this._deltaX;
      }
      this._handleSwipe();
      execute(this._config.endCallback);
    }
    _move(event) {
      this._deltaX = event.touches && event.touches.length > 1 ? 0 : event.touches[0].clientX - this._deltaX;
    }
    _handleSwipe() {
      const absDeltaX = Math.abs(this._deltaX);
      if (absDeltaX <= SWIPE_THRESHOLD) {
        return;
      }
      const direction = absDeltaX / this._deltaX;
      this._deltaX = 0;
      if (!direction) {
        return;
      }
      execute(direction > 0 ? this._config.rightCallback : this._config.leftCallback);
    }
    _initEvents() {
      if (this._supportPointerEvents) {
        EventHandler.on(this._element, EVENT_POINTERDOWN, (event) => this._start(event));
        EventHandler.on(this._element, EVENT_POINTERUP, (event) => this._end(event));
        this._element.classList.add(CLASS_NAME_POINTER_EVENT);
      } else {
        EventHandler.on(this._element, EVENT_TOUCHSTART, (event) => this._start(event));
        EventHandler.on(this._element, EVENT_TOUCHMOVE, (event) => this._move(event));
        EventHandler.on(this._element, EVENT_TOUCHEND, (event) => this._end(event));
      }
    }
    _eventIsPointerPenTouch(event) {
      return this._supportPointerEvents && (event.pointerType === POINTER_TYPE_PEN || event.pointerType === POINTER_TYPE_TOUCH);
    }
    static isSupported() {
      return "ontouchstart" in document.documentElement || navigator.maxTouchPoints > 0;
    }
  };
  var NAME$c = "carousel";
  var DATA_KEY$8 = "bs.carousel";
  var EVENT_KEY$8 = `.${DATA_KEY$8}`;
  var DATA_API_KEY$5 = ".data-api";
  var ARROW_LEFT_KEY$1 = "ArrowLeft";
  var ARROW_RIGHT_KEY$1 = "ArrowRight";
  var TOUCHEVENT_COMPAT_WAIT = 500;
  var ORDER_NEXT = "next";
  var ORDER_PREV = "prev";
  var DIRECTION_LEFT = "left";
  var DIRECTION_RIGHT = "right";
  var EVENT_SLIDE = `slide${EVENT_KEY$8}`;
  var EVENT_SLID = `slid${EVENT_KEY$8}`;
  var EVENT_KEYDOWN$1 = `keydown${EVENT_KEY$8}`;
  var EVENT_MOUSEENTER$1 = `mouseenter${EVENT_KEY$8}`;
  var EVENT_MOUSELEAVE$1 = `mouseleave${EVENT_KEY$8}`;
  var EVENT_DRAG_START = `dragstart${EVENT_KEY$8}`;
  var EVENT_LOAD_DATA_API$3 = `load${EVENT_KEY$8}${DATA_API_KEY$5}`;
  var EVENT_CLICK_DATA_API$5 = `click${EVENT_KEY$8}${DATA_API_KEY$5}`;
  var CLASS_NAME_CAROUSEL = "carousel";
  var CLASS_NAME_ACTIVE$2 = "active";
  var CLASS_NAME_SLIDE = "slide";
  var CLASS_NAME_END = "carousel-item-end";
  var CLASS_NAME_START = "carousel-item-start";
  var CLASS_NAME_NEXT = "carousel-item-next";
  var CLASS_NAME_PREV = "carousel-item-prev";
  var SELECTOR_ACTIVE = ".active";
  var SELECTOR_ITEM = ".carousel-item";
  var SELECTOR_ACTIVE_ITEM = SELECTOR_ACTIVE + SELECTOR_ITEM;
  var SELECTOR_ITEM_IMG = ".carousel-item img";
  var SELECTOR_INDICATORS = ".carousel-indicators";
  var SELECTOR_DATA_SLIDE = "[data-bs-slide], [data-bs-slide-to]";
  var SELECTOR_DATA_RIDE = '[data-bs-ride="carousel"]';
  var KEY_TO_DIRECTION = {
    [ARROW_LEFT_KEY$1]: DIRECTION_RIGHT,
    [ARROW_RIGHT_KEY$1]: DIRECTION_LEFT
  };
  var Default$b = {
    interval: 5e3,
    keyboard: true,
    pause: "hover",
    ride: false,
    touch: true,
    wrap: true
  };
  var DefaultType$b = {
    interval: "(number|boolean)",
    keyboard: "boolean",
    pause: "(string|boolean)",
    ride: "(boolean|string)",
    touch: "boolean",
    wrap: "boolean"
  };
  var Carousel = class extends BaseComponent {
    constructor(element, config) {
      super(element, config);
      this._interval = null;
      this._activeElement = null;
      this._isSliding = false;
      this.touchTimeout = null;
      this._swipeHelper = null;
      this._indicatorsElement = SelectorEngine.findOne(SELECTOR_INDICATORS, this._element);
      this._addEventListeners();
      if (this._config.ride === CLASS_NAME_CAROUSEL) {
        this.cycle();
      }
    }
    static get Default() {
      return Default$b;
    }
    static get DefaultType() {
      return DefaultType$b;
    }
    static get NAME() {
      return NAME$c;
    }
    next() {
      this._slide(ORDER_NEXT);
    }
    nextWhenVisible() {
      if (!document.hidden && isVisible(this._element)) {
        this.next();
      }
    }
    prev() {
      this._slide(ORDER_PREV);
    }
    pause() {
      if (this._isSliding) {
        triggerTransitionEnd(this._element);
      }
      this._clearInterval();
    }
    cycle() {
      this._clearInterval();
      this._updateInterval();
      this._interval = setInterval(() => this.nextWhenVisible(), this._config.interval);
    }
    _maybeEnableCycle() {
      if (!this._config.ride) {
        return;
      }
      if (this._isSliding) {
        EventHandler.one(this._element, EVENT_SLID, () => this.cycle());
        return;
      }
      this.cycle();
    }
    to(index) {
      const items = this._getItems();
      if (index > items.length - 1 || index < 0) {
        return;
      }
      if (this._isSliding) {
        EventHandler.one(this._element, EVENT_SLID, () => this.to(index));
        return;
      }
      const activeIndex = this._getItemIndex(this._getActive());
      if (activeIndex === index) {
        return;
      }
      const order2 = index > activeIndex ? ORDER_NEXT : ORDER_PREV;
      this._slide(order2, items[index]);
    }
    dispose() {
      if (this._swipeHelper) {
        this._swipeHelper.dispose();
      }
      super.dispose();
    }
    _configAfterMerge(config) {
      config.defaultInterval = config.interval;
      return config;
    }
    _addEventListeners() {
      if (this._config.keyboard) {
        EventHandler.on(this._element, EVENT_KEYDOWN$1, (event) => this._keydown(event));
      }
      if (this._config.pause === "hover") {
        EventHandler.on(this._element, EVENT_MOUSEENTER$1, () => this.pause());
        EventHandler.on(this._element, EVENT_MOUSELEAVE$1, () => this._maybeEnableCycle());
      }
      if (this._config.touch && Swipe.isSupported()) {
        this._addTouchEventListeners();
      }
    }
    _addTouchEventListeners() {
      for (const img of SelectorEngine.find(SELECTOR_ITEM_IMG, this._element)) {
        EventHandler.on(img, EVENT_DRAG_START, (event) => event.preventDefault());
      }
      const endCallBack = () => {
        if (this._config.pause !== "hover") {
          return;
        }
        this.pause();
        if (this.touchTimeout) {
          clearTimeout(this.touchTimeout);
        }
        this.touchTimeout = setTimeout(() => this._maybeEnableCycle(), TOUCHEVENT_COMPAT_WAIT + this._config.interval);
      };
      const swipeConfig = {
        leftCallback: () => this._slide(this._directionToOrder(DIRECTION_LEFT)),
        rightCallback: () => this._slide(this._directionToOrder(DIRECTION_RIGHT)),
        endCallback: endCallBack
      };
      this._swipeHelper = new Swipe(this._element, swipeConfig);
    }
    _keydown(event) {
      if (/input|textarea/i.test(event.target.tagName)) {
        return;
      }
      const direction = KEY_TO_DIRECTION[event.key];
      if (direction) {
        event.preventDefault();
        this._slide(this._directionToOrder(direction));
      }
    }
    _getItemIndex(element) {
      return this._getItems().indexOf(element);
    }
    _setActiveIndicatorElement(index) {
      if (!this._indicatorsElement) {
        return;
      }
      const activeIndicator = SelectorEngine.findOne(SELECTOR_ACTIVE, this._indicatorsElement);
      activeIndicator.classList.remove(CLASS_NAME_ACTIVE$2);
      activeIndicator.removeAttribute("aria-current");
      const newActiveIndicator = SelectorEngine.findOne(`[data-bs-slide-to="${index}"]`, this._indicatorsElement);
      if (newActiveIndicator) {
        newActiveIndicator.classList.add(CLASS_NAME_ACTIVE$2);
        newActiveIndicator.setAttribute("aria-current", "true");
      }
    }
    _updateInterval() {
      const element = this._activeElement || this._getActive();
      if (!element) {
        return;
      }
      const elementInterval = Number.parseInt(element.getAttribute("data-bs-interval"), 10);
      this._config.interval = elementInterval || this._config.defaultInterval;
    }
    _slide(order2, element = null) {
      if (this._isSliding) {
        return;
      }
      const activeElement = this._getActive();
      const isNext = order2 === ORDER_NEXT;
      const nextElement = element || getNextActiveElement(this._getItems(), activeElement, isNext, this._config.wrap);
      if (nextElement === activeElement) {
        return;
      }
      const nextElementIndex = this._getItemIndex(nextElement);
      const triggerEvent = (eventName) => {
        return EventHandler.trigger(this._element, eventName, {
          relatedTarget: nextElement,
          direction: this._orderToDirection(order2),
          from: this._getItemIndex(activeElement),
          to: nextElementIndex
        });
      };
      const slideEvent = triggerEvent(EVENT_SLIDE);
      if (slideEvent.defaultPrevented) {
        return;
      }
      if (!activeElement || !nextElement) {
        return;
      }
      const isCycling = Boolean(this._interval);
      this.pause();
      this._isSliding = true;
      this._setActiveIndicatorElement(nextElementIndex);
      this._activeElement = nextElement;
      const directionalClassName = isNext ? CLASS_NAME_START : CLASS_NAME_END;
      const orderClassName = isNext ? CLASS_NAME_NEXT : CLASS_NAME_PREV;
      nextElement.classList.add(orderClassName);
      reflow(nextElement);
      activeElement.classList.add(directionalClassName);
      nextElement.classList.add(directionalClassName);
      const completeCallBack = () => {
        nextElement.classList.remove(directionalClassName, orderClassName);
        nextElement.classList.add(CLASS_NAME_ACTIVE$2);
        activeElement.classList.remove(CLASS_NAME_ACTIVE$2, orderClassName, directionalClassName);
        this._isSliding = false;
        triggerEvent(EVENT_SLID);
      };
      this._queueCallback(completeCallBack, activeElement, this._isAnimated());
      if (isCycling) {
        this.cycle();
      }
    }
    _isAnimated() {
      return this._element.classList.contains(CLASS_NAME_SLIDE);
    }
    _getActive() {
      return SelectorEngine.findOne(SELECTOR_ACTIVE_ITEM, this._element);
    }
    _getItems() {
      return SelectorEngine.find(SELECTOR_ITEM, this._element);
    }
    _clearInterval() {
      if (this._interval) {
        clearInterval(this._interval);
        this._interval = null;
      }
    }
    _directionToOrder(direction) {
      if (isRTL()) {
        return direction === DIRECTION_LEFT ? ORDER_PREV : ORDER_NEXT;
      }
      return direction === DIRECTION_LEFT ? ORDER_NEXT : ORDER_PREV;
    }
    _orderToDirection(order2) {
      if (isRTL()) {
        return order2 === ORDER_PREV ? DIRECTION_LEFT : DIRECTION_RIGHT;
      }
      return order2 === ORDER_PREV ? DIRECTION_RIGHT : DIRECTION_LEFT;
    }
    static jQueryInterface(config) {
      return this.each(function() {
        const data = Carousel.getOrCreateInstance(this, config);
        if (typeof config === "number") {
          data.to(config);
          return;
        }
        if (typeof config === "string") {
          if (data[config] === void 0 || config.startsWith("_") || config === "constructor") {
            throw new TypeError(`No method named "${config}"`);
          }
          data[config]();
        }
      });
    }
  };
  EventHandler.on(document, EVENT_CLICK_DATA_API$5, SELECTOR_DATA_SLIDE, function(event) {
    const target = SelectorEngine.getElementFromSelector(this);
    if (!target || !target.classList.contains(CLASS_NAME_CAROUSEL)) {
      return;
    }
    event.preventDefault();
    const carousel = Carousel.getOrCreateInstance(target);
    const slideIndex = this.getAttribute("data-bs-slide-to");
    if (slideIndex) {
      carousel.to(slideIndex);
      carousel._maybeEnableCycle();
      return;
    }
    if (Manipulator.getDataAttribute(this, "slide") === "next") {
      carousel.next();
      carousel._maybeEnableCycle();
      return;
    }
    carousel.prev();
    carousel._maybeEnableCycle();
  });
  EventHandler.on(window, EVENT_LOAD_DATA_API$3, () => {
    const carousels = SelectorEngine.find(SELECTOR_DATA_RIDE);
    for (const carousel of carousels) {
      Carousel.getOrCreateInstance(carousel);
    }
  });
  defineJQueryPlugin(Carousel);
  var NAME$b = "collapse";
  var DATA_KEY$7 = "bs.collapse";
  var EVENT_KEY$7 = `.${DATA_KEY$7}`;
  var DATA_API_KEY$4 = ".data-api";
  var EVENT_SHOW$6 = `show${EVENT_KEY$7}`;
  var EVENT_SHOWN$6 = `shown${EVENT_KEY$7}`;
  var EVENT_HIDE$6 = `hide${EVENT_KEY$7}`;
  var EVENT_HIDDEN$6 = `hidden${EVENT_KEY$7}`;
  var EVENT_CLICK_DATA_API$4 = `click${EVENT_KEY$7}${DATA_API_KEY$4}`;
  var CLASS_NAME_SHOW$7 = "show";
  var CLASS_NAME_COLLAPSE = "collapse";
  var CLASS_NAME_COLLAPSING = "collapsing";
  var CLASS_NAME_COLLAPSED = "collapsed";
  var CLASS_NAME_DEEPER_CHILDREN = `:scope .${CLASS_NAME_COLLAPSE} .${CLASS_NAME_COLLAPSE}`;
  var CLASS_NAME_HORIZONTAL = "collapse-horizontal";
  var WIDTH = "width";
  var HEIGHT = "height";
  var SELECTOR_ACTIVES = ".collapse.show, .collapse.collapsing";
  var SELECTOR_DATA_TOGGLE$4 = '[data-bs-toggle="collapse"]';
  var Default$a = {
    parent: null,
    toggle: true
  };
  var DefaultType$a = {
    parent: "(null|element)",
    toggle: "boolean"
  };
  var Collapse = class extends BaseComponent {
    constructor(element, config) {
      super(element, config);
      this._isTransitioning = false;
      this._triggerArray = [];
      const toggleList = SelectorEngine.find(SELECTOR_DATA_TOGGLE$4);
      for (const elem of toggleList) {
        const selector = SelectorEngine.getSelectorFromElement(elem);
        const filterElement = SelectorEngine.find(selector).filter((foundElement) => foundElement === this._element);
        if (selector !== null && filterElement.length) {
          this._triggerArray.push(elem);
        }
      }
      this._initializeChildren();
      if (!this._config.parent) {
        this._addAriaAndCollapsedClass(this._triggerArray, this._isShown());
      }
      if (this._config.toggle) {
        this.toggle();
      }
    }
    static get Default() {
      return Default$a;
    }
    static get DefaultType() {
      return DefaultType$a;
    }
    static get NAME() {
      return NAME$b;
    }
    toggle() {
      if (this._isShown()) {
        this.hide();
      } else {
        this.show();
      }
    }
    show() {
      if (this._isTransitioning || this._isShown()) {
        return;
      }
      let activeChildren = [];
      if (this._config.parent) {
        activeChildren = this._getFirstLevelChildren(SELECTOR_ACTIVES).filter((element) => element !== this._element).map((element) => Collapse.getOrCreateInstance(element, {
          toggle: false
        }));
      }
      if (activeChildren.length && activeChildren[0]._isTransitioning) {
        return;
      }
      const startEvent = EventHandler.trigger(this._element, EVENT_SHOW$6);
      if (startEvent.defaultPrevented) {
        return;
      }
      for (const activeInstance of activeChildren) {
        activeInstance.hide();
      }
      const dimension = this._getDimension();
      this._element.classList.remove(CLASS_NAME_COLLAPSE);
      this._element.classList.add(CLASS_NAME_COLLAPSING);
      this._element.style[dimension] = 0;
      this._addAriaAndCollapsedClass(this._triggerArray, true);
      this._isTransitioning = true;
      const complete = () => {
        this._isTransitioning = false;
        this._element.classList.remove(CLASS_NAME_COLLAPSING);
        this._element.classList.add(CLASS_NAME_COLLAPSE, CLASS_NAME_SHOW$7);
        this._element.style[dimension] = "";
        EventHandler.trigger(this._element, EVENT_SHOWN$6);
      };
      const capitalizedDimension = dimension[0].toUpperCase() + dimension.slice(1);
      const scrollSize = `scroll${capitalizedDimension}`;
      this._queueCallback(complete, this._element, true);
      this._element.style[dimension] = `${this._element[scrollSize]}px`;
    }
    hide() {
      if (this._isTransitioning || !this._isShown()) {
        return;
      }
      const startEvent = EventHandler.trigger(this._element, EVENT_HIDE$6);
      if (startEvent.defaultPrevented) {
        return;
      }
      const dimension = this._getDimension();
      this._element.style[dimension] = `${this._element.getBoundingClientRect()[dimension]}px`;
      reflow(this._element);
      this._element.classList.add(CLASS_NAME_COLLAPSING);
      this._element.classList.remove(CLASS_NAME_COLLAPSE, CLASS_NAME_SHOW$7);
      for (const trigger of this._triggerArray) {
        const element = SelectorEngine.getElementFromSelector(trigger);
        if (element && !this._isShown(element)) {
          this._addAriaAndCollapsedClass([trigger], false);
        }
      }
      this._isTransitioning = true;
      const complete = () => {
        this._isTransitioning = false;
        this._element.classList.remove(CLASS_NAME_COLLAPSING);
        this._element.classList.add(CLASS_NAME_COLLAPSE);
        EventHandler.trigger(this._element, EVENT_HIDDEN$6);
      };
      this._element.style[dimension] = "";
      this._queueCallback(complete, this._element, true);
    }
    _isShown(element = this._element) {
      return element.classList.contains(CLASS_NAME_SHOW$7);
    }
    _configAfterMerge(config) {
      config.toggle = Boolean(config.toggle);
      config.parent = getElement(config.parent);
      return config;
    }
    _getDimension() {
      return this._element.classList.contains(CLASS_NAME_HORIZONTAL) ? WIDTH : HEIGHT;
    }
    _initializeChildren() {
      if (!this._config.parent) {
        return;
      }
      const children = this._getFirstLevelChildren(SELECTOR_DATA_TOGGLE$4);
      for (const element of children) {
        const selected = SelectorEngine.getElementFromSelector(element);
        if (selected) {
          this._addAriaAndCollapsedClass([element], this._isShown(selected));
        }
      }
    }
    _getFirstLevelChildren(selector) {
      const children = SelectorEngine.find(CLASS_NAME_DEEPER_CHILDREN, this._config.parent);
      return SelectorEngine.find(selector, this._config.parent).filter((element) => !children.includes(element));
    }
    _addAriaAndCollapsedClass(triggerArray, isOpen) {
      if (!triggerArray.length) {
        return;
      }
      for (const element of triggerArray) {
        element.classList.toggle(CLASS_NAME_COLLAPSED, !isOpen);
        element.setAttribute("aria-expanded", isOpen);
      }
    }
    static jQueryInterface(config) {
      const _config = {};
      if (typeof config === "string" && /show|hide/.test(config)) {
        _config.toggle = false;
      }
      return this.each(function() {
        const data = Collapse.getOrCreateInstance(this, _config);
        if (typeof config === "string") {
          if (typeof data[config] === "undefined") {
            throw new TypeError(`No method named "${config}"`);
          }
          data[config]();
        }
      });
    }
  };
  EventHandler.on(document, EVENT_CLICK_DATA_API$4, SELECTOR_DATA_TOGGLE$4, function(event) {
    if (event.target.tagName === "A" || event.delegateTarget && event.delegateTarget.tagName === "A") {
      event.preventDefault();
    }
    for (const element of SelectorEngine.getMultipleElementsFromSelector(this)) {
      Collapse.getOrCreateInstance(element, {
        toggle: false
      }).toggle();
    }
  });
  defineJQueryPlugin(Collapse);
  var NAME$a = "dropdown";
  var DATA_KEY$6 = "bs.dropdown";
  var EVENT_KEY$6 = `.${DATA_KEY$6}`;
  var DATA_API_KEY$3 = ".data-api";
  var ESCAPE_KEY$2 = "Escape";
  var TAB_KEY$1 = "Tab";
  var ARROW_UP_KEY$1 = "ArrowUp";
  var ARROW_DOWN_KEY$1 = "ArrowDown";
  var RIGHT_MOUSE_BUTTON = 2;
  var EVENT_HIDE$5 = `hide${EVENT_KEY$6}`;
  var EVENT_HIDDEN$5 = `hidden${EVENT_KEY$6}`;
  var EVENT_SHOW$5 = `show${EVENT_KEY$6}`;
  var EVENT_SHOWN$5 = `shown${EVENT_KEY$6}`;
  var EVENT_CLICK_DATA_API$3 = `click${EVENT_KEY$6}${DATA_API_KEY$3}`;
  var EVENT_KEYDOWN_DATA_API = `keydown${EVENT_KEY$6}${DATA_API_KEY$3}`;
  var EVENT_KEYUP_DATA_API = `keyup${EVENT_KEY$6}${DATA_API_KEY$3}`;
  var CLASS_NAME_SHOW$6 = "show";
  var CLASS_NAME_DROPUP = "dropup";
  var CLASS_NAME_DROPEND = "dropend";
  var CLASS_NAME_DROPSTART = "dropstart";
  var CLASS_NAME_DROPUP_CENTER = "dropup-center";
  var CLASS_NAME_DROPDOWN_CENTER = "dropdown-center";
  var SELECTOR_DATA_TOGGLE$3 = '[data-bs-toggle="dropdown"]:not(.disabled):not(:disabled)';
  var SELECTOR_DATA_TOGGLE_SHOWN = `${SELECTOR_DATA_TOGGLE$3}.${CLASS_NAME_SHOW$6}`;
  var SELECTOR_MENU = ".dropdown-menu";
  var SELECTOR_NAVBAR = ".navbar";
  var SELECTOR_NAVBAR_NAV = ".navbar-nav";
  var SELECTOR_VISIBLE_ITEMS = ".dropdown-menu .dropdown-item:not(.disabled):not(:disabled)";
  var PLACEMENT_TOP = isRTL() ? "top-end" : "top-start";
  var PLACEMENT_TOPEND = isRTL() ? "top-start" : "top-end";
  var PLACEMENT_BOTTOM = isRTL() ? "bottom-end" : "bottom-start";
  var PLACEMENT_BOTTOMEND = isRTL() ? "bottom-start" : "bottom-end";
  var PLACEMENT_RIGHT = isRTL() ? "left-start" : "right-start";
  var PLACEMENT_LEFT = isRTL() ? "right-start" : "left-start";
  var PLACEMENT_TOPCENTER = "top";
  var PLACEMENT_BOTTOMCENTER = "bottom";
  var Default$9 = {
    autoClose: true,
    boundary: "clippingParents",
    display: "dynamic",
    offset: [0, 2],
    popperConfig: null,
    reference: "toggle"
  };
  var DefaultType$9 = {
    autoClose: "(boolean|string)",
    boundary: "(string|element)",
    display: "string",
    offset: "(array|string|function)",
    popperConfig: "(null|object|function)",
    reference: "(string|element|object)"
  };
  var Dropdown = class extends BaseComponent {
    constructor(element, config) {
      super(element, config);
      this._popper = null;
      this._parent = this._element.parentNode;
      this._menu = SelectorEngine.next(this._element, SELECTOR_MENU)[0] || SelectorEngine.prev(this._element, SELECTOR_MENU)[0] || SelectorEngine.findOne(SELECTOR_MENU, this._parent);
      this._inNavbar = this._detectNavbar();
    }
    static get Default() {
      return Default$9;
    }
    static get DefaultType() {
      return DefaultType$9;
    }
    static get NAME() {
      return NAME$a;
    }
    toggle() {
      return this._isShown() ? this.hide() : this.show();
    }
    show() {
      if (isDisabled(this._element) || this._isShown()) {
        return;
      }
      const relatedTarget = {
        relatedTarget: this._element
      };
      const showEvent = EventHandler.trigger(this._element, EVENT_SHOW$5, relatedTarget);
      if (showEvent.defaultPrevented) {
        return;
      }
      this._createPopper();
      if ("ontouchstart" in document.documentElement && !this._parent.closest(SELECTOR_NAVBAR_NAV)) {
        for (const element of [].concat(...document.body.children)) {
          EventHandler.on(element, "mouseover", noop);
        }
      }
      this._element.focus();
      this._element.setAttribute("aria-expanded", true);
      this._menu.classList.add(CLASS_NAME_SHOW$6);
      this._element.classList.add(CLASS_NAME_SHOW$6);
      EventHandler.trigger(this._element, EVENT_SHOWN$5, relatedTarget);
    }
    hide() {
      if (isDisabled(this._element) || !this._isShown()) {
        return;
      }
      const relatedTarget = {
        relatedTarget: this._element
      };
      this._completeHide(relatedTarget);
    }
    dispose() {
      if (this._popper) {
        this._popper.destroy();
      }
      super.dispose();
    }
    update() {
      this._inNavbar = this._detectNavbar();
      if (this._popper) {
        this._popper.update();
      }
    }
    _completeHide(relatedTarget) {
      const hideEvent = EventHandler.trigger(this._element, EVENT_HIDE$5, relatedTarget);
      if (hideEvent.defaultPrevented) {
        return;
      }
      if ("ontouchstart" in document.documentElement) {
        for (const element of [].concat(...document.body.children)) {
          EventHandler.off(element, "mouseover", noop);
        }
      }
      if (this._popper) {
        this._popper.destroy();
      }
      this._menu.classList.remove(CLASS_NAME_SHOW$6);
      this._element.classList.remove(CLASS_NAME_SHOW$6);
      this._element.setAttribute("aria-expanded", "false");
      Manipulator.removeDataAttribute(this._menu, "popper");
      EventHandler.trigger(this._element, EVENT_HIDDEN$5, relatedTarget);
    }
    _getConfig(config) {
      config = super._getConfig(config);
      if (typeof config.reference === "object" && !isElement2(config.reference) && typeof config.reference.getBoundingClientRect !== "function") {
        throw new TypeError(`${NAME$a.toUpperCase()}: Option "reference" provided type "object" without a required "getBoundingClientRect" method.`);
      }
      return config;
    }
    _createPopper() {
      if (typeof lib_exports === "undefined") {
        throw new TypeError("Bootstrap's dropdowns require Popper (https://popper.js.org)");
      }
      let referenceElement = this._element;
      if (this._config.reference === "parent") {
        referenceElement = this._parent;
      } else if (isElement2(this._config.reference)) {
        referenceElement = getElement(this._config.reference);
      } else if (typeof this._config.reference === "object") {
        referenceElement = this._config.reference;
      }
      const popperConfig = this._getPopperConfig();
      this._popper = createPopper3(referenceElement, this._menu, popperConfig);
    }
    _isShown() {
      return this._menu.classList.contains(CLASS_NAME_SHOW$6);
    }
    _getPlacement() {
      const parentDropdown = this._parent;
      if (parentDropdown.classList.contains(CLASS_NAME_DROPEND)) {
        return PLACEMENT_RIGHT;
      }
      if (parentDropdown.classList.contains(CLASS_NAME_DROPSTART)) {
        return PLACEMENT_LEFT;
      }
      if (parentDropdown.classList.contains(CLASS_NAME_DROPUP_CENTER)) {
        return PLACEMENT_TOPCENTER;
      }
      if (parentDropdown.classList.contains(CLASS_NAME_DROPDOWN_CENTER)) {
        return PLACEMENT_BOTTOMCENTER;
      }
      const isEnd = getComputedStyle(this._menu).getPropertyValue("--bs-position").trim() === "end";
      if (parentDropdown.classList.contains(CLASS_NAME_DROPUP)) {
        return isEnd ? PLACEMENT_TOPEND : PLACEMENT_TOP;
      }
      return isEnd ? PLACEMENT_BOTTOMEND : PLACEMENT_BOTTOM;
    }
    _detectNavbar() {
      return this._element.closest(SELECTOR_NAVBAR) !== null;
    }
    _getOffset() {
      const {
        offset: offset2
      } = this._config;
      if (typeof offset2 === "string") {
        return offset2.split(",").map((value) => Number.parseInt(value, 10));
      }
      if (typeof offset2 === "function") {
        return (popperData) => offset2(popperData, this._element);
      }
      return offset2;
    }
    _getPopperConfig() {
      const defaultBsPopperConfig = {
        placement: this._getPlacement(),
        modifiers: [{
          name: "preventOverflow",
          options: {
            boundary: this._config.boundary
          }
        }, {
          name: "offset",
          options: {
            offset: this._getOffset()
          }
        }]
      };
      if (this._inNavbar || this._config.display === "static") {
        Manipulator.setDataAttribute(this._menu, "popper", "static");
        defaultBsPopperConfig.modifiers = [{
          name: "applyStyles",
          enabled: false
        }];
      }
      return {
        ...defaultBsPopperConfig,
        ...execute(this._config.popperConfig, [defaultBsPopperConfig])
      };
    }
    _selectMenuItem({
      key,
      target
    }) {
      const items = SelectorEngine.find(SELECTOR_VISIBLE_ITEMS, this._menu).filter((element) => isVisible(element));
      if (!items.length) {
        return;
      }
      getNextActiveElement(items, target, key === ARROW_DOWN_KEY$1, !items.includes(target)).focus();
    }
    static jQueryInterface(config) {
      return this.each(function() {
        const data = Dropdown.getOrCreateInstance(this, config);
        if (typeof config !== "string") {
          return;
        }
        if (typeof data[config] === "undefined") {
          throw new TypeError(`No method named "${config}"`);
        }
        data[config]();
      });
    }
    static clearMenus(event) {
      if (event.button === RIGHT_MOUSE_BUTTON || event.type === "keyup" && event.key !== TAB_KEY$1) {
        return;
      }
      const openToggles = SelectorEngine.find(SELECTOR_DATA_TOGGLE_SHOWN);
      for (const toggle of openToggles) {
        const context = Dropdown.getInstance(toggle);
        if (!context || context._config.autoClose === false) {
          continue;
        }
        const composedPath = event.composedPath();
        const isMenuTarget = composedPath.includes(context._menu);
        if (composedPath.includes(context._element) || context._config.autoClose === "inside" && !isMenuTarget || context._config.autoClose === "outside" && isMenuTarget) {
          continue;
        }
        if (context._menu.contains(event.target) && (event.type === "keyup" && event.key === TAB_KEY$1 || /input|select|option|textarea|form/i.test(event.target.tagName))) {
          continue;
        }
        const relatedTarget = {
          relatedTarget: context._element
        };
        if (event.type === "click") {
          relatedTarget.clickEvent = event;
        }
        context._completeHide(relatedTarget);
      }
    }
    static dataApiKeydownHandler(event) {
      const isInput = /input|textarea/i.test(event.target.tagName);
      const isEscapeEvent = event.key === ESCAPE_KEY$2;
      const isUpOrDownEvent = [ARROW_UP_KEY$1, ARROW_DOWN_KEY$1].includes(event.key);
      if (!isUpOrDownEvent && !isEscapeEvent) {
        return;
      }
      if (isInput && !isEscapeEvent) {
        return;
      }
      event.preventDefault();
      const getToggleButton = this.matches(SELECTOR_DATA_TOGGLE$3) ? this : SelectorEngine.prev(this, SELECTOR_DATA_TOGGLE$3)[0] || SelectorEngine.next(this, SELECTOR_DATA_TOGGLE$3)[0] || SelectorEngine.findOne(SELECTOR_DATA_TOGGLE$3, event.delegateTarget.parentNode);
      const instance = Dropdown.getOrCreateInstance(getToggleButton);
      if (isUpOrDownEvent) {
        event.stopPropagation();
        instance.show();
        instance._selectMenuItem(event);
        return;
      }
      if (instance._isShown()) {
        event.stopPropagation();
        instance.hide();
        getToggleButton.focus();
      }
    }
  };
  EventHandler.on(document, EVENT_KEYDOWN_DATA_API, SELECTOR_DATA_TOGGLE$3, Dropdown.dataApiKeydownHandler);
  EventHandler.on(document, EVENT_KEYDOWN_DATA_API, SELECTOR_MENU, Dropdown.dataApiKeydownHandler);
  EventHandler.on(document, EVENT_CLICK_DATA_API$3, Dropdown.clearMenus);
  EventHandler.on(document, EVENT_KEYUP_DATA_API, Dropdown.clearMenus);
  EventHandler.on(document, EVENT_CLICK_DATA_API$3, SELECTOR_DATA_TOGGLE$3, function(event) {
    event.preventDefault();
    Dropdown.getOrCreateInstance(this).toggle();
  });
  defineJQueryPlugin(Dropdown);
  var NAME$9 = "backdrop";
  var CLASS_NAME_FADE$4 = "fade";
  var CLASS_NAME_SHOW$5 = "show";
  var EVENT_MOUSEDOWN = `mousedown.bs.${NAME$9}`;
  var Default$8 = {
    className: "modal-backdrop",
    clickCallback: null,
    isAnimated: false,
    isVisible: true,
    rootElement: "body"
  };
  var DefaultType$8 = {
    className: "string",
    clickCallback: "(function|null)",
    isAnimated: "boolean",
    isVisible: "boolean",
    rootElement: "(element|string)"
  };
  var Backdrop = class extends Config {
    constructor(config) {
      super();
      this._config = this._getConfig(config);
      this._isAppended = false;
      this._element = null;
    }
    static get Default() {
      return Default$8;
    }
    static get DefaultType() {
      return DefaultType$8;
    }
    static get NAME() {
      return NAME$9;
    }
    show(callback) {
      if (!this._config.isVisible) {
        execute(callback);
        return;
      }
      this._append();
      const element = this._getElement();
      if (this._config.isAnimated) {
        reflow(element);
      }
      element.classList.add(CLASS_NAME_SHOW$5);
      this._emulateAnimation(() => {
        execute(callback);
      });
    }
    hide(callback) {
      if (!this._config.isVisible) {
        execute(callback);
        return;
      }
      this._getElement().classList.remove(CLASS_NAME_SHOW$5);
      this._emulateAnimation(() => {
        this.dispose();
        execute(callback);
      });
    }
    dispose() {
      if (!this._isAppended) {
        return;
      }
      EventHandler.off(this._element, EVENT_MOUSEDOWN);
      this._element.remove();
      this._isAppended = false;
    }
    _getElement() {
      if (!this._element) {
        const backdrop = document.createElement("div");
        backdrop.className = this._config.className;
        if (this._config.isAnimated) {
          backdrop.classList.add(CLASS_NAME_FADE$4);
        }
        this._element = backdrop;
      }
      return this._element;
    }
    _configAfterMerge(config) {
      config.rootElement = getElement(config.rootElement);
      return config;
    }
    _append() {
      if (this._isAppended) {
        return;
      }
      const element = this._getElement();
      this._config.rootElement.append(element);
      EventHandler.on(element, EVENT_MOUSEDOWN, () => {
        execute(this._config.clickCallback);
      });
      this._isAppended = true;
    }
    _emulateAnimation(callback) {
      executeAfterTransition(callback, this._getElement(), this._config.isAnimated);
    }
  };
  var NAME$8 = "focustrap";
  var DATA_KEY$5 = "bs.focustrap";
  var EVENT_KEY$5 = `.${DATA_KEY$5}`;
  var EVENT_FOCUSIN$2 = `focusin${EVENT_KEY$5}`;
  var EVENT_KEYDOWN_TAB = `keydown.tab${EVENT_KEY$5}`;
  var TAB_KEY = "Tab";
  var TAB_NAV_FORWARD = "forward";
  var TAB_NAV_BACKWARD = "backward";
  var Default$7 = {
    autofocus: true,
    trapElement: null
  };
  var DefaultType$7 = {
    autofocus: "boolean",
    trapElement: "element"
  };
  var FocusTrap = class extends Config {
    constructor(config) {
      super();
      this._config = this._getConfig(config);
      this._isActive = false;
      this._lastTabNavDirection = null;
    }
    static get Default() {
      return Default$7;
    }
    static get DefaultType() {
      return DefaultType$7;
    }
    static get NAME() {
      return NAME$8;
    }
    activate() {
      if (this._isActive) {
        return;
      }
      if (this._config.autofocus) {
        this._config.trapElement.focus();
      }
      EventHandler.off(document, EVENT_KEY$5);
      EventHandler.on(document, EVENT_FOCUSIN$2, (event) => this._handleFocusin(event));
      EventHandler.on(document, EVENT_KEYDOWN_TAB, (event) => this._handleKeydown(event));
      this._isActive = true;
    }
    deactivate() {
      if (!this._isActive) {
        return;
      }
      this._isActive = false;
      EventHandler.off(document, EVENT_KEY$5);
    }
    _handleFocusin(event) {
      const {
        trapElement
      } = this._config;
      if (event.target === document || event.target === trapElement || trapElement.contains(event.target)) {
        return;
      }
      const elements = SelectorEngine.focusableChildren(trapElement);
      if (elements.length === 0) {
        trapElement.focus();
      } else if (this._lastTabNavDirection === TAB_NAV_BACKWARD) {
        elements[elements.length - 1].focus();
      } else {
        elements[0].focus();
      }
    }
    _handleKeydown(event) {
      if (event.key !== TAB_KEY) {
        return;
      }
      this._lastTabNavDirection = event.shiftKey ? TAB_NAV_BACKWARD : TAB_NAV_FORWARD;
    }
  };
  var SELECTOR_FIXED_CONTENT = ".fixed-top, .fixed-bottom, .is-fixed, .sticky-top";
  var SELECTOR_STICKY_CONTENT = ".sticky-top";
  var PROPERTY_PADDING = "padding-right";
  var PROPERTY_MARGIN = "margin-right";
  var ScrollBarHelper = class {
    constructor() {
      this._element = document.body;
    }
    getWidth() {
      const documentWidth = document.documentElement.clientWidth;
      return Math.abs(window.innerWidth - documentWidth);
    }
    hide() {
      const width = this.getWidth();
      this._disableOverFlow();
      this._setElementAttributes(this._element, PROPERTY_PADDING, (calculatedValue) => calculatedValue + width);
      this._setElementAttributes(SELECTOR_FIXED_CONTENT, PROPERTY_PADDING, (calculatedValue) => calculatedValue + width);
      this._setElementAttributes(SELECTOR_STICKY_CONTENT, PROPERTY_MARGIN, (calculatedValue) => calculatedValue - width);
    }
    reset() {
      this._resetElementAttributes(this._element, "overflow");
      this._resetElementAttributes(this._element, PROPERTY_PADDING);
      this._resetElementAttributes(SELECTOR_FIXED_CONTENT, PROPERTY_PADDING);
      this._resetElementAttributes(SELECTOR_STICKY_CONTENT, PROPERTY_MARGIN);
    }
    isOverflowing() {
      return this.getWidth() > 0;
    }
    _disableOverFlow() {
      this._saveInitialAttribute(this._element, "overflow");
      this._element.style.overflow = "hidden";
    }
    _setElementAttributes(selector, styleProperty, callback) {
      const scrollbarWidth = this.getWidth();
      const manipulationCallBack = (element) => {
        if (element !== this._element && window.innerWidth > element.clientWidth + scrollbarWidth) {
          return;
        }
        this._saveInitialAttribute(element, styleProperty);
        const calculatedValue = window.getComputedStyle(element).getPropertyValue(styleProperty);
        element.style.setProperty(styleProperty, `${callback(Number.parseFloat(calculatedValue))}px`);
      };
      this._applyManipulationCallback(selector, manipulationCallBack);
    }
    _saveInitialAttribute(element, styleProperty) {
      const actualValue = element.style.getPropertyValue(styleProperty);
      if (actualValue) {
        Manipulator.setDataAttribute(element, styleProperty, actualValue);
      }
    }
    _resetElementAttributes(selector, styleProperty) {
      const manipulationCallBack = (element) => {
        const value = Manipulator.getDataAttribute(element, styleProperty);
        if (value === null) {
          element.style.removeProperty(styleProperty);
          return;
        }
        Manipulator.removeDataAttribute(element, styleProperty);
        element.style.setProperty(styleProperty, value);
      };
      this._applyManipulationCallback(selector, manipulationCallBack);
    }
    _applyManipulationCallback(selector, callBack) {
      if (isElement2(selector)) {
        callBack(selector);
        return;
      }
      for (const sel of SelectorEngine.find(selector, this._element)) {
        callBack(sel);
      }
    }
  };
  var NAME$7 = "modal";
  var DATA_KEY$4 = "bs.modal";
  var EVENT_KEY$4 = `.${DATA_KEY$4}`;
  var DATA_API_KEY$2 = ".data-api";
  var ESCAPE_KEY$1 = "Escape";
  var EVENT_HIDE$4 = `hide${EVENT_KEY$4}`;
  var EVENT_HIDE_PREVENTED$1 = `hidePrevented${EVENT_KEY$4}`;
  var EVENT_HIDDEN$4 = `hidden${EVENT_KEY$4}`;
  var EVENT_SHOW$4 = `show${EVENT_KEY$4}`;
  var EVENT_SHOWN$4 = `shown${EVENT_KEY$4}`;
  var EVENT_RESIZE$1 = `resize${EVENT_KEY$4}`;
  var EVENT_CLICK_DISMISS = `click.dismiss${EVENT_KEY$4}`;
  var EVENT_MOUSEDOWN_DISMISS = `mousedown.dismiss${EVENT_KEY$4}`;
  var EVENT_KEYDOWN_DISMISS$1 = `keydown.dismiss${EVENT_KEY$4}`;
  var EVENT_CLICK_DATA_API$2 = `click${EVENT_KEY$4}${DATA_API_KEY$2}`;
  var CLASS_NAME_OPEN = "modal-open";
  var CLASS_NAME_FADE$3 = "fade";
  var CLASS_NAME_SHOW$4 = "show";
  var CLASS_NAME_STATIC = "modal-static";
  var OPEN_SELECTOR$1 = ".modal.show";
  var SELECTOR_DIALOG = ".modal-dialog";
  var SELECTOR_MODAL_BODY = ".modal-body";
  var SELECTOR_DATA_TOGGLE$2 = '[data-bs-toggle="modal"]';
  var Default$6 = {
    backdrop: true,
    focus: true,
    keyboard: true
  };
  var DefaultType$6 = {
    backdrop: "(boolean|string)",
    focus: "boolean",
    keyboard: "boolean"
  };
  var Modal = class extends BaseComponent {
    constructor(element, config) {
      super(element, config);
      this._dialog = SelectorEngine.findOne(SELECTOR_DIALOG, this._element);
      this._backdrop = this._initializeBackDrop();
      this._focustrap = this._initializeFocusTrap();
      this._isShown = false;
      this._isTransitioning = false;
      this._scrollBar = new ScrollBarHelper();
      this._addEventListeners();
    }
    static get Default() {
      return Default$6;
    }
    static get DefaultType() {
      return DefaultType$6;
    }
    static get NAME() {
      return NAME$7;
    }
    toggle(relatedTarget) {
      return this._isShown ? this.hide() : this.show(relatedTarget);
    }
    show(relatedTarget) {
      if (this._isShown || this._isTransitioning) {
        return;
      }
      const showEvent = EventHandler.trigger(this._element, EVENT_SHOW$4, {
        relatedTarget
      });
      if (showEvent.defaultPrevented) {
        return;
      }
      this._isShown = true;
      this._isTransitioning = true;
      this._scrollBar.hide();
      document.body.classList.add(CLASS_NAME_OPEN);
      this._adjustDialog();
      this._backdrop.show(() => this._showElement(relatedTarget));
    }
    hide() {
      if (!this._isShown || this._isTransitioning) {
        return;
      }
      const hideEvent = EventHandler.trigger(this._element, EVENT_HIDE$4);
      if (hideEvent.defaultPrevented) {
        return;
      }
      this._isShown = false;
      this._isTransitioning = true;
      this._focustrap.deactivate();
      this._element.classList.remove(CLASS_NAME_SHOW$4);
      this._queueCallback(() => this._hideModal(), this._element, this._isAnimated());
    }
    dispose() {
      EventHandler.off(window, EVENT_KEY$4);
      EventHandler.off(this._dialog, EVENT_KEY$4);
      this._backdrop.dispose();
      this._focustrap.deactivate();
      super.dispose();
    }
    handleUpdate() {
      this._adjustDialog();
    }
    _initializeBackDrop() {
      return new Backdrop({
        isVisible: Boolean(this._config.backdrop),
        isAnimated: this._isAnimated()
      });
    }
    _initializeFocusTrap() {
      return new FocusTrap({
        trapElement: this._element
      });
    }
    _showElement(relatedTarget) {
      if (!document.body.contains(this._element)) {
        document.body.append(this._element);
      }
      this._element.style.display = "block";
      this._element.removeAttribute("aria-hidden");
      this._element.setAttribute("aria-modal", true);
      this._element.setAttribute("role", "dialog");
      this._element.scrollTop = 0;
      const modalBody = SelectorEngine.findOne(SELECTOR_MODAL_BODY, this._dialog);
      if (modalBody) {
        modalBody.scrollTop = 0;
      }
      reflow(this._element);
      this._element.classList.add(CLASS_NAME_SHOW$4);
      const transitionComplete = () => {
        if (this._config.focus) {
          this._focustrap.activate();
        }
        this._isTransitioning = false;
        EventHandler.trigger(this._element, EVENT_SHOWN$4, {
          relatedTarget
        });
      };
      this._queueCallback(transitionComplete, this._dialog, this._isAnimated());
    }
    _addEventListeners() {
      EventHandler.on(this._element, EVENT_KEYDOWN_DISMISS$1, (event) => {
        if (event.key !== ESCAPE_KEY$1) {
          return;
        }
        if (this._config.keyboard) {
          this.hide();
          return;
        }
        this._triggerBackdropTransition();
      });
      EventHandler.on(window, EVENT_RESIZE$1, () => {
        if (this._isShown && !this._isTransitioning) {
          this._adjustDialog();
        }
      });
      EventHandler.on(this._element, EVENT_MOUSEDOWN_DISMISS, (event) => {
        EventHandler.one(this._element, EVENT_CLICK_DISMISS, (event2) => {
          if (this._element !== event.target || this._element !== event2.target) {
            return;
          }
          if (this._config.backdrop === "static") {
            this._triggerBackdropTransition();
            return;
          }
          if (this._config.backdrop) {
            this.hide();
          }
        });
      });
    }
    _hideModal() {
      this._element.style.display = "none";
      this._element.setAttribute("aria-hidden", true);
      this._element.removeAttribute("aria-modal");
      this._element.removeAttribute("role");
      this._isTransitioning = false;
      this._backdrop.hide(() => {
        document.body.classList.remove(CLASS_NAME_OPEN);
        this._resetAdjustments();
        this._scrollBar.reset();
        EventHandler.trigger(this._element, EVENT_HIDDEN$4);
      });
    }
    _isAnimated() {
      return this._element.classList.contains(CLASS_NAME_FADE$3);
    }
    _triggerBackdropTransition() {
      const hideEvent = EventHandler.trigger(this._element, EVENT_HIDE_PREVENTED$1);
      if (hideEvent.defaultPrevented) {
        return;
      }
      const isModalOverflowing = this._element.scrollHeight > document.documentElement.clientHeight;
      const initialOverflowY = this._element.style.overflowY;
      if (initialOverflowY === "hidden" || this._element.classList.contains(CLASS_NAME_STATIC)) {
        return;
      }
      if (!isModalOverflowing) {
        this._element.style.overflowY = "hidden";
      }
      this._element.classList.add(CLASS_NAME_STATIC);
      this._queueCallback(() => {
        this._element.classList.remove(CLASS_NAME_STATIC);
        this._queueCallback(() => {
          this._element.style.overflowY = initialOverflowY;
        }, this._dialog);
      }, this._dialog);
      this._element.focus();
    }
    _adjustDialog() {
      const isModalOverflowing = this._element.scrollHeight > document.documentElement.clientHeight;
      const scrollbarWidth = this._scrollBar.getWidth();
      const isBodyOverflowing = scrollbarWidth > 0;
      if (isBodyOverflowing && !isModalOverflowing) {
        const property = isRTL() ? "paddingLeft" : "paddingRight";
        this._element.style[property] = `${scrollbarWidth}px`;
      }
      if (!isBodyOverflowing && isModalOverflowing) {
        const property = isRTL() ? "paddingRight" : "paddingLeft";
        this._element.style[property] = `${scrollbarWidth}px`;
      }
    }
    _resetAdjustments() {
      this._element.style.paddingLeft = "";
      this._element.style.paddingRight = "";
    }
    static jQueryInterface(config, relatedTarget) {
      return this.each(function() {
        const data = Modal.getOrCreateInstance(this, config);
        if (typeof config !== "string") {
          return;
        }
        if (typeof data[config] === "undefined") {
          throw new TypeError(`No method named "${config}"`);
        }
        data[config](relatedTarget);
      });
    }
  };
  EventHandler.on(document, EVENT_CLICK_DATA_API$2, SELECTOR_DATA_TOGGLE$2, function(event) {
    const target = SelectorEngine.getElementFromSelector(this);
    if (["A", "AREA"].includes(this.tagName)) {
      event.preventDefault();
    }
    EventHandler.one(target, EVENT_SHOW$4, (showEvent) => {
      if (showEvent.defaultPrevented) {
        return;
      }
      EventHandler.one(target, EVENT_HIDDEN$4, () => {
        if (isVisible(this)) {
          this.focus();
        }
      });
    });
    const alreadyOpen = SelectorEngine.findOne(OPEN_SELECTOR$1);
    if (alreadyOpen) {
      Modal.getInstance(alreadyOpen).hide();
    }
    const data = Modal.getOrCreateInstance(target);
    data.toggle(this);
  });
  enableDismissTrigger(Modal);
  defineJQueryPlugin(Modal);
  var NAME$6 = "offcanvas";
  var DATA_KEY$3 = "bs.offcanvas";
  var EVENT_KEY$3 = `.${DATA_KEY$3}`;
  var DATA_API_KEY$1 = ".data-api";
  var EVENT_LOAD_DATA_API$2 = `load${EVENT_KEY$3}${DATA_API_KEY$1}`;
  var ESCAPE_KEY = "Escape";
  var CLASS_NAME_SHOW$3 = "show";
  var CLASS_NAME_SHOWING$1 = "showing";
  var CLASS_NAME_HIDING = "hiding";
  var CLASS_NAME_BACKDROP = "offcanvas-backdrop";
  var OPEN_SELECTOR = ".offcanvas.show";
  var EVENT_SHOW$3 = `show${EVENT_KEY$3}`;
  var EVENT_SHOWN$3 = `shown${EVENT_KEY$3}`;
  var EVENT_HIDE$3 = `hide${EVENT_KEY$3}`;
  var EVENT_HIDE_PREVENTED = `hidePrevented${EVENT_KEY$3}`;
  var EVENT_HIDDEN$3 = `hidden${EVENT_KEY$3}`;
  var EVENT_RESIZE = `resize${EVENT_KEY$3}`;
  var EVENT_CLICK_DATA_API$1 = `click${EVENT_KEY$3}${DATA_API_KEY$1}`;
  var EVENT_KEYDOWN_DISMISS = `keydown.dismiss${EVENT_KEY$3}`;
  var SELECTOR_DATA_TOGGLE$1 = '[data-bs-toggle="offcanvas"]';
  var Default$5 = {
    backdrop: true,
    keyboard: true,
    scroll: false
  };
  var DefaultType$5 = {
    backdrop: "(boolean|string)",
    keyboard: "boolean",
    scroll: "boolean"
  };
  var Offcanvas = class extends BaseComponent {
    constructor(element, config) {
      super(element, config);
      this._isShown = false;
      this._backdrop = this._initializeBackDrop();
      this._focustrap = this._initializeFocusTrap();
      this._addEventListeners();
    }
    static get Default() {
      return Default$5;
    }
    static get DefaultType() {
      return DefaultType$5;
    }
    static get NAME() {
      return NAME$6;
    }
    toggle(relatedTarget) {
      return this._isShown ? this.hide() : this.show(relatedTarget);
    }
    show(relatedTarget) {
      if (this._isShown) {
        return;
      }
      const showEvent = EventHandler.trigger(this._element, EVENT_SHOW$3, {
        relatedTarget
      });
      if (showEvent.defaultPrevented) {
        return;
      }
      this._isShown = true;
      this._backdrop.show();
      if (!this._config.scroll) {
        new ScrollBarHelper().hide();
      }
      this._element.setAttribute("aria-modal", true);
      this._element.setAttribute("role", "dialog");
      this._element.classList.add(CLASS_NAME_SHOWING$1);
      const completeCallBack = () => {
        if (!this._config.scroll || this._config.backdrop) {
          this._focustrap.activate();
        }
        this._element.classList.add(CLASS_NAME_SHOW$3);
        this._element.classList.remove(CLASS_NAME_SHOWING$1);
        EventHandler.trigger(this._element, EVENT_SHOWN$3, {
          relatedTarget
        });
      };
      this._queueCallback(completeCallBack, this._element, true);
    }
    hide() {
      if (!this._isShown) {
        return;
      }
      const hideEvent = EventHandler.trigger(this._element, EVENT_HIDE$3);
      if (hideEvent.defaultPrevented) {
        return;
      }
      this._focustrap.deactivate();
      this._element.blur();
      this._isShown = false;
      this._element.classList.add(CLASS_NAME_HIDING);
      this._backdrop.hide();
      const completeCallback = () => {
        this._element.classList.remove(CLASS_NAME_SHOW$3, CLASS_NAME_HIDING);
        this._element.removeAttribute("aria-modal");
        this._element.removeAttribute("role");
        if (!this._config.scroll) {
          new ScrollBarHelper().reset();
        }
        EventHandler.trigger(this._element, EVENT_HIDDEN$3);
      };
      this._queueCallback(completeCallback, this._element, true);
    }
    dispose() {
      this._backdrop.dispose();
      this._focustrap.deactivate();
      super.dispose();
    }
    _initializeBackDrop() {
      const clickCallback = () => {
        if (this._config.backdrop === "static") {
          EventHandler.trigger(this._element, EVENT_HIDE_PREVENTED);
          return;
        }
        this.hide();
      };
      const isVisible2 = Boolean(this._config.backdrop);
      return new Backdrop({
        className: CLASS_NAME_BACKDROP,
        isVisible: isVisible2,
        isAnimated: true,
        rootElement: this._element.parentNode,
        clickCallback: isVisible2 ? clickCallback : null
      });
    }
    _initializeFocusTrap() {
      return new FocusTrap({
        trapElement: this._element
      });
    }
    _addEventListeners() {
      EventHandler.on(this._element, EVENT_KEYDOWN_DISMISS, (event) => {
        if (event.key !== ESCAPE_KEY) {
          return;
        }
        if (this._config.keyboard) {
          this.hide();
          return;
        }
        EventHandler.trigger(this._element, EVENT_HIDE_PREVENTED);
      });
    }
    static jQueryInterface(config) {
      return this.each(function() {
        const data = Offcanvas.getOrCreateInstance(this, config);
        if (typeof config !== "string") {
          return;
        }
        if (data[config] === void 0 || config.startsWith("_") || config === "constructor") {
          throw new TypeError(`No method named "${config}"`);
        }
        data[config](this);
      });
    }
  };
  EventHandler.on(document, EVENT_CLICK_DATA_API$1, SELECTOR_DATA_TOGGLE$1, function(event) {
    const target = SelectorEngine.getElementFromSelector(this);
    if (["A", "AREA"].includes(this.tagName)) {
      event.preventDefault();
    }
    if (isDisabled(this)) {
      return;
    }
    EventHandler.one(target, EVENT_HIDDEN$3, () => {
      if (isVisible(this)) {
        this.focus();
      }
    });
    const alreadyOpen = SelectorEngine.findOne(OPEN_SELECTOR);
    if (alreadyOpen && alreadyOpen !== target) {
      Offcanvas.getInstance(alreadyOpen).hide();
    }
    const data = Offcanvas.getOrCreateInstance(target);
    data.toggle(this);
  });
  EventHandler.on(window, EVENT_LOAD_DATA_API$2, () => {
    for (const selector of SelectorEngine.find(OPEN_SELECTOR)) {
      Offcanvas.getOrCreateInstance(selector).show();
    }
  });
  EventHandler.on(window, EVENT_RESIZE, () => {
    for (const element of SelectorEngine.find("[aria-modal][class*=show][class*=offcanvas-]")) {
      if (getComputedStyle(element).position !== "fixed") {
        Offcanvas.getOrCreateInstance(element).hide();
      }
    }
  });
  enableDismissTrigger(Offcanvas);
  defineJQueryPlugin(Offcanvas);
  var ARIA_ATTRIBUTE_PATTERN = /^aria-[\w-]*$/i;
  var DefaultAllowlist = {
    "*": ["class", "dir", "id", "lang", "role", ARIA_ATTRIBUTE_PATTERN],
    a: ["target", "href", "title", "rel"],
    area: [],
    b: [],
    br: [],
    col: [],
    code: [],
    div: [],
    em: [],
    hr: [],
    h1: [],
    h2: [],
    h3: [],
    h4: [],
    h5: [],
    h6: [],
    i: [],
    img: ["src", "srcset", "alt", "title", "width", "height"],
    li: [],
    ol: [],
    p: [],
    pre: [],
    s: [],
    small: [],
    span: [],
    sub: [],
    sup: [],
    strong: [],
    u: [],
    ul: []
  };
  var uriAttributes = /* @__PURE__ */ new Set(["background", "cite", "href", "itemtype", "longdesc", "poster", "src", "xlink:href"]);
  var SAFE_URL_PATTERN = /^(?!javascript:)(?:[a-z0-9+.-]+:|[^&:/?#]*(?:[/?#]|$))/i;
  var allowedAttribute = (attribute, allowedAttributeList) => {
    const attributeName = attribute.nodeName.toLowerCase();
    if (allowedAttributeList.includes(attributeName)) {
      if (uriAttributes.has(attributeName)) {
        return Boolean(SAFE_URL_PATTERN.test(attribute.nodeValue));
      }
      return true;
    }
    return allowedAttributeList.filter((attributeRegex) => attributeRegex instanceof RegExp).some((regex) => regex.test(attributeName));
  };
  function sanitizeHtml(unsafeHtml, allowList, sanitizeFunction) {
    if (!unsafeHtml.length) {
      return unsafeHtml;
    }
    if (sanitizeFunction && typeof sanitizeFunction === "function") {
      return sanitizeFunction(unsafeHtml);
    }
    const domParser = new window.DOMParser();
    const createdDocument = domParser.parseFromString(unsafeHtml, "text/html");
    const elements = [].concat(...createdDocument.body.querySelectorAll("*"));
    for (const element of elements) {
      const elementName = element.nodeName.toLowerCase();
      if (!Object.keys(allowList).includes(elementName)) {
        element.remove();
        continue;
      }
      const attributeList = [].concat(...element.attributes);
      const allowedAttributes = [].concat(allowList["*"] || [], allowList[elementName] || []);
      for (const attribute of attributeList) {
        if (!allowedAttribute(attribute, allowedAttributes)) {
          element.removeAttribute(attribute.nodeName);
        }
      }
    }
    return createdDocument.body.innerHTML;
  }
  var NAME$5 = "TemplateFactory";
  var Default$4 = {
    allowList: DefaultAllowlist,
    content: {},
    extraClass: "",
    html: false,
    sanitize: true,
    sanitizeFn: null,
    template: "<div></div>"
  };
  var DefaultType$4 = {
    allowList: "object",
    content: "object",
    extraClass: "(string|function)",
    html: "boolean",
    sanitize: "boolean",
    sanitizeFn: "(null|function)",
    template: "string"
  };
  var DefaultContentType = {
    entry: "(string|element|function|null)",
    selector: "(string|element)"
  };
  var TemplateFactory = class extends Config {
    constructor(config) {
      super();
      this._config = this._getConfig(config);
    }
    static get Default() {
      return Default$4;
    }
    static get DefaultType() {
      return DefaultType$4;
    }
    static get NAME() {
      return NAME$5;
    }
    getContent() {
      return Object.values(this._config.content).map((config) => this._resolvePossibleFunction(config)).filter(Boolean);
    }
    hasContent() {
      return this.getContent().length > 0;
    }
    changeContent(content) {
      this._checkContent(content);
      this._config.content = {
        ...this._config.content,
        ...content
      };
      return this;
    }
    toHtml() {
      const templateWrapper = document.createElement("div");
      templateWrapper.innerHTML = this._maybeSanitize(this._config.template);
      for (const [selector, text] of Object.entries(this._config.content)) {
        this._setContent(templateWrapper, text, selector);
      }
      const template = templateWrapper.children[0];
      const extraClass = this._resolvePossibleFunction(this._config.extraClass);
      if (extraClass) {
        template.classList.add(...extraClass.split(" "));
      }
      return template;
    }
    _typeCheckConfig(config) {
      super._typeCheckConfig(config);
      this._checkContent(config.content);
    }
    _checkContent(arg) {
      for (const [selector, content] of Object.entries(arg)) {
        super._typeCheckConfig({
          selector,
          entry: content
        }, DefaultContentType);
      }
    }
    _setContent(template, content, selector) {
      const templateElement = SelectorEngine.findOne(selector, template);
      if (!templateElement) {
        return;
      }
      content = this._resolvePossibleFunction(content);
      if (!content) {
        templateElement.remove();
        return;
      }
      if (isElement2(content)) {
        this._putElementInTemplate(getElement(content), templateElement);
        return;
      }
      if (this._config.html) {
        templateElement.innerHTML = this._maybeSanitize(content);
        return;
      }
      templateElement.textContent = content;
    }
    _maybeSanitize(arg) {
      return this._config.sanitize ? sanitizeHtml(arg, this._config.allowList, this._config.sanitizeFn) : arg;
    }
    _resolvePossibleFunction(arg) {
      return execute(arg, [this]);
    }
    _putElementInTemplate(element, templateElement) {
      if (this._config.html) {
        templateElement.innerHTML = "";
        templateElement.append(element);
        return;
      }
      templateElement.textContent = element.textContent;
    }
  };
  var NAME$4 = "tooltip";
  var DISALLOWED_ATTRIBUTES = /* @__PURE__ */ new Set(["sanitize", "allowList", "sanitizeFn"]);
  var CLASS_NAME_FADE$2 = "fade";
  var CLASS_NAME_MODAL = "modal";
  var CLASS_NAME_SHOW$2 = "show";
  var SELECTOR_TOOLTIP_INNER = ".tooltip-inner";
  var SELECTOR_MODAL = `.${CLASS_NAME_MODAL}`;
  var EVENT_MODAL_HIDE = "hide.bs.modal";
  var TRIGGER_HOVER = "hover";
  var TRIGGER_FOCUS = "focus";
  var TRIGGER_CLICK = "click";
  var TRIGGER_MANUAL = "manual";
  var EVENT_HIDE$2 = "hide";
  var EVENT_HIDDEN$2 = "hidden";
  var EVENT_SHOW$2 = "show";
  var EVENT_SHOWN$2 = "shown";
  var EVENT_INSERTED = "inserted";
  var EVENT_CLICK$1 = "click";
  var EVENT_FOCUSIN$1 = "focusin";
  var EVENT_FOCUSOUT$1 = "focusout";
  var EVENT_MOUSEENTER = "mouseenter";
  var EVENT_MOUSELEAVE = "mouseleave";
  var AttachmentMap = {
    AUTO: "auto",
    TOP: "top",
    RIGHT: isRTL() ? "left" : "right",
    BOTTOM: "bottom",
    LEFT: isRTL() ? "right" : "left"
  };
  var Default$3 = {
    allowList: DefaultAllowlist,
    animation: true,
    boundary: "clippingParents",
    container: false,
    customClass: "",
    delay: 0,
    fallbackPlacements: ["top", "right", "bottom", "left"],
    html: false,
    offset: [0, 6],
    placement: "top",
    popperConfig: null,
    sanitize: true,
    sanitizeFn: null,
    selector: false,
    template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
    title: "",
    trigger: "hover focus"
  };
  var DefaultType$3 = {
    allowList: "object",
    animation: "boolean",
    boundary: "(string|element)",
    container: "(string|element|boolean)",
    customClass: "(string|function)",
    delay: "(number|object)",
    fallbackPlacements: "array",
    html: "boolean",
    offset: "(array|string|function)",
    placement: "(string|function)",
    popperConfig: "(null|object|function)",
    sanitize: "boolean",
    sanitizeFn: "(null|function)",
    selector: "(string|boolean)",
    template: "string",
    title: "(string|element|function)",
    trigger: "string"
  };
  var Tooltip = class extends BaseComponent {
    constructor(element, config) {
      if (typeof lib_exports === "undefined") {
        throw new TypeError("Bootstrap's tooltips require Popper (https://popper.js.org)");
      }
      super(element, config);
      this._isEnabled = true;
      this._timeout = 0;
      this._isHovered = null;
      this._activeTrigger = {};
      this._popper = null;
      this._templateFactory = null;
      this._newContent = null;
      this.tip = null;
      this._setListeners();
      if (!this._config.selector) {
        this._fixTitle();
      }
    }
    static get Default() {
      return Default$3;
    }
    static get DefaultType() {
      return DefaultType$3;
    }
    static get NAME() {
      return NAME$4;
    }
    enable() {
      this._isEnabled = true;
    }
    disable() {
      this._isEnabled = false;
    }
    toggleEnabled() {
      this._isEnabled = !this._isEnabled;
    }
    toggle() {
      if (!this._isEnabled) {
        return;
      }
      this._activeTrigger.click = !this._activeTrigger.click;
      if (this._isShown()) {
        this._leave();
        return;
      }
      this._enter();
    }
    dispose() {
      clearTimeout(this._timeout);
      EventHandler.off(this._element.closest(SELECTOR_MODAL), EVENT_MODAL_HIDE, this._hideModalHandler);
      if (this._element.getAttribute("data-bs-original-title")) {
        this._element.setAttribute("title", this._element.getAttribute("data-bs-original-title"));
      }
      this._disposePopper();
      super.dispose();
    }
    show() {
      if (this._element.style.display === "none") {
        throw new Error("Please use show on visible elements");
      }
      if (!(this._isWithContent() && this._isEnabled)) {
        return;
      }
      const showEvent = EventHandler.trigger(this._element, this.constructor.eventName(EVENT_SHOW$2));
      const shadowRoot = findShadowRoot(this._element);
      const isInTheDom = (shadowRoot || this._element.ownerDocument.documentElement).contains(this._element);
      if (showEvent.defaultPrevented || !isInTheDom) {
        return;
      }
      this._disposePopper();
      const tip = this._getTipElement();
      this._element.setAttribute("aria-describedby", tip.getAttribute("id"));
      const {
        container
      } = this._config;
      if (!this._element.ownerDocument.documentElement.contains(this.tip)) {
        container.append(tip);
        EventHandler.trigger(this._element, this.constructor.eventName(EVENT_INSERTED));
      }
      this._popper = this._createPopper(tip);
      tip.classList.add(CLASS_NAME_SHOW$2);
      if ("ontouchstart" in document.documentElement) {
        for (const element of [].concat(...document.body.children)) {
          EventHandler.on(element, "mouseover", noop);
        }
      }
      const complete = () => {
        EventHandler.trigger(this._element, this.constructor.eventName(EVENT_SHOWN$2));
        if (this._isHovered === false) {
          this._leave();
        }
        this._isHovered = false;
      };
      this._queueCallback(complete, this.tip, this._isAnimated());
    }
    hide() {
      if (!this._isShown()) {
        return;
      }
      const hideEvent = EventHandler.trigger(this._element, this.constructor.eventName(EVENT_HIDE$2));
      if (hideEvent.defaultPrevented) {
        return;
      }
      const tip = this._getTipElement();
      tip.classList.remove(CLASS_NAME_SHOW$2);
      if ("ontouchstart" in document.documentElement) {
        for (const element of [].concat(...document.body.children)) {
          EventHandler.off(element, "mouseover", noop);
        }
      }
      this._activeTrigger[TRIGGER_CLICK] = false;
      this._activeTrigger[TRIGGER_FOCUS] = false;
      this._activeTrigger[TRIGGER_HOVER] = false;
      this._isHovered = null;
      const complete = () => {
        if (this._isWithActiveTrigger()) {
          return;
        }
        if (!this._isHovered) {
          this._disposePopper();
        }
        this._element.removeAttribute("aria-describedby");
        EventHandler.trigger(this._element, this.constructor.eventName(EVENT_HIDDEN$2));
      };
      this._queueCallback(complete, this.tip, this._isAnimated());
    }
    update() {
      if (this._popper) {
        this._popper.update();
      }
    }
    _isWithContent() {
      return Boolean(this._getTitle());
    }
    _getTipElement() {
      if (!this.tip) {
        this.tip = this._createTipElement(this._newContent || this._getContentForTemplate());
      }
      return this.tip;
    }
    _createTipElement(content) {
      const tip = this._getTemplateFactory(content).toHtml();
      if (!tip) {
        return null;
      }
      tip.classList.remove(CLASS_NAME_FADE$2, CLASS_NAME_SHOW$2);
      tip.classList.add(`bs-${this.constructor.NAME}-auto`);
      const tipId = getUID(this.constructor.NAME).toString();
      tip.setAttribute("id", tipId);
      if (this._isAnimated()) {
        tip.classList.add(CLASS_NAME_FADE$2);
      }
      return tip;
    }
    setContent(content) {
      this._newContent = content;
      if (this._isShown()) {
        this._disposePopper();
        this.show();
      }
    }
    _getTemplateFactory(content) {
      if (this._templateFactory) {
        this._templateFactory.changeContent(content);
      } else {
        this._templateFactory = new TemplateFactory({
          ...this._config,
          content,
          extraClass: this._resolvePossibleFunction(this._config.customClass)
        });
      }
      return this._templateFactory;
    }
    _getContentForTemplate() {
      return {
        [SELECTOR_TOOLTIP_INNER]: this._getTitle()
      };
    }
    _getTitle() {
      return this._resolvePossibleFunction(this._config.title) || this._element.getAttribute("data-bs-original-title");
    }
    _initializeOnDelegatedTarget(event) {
      return this.constructor.getOrCreateInstance(event.delegateTarget, this._getDelegateConfig());
    }
    _isAnimated() {
      return this._config.animation || this.tip && this.tip.classList.contains(CLASS_NAME_FADE$2);
    }
    _isShown() {
      return this.tip && this.tip.classList.contains(CLASS_NAME_SHOW$2);
    }
    _createPopper(tip) {
      const placement = execute(this._config.placement, [this, tip, this._element]);
      const attachment = AttachmentMap[placement.toUpperCase()];
      return createPopper3(this._element, tip, this._getPopperConfig(attachment));
    }
    _getOffset() {
      const {
        offset: offset2
      } = this._config;
      if (typeof offset2 === "string") {
        return offset2.split(",").map((value) => Number.parseInt(value, 10));
      }
      if (typeof offset2 === "function") {
        return (popperData) => offset2(popperData, this._element);
      }
      return offset2;
    }
    _resolvePossibleFunction(arg) {
      return execute(arg, [this._element]);
    }
    _getPopperConfig(attachment) {
      const defaultBsPopperConfig = {
        placement: attachment,
        modifiers: [{
          name: "flip",
          options: {
            fallbackPlacements: this._config.fallbackPlacements
          }
        }, {
          name: "offset",
          options: {
            offset: this._getOffset()
          }
        }, {
          name: "preventOverflow",
          options: {
            boundary: this._config.boundary
          }
        }, {
          name: "arrow",
          options: {
            element: `.${this.constructor.NAME}-arrow`
          }
        }, {
          name: "preSetPlacement",
          enabled: true,
          phase: "beforeMain",
          fn: (data) => {
            this._getTipElement().setAttribute("data-popper-placement", data.state.placement);
          }
        }]
      };
      return {
        ...defaultBsPopperConfig,
        ...execute(this._config.popperConfig, [defaultBsPopperConfig])
      };
    }
    _setListeners() {
      const triggers = this._config.trigger.split(" ");
      for (const trigger of triggers) {
        if (trigger === "click") {
          EventHandler.on(this._element, this.constructor.eventName(EVENT_CLICK$1), this._config.selector, (event) => {
            const context = this._initializeOnDelegatedTarget(event);
            context.toggle();
          });
        } else if (trigger !== TRIGGER_MANUAL) {
          const eventIn = trigger === TRIGGER_HOVER ? this.constructor.eventName(EVENT_MOUSEENTER) : this.constructor.eventName(EVENT_FOCUSIN$1);
          const eventOut = trigger === TRIGGER_HOVER ? this.constructor.eventName(EVENT_MOUSELEAVE) : this.constructor.eventName(EVENT_FOCUSOUT$1);
          EventHandler.on(this._element, eventIn, this._config.selector, (event) => {
            const context = this._initializeOnDelegatedTarget(event);
            context._activeTrigger[event.type === "focusin" ? TRIGGER_FOCUS : TRIGGER_HOVER] = true;
            context._enter();
          });
          EventHandler.on(this._element, eventOut, this._config.selector, (event) => {
            const context = this._initializeOnDelegatedTarget(event);
            context._activeTrigger[event.type === "focusout" ? TRIGGER_FOCUS : TRIGGER_HOVER] = context._element.contains(event.relatedTarget);
            context._leave();
          });
        }
      }
      this._hideModalHandler = () => {
        if (this._element) {
          this.hide();
        }
      };
      EventHandler.on(this._element.closest(SELECTOR_MODAL), EVENT_MODAL_HIDE, this._hideModalHandler);
    }
    _fixTitle() {
      const title = this._element.getAttribute("title");
      if (!title) {
        return;
      }
      if (!this._element.getAttribute("aria-label") && !this._element.textContent.trim()) {
        this._element.setAttribute("aria-label", title);
      }
      this._element.setAttribute("data-bs-original-title", title);
      this._element.removeAttribute("title");
    }
    _enter() {
      if (this._isShown() || this._isHovered) {
        this._isHovered = true;
        return;
      }
      this._isHovered = true;
      this._setTimeout(() => {
        if (this._isHovered) {
          this.show();
        }
      }, this._config.delay.show);
    }
    _leave() {
      if (this._isWithActiveTrigger()) {
        return;
      }
      this._isHovered = false;
      this._setTimeout(() => {
        if (!this._isHovered) {
          this.hide();
        }
      }, this._config.delay.hide);
    }
    _setTimeout(handler, timeout) {
      clearTimeout(this._timeout);
      this._timeout = setTimeout(handler, timeout);
    }
    _isWithActiveTrigger() {
      return Object.values(this._activeTrigger).includes(true);
    }
    _getConfig(config) {
      const dataAttributes = Manipulator.getDataAttributes(this._element);
      for (const dataAttribute of Object.keys(dataAttributes)) {
        if (DISALLOWED_ATTRIBUTES.has(dataAttribute)) {
          delete dataAttributes[dataAttribute];
        }
      }
      config = {
        ...dataAttributes,
        ...typeof config === "object" && config ? config : {}
      };
      config = this._mergeConfigObj(config);
      config = this._configAfterMerge(config);
      this._typeCheckConfig(config);
      return config;
    }
    _configAfterMerge(config) {
      config.container = config.container === false ? document.body : getElement(config.container);
      if (typeof config.delay === "number") {
        config.delay = {
          show: config.delay,
          hide: config.delay
        };
      }
      if (typeof config.title === "number") {
        config.title = config.title.toString();
      }
      if (typeof config.content === "number") {
        config.content = config.content.toString();
      }
      return config;
    }
    _getDelegateConfig() {
      const config = {};
      for (const [key, value] of Object.entries(this._config)) {
        if (this.constructor.Default[key] !== value) {
          config[key] = value;
        }
      }
      config.selector = false;
      config.trigger = "manual";
      return config;
    }
    _disposePopper() {
      if (this._popper) {
        this._popper.destroy();
        this._popper = null;
      }
      if (this.tip) {
        this.tip.remove();
        this.tip = null;
      }
    }
    static jQueryInterface(config) {
      return this.each(function() {
        const data = Tooltip.getOrCreateInstance(this, config);
        if (typeof config !== "string") {
          return;
        }
        if (typeof data[config] === "undefined") {
          throw new TypeError(`No method named "${config}"`);
        }
        data[config]();
      });
    }
  };
  defineJQueryPlugin(Tooltip);
  var NAME$3 = "popover";
  var SELECTOR_TITLE = ".popover-header";
  var SELECTOR_CONTENT = ".popover-body";
  var Default$2 = {
    ...Tooltip.Default,
    content: "",
    offset: [0, 8],
    placement: "right",
    template: '<div class="popover" role="tooltip"><div class="popover-arrow"></div><h3 class="popover-header"></h3><div class="popover-body"></div></div>',
    trigger: "click"
  };
  var DefaultType$2 = {
    ...Tooltip.DefaultType,
    content: "(null|string|element|function)"
  };
  var Popover = class extends Tooltip {
    static get Default() {
      return Default$2;
    }
    static get DefaultType() {
      return DefaultType$2;
    }
    static get NAME() {
      return NAME$3;
    }
    _isWithContent() {
      return this._getTitle() || this._getContent();
    }
    _getContentForTemplate() {
      return {
        [SELECTOR_TITLE]: this._getTitle(),
        [SELECTOR_CONTENT]: this._getContent()
      };
    }
    _getContent() {
      return this._resolvePossibleFunction(this._config.content);
    }
    static jQueryInterface(config) {
      return this.each(function() {
        const data = Popover.getOrCreateInstance(this, config);
        if (typeof config !== "string") {
          return;
        }
        if (typeof data[config] === "undefined") {
          throw new TypeError(`No method named "${config}"`);
        }
        data[config]();
      });
    }
  };
  defineJQueryPlugin(Popover);
  var NAME$2 = "scrollspy";
  var DATA_KEY$2 = "bs.scrollspy";
  var EVENT_KEY$2 = `.${DATA_KEY$2}`;
  var DATA_API_KEY = ".data-api";
  var EVENT_ACTIVATE = `activate${EVENT_KEY$2}`;
  var EVENT_CLICK = `click${EVENT_KEY$2}`;
  var EVENT_LOAD_DATA_API$1 = `load${EVENT_KEY$2}${DATA_API_KEY}`;
  var CLASS_NAME_DROPDOWN_ITEM = "dropdown-item";
  var CLASS_NAME_ACTIVE$1 = "active";
  var SELECTOR_DATA_SPY = '[data-bs-spy="scroll"]';
  var SELECTOR_TARGET_LINKS = "[href]";
  var SELECTOR_NAV_LIST_GROUP = ".nav, .list-group";
  var SELECTOR_NAV_LINKS = ".nav-link";
  var SELECTOR_NAV_ITEMS = ".nav-item";
  var SELECTOR_LIST_ITEMS = ".list-group-item";
  var SELECTOR_LINK_ITEMS = `${SELECTOR_NAV_LINKS}, ${SELECTOR_NAV_ITEMS} > ${SELECTOR_NAV_LINKS}, ${SELECTOR_LIST_ITEMS}`;
  var SELECTOR_DROPDOWN = ".dropdown";
  var SELECTOR_DROPDOWN_TOGGLE$1 = ".dropdown-toggle";
  var Default$1 = {
    offset: null,
    rootMargin: "0px 0px -25%",
    smoothScroll: false,
    target: null,
    threshold: [0.1, 0.5, 1]
  };
  var DefaultType$1 = {
    offset: "(number|null)",
    rootMargin: "string",
    smoothScroll: "boolean",
    target: "element",
    threshold: "array"
  };
  var ScrollSpy = class extends BaseComponent {
    constructor(element, config) {
      super(element, config);
      this._targetLinks = /* @__PURE__ */ new Map();
      this._observableSections = /* @__PURE__ */ new Map();
      this._rootElement = getComputedStyle(this._element).overflowY === "visible" ? null : this._element;
      this._activeTarget = null;
      this._observer = null;
      this._previousScrollData = {
        visibleEntryTop: 0,
        parentScrollTop: 0
      };
      this.refresh();
    }
    static get Default() {
      return Default$1;
    }
    static get DefaultType() {
      return DefaultType$1;
    }
    static get NAME() {
      return NAME$2;
    }
    refresh() {
      this._initializeTargetsAndObservables();
      this._maybeEnableSmoothScroll();
      if (this._observer) {
        this._observer.disconnect();
      } else {
        this._observer = this._getNewObserver();
      }
      for (const section of this._observableSections.values()) {
        this._observer.observe(section);
      }
    }
    dispose() {
      this._observer.disconnect();
      super.dispose();
    }
    _configAfterMerge(config) {
      config.target = getElement(config.target) || document.body;
      config.rootMargin = config.offset ? `${config.offset}px 0px -30%` : config.rootMargin;
      if (typeof config.threshold === "string") {
        config.threshold = config.threshold.split(",").map((value) => Number.parseFloat(value));
      }
      return config;
    }
    _maybeEnableSmoothScroll() {
      if (!this._config.smoothScroll) {
        return;
      }
      EventHandler.off(this._config.target, EVENT_CLICK);
      EventHandler.on(this._config.target, EVENT_CLICK, SELECTOR_TARGET_LINKS, (event) => {
        const observableSection = this._observableSections.get(event.target.hash);
        if (observableSection) {
          event.preventDefault();
          const root = this._rootElement || window;
          const height = observableSection.offsetTop - this._element.offsetTop;
          if (root.scrollTo) {
            root.scrollTo({
              top: height,
              behavior: "smooth"
            });
            return;
          }
          root.scrollTop = height;
        }
      });
    }
    _getNewObserver() {
      const options = {
        root: this._rootElement,
        threshold: this._config.threshold,
        rootMargin: this._config.rootMargin
      };
      return new IntersectionObserver((entries) => this._observerCallback(entries), options);
    }
    _observerCallback(entries) {
      const targetElement = (entry) => this._targetLinks.get(`#${entry.target.id}`);
      const activate = (entry) => {
        this._previousScrollData.visibleEntryTop = entry.target.offsetTop;
        this._process(targetElement(entry));
      };
      const parentScrollTop = (this._rootElement || document.documentElement).scrollTop;
      const userScrollsDown = parentScrollTop >= this._previousScrollData.parentScrollTop;
      this._previousScrollData.parentScrollTop = parentScrollTop;
      for (const entry of entries) {
        if (!entry.isIntersecting) {
          this._activeTarget = null;
          this._clearActiveClass(targetElement(entry));
          continue;
        }
        const entryIsLowerThanPrevious = entry.target.offsetTop >= this._previousScrollData.visibleEntryTop;
        if (userScrollsDown && entryIsLowerThanPrevious) {
          activate(entry);
          if (!parentScrollTop) {
            return;
          }
          continue;
        }
        if (!userScrollsDown && !entryIsLowerThanPrevious) {
          activate(entry);
        }
      }
    }
    _initializeTargetsAndObservables() {
      this._targetLinks = /* @__PURE__ */ new Map();
      this._observableSections = /* @__PURE__ */ new Map();
      const targetLinks = SelectorEngine.find(SELECTOR_TARGET_LINKS, this._config.target);
      for (const anchor of targetLinks) {
        if (!anchor.hash || isDisabled(anchor)) {
          continue;
        }
        const observableSection = SelectorEngine.findOne(decodeURI(anchor.hash), this._element);
        if (isVisible(observableSection)) {
          this._targetLinks.set(decodeURI(anchor.hash), anchor);
          this._observableSections.set(anchor.hash, observableSection);
        }
      }
    }
    _process(target) {
      if (this._activeTarget === target) {
        return;
      }
      this._clearActiveClass(this._config.target);
      this._activeTarget = target;
      target.classList.add(CLASS_NAME_ACTIVE$1);
      this._activateParents(target);
      EventHandler.trigger(this._element, EVENT_ACTIVATE, {
        relatedTarget: target
      });
    }
    _activateParents(target) {
      if (target.classList.contains(CLASS_NAME_DROPDOWN_ITEM)) {
        SelectorEngine.findOne(SELECTOR_DROPDOWN_TOGGLE$1, target.closest(SELECTOR_DROPDOWN)).classList.add(CLASS_NAME_ACTIVE$1);
        return;
      }
      for (const listGroup of SelectorEngine.parents(target, SELECTOR_NAV_LIST_GROUP)) {
        for (const item of SelectorEngine.prev(listGroup, SELECTOR_LINK_ITEMS)) {
          item.classList.add(CLASS_NAME_ACTIVE$1);
        }
      }
    }
    _clearActiveClass(parent) {
      parent.classList.remove(CLASS_NAME_ACTIVE$1);
      const activeNodes = SelectorEngine.find(`${SELECTOR_TARGET_LINKS}.${CLASS_NAME_ACTIVE$1}`, parent);
      for (const node of activeNodes) {
        node.classList.remove(CLASS_NAME_ACTIVE$1);
      }
    }
    static jQueryInterface(config) {
      return this.each(function() {
        const data = ScrollSpy.getOrCreateInstance(this, config);
        if (typeof config !== "string") {
          return;
        }
        if (data[config] === void 0 || config.startsWith("_") || config === "constructor") {
          throw new TypeError(`No method named "${config}"`);
        }
        data[config]();
      });
    }
  };
  EventHandler.on(window, EVENT_LOAD_DATA_API$1, () => {
    for (const spy of SelectorEngine.find(SELECTOR_DATA_SPY)) {
      ScrollSpy.getOrCreateInstance(spy);
    }
  });
  defineJQueryPlugin(ScrollSpy);
  var NAME$1 = "tab";
  var DATA_KEY$1 = "bs.tab";
  var EVENT_KEY$1 = `.${DATA_KEY$1}`;
  var EVENT_HIDE$1 = `hide${EVENT_KEY$1}`;
  var EVENT_HIDDEN$1 = `hidden${EVENT_KEY$1}`;
  var EVENT_SHOW$1 = `show${EVENT_KEY$1}`;
  var EVENT_SHOWN$1 = `shown${EVENT_KEY$1}`;
  var EVENT_CLICK_DATA_API = `click${EVENT_KEY$1}`;
  var EVENT_KEYDOWN = `keydown${EVENT_KEY$1}`;
  var EVENT_LOAD_DATA_API = `load${EVENT_KEY$1}`;
  var ARROW_LEFT_KEY = "ArrowLeft";
  var ARROW_RIGHT_KEY = "ArrowRight";
  var ARROW_UP_KEY = "ArrowUp";
  var ARROW_DOWN_KEY = "ArrowDown";
  var HOME_KEY = "Home";
  var END_KEY = "End";
  var CLASS_NAME_ACTIVE = "active";
  var CLASS_NAME_FADE$1 = "fade";
  var CLASS_NAME_SHOW$1 = "show";
  var CLASS_DROPDOWN = "dropdown";
  var SELECTOR_DROPDOWN_TOGGLE = ".dropdown-toggle";
  var SELECTOR_DROPDOWN_MENU = ".dropdown-menu";
  var NOT_SELECTOR_DROPDOWN_TOGGLE = `:not(${SELECTOR_DROPDOWN_TOGGLE})`;
  var SELECTOR_TAB_PANEL = '.list-group, .nav, [role="tablist"]';
  var SELECTOR_OUTER = ".nav-item, .list-group-item";
  var SELECTOR_INNER = `.nav-link${NOT_SELECTOR_DROPDOWN_TOGGLE}, .list-group-item${NOT_SELECTOR_DROPDOWN_TOGGLE}, [role="tab"]${NOT_SELECTOR_DROPDOWN_TOGGLE}`;
  var SELECTOR_DATA_TOGGLE = '[data-bs-toggle="tab"], [data-bs-toggle="pill"], [data-bs-toggle="list"]';
  var SELECTOR_INNER_ELEM = `${SELECTOR_INNER}, ${SELECTOR_DATA_TOGGLE}`;
  var SELECTOR_DATA_TOGGLE_ACTIVE = `.${CLASS_NAME_ACTIVE}[data-bs-toggle="tab"], .${CLASS_NAME_ACTIVE}[data-bs-toggle="pill"], .${CLASS_NAME_ACTIVE}[data-bs-toggle="list"]`;
  var Tab = class extends BaseComponent {
    constructor(element) {
      super(element);
      this._parent = this._element.closest(SELECTOR_TAB_PANEL);
      if (!this._parent) {
        return;
      }
      this._setInitialAttributes(this._parent, this._getChildren());
      EventHandler.on(this._element, EVENT_KEYDOWN, (event) => this._keydown(event));
    }
    static get NAME() {
      return NAME$1;
    }
    show() {
      const innerElem = this._element;
      if (this._elemIsActive(innerElem)) {
        return;
      }
      const active = this._getActiveElem();
      const hideEvent = active ? EventHandler.trigger(active, EVENT_HIDE$1, {
        relatedTarget: innerElem
      }) : null;
      const showEvent = EventHandler.trigger(innerElem, EVENT_SHOW$1, {
        relatedTarget: active
      });
      if (showEvent.defaultPrevented || hideEvent && hideEvent.defaultPrevented) {
        return;
      }
      this._deactivate(active, innerElem);
      this._activate(innerElem, active);
    }
    _activate(element, relatedElem) {
      if (!element) {
        return;
      }
      element.classList.add(CLASS_NAME_ACTIVE);
      this._activate(SelectorEngine.getElementFromSelector(element));
      const complete = () => {
        if (element.getAttribute("role") !== "tab") {
          element.classList.add(CLASS_NAME_SHOW$1);
          return;
        }
        element.removeAttribute("tabindex");
        element.setAttribute("aria-selected", true);
        this._toggleDropDown(element, true);
        EventHandler.trigger(element, EVENT_SHOWN$1, {
          relatedTarget: relatedElem
        });
      };
      this._queueCallback(complete, element, element.classList.contains(CLASS_NAME_FADE$1));
    }
    _deactivate(element, relatedElem) {
      if (!element) {
        return;
      }
      element.classList.remove(CLASS_NAME_ACTIVE);
      element.blur();
      this._deactivate(SelectorEngine.getElementFromSelector(element));
      const complete = () => {
        if (element.getAttribute("role") !== "tab") {
          element.classList.remove(CLASS_NAME_SHOW$1);
          return;
        }
        element.setAttribute("aria-selected", false);
        element.setAttribute("tabindex", "-1");
        this._toggleDropDown(element, false);
        EventHandler.trigger(element, EVENT_HIDDEN$1, {
          relatedTarget: relatedElem
        });
      };
      this._queueCallback(complete, element, element.classList.contains(CLASS_NAME_FADE$1));
    }
    _keydown(event) {
      if (![ARROW_LEFT_KEY, ARROW_RIGHT_KEY, ARROW_UP_KEY, ARROW_DOWN_KEY, HOME_KEY, END_KEY].includes(event.key)) {
        return;
      }
      event.stopPropagation();
      event.preventDefault();
      const children = this._getChildren().filter((element) => !isDisabled(element));
      let nextActiveElement;
      if ([HOME_KEY, END_KEY].includes(event.key)) {
        nextActiveElement = children[event.key === HOME_KEY ? 0 : children.length - 1];
      } else {
        const isNext = [ARROW_RIGHT_KEY, ARROW_DOWN_KEY].includes(event.key);
        nextActiveElement = getNextActiveElement(children, event.target, isNext, true);
      }
      if (nextActiveElement) {
        nextActiveElement.focus({
          preventScroll: true
        });
        Tab.getOrCreateInstance(nextActiveElement).show();
      }
    }
    _getChildren() {
      return SelectorEngine.find(SELECTOR_INNER_ELEM, this._parent);
    }
    _getActiveElem() {
      return this._getChildren().find((child) => this._elemIsActive(child)) || null;
    }
    _setInitialAttributes(parent, children) {
      this._setAttributeIfNotExists(parent, "role", "tablist");
      for (const child of children) {
        this._setInitialAttributesOnChild(child);
      }
    }
    _setInitialAttributesOnChild(child) {
      child = this._getInnerElement(child);
      const isActive = this._elemIsActive(child);
      const outerElem = this._getOuterElement(child);
      child.setAttribute("aria-selected", isActive);
      if (outerElem !== child) {
        this._setAttributeIfNotExists(outerElem, "role", "presentation");
      }
      if (!isActive) {
        child.setAttribute("tabindex", "-1");
      }
      this._setAttributeIfNotExists(child, "role", "tab");
      this._setInitialAttributesOnTargetPanel(child);
    }
    _setInitialAttributesOnTargetPanel(child) {
      const target = SelectorEngine.getElementFromSelector(child);
      if (!target) {
        return;
      }
      this._setAttributeIfNotExists(target, "role", "tabpanel");
      if (child.id) {
        this._setAttributeIfNotExists(target, "aria-labelledby", `${child.id}`);
      }
    }
    _toggleDropDown(element, open) {
      const outerElem = this._getOuterElement(element);
      if (!outerElem.classList.contains(CLASS_DROPDOWN)) {
        return;
      }
      const toggle = (selector, className) => {
        const element2 = SelectorEngine.findOne(selector, outerElem);
        if (element2) {
          element2.classList.toggle(className, open);
        }
      };
      toggle(SELECTOR_DROPDOWN_TOGGLE, CLASS_NAME_ACTIVE);
      toggle(SELECTOR_DROPDOWN_MENU, CLASS_NAME_SHOW$1);
      outerElem.setAttribute("aria-expanded", open);
    }
    _setAttributeIfNotExists(element, attribute, value) {
      if (!element.hasAttribute(attribute)) {
        element.setAttribute(attribute, value);
      }
    }
    _elemIsActive(elem) {
      return elem.classList.contains(CLASS_NAME_ACTIVE);
    }
    _getInnerElement(elem) {
      return elem.matches(SELECTOR_INNER_ELEM) ? elem : SelectorEngine.findOne(SELECTOR_INNER_ELEM, elem);
    }
    _getOuterElement(elem) {
      return elem.closest(SELECTOR_OUTER) || elem;
    }
    static jQueryInterface(config) {
      return this.each(function() {
        const data = Tab.getOrCreateInstance(this);
        if (typeof config !== "string") {
          return;
        }
        if (data[config] === void 0 || config.startsWith("_") || config === "constructor") {
          throw new TypeError(`No method named "${config}"`);
        }
        data[config]();
      });
    }
  };
  EventHandler.on(document, EVENT_CLICK_DATA_API, SELECTOR_DATA_TOGGLE, function(event) {
    if (["A", "AREA"].includes(this.tagName)) {
      event.preventDefault();
    }
    if (isDisabled(this)) {
      return;
    }
    Tab.getOrCreateInstance(this).show();
  });
  EventHandler.on(window, EVENT_LOAD_DATA_API, () => {
    for (const element of SelectorEngine.find(SELECTOR_DATA_TOGGLE_ACTIVE)) {
      Tab.getOrCreateInstance(element);
    }
  });
  defineJQueryPlugin(Tab);
  var NAME = "toast";
  var DATA_KEY = "bs.toast";
  var EVENT_KEY = `.${DATA_KEY}`;
  var EVENT_MOUSEOVER = `mouseover${EVENT_KEY}`;
  var EVENT_MOUSEOUT = `mouseout${EVENT_KEY}`;
  var EVENT_FOCUSIN = `focusin${EVENT_KEY}`;
  var EVENT_FOCUSOUT = `focusout${EVENT_KEY}`;
  var EVENT_HIDE = `hide${EVENT_KEY}`;
  var EVENT_HIDDEN = `hidden${EVENT_KEY}`;
  var EVENT_SHOW = `show${EVENT_KEY}`;
  var EVENT_SHOWN = `shown${EVENT_KEY}`;
  var CLASS_NAME_FADE = "fade";
  var CLASS_NAME_HIDE = "hide";
  var CLASS_NAME_SHOW = "show";
  var CLASS_NAME_SHOWING = "showing";
  var DefaultType = {
    animation: "boolean",
    autohide: "boolean",
    delay: "number"
  };
  var Default = {
    animation: true,
    autohide: true,
    delay: 5e3
  };
  var Toast = class extends BaseComponent {
    constructor(element, config) {
      super(element, config);
      this._timeout = null;
      this._hasMouseInteraction = false;
      this._hasKeyboardInteraction = false;
      this._setListeners();
    }
    static get Default() {
      return Default;
    }
    static get DefaultType() {
      return DefaultType;
    }
    static get NAME() {
      return NAME;
    }
    show() {
      const showEvent = EventHandler.trigger(this._element, EVENT_SHOW);
      if (showEvent.defaultPrevented) {
        return;
      }
      this._clearTimeout();
      if (this._config.animation) {
        this._element.classList.add(CLASS_NAME_FADE);
      }
      const complete = () => {
        this._element.classList.remove(CLASS_NAME_SHOWING);
        EventHandler.trigger(this._element, EVENT_SHOWN);
        this._maybeScheduleHide();
      };
      this._element.classList.remove(CLASS_NAME_HIDE);
      reflow(this._element);
      this._element.classList.add(CLASS_NAME_SHOW, CLASS_NAME_SHOWING);
      this._queueCallback(complete, this._element, this._config.animation);
    }
    hide() {
      if (!this.isShown()) {
        return;
      }
      const hideEvent = EventHandler.trigger(this._element, EVENT_HIDE);
      if (hideEvent.defaultPrevented) {
        return;
      }
      const complete = () => {
        this._element.classList.add(CLASS_NAME_HIDE);
        this._element.classList.remove(CLASS_NAME_SHOWING, CLASS_NAME_SHOW);
        EventHandler.trigger(this._element, EVENT_HIDDEN);
      };
      this._element.classList.add(CLASS_NAME_SHOWING);
      this._queueCallback(complete, this._element, this._config.animation);
    }
    dispose() {
      this._clearTimeout();
      if (this.isShown()) {
        this._element.classList.remove(CLASS_NAME_SHOW);
      }
      super.dispose();
    }
    isShown() {
      return this._element.classList.contains(CLASS_NAME_SHOW);
    }
    _maybeScheduleHide() {
      if (!this._config.autohide) {
        return;
      }
      if (this._hasMouseInteraction || this._hasKeyboardInteraction) {
        return;
      }
      this._timeout = setTimeout(() => {
        this.hide();
      }, this._config.delay);
    }
    _onInteraction(event, isInteracting) {
      switch (event.type) {
        case "mouseover":
        case "mouseout": {
          this._hasMouseInteraction = isInteracting;
          break;
        }
        case "focusin":
        case "focusout": {
          this._hasKeyboardInteraction = isInteracting;
          break;
        }
      }
      if (isInteracting) {
        this._clearTimeout();
        return;
      }
      const nextElement = event.relatedTarget;
      if (this._element === nextElement || this._element.contains(nextElement)) {
        return;
      }
      this._maybeScheduleHide();
    }
    _setListeners() {
      EventHandler.on(this._element, EVENT_MOUSEOVER, (event) => this._onInteraction(event, true));
      EventHandler.on(this._element, EVENT_MOUSEOUT, (event) => this._onInteraction(event, false));
      EventHandler.on(this._element, EVENT_FOCUSIN, (event) => this._onInteraction(event, true));
      EventHandler.on(this._element, EVENT_FOCUSOUT, (event) => this._onInteraction(event, false));
    }
    _clearTimeout() {
      clearTimeout(this._timeout);
      this._timeout = null;
    }
    static jQueryInterface(config) {
      return this.each(function() {
        const data = Toast.getOrCreateInstance(this, config);
        if (typeof config === "string") {
          if (typeof data[config] === "undefined") {
            throw new TypeError(`No method named "${config}"`);
          }
          data[config](this);
        }
      });
    }
  };
  enableDismissTrigger(Toast);
  defineJQueryPlugin(Toast);

  // app/javascript/mask.js
  var import_inputmask = __toESM(require_inputmask());
  var element_phone = document.getElementsByClassName("mask-phone");
  var im_phone = new import_inputmask.default("(99) 999999999");
  im_phone.mask(element_phone);
  var element_cpf = document.getElementsByClassName("mask-cpf");
  var im_cpf = new import_inputmask.default("999.999.999-99");
  im_cpf.mask(element_cpf);
})();
/*!
  * Bootstrap v5.3.2 (https://getbootstrap.com/)
  * Copyright 2011-2023 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
  * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
  */
/*!
 * dist/inputmask
 * https://github.com/RobinHerbots/Inputmask
 * Copyright (c) 2010 - 2023 Robin Herbots
 * Licensed under the MIT license
 * Version: 5.0.8
 */
//# sourceMappingURL=assets/application.js.map
