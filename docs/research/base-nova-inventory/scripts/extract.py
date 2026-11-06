"""Extract per-item facts from base-nova registry JSON + shadcn CLI output.

Usage: python3 -I extract.py <ticket-08 dir>
Reads raw/base-nova-registry.json, items/*.json, addall/src/**, addall/node_modules.
Writes inventory.json.
"""
import json, re, sys, pathlib

root = pathlib.Path(sys.argv[1])
reg = json.loads((root / "raw/base-nova-registry.json").read_text())
src = root / "addall/src"
nm = root / "addall/node_modules"

BASELINE = {"react", "react-dom", "@base-ui/react", "class-variance-authority", "cn"}
SHADCN_VARIANTS = ["open", "closed", "checked", "unchecked", "selected", "disabled",
                   "active", "horizontal", "vertical"]
VAR_RE = re.compile(r"(?<![\w\[])data-(%s)(?:/[\w-]+)?:" % "|".join(SHADCN_VARIANTS))
# Utilities defined only in shadcn/tailwind.css (accordion keyframes overlap tw-animate-css).
SHADCN_UTIL_RE = re.compile(r"(?<![\w-])(no-scrollbar|scroll-fade(?:-[\w\[\]%.-]+)?|shimmer(?:-[\w-]+)?)(?![\w-])")
ACCORDION_RE = re.compile(r"animate-accordion-(?:down|up)")
TWA_RE = re.compile(r"(?<![\w-])(animate-in|animate-out|fade-(?:in|out)(?:-\d+)?|zoom-(?:in|out)(?:-\d+)?"
                    r"|slide-(?:in-from|out-to)-[a-z]+(?:-[\w\[\]().]+)?|-?spin-(?:in|out)(?:-\d+)?"
                    r"|blur-(?:in|out)(?:-\d+)?|animate-caret-blink|animate-collapsible-(?:down|up)"
                    r"|animation-duration-\d+|fill-mode-\w+|repeat-(?:\d+|infinite))(?![\w-])")
IMPORT_RE = re.compile(r"""(?:import|export)\s[^"';]*?from\s+["']([^"']+)["']|import\s+["']([^"']+)["']""")
CN_CLASS_RE = re.compile(r"(?<![\w-])(cn-[a-z][\w-]*)")


def pkg_name(spec):
    if spec.startswith("@/") or spec.startswith("."):
        return None
    parts = spec.split("/")
    return "/".join(parts[:2]) if spec.startswith("@") else parts[0]


def analyse(text):
    imports = sorted({m.group(1) or m.group(2) for m in IMPORT_RE.finditer(text)})
    npm = sorted({p for p in (pkg_name(i) for i in imports) if p})
    internal = sorted(i for i in imports if i.startswith("@/"))
    lucide_icons = sorted(set(re.findall(r"\b(\w+Icon)\b", " ".join(
        re.findall(r'import\s*\{([^}]*)\}\s*from\s*"lucide-react"', text)))))
    first = text.lstrip().split("\n", 1)[0].strip().rstrip(";")
    return {
        "imports": imports,
        "npm": npm,
        "internal": internal,
        "lucide_icons": lucide_icons,
        "use_client": first in ('"use client"', "'use client'"),
        "shadcn_variants": sorted({m.group(1) for m in VAR_RE.finditer(text)}),
        "shadcn_utilities": sorted({m.group(1).split("-[")[0] for m in SHADCN_UTIL_RE.finditer(text)}),
        "accordion_keyframes": bool(ACCORDION_RE.search(text)),
        "tw_animate": sorted({m.group(1) for m in TWA_RE.finditer(text)}),
        "cn_classes": sorted(set(CN_CLASS_RE.findall(text)) - {"cn"}),
    }


def declared_pkg(d):
    # "react-day-picker@latest" -> "react-day-picker"; "@scope/x@1" -> "@scope/x"
    return "@" + d[1:].split("@")[0] if d.startswith("@") else d.split("@")[0]


def local_file(internal):
    # "@/components/button" -> src/components/button.tsx ; hooks/lib likewise
    rel = internal[2:]
    for ext in (".tsx", ".ts"):
        p = src / (rel + ext)
        if p.exists():
            return p
    return None


def peer_info(pkg):
    pj = nm / pkg / "package.json"
    if not pj.exists():
        return None
    d = json.loads(pj.read_text())
    return {"version": d.get("version"), "license": d.get("license"),
            "peerDependencies": d.get("peerDependencies", {}),
            "peerDependenciesMeta": d.get("peerDependenciesMeta", {}),
            "dependencies": sorted(d.get("dependencies", {}))}


items = []
for it in reg["items"]:
    if it["type"] != "registry:ui":
        continue
    full = json.loads((root / "items" / f"{it['name']}.json").read_text())
    rec = {
        "name": it["name"],
        "registry_files": [f["path"] for f in full.get("files", [])],
        "declared_dependencies": full.get("dependencies", []),
        "declared_devDependencies": full.get("devDependencies", []),
        "registryDependencies": full.get("registryDependencies", []),
        "css": full.get("css"), "cssVars": full.get("cssVars"),
        "docs": full.get("docs"),
    }
    written = src / "components" / f"{it['name']}.tsx"
    if not written.exists():
        rec["written_files"] = []
        items.append(rec)
        continue
    files = [written]
    # follow hook/lib internal imports transitively (they ship with the item's deps)
    seen = set()
    queue = [written]
    while queue:
        f = queue.pop()
        for i in analyse(f.read_text())["internal"]:
            if i.startswith("@/components/"):
                continue
            lf = local_file(i)
            if lf and lf not in seen:
                seen.add(lf); files.append(lf); queue.append(lf)
    rec["written_files"] = [str(f.relative_to(src.parent)) for f in files]
    main = analyse(written.read_text())
    rec.update(main)
    rec["helper_files"] = {str(f.relative_to(src.parent)): analyse(f.read_text()) for f in files[1:]}
    allnpm = set(main["npm"]) | {p for h in rec["helper_files"].values() for p in h["npm"]}
    rec["all_npm"] = sorted(allnpm)
    rec["new_npm"] = sorted(allnpm - BASELINE)
    declared = {declared_pkg(d) for d in rec["declared_dependencies"]}
    rec["undeclared_npm"] = sorted(allnpm - {"react", "react-dom"} - declared)
    rec["declared_not_imported"] = sorted(declared - allnpm)
    rec["component_deps"] = sorted(i.split("/")[-1] for i in main["internal"] if i.startswith("@/components/"))
    rec["third_party"] = {p: peer_info(p) for p in rec["new_npm"]}
    items.append(rec)

(root / "inventory.json").write_text(json.dumps(items, indent=1))
print(len(items), "items")
