# Context

Glossary for earth-ui. Terms only; no implementation detail.

## Package mode

A consumer installs `@asif-sirajudeen/earth-ui` from npm and imports components from it. The source stays in `node_modules`.

## Copy mode

A consumer copies component source into their project with `shadcn add @earth-ui/<name>`, then owns that source.

## Registry

The copy-mode artifact: the set of `@earth-ui/*` items that the shadcn CLI installs. Not shipped in the npm package.
_Avoid_: using "registry" for the data the CLI reads.

## Component Index

The package-mode lookup data shipped inside the npm package: one entry per importable component or hook, with its import path, exported parts, variants and the Base UI doc it wraps. Derived from the Registry and the built package. The `earth-ui` CLI reads it.
_Avoid_: "registry", "manifest".

## Base UI doc

The documentation page that `@base-ui/react` ships for one of its parts (for example `dialog`). A component's Base UI doc is the one for the Base UI part it wraps, which can have a different name (hover-card wraps preview-card).
