"""Write phase 1b tickets. Usage: python3 -I tickets.py <inventory.json> <out dir>

Asserts that every planned registry:ui item is in exactly one ticket and that no ticket
ships a component before a component it imports or declares.
"""
import json, sys, pathlib

inv = {i["name"]: i for i in json.loads(pathlib.Path(sys.argv[1]).read_text())}
out = pathlib.Path(sys.argv[2]); out.mkdir(parents=True, exist_ok=True)
SRC = "Source: Spec 1b, `docs/specs/phase-1b-component-coverage.md`."
NO_NEW = "No new dependencies."
RANGE = "with the range that the spec's ranges rule gives"
CHECKLIST = "- [ ] Spec 1b's per-ticket release checklist passes (Testing Decisions)."
NEEDS_HUMAN = {"19": "needs-human (open decision (a): ship or drop Sonner); the code change can be done by an agent",
               "20": "needs-human (open decision (c): ship or drop the highlighting hook); the code change can be done by an agent"}

T = [
 # num, slug, title, batch, components, what, deps-line, extra criteria
 ("01", "textarea-input-group-and-content-components-join", "Textarea, Input Group and six content components join the package", "A",
  "textarea input-group alert badge card kbd skeleton empty",
  "An app developer can build simple content and form layouts from the package: Textarea, Input Group, Alert, Badge, Card, Kbd, Skeleton and Empty. These need nothing new, so this ticket proves that the phase 1 pipeline scales to a batch of eight. Phase 1b starts only after phase 1's exit checks pass, so this ticket waits for phase 1's last ticket, in `.scratch/earth-ui-phase-1/issues/`.",
  NO_NEW,
  ["Input Group's addons render around Input and Textarea, and its button addon uses the shipped Button."]),
 ("02", "avatar-progress-table-toggle-and-collapsible-join", "Avatar, Aspect Ratio, Progress, Table, Toggle and Collapsible join the package", "A",
  "avatar aspect-ratio progress table toggle collapsible",
  "An app developer can show avatars, fixed-ratio media, progress, tables, toggle buttons and collapsible sections from the package.",
  NO_NEW,
  ["Toggle switches its pressed style when clicked, and Collapsible opens and closes its panel.",
   "Avatar shows its fallback when the image fails to load."]),
 ("03", "drawer-direction-and-chat-message-parts-join", "Drawer, right-to-left direction and chat message parts join the package", "A",
  "drawer direction bubble marker message",
  "An app developer can use the Base UI Drawer, set text direction for the whole package with the Direction provider, and lay out chat messages with Bubble, Marker and Message. This completes batch A.",
  NO_NEW,
  ["Drawer opens, can be swiped or dismissed, and closes, using only Tailwind's built-in data-attribute variants.",
   "The Direction subpath re-exports exactly Base UI's direction provider and hook, and nothing else. The ticket notes that this subpath now follows Base UI's API.",
   "Wrapping the page in the Direction provider set to right-to-left flips Drawer's side."]),
 ("04", "icons-animations-and-shadcn-variants-arrive", "Icons, animations and shadcn variants arrive", "B",
  "separator spinner checkbox radio-group switch",
  "The package gains what batch B needs: `lucide-react` icons, `tw-animate-css` animations and shadcn's custom Tailwind variants and utilities, without depending on the shadcn CLI. Separator, Spinner, Checkbox, Radio Group and Switch ship as the first components that use them. This ticket is small on purpose, because it also changes the stylesheet.",
  "`lucide-react` and `tw-animate-css` are added as regular dependencies, " + RANGE + ". Nothing else is added, and `shadcn` is not a dependency.",
  ["The stylesheet imports `tw-animate-css` first, then holds the full shadcn Tailwind stylesheet from the pinned CLI version, copied verbatim under a comment that names that version (the same output as `shadcn eject`), then the existing theme. `shadcn init` and `shadcn eject` are not run in the package.",
   "The licence file keeps shadcn's MIT notice. No new notice is needed for a dependency.",
   "In the scratch app installed with pnpm, the nested `tw-animate-css` import resolves from the package's own folder with the Next.js PostCSS plugin. If it does not, `tw-animate-css` is vendored like the shadcn block, its MIT notice is added, and the spec is updated.",
   "The compiled CSS shows the shadcn variants in their real forms: horizontal and vertical match the `data-orientation` attribute, and checked and unchecked match Base UI's attributes.",
   "Separator renders in both orientations. Checkbox shows its check icon. Radio Group and Switch change state visibly. Spinner spins.",
   "Phase 1 components look the same as before the stylesheet change, in both themes."]),
 ("05", "field-slider-pagination-and-grouped-controls-join", "Field, Slider, Pagination and five more grouped controls join the package", "B",
  "slider native-select breadcrumb button-group item field pagination toggle-group",
  "An app developer can build grouped controls and complete form fields: Slider, Native Select, Breadcrumb, Button Group, Item, Field, Pagination and Toggle Group.",
  NO_NEW,
  ["Slider and Toggle Group work in both orientations, and Button Group and Field render their horizontal and vertical layouts.",
   "Field composes Label and Separator from the package, and a checked control inside it gets the checked style.",
   "Pagination's links use the button styles. The open `buttonVariants` border decision is noted, not fixed."]),
 ("06", "tabs-accordion-scroll-area-and-ai-chat-parts-join", "Tabs, Accordion, Scroll Area, Attachment, Trace and Code Block join the package", "B",
  "tabs scroll-area accordion attachment trace code-block",
  "An app developer can use Tabs, Scroll Area and Accordion, plus the AI chat parts Attachment, Trace and Code Block, the first components that use shadcn's shimmer and scroll-fade utilities. Code Block ships as a component only; the code-highlighting hook is open decision (c) and ticket 20.",
  NO_NEW,
  ["Accordion panels animate their height open and closed, using shadcn's accordion keyframes and not the tw-animate-css ones.",
   "Tabs show the active tab style in both orientations. Scroll Area shows horizontal and vertical scrollbars.",
   "Attachment's scroll fade and shimmer render. Trace's shimmer stops when reduced motion is on, and Trace expands through the package's Collapsible.",
   "`shadcn add code-block` also writes the `use-highlighted-code` hook and its highlighter lib and adds `shiki`, although Code Block never imports them. They are removed and not shipped, and `add --diff` is judged on Code Block's own file.",
   "Code Block's copy button and its horizontal and vertical scroll fades work, with no shiki installed."]),
 ("07", "modal-overlays-open-animated", "Dialog, Alert Dialog and Sheet open as animated modals", "B",
  "dialog alert-dialog sheet",
  "An app developer can open modal overlays from the package: Dialog, Alert Dialog and Sheet.",
  NO_NEW,
  ["Each overlay animates in and out, traps focus while open, closes with Escape, and returns focus to its trigger.",
   "Sheet opens from each side.",
   "The close icons render, and the overlay backdrop is visible in both themes."]),
 ("08", "floating-overlays-float-beside-triggers", "Popover, Tooltip and Hover Card float beside their triggers", "B",
  "popover tooltip hover-card",
  "An app developer can show floating content from the package: Popover, Tooltip and Hover Card.",
  NO_NEW,
  ["The scratch app wraps its layout in the Tooltip provider, as upstream requires, and the ticket records this for the future README.",
   "Each overlay animates in and out from the side it is placed on, and stays readable in dark mode."]),
 ("09", "menus-join", "Dropdown Menu, Context Menu and Menubar join the package", "B",
  "dropdown-menu context-menu menubar",
  "An app developer can build menus from the package: Dropdown Menu, Context Menu and Menubar.",
  NO_NEW,
  ["Menus open with click, right-click or keyboard as appropriate. Arrow keys move through items, disabled items are skipped and dimmed, and submenus open.",
   "Checkbox and radio items show their indicator icons."]),
 ("10", "select-combobox-and-navigation-menu-join", "Select, Combobox and Navigation Menu join the package", "B",
  "select combobox navigation-menu",
  "An app developer can use Select, Combobox and Navigation Menu from the package.",
  NO_NEW,
  ["Select and Combobox open, filter where relevant, select with the keyboard, and show the selected item. Combobox's input uses the package's Input Group.",
   "Navigation Menu opens its content panels with an animation and marks the active link."]),
 ("11", "toast-and-sidebar-join", "Toast notifications and the Sidebar layout join the package", "B",
  "toast sidebar",
  "An app developer can show notifications with the Base UI Toast and lay out an app with Sidebar. This completes batch B.",
  NO_NEW,
  ["The root entry's `Toaster` comes from Toast.",
   "Sidebar's mobile-breakpoint hook is shipped but internal. It is not re-exported from the root, and no subpath reaches it.",
   "Sidebar collapses and expands, shows tooltips when collapsed, and becomes a Sheet below the mobile breakpoint.",
   "A toast can be triggered, stacks, and can be dismissed."]),
 ("12", "calendar-picks-dates", "Calendar picks dates with react-day-picker", "C",
  "calendar",
  "An app developer can pick dates with Calendar, built on react-day-picker.",
  "`react-day-picker` is added as a regular dependency, " + RANGE + ", replacing the registry's `@latest`. `date-fns` is not added, because nothing imports it; if the CLI adds it, it is removed.",
  ["Calendar moves between months, selects single dates and ranges, and shows today's date and the selected dates in both themes."]),
 ("13", "carousel-slides-with-embla", "Carousel slides content with embla", "C",
  "carousel",
  "An app developer can show a carousel built on embla.",
  "`embla-carousel-react` is added as a regular dependency, " + RANGE + ".",
  ["The previous and next buttons move the carousel and disable at the ends. Arrow keys work. Horizontal and vertical orientations both work."]),
 ("14", "chart-draws-themed-charts", "Chart draws recharts charts in theme colours", "C",
  "chart",
  "An app developer can build charts with the shadcn Chart wrapper on recharts, using the theme's chart colours.",
  "`recharts` is added as a regular dependency, " + RANGE + " (it names recharts as its one exception). Its required `react-is` peer is installed automatically, and the install shows no peer warnings.",
  ["A bar chart and a line chart render with the five chart colour tokens, and the tooltip and legend render in both themes."]),
 ("15", "command-menu-filters-with-cmdk", "Command menu filters items with cmdk", "C",
  "command",
  "An app developer can build a command menu with Command on cmdk, including the dialog form.",
  "`cmdk` is added as a regular dependency, " + RANGE + ". The ticket notes that cmdk brings Radix dialog primitives in as transitive dependencies.",
  ["Typing filters the items. Arrow keys move the selected item and show the selected style. The dialog form opens through the package's Dialog."]),
 ("16", "input-otp-collects-codes", "Input OTP collects one-time codes", "C",
  "input-otp",
  "An app developer can collect one-time codes with Input OTP.",
  "`input-otp` is added as a regular dependency, " + RANGE + ".",
  ["Typing fills the slots and moves the caret. The fake caret blinks through tw-animate-css. Pasting a code fills every slot. The `cn-input-otp` class is kept as an unstyled upstream hook."]),
 ("17", "resizable-panels-resize", "Resizable panels resize by drag and keyboard", "C",
  "resizable",
  "An app developer can build resizable panel layouts with Resizable.",
  "`react-resizable-panels` is added as a regular dependency, " + RANGE + ".",
  ["Dragging the handle resizes the panels horizontally and vertically, and the handle is keyboard-operable."]),
 ("18", "message-scroller-and-questionnaire-join", "Message Scroller and Questionnaire join the package", "C",
  "message-scroller questionnaire",
  "An app developer can build chat views with Message Scroller and Questionnaire, which build on shadcn's own React package.",
  "`@shadcn/react` is added as a regular dependency, " + RANGE + ".",
  ["Message Scroller sticks to the bottom as messages arrive and shows its bottom scroll fade. Questionnaire options show checked and disabled states."]),
 ("19", "sonner-toaster-on-own-subpath", "Sonner Toaster is available from its own subpath", "C",
  "sonner",
  "An app developer who already uses sonner and next-themes can use the shadcn Sonner Toaster from its own subpath. The shadcn CLI hides Sonner in Base UI projects and points to Toast, so this ticket starts with the maintainer's ship-or-drop decision.",
  "`sonner` and `next-themes` are added as optional peer dependencies, each " + RANGE + ". They are peers because the app calls sonner's `toast()` and mounts the theme provider itself, so both sides must share one copy of each. Both are also dev dependencies for local builds.",
  ["The maintainer decides whether to ship Sonner (spec, open decision (a)). If they drop it, this ticket closes, the spec is updated, and nothing below applies.",
   "Sonner is subpath-only. The root entry keeps Toast's `Toaster`, because the names collide.",
   "Sonner gets its own build entry, as the spec requires for subpath-only modules. The built Sonner file appears in the dry-run pack and keeps the sonner and next-themes imports external.",
   "A scratch app without sonner or next-themes still builds from the root entry.",
   "In a scratch app with next-themes, a toast fired with the app's own `sonner` import appears in the package's Toaster, and follows the theme in light and dark. The `cn-toast` class is kept as an unstyled upstream hook."]),
]

