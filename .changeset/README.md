# Changesets

This folder is used by [Changesets](https://github.com/changesets/changesets) to manage versioning and changelogs for the publishable packages.

## Usage

To add a changeset (when you make changes to packages):

```bash
pnpm changeset
```

To version packages based on changesets:

```bash
pnpm version
```

To publish packages to npm:

```bash
pnpm release
```

## Publishable Packages

- `@coptic/core` - Types and liturgical logic
- `@coptic/client` - API client wrapper
- `@coptic/data` - Offline data bundle
