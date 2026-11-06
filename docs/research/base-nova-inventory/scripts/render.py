"""Render docs/research/base-nova-inventory.md table rows from inventory.json.

Usage: python3 -I render.py <ticket-08 dir>  -> prints markdown rows; writes ticket into inventory.json
"""
import json, sys, pathlib

root = pathlib.Path(sys.argv[1])
inv = json.loads((root / "inventory.json").read_text())
TICKETS = {
    "01": "textarea input-group alert badge card kbd skeleton empty",
    "02": "avatar aspect-ratio progress table toggle collapsible",
    "03": "drawer direction bubble marker message",
    "04": "separator spinner checkbox radio-group switch",
    "05": "slider native-select breadcrumb button-group item field pagination toggle-group",
    "06": "tabs scroll-area accordion attachment trace code-block",
    "07": "dialog alert-dialog sheet",
    "08": "popover tooltip hover-card",
    "09": "dropdown-menu context-menu menubar",
    "10": "select combobox navigation-menu",
    "11": "toast sidebar",
    "12": "calendar", "13": "carousel", "14": "chart", "15": "command", "16": "input-otp",
    "17": "resizable", "18": "message-scroller questionnaire", "19": "sonner",
    # ticket 20 ships no registry:ui item: it is the optional use-highlighted-code hook
}
t_of = {n: t for t, ns in TICKETS.items() for n in ns.split()}
by = {i["name"]: i for i in inv}
for i in inv:
    i["ticket"] = t_of.get(i["name"], "phase 1" if i["batch"] == "shipped" else "-")
# every item placed once; deps never in a later ticket
assert sorted(t_of) == sorted(i["name"] for i in inv if i["batch"] in "ABC"), "placement"
for i in inv:
    for d in i.get("deps", []):
        if by[d]["batch"] != "shipped" and i["batch"] != "shipped":
            assert by[d]["ticket"] <= i["ticket"], (i["name"], d)
(root / "inventory.json").write_text(json.dumps(inv, indent=1))

order = {"shipped": 0, "A": 1, "B": 2, "C": 3, "excluded": 4}
BASE = {"react", "react-dom"}


def j(xs):
    return ", ".join(xs) if xs else "–"


URL = "https://ui.shadcn.com/r/styles/base-nova/{}.json"
print("| Batch | Ticket | Item | Source | use client | registryDependencies | Declared deps | Actual npm imports | Undeclared | Icons | shadcn CSS | tw-animate | Notes |")
print("| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |")
for i in sorted(inv, key=lambda i: (order[i["batch"]], i.get("ticket", ""), i["name"])):
    if i["batch"] == "excluded":
        print(f"| excluded | – | {i['name']} | [{i['name']}.json]({URL.format(i['name'])}) | – | – | – | – | – | – | – | {i['exclude_reason']} |")
        continue
    npm = sorted(set(i["all_npm"]) - BASE)
    css = i["shadcn_variants"] and ["data-" + v for v in i["shadcn_variants"]] or []
    css = css + i["shadcn_utilities"] + (["accordion keyframes"] if i["accordion_keyframes"] else [])
    notes = []
    if i.get("promoted"):
        notes.append(f"own needs: {i['own_batch']}; promoted by deps")
    imported = set(i["component_deps"]) | {x.split("/")[-1] for x in i["internal"]}
    over = [r for r in i["registryDependencies"] if r not in imported]
    if over:
        notes.append("registryDependencies over-declared, not imported: " + ", ".join(over))
    if i["declared_not_imported"]:
        notes.append("declared, not imported: " + ", ".join(i["declared_not_imported"]))
    if i["cn_classes"]:
        notes.append("inert hook class " + ", ".join(i["cn_classes"]))
    if i["helper_files"]:
        notes.append("also writes " + ", ".join(pathlib.Path(h).name for h in i["helper_files"]))
    pinned = [d for d in i["declared_dependencies"] if "@" in d.lstrip("@")]
    if pinned:
        notes.append("registry pins " + ", ".join(pinned))
    print("| {} | {} | {} | {} | {} | {} | {} | {} | {} | {} | {} | {} | {} |".format(
        i["batch"], i["ticket"], i["name"], f"[{i['name']}.json]({URL.format(i['name'])})", "yes" if i["use_client"] else "no",
        j(i["registryDependencies"]), j(i["declared_dependencies"]), j(npm), j(i["undeclared_npm"]),
        len(i["lucide_icons"]) or "–", j(css), len(i["tw_animate"]) or "–", "; ".join(notes) or "–"))
