'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  FileText, 
  Eye, 
  Edit3, 
  Users, 
  Calendar,
  Star,
  Activity,
  Target,
  Award,
  Zap,
  PieChart,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

interface AnalyticsOverview {
  totalNotes: number;
  totalViews: number;
  totalEdits: number;
  timeSpent: number;
  pinnedNotes: number;
  favoriteNotes: number;
  totalActions: number;
}

interface DailyActivity {
  _id: {
    date: string;
  };
  count: number;
  actions: string[];
}

interface CategoryStats {
  _id: string;
  count: number;
}

interface HourlyActivity {
  _id: {
    hour: number;
  };
  count: number;
}

interface RecentAction {
  _id: string;
  action: string;
  timestamp: string;
  note?: string;
  workspace?: string;
  details: any;
}

interface CollaborationStats {
  totalCollaborativeNotes: number;
  totalCollaborators: number;
}

interface TopCollaborator {
  user: {
    _id: string;
    username: string;
    email: string;
    profile?: {
      avatar?: string;
    };
  };
  collaborationCount: number;
}

interface AnalyticsData {
  period: string;
  overview: AnalyticsOverview;
  dailyActivity: DailyActivity[];
  categoryStats: CategoryStats[];
  hourlyActivity: HourlyActivity[];
  recentActions: RecentAction[];
}

type TimePeriod = '7d' | '30d' | '90d';

