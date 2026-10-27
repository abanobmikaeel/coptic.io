---
"@coptic/client": minor
---

Replace the hand-written `CopticClient` with `createCopticClient`, an openapi-fetch client whose paths, parameters and responses are typed from the API's OpenAPI spec. `ApiResponse<'/api/...'>` names a route's response type. The `clientName` option is unchanged.
