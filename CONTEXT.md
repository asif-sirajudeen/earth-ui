# Context

Glossary for earth-ui. Terms only; no implementation detail.

## Package mode

A consumer installs `@asif-sirajudeen/earth-ui` from npm and imports components from it. The source stays in `node_modules`.

## Copy mode

A consumer copies component source into their project with `shadcn add @earth-ui/<name>`, then owns that source.

## Registry

The set of `@earth-ui/*` items, each with its source. The shadcn CLI installs them in copy mode. A built copy also ships inside the npm package, where the `earth-ui` CLI reads it.

## Component Index

The package-mode view of the Registry: one entry per importable component or hook, with its import path, exported parts, variants, the Base UI doc it wraps and its source. The `earth-ui` CLI derives it from the Registry and the built package each time it runs.
_Avoid_: "manifest".

## Base UI doc

The documentation page that `@base-ui/react` ships for one of its parts (for example `dialog`). A component's Base UI doc is the one for the Base UI part it wraps, which can have a different name (hover-card wraps preview-card).

## Example

A small usage file that the docs site renders as a live preview, with its code, on a component's page. Examples are copied from shadcn's examples and import from the package, so the shown code is what a consumer writes. The example named `<component>-demo` comes first on the page.
_Avoid_: "demo" for the whole set (the `-demo` example is just the first one).
