"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { DEMO_COURSE, flattenItems } from "@/lib/demo-data";
import { DEFAULT_LOCALE, type Locale } from "@/lib/locale";
import { getDictionary } from "@/lib/i18n";

export interface AppSearchProps {
  locale?: Locale;
}

/** Search focus opens a command palette over lessons and resources. */
function AppSearch({ locale = DEFAULT_LOCALE }: AppSearchProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const items = flattenItems();
  const t = getDictionary(locale);

  return (
    <>
      <div className="relative max-w-sm flex-1">
        <Search
          className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-fg-tertiary"
          aria-hidden
        />
        <Input
          placeholder={t.search.placeholder}
          className="ps-9"
          readOnly
          onFocus={() => setOpen(true)}
        />
      </div>
      <CommandDialog open={open} onOpenChange={setOpen} title="Search">
        <CommandInput placeholder={t.search.placeholder} />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
          <CommandGroup heading="Lessons and quizzes">
            {items.map(({ unit, item }) => (
              <CommandItem
                key={item.id}
                value={item.title}
                onSelect={() => {
                  setOpen(false);
                  router.push(
                    item.kind === "lesson"
                      ? `/courses/${DEMO_COURSE.slug}/lessons/${item.id}`
                      : `/courses/${DEMO_COURSE.slug}/quiz/${item.id}`,
                  );
                }}
              >
                {item.title}
                <span className="t-body-xs ms-auto text-fg-tertiary">{unit.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}

export { AppSearch };
