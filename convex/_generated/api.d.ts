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
import type * as auth from "../auth.js";
import type * as categories from "../categories.js";
import type * as crons from "../crons.js";
import type * as files from "../files.js";
import type * as http from "../http.js";
import type * as matchAdmin from "../matchAdmin.js";
import type * as matchCore from "../matchCore.js";
import type * as matchGameplay from "../matchGameplay.js";
import type * as matchResults from "../matchResults.js";
import type * as matches from "../matches.js";
import type * as questionCategories from "../questionCategories.js";
import type * as questions from "../questions.js";
import type * as router from "../router.js";
import type * as utils from "../utils.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  categories: typeof categories;
  crons: typeof crons;
  files: typeof files;
  http: typeof http;
  matchAdmin: typeof matchAdmin;
  matchCore: typeof matchCore;
  matchGameplay: typeof matchGameplay;
  matchResults: typeof matchResults;
  matches: typeof matches;
  questionCategories: typeof questionCategories;
  questions: typeof questions;
  router: typeof router;
  utils: typeof utils;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
