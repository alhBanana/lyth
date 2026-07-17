import type { PropsWithChildren } from 'react'
import Card from './Card'

type FeatureSectionProps = PropsWithChildren<{
  title: string
  subtitle?: string
}>

export default function FeatureSection({ title, subtitle, children }: FeatureSectionProps) {
  return (
    <Card className="space-y-4">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#2F5D50]/90">{title}</p>
        {subtitle ? <p className="mt-3 text-sm leading-6 text-slate-600">{subtitle}</p> : null}
      </div>
      {children}
    </Card>
  )
}
