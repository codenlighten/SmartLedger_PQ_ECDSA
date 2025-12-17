interface SectionCardProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const SectionCard = ({ title, children, icon }: SectionCardProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          {icon && <div className="text-slate-700">{icon}</div>}
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
};
