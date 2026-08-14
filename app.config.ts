import type { ConfigContext, ExpoConfig } from "expo/config";

type Plugin = NonNullable<ExpoConfig["plugins"]>[number];

const isRouterPlugin = (plugin: Plugin) =>
  plugin === "expo-router" || (Array.isArray(plugin) && plugin[0] === "expo-router");

/**
 * The routes in app/api/v1 only answer on a server. Under `expo start` Metro is that server and
 * Expo's fetch polyfill resolves a relative path against it, so nothing below matters in dev.
 *
 * A release build has no dev server: the polyfill falls back to `extra.router.origin`, which is
 * what this file writes. Without it every screen in a preview/production build loads empty, so the
 * static app.json cannot hold the value — it differs per build and has to come from the
 * environment (eas.json `env`, or .env.local when exporting locally).
 */
export default ({ config }: ConfigContext): ExpoConfig => {
  const origin = process.env.EXPO_PUBLIC_API_ORIGIN?.trim().replace(/\/$/, "");

  return {
    ...(config as ExpoConfig),
    plugins: [
      ["expo-router", origin ? { origin } : {}],
      ...(config.plugins ?? []).filter((plugin) => !isRouterPlugin(plugin)),
    ],
  };
};
