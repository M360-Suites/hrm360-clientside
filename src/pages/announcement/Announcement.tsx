import { useEffect } from "react";
import { Megaphone, Bell, Calendar, ChevronRight } from "lucide-react";
import { useAnnouncementStore } from "../../store/useAnnouncementStore";

const timeAgo = (date: string) => {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
};

const Announcement = () => {
  const { notifications, fetchNotifications, isLoading } = useAnnouncementStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
            <Megaphone className="text-[#3B00D9]" size={24} />
            Announcements & Notifications
          </h2>
          <p className="text-sm text-gray-500">Stay updated with the latest company news and alerts</p>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-10 flex flex-col items-center justify-center text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3B00D9] mb-4"></div>
            <p>Loading announcements...</p>
          </div>
        ) : notifications.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {notifications.map((notification, idx) => {
              const date = notification.date || notification.createdAt || new Date().toISOString();
              // Check if date is within the last 3 days
              const threeDaysAgo = new Date();
              threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
              const isRecent = new Date(date) > threeDaysAgo;
              
              return (
                <div 
                  key={notification._id || idx} 
                  className="p-6 hover:bg-gray-50/50 transition-colors group cursor-pointer flex gap-5"
                >
                  <div className="shrink-0 mt-1">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isRecent ? 'bg-indigo-50 text-[#3B00D9]' : 'bg-gray-50 text-gray-400'
                    }`}>
                      <Bell size={20} className={isRecent ? 'animate-pulse' : ''} />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-1">
                      <h3 className="text-base font-semibold text-gray-900 truncate">
                        {notification.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 shrink-0 bg-white border border-gray-100 px-2.5 py-1 rounded-full shadow-xs self-start sm:self-auto">
                        <Calendar size={12} />
                        {timeAgo(date)}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 pr-0 sm:pr-8 mt-1 sm:mt-0">
                      {notification.message}
                    </p>
                  </div>
                  
                  <div className="hidden sm:flex shrink-0 items-center self-center opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 duration-300">
                    <div className="w-8 h-8 rounded-full bg-white shadow-xs border border-gray-100 flex items-center justify-center text-gray-400 hover:text-[#3B00D9]">
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
              <Megaphone size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No Announcements Yet</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              You're all caught up! New company announcements and notifications will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Announcement;
