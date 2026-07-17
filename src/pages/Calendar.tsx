import Card from '../components/Card'
import SectionHeading from '../components/SectionHeading'

export default function Calendar() {
  return (
    <div className="space-y-8">
      <SectionHeading title="Calendar" subtitle="A simple planning view for upcoming sessions." />
      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <Card>
          <div className="space-y-5">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#2F5D50]/90">This week</p>
            <div className="grid gap-4">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day) => (
                <div key={day} className="rounded-[1.5rem] border border-[#E8E4DD] bg-[#FAF8F4] p-4">
                  <p className="text-sm font-semibold text-slate-950">{day}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">Session · 10:00 AM</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
        <Card>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#2F5D50]/90">Focus</p>
          <p className="mt-4 text-sm leading-7 text-slate-600">Keep your calendar light and steady. Block time for priority activities, review, and breaks so the week stays balanced.</p>
        </Card>
      </div>
    </div>
  )
}