# ticket 20 ships a registry:hook item, not a registry:ui item, so it is written by hand below.
HOOK = ("20", "highlighting-hook-on-own-subpath", "Code highlighting hook is available from its own subpath")
HOOK_LINES = [
    "**What to build:** An app developer who wants syntax highlighting in Code Block can install shiki and use the shadcn code-highlighting hook from its own subpath. Apps that do not want highlighting never install or resolve shiki. Code Block itself shipped in ticket 06 and never imports the hook. This ticket starts with the maintainer's ship-or-drop decision. " + SRC,
    None,  # blocked by
    "- [ ] The maintainer decides whether to ship the hook (spec, open decision (c)). If they drop it, this ticket closes, the spec is updated, and nothing below applies.",
    "- [ ] The shadcn CLI `add` command pulls use-highlighted-code from shadcn's `base-nova` style, which also writes its highlighter lib; nothing is copied by hand. Afterwards, `add --diff` shows no drift.",
    "- [ ] Dependencies: `shiki` is added as an optional peer dependency, " + RANGE + ". It is also a dev dependency for local builds, and is kept out of regular dependencies.",
    "- [ ] Neither the hook nor the highlighter lib has `\"use client\"`, as in upstream's source. The hook is called only from client components. The root entry does not have the directive.",
    "- [ ] New public subpath: `/use-highlighted-code`, an explicit export listed before the component wildcard. The root entry does not re-export it, and the highlighter lib is reachable only through it.",
    "- [ ] The hook gets its own build entry, as the spec requires for subpath-only modules. The built hook file appears in the dry-run pack.",
    "- [ ] The built hook and highlighter keep their shiki imports external. tsdown does not bundle shiki into them.",
    "- [ ] A scratch app without shiki still builds from the root entry. A scratch app with shiki renders highlighted code through the hook, in both themes.",
]

