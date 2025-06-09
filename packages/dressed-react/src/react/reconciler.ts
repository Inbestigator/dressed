import ReactReconciler, {
  type HostConfig,
  type ReactContext,
} from "react-reconciler";
import {
  DefaultEventPriority,
  NoEventPriority,
} from "react-reconciler/constants.js";
import { createNode, isNode, type Node } from "./node.ts";
import type { Renderer } from "./renderer.ts";
import { createTextNode, type TextNode } from "./text-node.ts";
import { createContext } from "react";

let currentUpdatePriority: number = NoEventPriority;

const config: HostConfig<
  string, // Type,
  Record<string, unknown>, // Props,
  Renderer, // Container,
  Node<unknown>, // Instance,
  TextNode, // TextInstance,
  never, // SuspenseInstance,
  never, // HydratableInstance,
  never, // PublicInstance,
  never, // HostContext,
  true, // UpdatePayload,
  never, // ChildSet,
  number, // TimeoutHandle,
  number, // NoTimeout,
  null // TransitionStatus
> = {
  supportsMutation: true,
  supportsPersistence: false,
  supportsHydration: false,
  isPrimaryRenderer: true,
  scheduleTimeout: globalThis.setTimeout,
  cancelTimeout: globalThis.clearTimeout,
  noTimeout: -1,
  getRootHostContext: () => true,
  getChildHostContext: () => true,
  createInstance: (type, props) => {
    if (type !== "dressed-node") {
      throw new Error(`Unknown node type: ${type}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { children, ...rest } = props;

    const node = createNode(rest);
    if (!isNode(node)) {
      throw new Error(`createNode function did not return a Node`);
    }

    return node;
  },
  createTextInstance: (text) => createTextNode(text),
  shouldSetTextContent: () => false,
  detachDeletedInstance: () => {},
  beforeActiveInstanceBlur: () => {},
  afterActiveInstanceBlur: () => {},
  getInstanceFromNode: () => null,
  getInstanceFromScope: () => null,
  clearContainer: (renderer) => {
    renderer.nodes.length = 0;
  },
  appendChildToContainer: (renderer, child) => {
    renderer.nodes.push(child);
  },
  appendInitialChild: (parent, child) => {
    parent.children.push(child);
  },
  prepareForCommit: () => null,
  resetAfterCommit: () => null,
  prepareScopeUpdate: () => {},
  preparePortalMount: () => {
    throw new Error("Portals are not supported");
  },
  getPublicInstance: () => {
    throw new Error("Refs are currently not supported");
  },
  finalizeInitialChildren: () => false,
  setCurrentUpdatePriority: (newPriority: number) => {
    currentUpdatePriority = newPriority;
  },
  getCurrentUpdatePriority: () => currentUpdatePriority,
  resolveUpdatePriority: () =>
    currentUpdatePriority !== NoEventPriority
      ? currentUpdatePriority
      : DefaultEventPriority,
  maySuspendCommit: () => false,
  NotPendingTransition: null,
  HostTransitionContext: createContext(null) as unknown as ReactContext<null>,
  resetFormInstance: () => {},
  requestPostPaintCallback: () => {},
  shouldAttemptEagerTransition: () => false,
  trackSchedulerEvent: () => {},
  resolveEventType: () => null,
  resolveEventTimeStamp: () => -1,
  preloadInstance: () => false,
  startSuspendingCommit: () => {},
  suspendInstance: () => {},
  waitForCommitToBeReady: () => null,
};

export const reconciler = ReactReconciler(config);
