import { routes } from "./data.json";

export default routes as Record<
  string,
  {
    params: `${"data" | "params" | `url.${string}` | `var.${string}`}${"?" | ""}`[];
    overrides?: {
      apiRoute?: string;
      dangerousExtraLogic?: string;
      dataType?: string;
      fetchOptions?: Record<string, unknown>;
      fileKey?: string;
      generic?: string;
      imports?: string[];
      messageKey?: string;
      name?: string;
      paramsType?: string;
      returnType?: string;
      splitKeyStart?: number;
    };
    flags?: ("deprecated" | "form" | "hasFiles" | "hasStringableContent" | "returnVoid" | "singlefile")[];
    docs: { description: string; infos?: string[]; warns?: string[]; dangers?: string[]; see: string };
  }
>;

export function routeKeyToMethodName(method: string, key: string, splitKeyStart = 1) {
  const routeKey = key.slice(method.length).replace("API", "");
  const prefix = {
    Get: routeKey.endsWith("s") ? "list" : "get",
    Post: "create",
    Put: "add",
    Patch: "modify",
    Delete: "delete",
  }[method];
  const splitRoutes = routeKey.match(/[A-Z][a-z]+/g) ?? [];
  return (
    prefix +
    (splitRoutes.length > 1 ? splitRoutes.slice(splitKeyStart) : splitRoutes)
      .join("")
      .slice(0, routeKey.endsWith("s") && method !== "Get" ? -1 : undefined)
  );
}
