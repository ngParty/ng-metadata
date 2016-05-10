export type HostBindingsProcessed = {
  classes: StringMap,
  attributes: StringMap,
  properties: StringMap
}
export type HostListenersProcessed = {[key:string]:string[]};
export type HostProcessed = {
  hostStatic: StringMap,
  hostBindings: HostBindingsProcessed,
  hostListeners: HostListenersProcessed
}
