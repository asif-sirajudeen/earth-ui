import type { ComponentProps } from "react";
import { Button, buttonVariants } from "./components/button";
import { Input } from "./components/input";
import { Label } from "./components/label";

export { Button, buttonVariants, Input, Label };
export type ButtonProps = ComponentProps<typeof Button>;
export type InputProps = ComponentProps<typeof Input>;
export type LabelProps = ComponentProps<typeof Label>;
