type PageCardProps = {
  title: string
  subtitle: string
  value: string
}

export default function PageCard({ title, subtitle, value }: PageCardProps) {
  return (
    <div className="rounded-[1.5rem] border border-[#E8E4DD] bg-[#F8F5EF] p-5">
      <p className="text-sm font-medium text-[#2F5D50]/95">{title}</p>
      <h3 className="mt-3 text-2xl font-semibold text-slate-950">{value}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p>
    </div>
  )
}
