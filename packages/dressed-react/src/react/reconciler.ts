import type { HostConfig, ReactContext } from "react-reconciler";
import ReactReconciler from "react-reconciler";
import { DefaultEventPriority, NoEventPriority } from "react-reconciler/constants.js";
import { createNode, isNode, type Node } from "./node.ts";
import type { Renderer } from "./renderer.ts";
import { createTextNode, type TextNode } from "./text-node.ts";

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

    // biome-ignore lint/correctness/noUnusedVariables: Children are being filtered out
    const { children, ...rest } = props;

    const node = createNode(rest);
    if (!isNode(node)) {
      throw new Error(`createNode function did not return a Node`);
    }

    return node;
  },
  createTextInstance: (text) => createTextNode(text),
  shouldSetTextContent: () => false,
  detachDeletedInstance() {},
  beforeActiveInstanceBlur() {},
  afterActiveInstanceBlur() {},
  getInstanceFromNode: () => null,
  getInstanceFromScope: () => null,
  clearContainer: (renderer) => {
    renderer.nodes.length = 0;
  },
  appendChildToContainer: (renderer, child) => renderer.nodes.push(child),
  removeChildFromContainer: (renderer, child) => renderer.nodes.filter((n) => n !== child),
  insertInContainerBefore: (renderer, child, before) => {
    let index = renderer.nodes.indexOf(before);
    if (index === -1) {
      index = renderer.nodes.length;
    }
    renderer.nodes.splice(index, 0, child);
  },
  appendInitialChild: (parent, child) => parent.children.push(child),
  appendChild: (parent, child) => parent.children.push(child),
  removeChild: (parent, child) => parent.children.filter((n) => n !== child),
  insertBefore: (parent, child, before) => {
    let index = parent.children.indexOf(before);
    if (index === -1) {
      index = parent.children.length;
    }
    parent.children.splice(index, 0, child);
  },
  prepareForCommit: () => null,
  resetAfterCommit: () => null,
  prepareScopeUpdate() {},
  preparePortalMount: () => {
    throw new Error("Portals are not supported");
  },
  getPublicInstance: () => {
    throw new Error("Refs are currently not supported");
  },
  finalizeInitialChildren: () => false,
  setCurrentUpdatePriority: (newPriority) => {
    currentUpdatePriority = newPriority;
  },
  getCurrentUpdatePriority: () => currentUpdatePriority,
  resolveUpdatePriority: () =>
    currentUpdatePriority !== NoEventPriority ? currentUpdatePriority : DefaultEventPriority,
  maySuspendCommit: () => false,
  NotPendingTransition: null,
  HostTransitionContext: {
    $$typeof: Symbol.for("react.context"),
    _currentValue: null,
    _currentValue2: null,
    Provider: null,
    Consumer: null,
    _threadCount: 0,
  } as unknown as ReactContext<null>,
  resetFormInstance() {},
  requestPostPaintCallback() {},
  shouldAttemptEagerTransition: () => false,
  trackSchedulerEvent() {},
  resolveEventType: () => null,
  resolveEventTimeStamp: () => -1,
  preloadInstance: () => false,
  startSuspendingCommit() {},
  suspendInstance() {},
  waitForCommitToBeReady: () => null,
};

export const reconciler = ReactReconciler(config);
