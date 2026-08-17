declare module '@deepseek-ai/dsh-client-ui-primitives' {
  import type { ReactElement } from 'react'

  export interface FishLogoProps {
    readonly size?: number
    readonly className?: string
  }

  export function FishLogo(props: FishLogoProps): ReactElement
}
