import type { ComponentProps } from "react";
import { Button } from "./components/button";
import { Input } from "./components/input";
import { Label } from "./components/label";

export { Button, buttonVariants } from "./components/button";
export type ButtonProps = ComponentProps<typeof Button>;
export { Input } from "./components/input";
export type InputProps = ComponentProps<typeof Input>;
export { Label } from "./components/label";
export type LabelProps = ComponentProps<typeof Label>;
