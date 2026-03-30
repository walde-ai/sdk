# Walde SDK
This is the TypeScript SDK to use Walde, a powerful platform to create and manage beautiful and
performant online content.


## Installation
```bash
npm i @walde.ai/sdk
```

## Quick Start
The most common use of Walde SDK is to be used in your frontend application to load content from
a Walde backend. You can use this SDK in any TypeScript frontend, such a React or Vue, or even with
vanilla TypeScript.


The first step is to init your Walde instance. This is an object you can use to query your backend,
of which you need to define the URL.
```ts
import { MakeWalde } from '@walde.ai/sdk';

// Initialize the SDK
const walde = MakeWalde({
  url: 'https://content.your-walde-site.com'
});
```

Once you have your instance defined, you can chain methods to fetch the content you want.
```ts
// Get one content
const byKey = await walde
  .contents()
  .key('my/content/key')
  .locale('en-us')
  .resolve();
```
Other ways to get content.
```ts
const byId = await walde
  .contents()
  .id('my-content-id')
  .locale('en-us')
  .resolve();

const byName = await walde
  .contents()
  .name('My Content Name')
  .locale('en-us')
  .resolve();

// List all content in the site
const all = await walde
  .contents()
  .list()
  .resolve();
```

Note that you can chain all the methods you want inexpensively. The asynchronous backend calls
happens only when you run the `resolve()` method.
```ts
// This is not loading anything yet
const query = walde
  .contents()
  .key('my/content/key')
  .locale('en-us');

// This actually performs the backend call
const result = await query.resolve();
```