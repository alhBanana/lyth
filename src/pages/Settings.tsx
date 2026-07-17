import Card from '../components/Card'
import SectionHeading from '../components/SectionHeading'

export default function Settings() {
  return (
    <div className="space-y-8">
      <SectionHeading title="Settings" subtitle="Adjust your shell and workspace settings." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#2F5D50]/90">Appearance</p>
          <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
            <p>Paper background and soft details keep the interface calm.</p>
            <p>Rounded cards, simplified spacing, and a restrained palette support the Lyth design system.</p>
          </div>
        </Card>
        <Card>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#2F5D50]/90">Profile</p>
          <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
            <p>Profile avatar placeholder is a visual cue without extra user flow.</p>
            <p>Navigation and layout are designed to keep each page accessible and consistent.</p>
          </div>
        </Card>
      </div>
    </div>
  )
}
