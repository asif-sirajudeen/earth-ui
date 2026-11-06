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

import { Avatar, AvatarImage, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarBadge } from "./components/avatar";
export { Avatar, AvatarImage, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarBadge };
export type AvatarProps = ComponentProps<typeof Avatar>;
export type AvatarImageProps = ComponentProps<typeof AvatarImage>;
export type AvatarFallbackProps = ComponentProps<typeof AvatarFallback>;
export type AvatarGroupProps = ComponentProps<typeof AvatarGroup>;
export type AvatarGroupCountProps = ComponentProps<typeof AvatarGroupCount>;
export type AvatarBadgeProps = ComponentProps<typeof AvatarBadge>;

import { AspectRatio } from "./components/aspect-ratio";
export { AspectRatio };
export type AspectRatioProps = ComponentProps<typeof AspectRatio>;

import { Progress, ProgressTrack, ProgressIndicator, ProgressLabel, ProgressValue } from "./components/progress";
export { Progress, ProgressTrack, ProgressIndicator, ProgressLabel, ProgressValue };
export type ProgressProps = ComponentProps<typeof Progress>;
export type ProgressTrackProps = ComponentProps<typeof ProgressTrack>;
export type ProgressIndicatorProps = ComponentProps<typeof ProgressIndicator>;
export type ProgressLabelProps = ComponentProps<typeof ProgressLabel>;
export type ProgressValueProps = ComponentProps<typeof ProgressValue>;

import { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption } from "./components/table";
export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
export type TableProps = ComponentProps<typeof Table>;
export type TableHeaderProps = ComponentProps<typeof TableHeader>;
export type TableBodyProps = ComponentProps<typeof TableBody>;
export type TableFooterProps = ComponentProps<typeof TableFooter>;
export type TableHeadProps = ComponentProps<typeof TableHead>;
export type TableRowProps = ComponentProps<typeof TableRow>;
export type TableCellProps = ComponentProps<typeof TableCell>;
export type TableCaptionProps = ComponentProps<typeof TableCaption>;

import { Toggle, toggleVariants } from "./components/toggle";
export { Toggle, toggleVariants };
export type ToggleProps = ComponentProps<typeof Toggle>;

import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "./components/collapsible";
export { Collapsible, CollapsibleTrigger, CollapsibleContent };
export type CollapsibleProps = ComponentProps<typeof Collapsible>;
export type CollapsibleTriggerProps = ComponentProps<typeof CollapsibleTrigger>;
export type CollapsibleContentProps = ComponentProps<typeof CollapsibleContent>;
