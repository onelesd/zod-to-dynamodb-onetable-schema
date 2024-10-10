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
  address: z.array(z.string()),
});
```

You can add it to your
