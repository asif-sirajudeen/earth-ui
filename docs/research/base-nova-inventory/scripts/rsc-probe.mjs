// Calls Base UI useRender the way Badge does, under whatever conditions node was started with.
import { useRender } from "@base-ui/react/use-render";
try {
  const el = useRender({ defaultTagName: "span", props: { className: "x" }, state: { slot: "badge" } });
  console.log("ok", el?.type);
} catch (e) { console.log("throws:", e.message); }
