import { j as defineNuxtRouteMiddleware } from './server.mjs';
import 'vue';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'better-sqlite3';
import 'vue-router';
import '@supabase/ssr';
import 'vue/server-renderer';
import '@vercel/analytics/nuxt';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';

const roleCoordinadora = defineNuxtRouteMiddleware(async (to, from) => {
  return;
});

export { roleCoordinadora as default };
//# sourceMappingURL=role-coordinadora-laMUBNO1.mjs.map
