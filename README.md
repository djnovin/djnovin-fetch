<h1 align="center">djnovin/fetcher</h1>

<p align="center">
  <p> A simple fetch wrapper with retry mechanism. </p>
</p>

## Quickstart

```zsh

npm install djnovin-fetch@latest

```

## Example

```ts

fetchBuilder
  .setUrl("https://jsonplaceholder.typicode.com/posts")
  .setMethod("POST")
  .setHeaders({ "Content-Type": "application/json" })
  .setBody({ name: "John Doe" })
  .setMaxRetries(3)
  .setRetryDelay(1000)
  .execute<{ id: number; name: string }>()
  .then(([error, response]) => {
    if (error) {
      console.error(error);
    } else {
      console.log(response);
    }
  });

```
