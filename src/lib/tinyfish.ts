import { TinyFish } from "@tiny-fish/sdk";

import { getEnv } from "../config/env.js";

let client: TinyFish | undefined;

export function getTinyFishClient(): TinyFish {
  if (client) {
    return client;
  }

  const env = getEnv();

  client = new TinyFish({
    apiKey: env.TINYFISH_API_KEY,
  });

  return client;
}