# placement: every planned registry:ui item in exactly one ticket; dependencies never ship later
t_of = {n: num for num, _, _, _, comps, *_ in T for n in comps.split()}
planned = sorted(n for n, i in inv.items() if i["batch"] in ("A", "B", "C"))
assert sorted(t_of) == planned, set(planned) ^ set(t_of)
assert sum(len(x[4].split()) for x in T) == len(t_of), "an item is in two tickets"
for n, num in t_of.items():
    assert inv[n]["batch"] == T[int(num) - 1][3], (n, num)
    for d in inv[n]["deps"]:
        if inv[d]["batch"] != "shipped":
            assert t_of[d] <= num, (n, d)

titles = {t[0]: t[2] for t in T}
titles[HOOK[0]] = HOOK[2]
for f in out.glob("[0-9][0-9]-*.md"):
    f.unlink()
for i, (num, slug, title, batch, comps, what, deps, extra) in enumerate(T):
    names = comps.split()
    if num == "01":
        blocked = "phase 1 — 07 — CI publishes 0.1.1 through trusted publishing"
    else:
        prev = T[i - 1][0]
        blocked = f"{prev} — {titles[prev]}"
    uc = [n for n in names if inv[n]["use_client"]]
    nuc = [n for n in names if not inv[n]["use_client"]]
    disp = ", ".join(names)
    subpaths = ", ".join(f"`/{n}`" for n in names)
    lines = [
        f"# {num} — {title}", "",
        f"**What to build:** {what} {SRC}", "",
        f"**Blocked by:** {blocked}", "",
        "**Status:** " + NEEDS_HUMAN.get(num, "ready-for-agent"), "",
    ]
    if num in NEEDS_HUMAN:
        lines.append("- [ ] " + extra.pop(0))
    lines += [
        f"- [ ] The shadcn CLI `add` command pulls {disp} from shadcn's `base-nova` style; nothing is copied by hand. Afterwards, `add --diff` shows no drift{' for each' if len(names) > 1 else ''}.",
        "- [ ] " + (deps if deps == NO_NEW else f"Dependencies: {deps}"),
    ]
    if uc and nuc:
        lines.append(f"- [ ] Built files start with `\"use client\"` only where upstream's source does: {', '.join(uc)} {'has' if len(uc) == 1 else 'have'} it; {', '.join(nuc)} {'does' if len(nuc) == 1 else 'do'} not. The root entry does not.")
    elif uc:
        lines.append(f"- [ ] Every built file for {', '.join(uc)} starts with `\"use client\"`, as upstream's source does. The root entry does not.")
    else:
        lines.append(f"- [ ] No built file for {', '.join(nuc)} has `\"use client\"`, as in upstream's source. The root entry does not.")
    root = ("The root entry does not re-export it" if num == "19"
            else "The root entry re-exports the new components and their prop types")
    word = "subpath" if len(names) == 1 else "subpaths"
    lines.append(f"- [ ] New public {word}: {subpaths}. {root}.")
    lines += [f"- [ ] {e}" for e in extra]
    lines.append(CHECKLIST)
    (out / f"{num}-{slug}.md").write_text("\n".join(lines) + "\n")
    print(f"{num} — {title} | blocked by: {blocked}")

num, slug, title = HOOK
blocked = f"{T[-1][0]} — {titles[T[-1][0]]}"
lines = [f"# {num} — {title}", "", HOOK_LINES[0], "", f"**Blocked by:** {blocked}", "",
         "**Status:** " + NEEDS_HUMAN[num], ""] + HOOK_LINES[2:] + [CHECKLIST]
(out / f"{num}-{slug}.md").write_text("\n".join(lines) + "\n")
print(f"{num} — {title} | blocked by: {blocked}")
