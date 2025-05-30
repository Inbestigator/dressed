/**
 * This separation is intended to shield esbuild from bundling, as Next.js especially seems to freak out when it's referenced
 *
 * @module
 */

import build from "./build.ts";

export default build;
