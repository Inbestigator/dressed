import type { ReactContext } from "react-reconciler";
import ReactReconciler from "react-reconciler";
import { DefaultEventPriority, NoEventPriority } from "react-reconciler/constants.js";
import { createNode, isNode, type Node, removeChild } from "./node.ts";
import type { Renderer } from "./renderer.ts";
import { createTextNode, type TextNode } from "./text-node.ts";

let currentUpdatePriority: number = NoEventPriority;

export const reconciler = ReactReconciler<
  string, // Type,
  Record<string, unknown>, // Props,
  Renderer, // Container,
  Node<unknown>, // Instance,
  TextNode, // TextInstance,
  never, // SuspenseInstance,
  never, // HydratableInstance,
  never, // PublicInstance,
  Record<string, never>, // HostContext,
  true, // UpdatePayload,
  never, // ChildSet,
  number, // TimeoutHandle,
  number, // NoTimeout,
  null // TransitionStatus
>({
  supportsMutation: true,
  supportsPersistence: false,
  supportsHydration: false,
  isPrimaryRenderer: true,
  supportsMicrotasks: true,
  scheduleMicrotask: queueMicrotask,
  scheduleTimeout: globalThis.setTimeout,
  cancelTimeout: globalThis.clearTimeout,
  noTimeout: -1,
  getRootHostContext: () => true,
  getChildHostContext: () => true,
  createInstance(type, props) {
    if (type !== "dressed-node") {
      throw new Error(`Unknown node type: ${type}`);
    }

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
  clearContainer(renderer) {
    renderer.nodes = [];
  },
  appendChildToContainer: (renderer, child) => renderer.nodes.push(child),
  removeChildFromContainer: (renderer, child) => removeChild(renderer.nodes, child),
  insertInContainerBefore(renderer, child, before) {
    let index = renderer.nodes.indexOf(before);
    if (index === -1) {
      index = renderer.nodes.length;
    }
    renderer.nodes.splice(index, 0, child);
  },
  appendInitialChild: (parent, child) => parent.children.push(child),
  appendChild: (parent, child) => parent.children.push(child),
  removeChild: (parent, child) => removeChild(parent.children, child),
  insertBefore(parent, child, before) {
    let index = parent.children.indexOf(before);
    if (index === -1) {
      index = parent.children.length;
    }
    parent.children.splice(index, 0, child);
  },
  prepareForCommit: () => null,
  resetAfterCommit: (renderer) => queueMicrotask(renderer.render),
  prepareScopeUpdate() {},
  preparePortalMount() {
    throw new Error("Portals are not supported");
  },
  getPublicInstance() {
    throw new Error("Refs are currently not supported");
  },
  finalizeInitialChildren: () => false,
  setCurrentUpdatePriority(newPriority) {
    currentUpdatePriority = newPriority;
  },
  getCurrentUpdatePriority: () => currentUpdatePriority,
  resolveUpdatePriority: () => currentUpdatePriority || DefaultEventPriority,
  maySuspendCommit: () => true,
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
  commitUpdate(node, _type, oldProps, newProps) {
    const { children, ...props } = newProps ?? oldProps;
    node.props = props;
  },
  commitTextUpdate(node, _oldText, newText) {
    node.props = newText;
  },
  hideInstance(instance) {
    instance.hidden = true;
  },
  unhideInstance(instance) {
    instance.hidden = false;
  },
  hideTextInstance(textInstance) {
    textInstance.hidden = true;
  },
  unhideTextInstance(textInstance) {
    textInstance.hidden = false;
  },
});
