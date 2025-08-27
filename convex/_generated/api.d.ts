/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as analyses from "../analyses.js";
import type * as analyze from "../analyze.js";
import type * as extract from "../extract.js";
import type * as extract_node from "../extract_node.js";
import type * as extractions from "../extractions.js";
import type * as files from "../files.js";
import type * as history from "../history.js";
import type * as http from "../http.js";
import type * as usageLogs from "../usageLogs.js";
import type * as user from "../user.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  analyses: typeof analyses;
  analyze: typeof analyze;
  extract: typeof extract;
  extract_node: typeof extract_node;
  extractions: typeof extractions;
  files: typeof files;
  history: typeof history;
  http: typeof http;
  usageLogs: typeof usageLogs;
  user: typeof user;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
