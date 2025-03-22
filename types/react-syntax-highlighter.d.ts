declare module 'react-syntax-highlighter' {
  import { ComponentType } from 'react'
  
  export interface SyntaxHighlighterProps {
    language?: string
    style?: any
    children?: string
    className?: string
    PreTag?: string | ComponentType
    [key: string]: any
  }

  export const Prism: ComponentType<SyntaxHighlighterProps>
}

declare module 'react-syntax-highlighter/dist/esm/styles/prism' {
  const styles: { [key: string]: { [key: string]: React.CSSProperties } }
  export const tomorrow: typeof styles
} 