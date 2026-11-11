import assert from "node:assert/strict"
import { test } from "node:test"

import {
  buildExamples,
  componentFor,
  externalImports,
  readExampleFiles,
  registryNames,
} from "../../build/examples.mts"

test("imports exclude react, package, relative", () => {
  const code = `import * as React from "react"
import { X } from "lucide-react"
import { Button } from "@asif-sirajudeen/earth-ui/button"
import { y } from './y'
import { toast } from 'sonner'`
  assert.deepEqual(externalImports(code), ["lucide-react", "sonner"])
})

test("longest component prefix wins", () => {
  const names = ["alert", "alert-dialog", "input", "input-group"]
  assert.equal(componentFor("alert-dialog-demo", names), "alert-dialog")
  assert.equal(componentFor("input-group-demo", names), "input-group")
  assert.equal(componentFor("alert-demo", names), "alert")
  assert.equal(componentFor("typography-large", names), null)
})

test("every component with a site example gets >=1 Example", () => {
  const names = registryNames()
  const files = readExampleFiles()
  const data = buildExamples(files, names)
  for (const f of files) {
    const owner = componentFor(f.name, names)
    if (owner) assert.ok(data[owner]?.length, `${owner} has no examples`)
  }
  assert.ok(data.dialog?.some((e) => e.name === "dialog-demo"))
})
