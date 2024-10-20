export * from "./core";
export * from "./shared";

import { FetchBuilder } from "./core";

const fetcher = new FetchBuilder()
  .setUrl("https://jsonplaceholder.typicode.com/posts")
  .setMethod("GET")
  .setHeaders({ "Content-Type": "application/json" })
  .setResponseType("json")
  .setTimeout(5000)
  .setMaxRetries(2)
  .setRetryDelay(1500)
  .execute();

async function fetchData() {
  try {
    const data = await fetcher;
    console.log(data);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

fetchData();
