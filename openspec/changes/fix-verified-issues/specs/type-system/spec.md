## MODIFIED Requirements

### Requirement: VueJsonSchema type SHALL be uniquely defined
The `VueJsonSchema` type SHALL be defined only once in `types/schema.ts`. The conflicting definition in `types/app.ts` SHALL be removed or renamed to avoid shadowing.

#### Scenario: Single VueJsonSchema export
- **WHEN** importing `VueJsonSchema` from the types barrel export
- **THEN** only one unambiguous type definition is exported

#### Scenario: Backward compatibility for VueJsonSchemaType
- **WHEN** code imports `VueJsonSchemaType` from types
- **THEN** the import resolves to the same type as `VueJsonSchema` from schema.ts
