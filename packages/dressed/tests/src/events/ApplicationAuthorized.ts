import type { Event } from "dressed";

export default function (event: Event<"ApplicationAuthorized">) {
  console.log(event.user.username, "just added me to", event.guild ? event.guild.name : "themself");
}
