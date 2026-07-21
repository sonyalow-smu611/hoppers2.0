"use client";

import { SearchIcon, XIcon } from "lucide-react";
import {
  Button as AriaButton,
  Group as AriaGroup,
  Input as AriaInput,
  SearchField as AriaSearchField,
  composeRenderProps,
  Text,
} from "react-aria-components";

import { cn } from "@/lib/utils";
import {
  FieldError,
  FieldGroup,
  FieldLabel as Label,
} from "@/components/ui/field";

function SearchField({ className, ...props }) {
  return (
    <AriaSearchField
      className={composeRenderProps(className, (className) =>
        cn("group", className),
      )}
      {...props}
    />
  );
}

function SearchFieldInput({ className, ...props }) {
  return (
    <AriaInput
      className={composeRenderProps(className, (className) =>
        cn(
          "min-w-0 flex-1 bg-background px-2 py-1.5 outline outline-0 placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden",
          className,
        ),
      )}
      {...props}
    />
  );
}

function SearchFieldGroup({ className, ...props }) {
  return (
    <AriaGroup
      className={composeRenderProps(className, (className) =>
        cn(
          "flex h-10 w-full items-center overflow-hidden rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
          "data-[focus-within]:outline-none data-[focus-within]:ring-2 data-[focus-within]:ring-ring data-[focus-within]:ring-offset-2",
          "data-[disabled]:opacity-50",
          className,
        ),
      )}
      {...props}
    />
  );
}

function SearchFieldClear({ className, ...props }) {
  return (
    <AriaButton
      className={composeRenderProps(className, (className) =>
        cn(
          "mr-1 rounded-sm opacity-70 ring-offset-background transition-opacity",
          "data-[hovered]:opacity-100",
          "data-[disabled]:pointer-events-none",
          "group-data-[empty]:invisible",
          className,
        ),
      )}
      {...props}
    />
  );
}

function JollySearchField({
  label,
  description,
  className,
  errorMessage,
  placeholder = "Search...",
  ...props
}) {
  return (
    <SearchField
      className={composeRenderProps(className, (className) =>
        cn("group flex flex-col gap-2", className),
      )}
      {...props}
    >
      {label && <Label>{label}</Label>}
      <FieldGroup>
        <SearchFieldGroup>
          <SearchIcon aria-hidden className="size-4 text-muted-foreground" />
          <SearchFieldInput placeholder={placeholder} />
          <SearchFieldClear aria-label="Clear search">
            <XIcon aria-hidden className="size-4" />
          </SearchFieldClear>
        </SearchFieldGroup>
      </FieldGroup>
      {description && (
        <Text className="text-sm text-muted-foreground" slot="description">
          {description}
        </Text>
      )}
      <FieldError>{errorMessage}</FieldError>
    </SearchField>
  );
}

export {
  SearchField,
  SearchFieldGroup,
  SearchFieldInput,
  SearchFieldClear,
  JollySearchField,
};