export const AnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [collaborationData, setCollaborationData] = useState<{
    stats: CollaborationStats;
    topCollaborators: TopCollaborator[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('30d');

  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (isAuthenticated) {
      loadAnalyticsData();
    }
  }, [isAuthenticated, authLoading, selectedPeriod, router]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      const [dashboardResponse, collaborationResponse] = await Promise.all([
        api.get(`/analytics/dashboard?period=${selectedPeriod}`),
        api.get('/analytics/collaboration')
      ]);

      setAnalyticsData(dashboardResponse.data);
      setCollaborationData(collaborationResponse.data);
    } catch (error: any) {
      toast.error('Failed to load analytics data');
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    try {
      setRefreshing(true);
      await loadAnalyticsData();
      toast.success('Analytics data refreshed!');
    } catch (error) {
      toast.error('Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getActivityIntensity = (count: number, maxCount: number) => {
    const intensity = (count / maxCount) * 100;
    if (intensity === 0) return 'bg-gray-100';
    if (intensity < 25) return 'bg-blue-200';
    if (intensity < 50) return 'bg-blue-300';
    if (intensity < 75) return 'bg-blue-400';
    return 'bg-blue-500';
  };

  const getPeriodLabel = (period: TimePeriod) => {
    switch (period) {
      case '7d': return 'Last 7 Days';
      case '30d': return 'Last 30 Days';
      case '90d': return 'Last 90 Days';
      default: return 'Last 30 Days';
    }
  };

  const getProductivityScore = () => {
    if (!analyticsData) return 0;
    const { overview } = analyticsData;
    
    // Calculate productivity score based on various metrics
    const noteCreationScore = Math.min(overview.totalNotes * 5, 50);
    const activityScore = Math.min(overview.totalActions * 2, 30);
    const engagementScore = Math.min((overview.totalViews + overview.totalEdits) * 0.5, 20);
    
    return Math.round(noteCreationScore + activityScore + engagementScore);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-cyan-50 to-yellow-50">
        <Header />
        
        <div className="max-w-7xl mx-auto p-6">
          <div className="space-y-8">
            <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] p-8 transform -rotate-1 animate-pulse">
              <div className="h-12 bg-gray-300 border-2 border-black w-1/3 mb-4"></div>
              <div className="h-6 bg-gray-200 border-2 border-black w-1/2"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_#000] p-6 animate-pulse">
                  <div className="h-8 bg-gray-300 border-2 border-black mb-4"></div>
                  <div className="h-12 bg-gray-200 border-2 border-black"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const maxDailyActivity = Math.max(...(analyticsData?.dailyActivity.map(d => d.count) || [1]));
  const productivityScore = getProductivityScore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-cyan-50 to-yellow-50">
      <Header />
      
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Brutal Header */}
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] p-8 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-black text-black mb-2 transform hover:scale-105 transition-transform">
                📊 ANALYTICS DASHBOARD
              </h1>
              <p className="text-lg font-bold text-gray-700">
                Track your brutal productivity and insights
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Period Selector */}
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as TimePeriod)}
                className="px-4 py-2 border-4 border-black rounded-xl font-bold text-black bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_#000] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all duration-200"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>

              {/* Refresh Button */}
              <button
                onClick={refreshData}
                disabled={refreshing}
                className="bg-blue-400 hover:bg-blue-300 text-black font-black px-4 py-2 border-4 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200 flex items-center gap-2"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'REFRESHING...' : 'REFRESH'}
              </button>
            </div>
          </div>
        </div>

        {/* Productivity Score */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 border-4 border-black shadow-[8px_8px_0px_0px_#000] p-8 transform rotate-1 hover:rotate-0 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black text-black mb-2">🎯 PRODUCTIVITY SCORE</h2>
              <p className="text-lg font-bold text-black">Your brutal productivity rating</p>
            </div>
            <div className="text-6xl font-black text-black">
              {productivityScore}/100
            </div>
          </div>
          
          <div className="mt-4 bg-white border-4 border-black rounded-xl p-4 shadow-[4px_4px_0px_0px_#000]">
            <div className="flex justify-between items-center">
              <span className="font-bold text-black">Progress Bar:</span>
              <span className="text-lg font-black text-black">{productivityScore}%</span>
            </div>
            <div className="w-full bg-gray-200 border-3 border-black rounded-full h-6 mt-2">
              <div 
                className="bg-green-400 h-full border-2 border-black rounded-full transition-all duration-500"
                style={{ width: `${productivityScore}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Overview Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-blue-200 border-4 border-black shadow-[6px_6px_0px_0px_#000] p-6 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between mb-4">
              <FileText className="w-8 h-8 text-black" />
              <div className="text-3xl font-black text-black">
                {analyticsData?.overview.totalNotes || 0}
              </div>
            </div>
            <h3 className="text-xl font-black text-black">TOTAL NOTES</h3>
            <p className="text-sm font-bold text-gray-700">Created in {getPeriodLabel(selectedPeriod)}</p>
          </div>

          <div className="bg-green-200 border-4 border-black shadow-[6px_6px_0px_0px_#000] p-6 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between mb-4">
              <Eye className="w-8 h-8 text-black" />
              <div className="text-3xl font-black text-black">
                {analyticsData?.overview.totalViews || 0}
              </div>
            </div>
            <h3 className="text-xl font-black text-black">TOTAL VIEWS</h3>
            <p className="text-sm font-bold text-gray-700">Notes opened and viewed</p>
          </div>

          <div className="bg-yellow-200 border-4 border-black shadow-[6px_6px_0px_0px_#000] p-6 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between mb-4">
              <Edit3 className="w-8 h-8 text-black" />
              <div className="text-3xl font-black text-black">
                {analyticsData?.overview.totalEdits || 0}
              </div>
            </div>
            <h3 className="text-xl font-black text-black">TOTAL EDITS</h3>
            <p className="text-sm font-bold text-gray-700">Times notes were modified</p>
          </div>

          <div className="bg-purple-200 border-4 border-black shadow-[6px_6px_0px_0px_#000] p-6 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-8 h-8 text-black" />
              <div className="text-3xl font-black text-black">
                {formatDuration(analyticsData?.overview.timeSpent || 0)}
              </div>
            </div>
            <h3 className="text-xl font-black text-black">TIME SPENT</h3>
            <p className="text-sm font-bold text-gray-700">Active writing time</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Daily Activity Heatmap */}
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] p-6 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
            <h2 className="text-2xl font-black text-black mb-4 flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              DAILY ACTIVITY
            </h2>
            
            <div className="grid grid-cols-7 gap-2">
              {analyticsData?.dailyActivity.map((day, index) => (
                <div
                  key={index}
                  className={`h-12 border-3 border-black rounded-lg flex items-center justify-center font-bold text-xs ${getActivityIntensity(day.count, maxDailyActivity)} transition-all duration-200 hover:scale-110 cursor-pointer`}
                  title={`${formatDate(day._id.date)}: ${day.count} actions`}
                >
                  <div className="text-center">
                    <div className="text-black">{formatDate(day._id.date)}</div>
                    <div className="text-black font-black">{day.count}</div>
                  </div>
                </div>
              )) || (
                <div className="col-span-7 text-center py-8">
                  <p className="text-gray-500 font-bold">No activity data available</p>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between mt-4 text-sm font-bold text-gray-700">
              <span>Less Active</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 bg-gray-100 border-2 border-black rounded"></div>
                <div className="w-3 h-3 bg-blue-200 border-2 border-black rounded"></div>
                <div className="w-3 h-3 bg-blue-300 border-2 border-black rounded"></div>
                <div className="w-3 h-3 bg-blue-400 border-2 border-black rounded"></div>
                <div className="w-3 h-3 bg-blue-500 border-2 border-black rounded"></div>
              </div>
              <span>More Active</span>
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] p-6 transform rotate-1 hover:rotate-0 transition-transform duration-300">
            <h2 className="text-2xl font-black text-black mb-4 flex items-center gap-2">
              <PieChart className="w-6 h-6" />
              CATEGORY BREAKDOWN
            </h2>
            
            <div className="space-y-3">
              {analyticsData?.categoryStats.map((category, index) => {
                const total = analyticsData.overview.totalNotes;
                const percentage = total > 0 ? Math.round((category.count / total) * 100) : 0;
                const colors = ['bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400', 'bg-purple-400', 'bg-pink-400'];
                
                return (
                  <div key={category._id} className="flex items-center gap-3">
                    <div className={`w-4 h-4 border-2 border-black rounded ${colors[index % colors.length]}`}></div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-black capitalize">{category._id || 'Uncategorized'}</span>
                        <span className="font-black text-black">{category.count} ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 border-2 border-black rounded-full h-3 mt-1">
                        <div 
                          className={`h-full border border-black rounded-full ${colors[index % colors.length]} transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              }) || (
                <div className="text-center py-8">
                  <p className="text-gray-500 font-bold">No category data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Hourly Activity */}
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] p-6 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
            <h2 className="text-2xl font-black text-black mb-4 flex items-center gap-2">
              <Clock className="w-6 h-6" />
              HOURLY PATTERN
            </h2>
            
            <div className="space-y-2">
              {Array.from({ length: 24 }, (_, hour) => {
                const activity = analyticsData?.hourlyActivity.find(h => h._id.hour === hour);
                const count = activity?.count || 0;
                const maxHourlyActivity = Math.max(...(analyticsData?.hourlyActivity.map(h => h.count) || [1]));
                const percentage = maxHourlyActivity > 0 ? (count / maxHourlyActivity) * 100 : 0;
                
                return (
                  <div key={hour} className="flex items-center gap-3">
                    <div className="w-12 text-xs font-bold text-black text-right">
                      {hour.toString().padStart(2, '0')}:00
                    </div>
                    <div className="flex-1 bg-gray-200 border-2 border-black rounded-full h-4">
                      <div 
                        className="h-full bg-blue-400 border border-black rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="w-8 text-xs font-black text-black">
                      {count}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Collaboration Stats */}
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] p-6 transform rotate-1 hover:rotate-0 transition-transform duration-300">
            <h2 className="text-2xl font-black text-black mb-4 flex items-center gap-2">
              <Users className="w-6 h-6" />
              COLLABORATION
            </h2>
            
            <div className="space-y-4">
              <div className="bg-pink-200 border-3 border-black rounded-xl p-4 shadow-[2px_2px_0px_0px_#000]">
                <div className="text-2xl font-black text-black">
                  {collaborationData?.stats.totalCollaborativeNotes || 0}
                </div>
                <div className="text-sm font-bold text-gray-700">Collaborative Notes</div>
              </div>
              
              <div className="bg-cyan-200 border-3 border-black rounded-xl p-4 shadow-[2px_2px_0px_0px_#000]">
                <div className="text-2xl font-black text-black">
                  {collaborationData?.stats.totalCollaborators || 0}
                </div>
                <div className="text-sm font-bold text-gray-700">Total Collaborators</div>
              </div>

              {collaborationData?.topCollaborators.length ? (
                <div>
                  <h3 className="text-lg font-black text-black mb-2">TOP COLLABORATORS</h3>
                  <div className="space-y-2">
                    {collaborationData.topCollaborators.slice(0, 3).map((collab, index) => (
                      <div key={collab.user._id} className="flex items-center gap-3 p-3 bg-gray-100 border-2 border-black rounded-lg">
                        <div className="w-8 h-8 bg-blue-400 border-2 border-black rounded-full flex items-center justify-center font-black text-black">
                          {collab.user.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-black">{collab.user.username}</div>
                          <div className="text-xs font-bold text-gray-600">{collab.collaborationCount} collaborations</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 font-bold">No collaborations yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Actions */}
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] p-6 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
            <h2 className="text-2xl font-black text-black mb-4 flex items-center gap-2">
              <Activity className="w-6 h-6" />
              RECENT ACTIVITY
            </h2>
            
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {analyticsData?.recentActions.map((action, index) => (
                <div key={action._id} className="flex items-start gap-3 p-3 bg-gray-50 border-2 border-black rounded-lg">
                  <div className="w-2 h-2 bg-blue-400 border border-black rounded-full mt-2"></div>
                  <div className="flex-1">
                    <div className="font-bold text-black capitalize">{action.action.replace('_', ' ')}</div>
                    <div className="text-xs font-bold text-gray-600">
                      {new Date(action.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8">
                  <p className="text-gray-500 font-bold">No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-red-200 border-4 border-black shadow-[6px_6px_0px_0px_#000] p-6 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between mb-4">
              <Star className="w-8 h-8 text-black" />
              <div className="text-3xl font-black text-black">
                {analyticsData?.overview.favoriteNotes || 0}
              </div>
            </div>
            <h3 className="text-xl font-black text-black">FAVORITE NOTES</h3>
            <p className="text-sm font-bold text-gray-700">Notes marked as favorites</p>
          </div>

          <div className="bg-orange-200 border-4 border-black shadow-[6px_6px_0px_0px_#000] p-6 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between mb-4">
              <Target className="w-8 h-8 text-black" />
              <div className="text-3xl font-black text-black">
                {analyticsData?.overview.pinnedNotes || 0}
              </div>
            </div>
            <h3 className="text-xl font-black text-black">PINNED NOTES</h3>
            <p className="text-sm font-bold text-gray-700">Notes pinned for quick access</p>
          </div>

          <div className="bg-cyan-200 border-4 border-black shadow-[6px_6px_0px_0px_#000] p-6 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between mb-4">
              <Zap className="w-8 h-8 text-black" />
              <div className="text-3xl font-black text-black">
                {analyticsData?.overview.totalActions || 0}
              </div>
            </div>
            <h3 className="text-xl font-black text-black">TOTAL ACTIONS</h3>
            <p className="text-sm font-bold text-gray-700">All tracked user actions</p>
          </div>
        </div>
      </div>
    </div>
  );
};
