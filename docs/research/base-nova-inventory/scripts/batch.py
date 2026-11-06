"""Assign batches. own = item's own needs; effective = max(own, deps' effective).

Usage: python3 -I batch.py <ticket-08 dir>  (rewrites inventory.json with batch fields)
"""
import json, sys, pathlib

root = pathlib.Path(sys.argv[1])
inv = json.loads((root / "inventory.json").read_text())
by = {i["name"]: i for i in inv}
SHIPPED = {"button", "input", "label"}
EXCLUDED = {"form": "Registry item has no files (empty `form.json`); nothing to ship."}
RANK = {"A": 0, "B": 1, "C": 2}



# Batch from what the item's own files import and use. A registry dependency that the
# source never imports (code-block -> use-highlighted-code -> shiki) does not count.
def own(i):
    if set(i["new_npm"]) - {"lucide-react"}:
        return "C"
    if i["new_npm"] or i["shadcn_variants"] or i["shadcn_utilities"] or i["accordion_keyframes"] or i["tw_animate"]:
        return "B"
    return "A"


def deps(i):
    return sorted(set(i.get("component_deps", [])) | {d for d in i["registryDependencies"] if d in by})


memo = {}


def eff(n):
    if n not in memo:
        i = by[n]
        b = own(i)
        for d in deps(i):
            if RANK[eff(d)] > RANK[b]:
                b = eff(d)
        memo[n] = b
    return memo[n]


for i in inv:
    if i["name"] in EXCLUDED:
        i["batch"] = "excluded"; i["exclude_reason"] = EXCLUDED[i["name"]]; continue
    i["own_batch"] = own(i)
    i["deps"] = deps(i)
    i["batch"] = "shipped" if i["name"] in SHIPPED else eff(i["name"])
    i["promoted"] = i["batch"] not in ("shipped", i["own_batch"])

# sanity: every shipped/A item's deps are A or shipped
for i in inv:
    for d in i.get("deps", []):
        assert RANK.get(by[d].get("batch"), -1) <= RANK.get(i["batch"], 9) or by[d]["batch"] == "shipped", (i["name"], d)

(root / "inventory.json").write_text(json.dumps(inv, indent=1))
for b in ("shipped", "A", "B", "C", "excluded"):
    names = [i["name"] + ("*" if i.get("promoted") else "") for i in inv if i["batch"] == b]
    print(b, len(names), " ".join(names))
