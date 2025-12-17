interface StatsCardProps {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
}

export const StatsCard = ({ value, label, icon }: StatsCardProps) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-3xl font-bold text-slate-900">{value}</div>
          <div className="text-sm text-slate-600 mt-1">{label}</div>
        </div>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>
    </div>
  );
};
