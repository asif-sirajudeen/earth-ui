import type { ComponentProps } from "react";
import { Button, buttonVariants } from "./components/button";
import { Input } from "./components/input";
import { Label } from "./components/label";

export { Button, buttonVariants, Input, Label };
export type ButtonProps = ComponentProps<typeof Button>;
export type InputProps = ComponentProps<typeof Input>;
export type LabelProps = ComponentProps<typeof Label>;

import { Textarea } from "./components/textarea";
export { Textarea };
export type TextareaProps = ComponentProps<typeof Textarea>;

import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupText, InputGroupInput, InputGroupTextarea } from "./components/input-group";
export { InputGroup, InputGroupAddon, InputGroupButton, InputGroupText, InputGroupInput, InputGroupTextarea };
export type InputGroupProps = ComponentProps<typeof InputGroup>;
export type InputGroupAddonProps = ComponentProps<typeof InputGroupAddon>;
export type InputGroupButtonProps = ComponentProps<typeof InputGroupButton>;
export type InputGroupTextProps = ComponentProps<typeof InputGroupText>;
export type InputGroupInputProps = ComponentProps<typeof InputGroupInput>;
export type InputGroupTextareaProps = ComponentProps<typeof InputGroupTextarea>;

import { Alert, AlertTitle, AlertDescription, AlertAction } from "./components/alert";
export { Alert, AlertTitle, AlertDescription, AlertAction };
export type AlertProps = ComponentProps<typeof Alert>;
export type AlertTitleProps = ComponentProps<typeof AlertTitle>;
export type AlertDescriptionProps = ComponentProps<typeof AlertDescription>;
export type AlertActionProps = ComponentProps<typeof AlertAction>;

import { Badge, badgeVariants } from "./components/badge";
export { Badge, badgeVariants };
export type BadgeProps = ComponentProps<typeof Badge>;

import { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent } from "./components/card";
export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent };
export type CardProps = ComponentProps<typeof Card>;
export type CardHeaderProps = ComponentProps<typeof CardHeader>;
export type CardFooterProps = ComponentProps<typeof CardFooter>;
export type CardTitleProps = ComponentProps<typeof CardTitle>;
export type CardActionProps = ComponentProps<typeof CardAction>;
export type CardDescriptionProps = ComponentProps<typeof CardDescription>;
export type CardContentProps = ComponentProps<typeof CardContent>;

import { Kbd, KbdGroup } from "./components/kbd";
export { Kbd, KbdGroup };
export type KbdProps = ComponentProps<typeof Kbd>;
export type KbdGroupProps = ComponentProps<typeof KbdGroup>;

import { Skeleton } from "./components/skeleton";
export { Skeleton };
export type SkeletonProps = ComponentProps<typeof Skeleton>;

import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent, EmptyMedia } from "./components/empty";
export { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent, EmptyMedia };
export type EmptyProps = ComponentProps<typeof Empty>;
export type EmptyHeaderProps = ComponentProps<typeof EmptyHeader>;
export type EmptyTitleProps = ComponentProps<typeof EmptyTitle>;
export type EmptyDescriptionProps = ComponentProps<typeof EmptyDescription>;
export type EmptyContentProps = ComponentProps<typeof EmptyContent>;
export type EmptyMediaProps = ComponentProps<typeof EmptyMedia>;
