"use client"

import * as React from "react"
import * as ReactAria from "react-aria-components"
import { useRouter } from "next/navigation"
import { updateLocale } from "@lib/data/locale-actions"
import type { Locale } from "@lib/data/locales"
import {
  UiSelectButton,
  UiSelectIcon,
  UiSelectListBox,
  UiSelectListBoxItem,
  UiSelectValue,
} from "@/components/ui/Select"
import { withReactQueryProvider } from "@lib/util/react-query"

type LanguageOption = {
  code: string
  label: string
}

const DEFAULT_OPTION: LanguageOption = {
  code: "",
  label: "Default",
}

const getLocalizedLanguageName = (
  code: string,
  fallbackName: string,
  displayLocale: string = "en-US"
): string => {
  try {
    const displayNames = new Intl.DisplayNames([displayLocale], {
      type: "language",
    })
    return displayNames.of(code) ?? fallbackName
  } catch {
    return fallbackName
  }
}

export const LanguageSelect = withReactQueryProvider<{
  locales: Locale[]
  currentLocale: string | null
  className?: string
  selectButtonClassName?: string
  selectIconClassName?: string
}>(({ locales, currentLocale, className, selectButtonClassName, selectIconClassName }) => {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  const options = React.useMemo<LanguageOption[]>(() => {
    const localeOptions = locales.map((locale) => ({
      code: locale.code,
      label: getLocalizedLanguageName(
        locale.code,
        locale.name,
        currentLocale ?? "en-US"
      ),
    }))
    return [DEFAULT_OPTION, ...localeOptions]
  }, [locales, currentLocale])

  const handleSelectionChange = (key: ReactAria.Key | null) => {
    if (key === null) return
    startTransition(async () => {
      await updateLocale(`${key}`)
      router.refresh()
    })
  }

  return (
    <ReactAria.Select
      selectedKey={currentLocale ?? ""}
      onSelectionChange={handleSelectionChange}
      className={className}
      aria-label="Select language"
      isDisabled={isPending}
    >
      <UiSelectButton variant="ghost" className={selectButtonClassName}>
        <UiSelectValue>
          {(item) =>
            typeof item.selectedItem === "object" &&
            item.selectedItem !== null &&
            "label" in item.selectedItem &&
            typeof item.selectedItem.label === "string"
              ? item.selectedItem.label
              : item.defaultChildren
          }
        </UiSelectValue>
        <UiSelectIcon className={selectIconClassName} />
      </UiSelectButton>
      <ReactAria.Popover placement="bottom right" className="max-w-61 w-full">
        <UiSelectListBox>
          {options.map((option) => (
            <UiSelectListBoxItem
              key={option.code}
              id={option.code}
              value={option}
            >
              {option.label}
            </UiSelectListBoxItem>
          ))}
        </UiSelectListBox>
      </ReactAria.Popover>
    </ReactAria.Select>
  )
})
