import { handleEvent, handleInteraction } from "@dressed/dressed/server";
import { assertEquals, assertExists } from "@std/assert";

Deno.test(function replying() {
  for (const n of [1, 2, 3, 5]) {
    callEndpoint(
      n,
      1,
      1,
      (body) =>
        handleInteraction(
          // deno-lint-ignore require-await
          async (i) => {
            i.reply("Command received");
          },
          // deno-lint-ignore require-await
          async (i) => {
            i.reply("Component received");
          },
          body,
        ),
      new URL(
        "https://discord.com/api/v10/interactions/int_id/int_token/callback",
      ),
    );
  }
  for (const n of [0, 1]) {
    callEndpoint(n, 0, 0, (body) =>
      handleEvent(
        async () => {},
        body,
      ), null);
  }
});

const defaultBody = {
  type: 0,
  id: "int_id",
  token: "int_token",
  data: {
    id: "cmd_id",
    name: "cmd_name",
    custom_id: "cpt_id",
  },
  event: {
    type: "evt_type",
  },
};

function callEndpoint(
  n: number,
  pingN: number,
  requestsN: number,
  callback: (body: typeof defaultBody) => number,
  endpointCalled: URL | null,
) {
  const body = { ...defaultBody, type: n };
  const requests: {
    input: string | URL | Request;
    init?: RequestInit;
  }[] = [];
  // @ts-ignore This is fine
  // deno-lint-ignore no-global-assign
  fetch = function fetch(
    input: string | URL | Request,
    init?: globalThis.RequestInit,
  ) {
    requests.push({ input, init });
    return new Response(null, { status: 204 });
  };

  const res = callback(body);

  // Ping test case
  if (n === pingN) {
    assertEquals(res, 200);
    return;
  }

  assertEquals(requests.length, requestsN);
  if (requestsN) {
    assertEquals(requests[0].input, endpointCalled);
    assertExists(requests[0].init);
    assertEquals(
      requests[0].init.method,
      "POST",
    );
    assertEquals(
      requests[0].init.headers,
      {
        Authorization: "Bot bot_token",
        "Content-Type": "application/json",
      },
    );
    assertEquals(
      requests[0].init.body,
      JSON.stringify({
        type: 4,
        data: { content: `${n === 2 ? "Command" : "Component"} received` },
      }),
    );
  }
}
