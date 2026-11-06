"""Count exported names across the CLI-written component files and report collisions.

Usage: python3 -I exports.py <work dir>   (reads addall/src/components/*.tsx)
"""
import re, sys, pathlib, collections

comp = pathlib.Path(sys.argv[1]) / "addall/src/components"
seen = collections.defaultdict(list)
for f in sorted(comp.glob("*.tsx")):
    t = f.read_text()
    names = set(re.findall(r"^export\s+(?:async\s+)?(?:function|const|let|class|type|interface)\s+(\w+)", t, re.M))
    for block in re.findall(r"^export\s+(?:type\s+)?\{([^}]*)\}", t, re.M):
        names |= {p.split(" as ")[-1].strip().removeprefix("type ").strip() for p in block.split(",") if p.strip()}
    for n in names:
        seen[n].append(f.stem)
files = len(list(comp.glob("*.tsx")))
dups = {n: fs for n, fs in seen.items() if len(fs) > 1}
print(files, "files,", len(seen), "distinct names,", sum(len(v) for v in seen.values()), "exports; collisions:", dups)
