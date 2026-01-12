import { MessageSquare, Clock, CheckCircle, Users } from 'lucide-react';

const ChatStats = ({ stats }) => {
  if (!stats) {
    return null;
  }

  const statItems = [
    {
      label: 'Total Chats',
      value: stats.totalChats || 0,
      icon: MessageSquare,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
    },
    {
      label: 'Waiting',
      value: stats.waitingChats || 0,
      icon: Clock,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50',
    },
    {
      label: 'Active Now',
      value: stats.activeChats || 0,
      icon: Users,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
    },
    {
      label: 'Resolved',
      value: stats.resolvedChats || 0,
      icon: CheckCircle,
      iconColor: 'text-violet-600',
      iconBg: 'bg-violet-50',
    },
    {
      label: 'Avg Response',
      value: stats.avgResponseTimeMinutes
        ? `${stats.avgResponseTimeMinutes}m`
        : 'N/A',
      icon: Clock,
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {statItems.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{stat.value}</h3>
            </div>
            <div className={`p-2 rounded-lg ${stat.iconBg}`}>
              <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatStats;
