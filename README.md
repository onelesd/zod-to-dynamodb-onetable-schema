# 💍 `zod-to-dynamodb-onetable-schema`

Auto-generate `dynamodb-onetable` model schemas using `zod`, with best-in-class autocomplete

## Overview

- Convert `zod` _objects_ into `dynamo-onetable` model schemas
- Convert `zod` _schemas_ into `dynamo-onetable` model field schemas
- Get dynamic autocomplete as you expect from `dynamo-onetable` via type-fu 🥋
- Un-representable data-types cause errors, un-representable checks optionally `debug` log
- Zero dependencies

## Rationale

`dyanmodb-onetable` provides a fantastic API for building and interacting with DynamoDB single-table designs. In using it, I've come to appreciate a couple of areas where I wanted something slightly different:

1. The validation option offers a single regex pattern per field [(and we all know how regex goes)](https://regex.info/blog/2006-09-15/247)
2. Defining the schema can be tricky because using the supplied types clobbers the library's ability to infer your specific models

Enter, `zod`, which excels at providing a flexible schema-building API and [parsing](https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/) data. This library aims to bridge the two, giving you all the benefits of `dynamodb-onetable` while delegating model schema building and parsing to `zod`, which has proven itself as a capable library for those jobs.

## Quick start

Say you have an existing 'Account' schema using `zod` in your application code:

```ts
import { z } from "zod";

const accountSchema = z.object({
  id: z.string().uuid(),
  email: z.string(),
  status: z.enum(["verified", "unverified"]),
});
```

You've also started defining your `dynamodb-onetable` Table schema:

```ts
import { OneSchema, OneTableError } from "dynamodb-onetable";

const SCHEMA = {
  format: "onetable:1.1.0",
  version: "0.0.1",
  indexes: { primary: { hash: "pk", sort: "sk" } },
  params: { isoDates: false, timestamps: true, null: true },
  // 👈 We need models here
} satisfies OneSchema;
```

Adding a `Account` model is easy. First, create a `zod` schema and then pass it into `createModelSchema`.

```ts
import { createModelSchema } from "zod-to-dynamodb-onetable-schema";

const accountRecordSchema = accountSchema.extend({
  pk: z.literal("${_type}#${id}"),
  sk: z.literal("${_type}#"),
});

const SCHEMA = {
  // other fields collapsed
  models: { Account: createModelSchema(accountRecordSchema, {}) },
} satisfies OneSchema;
```

Your schema is complete, now let's use the model:

```ts
import { Table } from "dynamodb-onetable";

const table = new Table({
  // other fields collapsed,
  schema: SCHEMA,
});

const accountModel = table.getModel("Account");

const newAccount: z.infer<typeof accountSchema> = {
  id: uuidv4(),
  email: "hello@example.com",
  status: "unverified",
};

await accountModel.create(newAccount);
const storedAccount = await accountModel.get(newAccount);
expect(newAccount).toEqual(storedAccount);
```

Notice we didn't need to specify the `pk` or `pk`? That's because `Table` handles it for us when we use `z.literal()` with OneTable's [value template syntax](https://doc.onetable.io/api/table/schemas/attributes/#value-templates). The typing is smart enough to identify that these values can be automatically extracted from your entity data and aren't needed.

<details>
<summary><b>Expand for an example that explicitly sets the indexes</b></summary>

```ts
import { Table, OneSchema, OneTableError } from "dynamodb-onetable";
import { createModelSchema } from "zod-to-dynamodb-onetable-schema";
import { z } from "zod";

const accountRecordSchema = z.object({
  pk: z.string(),
  sk: z.string(),
  id: z.string().uuid(),
  email: z.string(),
  status: z.enum(["verified", "unverified"]),
});

const SCHEMA = {
  // other fields collapsed
  models: { Account: createModelSchema(accountRecordSchema, {}) },
} satisfies OneSchema;

const accountModel = table.getModel("Account");

const newAccount: z.infer<typeof accountRecordSchema> = {
  pk: "Account#1",
  sk: "Account",
  id: 1,
  email: "hello@example.com",
  status: "unverified",
};

await accountModel.create(newAccount);
const storedAccount = await accountModel.get(newAccount);
expect(newAccount).toMatchObject(storedAccount);
```

</details>

## Contributing

I appreciate any contributions, issues or discussions. My aim is to make contributing quick and easy.

Please note that PR quality checks enforce a 100% code coverage rate and will test your code against a local version of DynamoDB. Passing these requirements are essential to getting a merge/release. For new code, at least some tests should interface with an instance of `Table` that interacts with a local DynamoDB instance. An example of this test type is at `tests/createModelSchema.spec.ts`.

Here's a quick start to getting this repo running on your own machine (assumes you already have `gh`, `node` and `docker` installed):

1. Clone the repo to your own machine

```sh
gh repo clone jharlow/zod-to-dynamodb-onetable-schema
```

2. Start an instance of `dynamodb-local` on your machine

```sh
docker run -d -p 8000:8000 amazon/dynamodb-local
```

3. Install dependencies

```sh
pnpm install
```

4. You can now execute the test suite and develop 🙌

```sh
pnpm test
```
