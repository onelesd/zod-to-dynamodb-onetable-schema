# 💍 `zod-to-dynamodb-onetable-schema`

Auto-generate `dynamodb-onetable` model schemas using `zod`, with best-in-class autocomplete

## Overview

- Convert `zod` _objects_ into `dynamo-onetable` model schemas
- Convert `zod` _schemas_ into `dynamo-onetable` model field schemas
- Get dynamic autocomplete as you expect from `dynamo-onetable` via type-fu 🥋
- Un-representable data-types cause errors, un-representable checks will notify you via `logger.debug` if you provide a Winston instance
- Compatible with `zod@^3.23.8` and `dynamo-onetable@^2.7.5`

## Rationale

`dyanmodb-onetable` provides a fantastic API for building and interacting with DynamoDB single-table designs. In using it, I've come to appreciate a couple of areas where I wanted something slightly different:

1. The validation option offers a single regex pattern per field [(and we all know how regex goes)](https://regex.info/blog/2006-09-15/247)
2. Defining the schema can be tricky because using the supplied types clobbers the library's ability to infer your specific models

Enter, `zod`, which excels at providing a flexible schema-building API and [parsing](https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/) data. This library aims to bridge the two, giving you all the benefits of `dynamodb-onetable` while delegating model schema building and parsing to `zod`, which has proven itself as a capable library for those jobs.

## Install

```sh
npm i zod-to-dynamodb-onetable-schema
```

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

Defining a `Account` model is now easy. We'll extend it to include our table's indexes and pass it to `zodOneModelSchema`.

```ts
import { zodOneModelSchema } from "zod-to-dynamodb-onetable-schema";
import { Table } from "dynamodb-onetable";

const accountRecordSchema = accountSchema.extend({
  pk: z.literal("${_type}#${id}"), // 👈 more about this later
  sk: z.literal("${_type}#"),
});

const table = new Table({
  // other fields collapsed,
  schema: {
    indexes: { primary: { hash: "pk", sort: "sk" } },
    models: { Account: zodOneModelSchema(accountRecordSchema) },
  },
});
```

We can now use our new Account model...

```ts
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

## A deeper dive

### Explicitly setting indexes

<details>
<summary><b>Expand for an example that explicitly sets the indexes</b></summary>

If you don't want to use `z.literal()` and OneTable's value template syntax, you can set your indexes using `z.string()` and `z.number()` as you would expect.

```ts
import { Table } from "dynamodb-onetable";
import { zodOneModelSchema } from "zod-to-dynamodb-onetable-schema";
import { z } from "zod";

const accountRecordSchema = z.object({
  pk: z.string(),
  sk: z.string(),
  id: z.string().uuid(),
  email: z.string(),
  status: z.enum(["verified", "unverified"]),
});

const table = new Table({
  // other fields collapsed,
  schema: {
    indexes: { primary: { hash: "pk", sort: "sk" } },
    models: { Account: zodOneModelSchema(accountRecordSchema) },
  },
});

const accountModel = table.getModel("Account");

const newAccount: z.infer<typeof accountRecordSchema> = {
  pk: "Account#1",
  sk: "Account",
  id: "1",
  email: "hello@example.com",
  status: "unverified",
};

await accountModel.create(newAccount);
const storedAccount = await accountModel.get(newAccount);
expect(newAccount).toMatchObject(storedAccount);
```

</details>

### Mixing OneTable schema syntax with `zod` schemas

<details>
<summary><b>Expand for an example that nests zod model in existing schema</b></summary>

This library also supports partial `zod` schema definition via the `zodOneFieldSchema` export. In this example, we add a complex schema using the `zod` API to a nested attribute.

```ts
import { Table } from "dynamodb-onetable";
import { zodOneFieldSchema } from "zod-to-dynamodb-onetable-schema";

const table = new Table({
  // other fields collapsed,
  schema: {
    indexes: { primary: { hash: "pk", sort: "sk" } },
    models: {
      Account: {
        pk: { type: String, required: true },
        sk: { type: String, required: true },
        account: {
          type: "object",
          required: true,
          schema: {
            id: { type: String, required: true },
            //     👇  utilize our zod converter
            emails: zodOneFieldSchema(
              z.array(
                z.object({
                  email: z.string().email(),
                  isVerified: z.boolean(),
                }),
              ),
            ),
          },
        },
      },
    },
  },
});
```

Thanks to the type-fu 🥋 of `ZodToOneField`, even nesting our converter like this will still leave you with best-in-class autocomplete in the `Table` instance.

</details>

### Decoupling the `schema` from `Table`

<details>
<summary><b>Expand for an example demonstrating dependency injection using your schema</b></summary>

You might get to a point where you want to have multiple `Table` instances, at which point you'll want to have one source of truth for your schema. Likewise, you might want to inject your `Table` while still getting full autocomplete.

In short, the answer is to use `Table<typeof oneTableSchema>` as your injectable table where `oneTableSchema satisfies OneSchema`!

```ts
import { OneSchema, Table } from "dynamodb-onetable";
import { z } from "zod";
import { zodOneModelSchema } from "../src";

const accountSchema = z.object({
  id: z.string().uuid(),
  email: z.string(),
  status: z.enum(["verified", "unverified"]),
});

type Account = z.infer<typeof accountSchema>;

interface AccountStore {
  getAccount: (accountId: string) => Promise<Account | null>;
}

const accountRecordSchema = accountSchema.extend({
  pk: z.literal("${_type}#${id}"),
  sk: z.literal("${_type}#"),
});

const oneTableSchema = {
  // other attributes collapsed
  indexes: { primary: { hash: "pk", sort: "sk" } },
  models: { Account: zodOneModelSchema(accountRecordSchema) },
} satisfies OneSchema;

class AccountOneTableStore implements AccountStore {
  constructor(private readonly table: Table<typeof oneTableSchema>) {}

  async getAccount(accountId: string): Promise<Account | null> {
    try {
      const data = await this.table.getModel("Account").get({ id: accountId });
      return accountSchema.parse(data);
    } catch (err) {
      console.info("Account could not be found in OneTable", { err });
      return null;
    }
  }
}

const table = new Table({
  // other attributes collapsed
  schema: oneTableSchema,
});

const accountStore = new AccountOneTableStore(table);

const account = await accountStore.get("test-id");
```

</details>

## Contributing

I appreciate any contributions, issues or discussions. My aim is to make contributing quick and easy.

Please note that PR quality checks enforce a 100% code coverage rate and will test your code against a local version of DynamoDB. Passing these requirements are essential to getting a merge/release. For new code, at least some tests should interface with an instance of `Table` that interacts with a local DynamoDB instance. An example of this test type is at `tests/zodOneModelSchema.spec.ts`.

Here's a quick start to getting this repo running on your own machine (assumes you already have `gh`, `node`, `pnpm` and `docker` installed):

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

5. Before pushing, check your work will pass checks:

```sh
pnpm pr-checks
```
