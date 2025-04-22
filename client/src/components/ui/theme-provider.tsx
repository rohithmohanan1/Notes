"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function createTheme() {
  return {
    colors: {
      primary: "hsl(122 39% 34%)", /* Green color: #2E7D32 */
      primaryDark: "hsl(122 40% 25%)", /* #1B5E20 */
      primaryLight: "hsl(122 39% 49%)", /* #4CAF50 */
    }
  }
}

export function ThemeProvider({ 
  children, 
  theme, 
  defaultTheme = "system",
  ...props
}: ThemeProviderProps & { theme: ReturnType<typeof createTheme> }) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <NextThemesProvider
      defaultTheme={defaultTheme}
      enableSystem
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}