'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, 
  Calendar,
  TrendingUp,
  Clock,
  Target,
  Award,
  Zap,
  CheckCircle,
  BookOpen,
  BarChart3,
  Star,
  Brain,
  Flame
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface DashboardStats {
  totalNotes: number;
  totalWorkspaces: number;
  totalTemplatesUsed: number;
  weeklyActivity: number;
  collaborations: number;
  averageNoteLength: number;
  productivityScore: number;
  streakDays: number;
  totalActions: number;
  pinnedNotes: number;
  favoriteNotes: number;
}

interface RecentActivity {
  type: 'note' | 'workspace' | 'template';
  title: string;
  workspace?: string;
  timestamp: string;
  action: string;
  user?: {
    username: string;
    email: string;
  };
}

interface ProductivityData {
  date: string;
  notes: number;
  time: number;
  actions: number;
}

export const ProductivityDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [productivityData, setProductivityData] = useState<ProductivityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30d');

  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [timeframe, isAuthenticated]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [dashboardRes, activityRes] = await Promise.all([
        api.get(`/analytics/dashboard?period=${timeframe}`),
        api.get('/analytics/dashboard?period=7d') // Recent activity
      ]);

      if (dashboardRes.data) {
        const data = dashboardRes.data;
        setStats({
          totalNotes: data.overview?.totalNotes || 0,
          totalWorkspaces: data.overview?.totalWorkspaces || 0,
          totalTemplatesUsed: data.overview?.totalTemplatesUsed || 0,
          weeklyActivity: data.overview?.timeSpent || 0,
          collaborations: data.overview?.collaborations || 0,
          averageNoteLength: data.overview?.averageNoteLength || 0,
          productivityScore: Math.min(100, Math.max(0, (data.overview?.totalActions || 0) * 10)),
          streakDays: data.overview?.streakDays || 0,
          totalActions: data.overview?.totalActions || 0,
          pinnedNotes: data.overview?.pinnedNotes || 0,
          favoriteNotes: data.overview?.favoriteNotes || 0
        });

        // Transform daily activity to productivity data
        const prodData = data.dailyActivity?.map((day: any) => ({
          date: day._id.date,
          notes: day.count || 0,
          time: Math.random() * 8, // Mock time data for now
          actions: day.count || 0
        })) || [];
        
        setProductivityData(prodData);
      }

      if (activityRes.data?.recentActions) {
        const activities = activityRes.data.recentActions.map((action: any) => ({
          type: action.note ? 'note' : action.workspace ? 'workspace' : 'template',
          title: action.note?.title || action.workspace?.name || 'Unknown',
          workspace: action.workspace?.name,
          timestamp: action.timestamp,
          action: action.action,
          user: action.user
        }));
        setRecentActivity(activities);
      }
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
      
      // Set mock data for development
      setStats({
        totalNotes: 42,
        totalWorkspaces: 5,
        totalTemplatesUsed: 12,
        weeklyActivity: 28,
        collaborations: 8,
        averageNoteLength: 287,
        productivityScore: 85,
        streakDays: 7,
        totalActions: 156,
        pinnedNotes: 6,
        favoriteNotes: 14
      });
    } finally {
      setLoading(false);
    }
  };

  const getProductivityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'note':
        return <BookOpen className="w-4 h-4" />;
      case 'workspace':
        return <Users className="w-4 h-4" />;
      case 'template':
        return <Target className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-8">
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] p-8 transform -rotate-1 animate-pulse">
            <div className="h-12 bg-gray-300 border-2 border-black w-1/3 mb-4"></div>
            <div className="h-6 bg-gray-200 border-2 border-black w-1/2"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_#000] p-6 animate-pulse">
                <div className="h-32 bg-gray-300 border-2 border-black mb-4"></div>
                <div className="h-4 bg-gray-200 border-2 border-black mb-2"></div>
                <div className="h-4 bg-gray-200 border-2 border-black w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Brutal Header */}
      <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] p-8 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-black mb-2 transform hover:scale-105 transition-transform">
              📊 PRODUCTIVITY DASHBOARD
            </h1>
            <p className="text-lg font-bold text-gray-700">
              Track your progress and insights
            </p>
          </div>
          
          <div className="bg-yellow-400 border-4 border-black rounded-xl p-4 shadow-[4px_4px_0px_0px_#000] transform rotate-2 hover:rotate-0 transition-transform duration-300">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="bg-transparent border-none outline-none text-lg font-black text-black cursor-pointer"
            >
              <option value="7d">THIS WEEK</option>
              <option value="30d">THIS MONTH</option>
              <option value="90d">THIS QUARTER</option>
              <option value="365d">THIS YEAR</option>
            </select>
          </div>
        </div>
      </div>

      {stats && (
        <>
          {/* Key Metrics - Brutal Style */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-blue-400 border-4 border-black shadow-[6px_6px_0px_0px_#000] p-6 transform rotate-1 hover:rotate-0 transition-transform duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-black text-black mb-1">TOTAL NOTES</p>
                  <p className="text-4xl font-black text-black">{stats.totalNotes}</p>
                </div>
                <div className="w-16 h-16 bg-white border-4 border-black rounded-xl flex items-center justify-center shadow-[4px_4px_0px_0px_#000]">
                  <BookOpen className="w-8 h-8 text-black" />
                </div>
              </div>
            </Card>

            <Card className="bg-purple-400 border-4 border-black shadow-[6px_6px_0px_0px_#000] p-6 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-black text-black mb-1">WORKSPACES</p>
                  <p className="text-4xl font-black text-black">{stats.totalWorkspaces}</p>
                </div>
                <div className="w-16 h-16 bg-white border-4 border-black rounded-xl flex items-center justify-center shadow-[4px_4px_0px_0px_#000]">
                  <Users className="w-8 h-8 text-black" />
                </div>
              </div>
            </Card>

            <Card className="bg-green-400 border-4 border-black shadow-[6px_6px_0px_0px_#000] p-6 transform rotate-1 hover:rotate-0 transition-transform duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-black text-black mb-1">TEMPLATES USED</p>
                  <p className="text-4xl font-black text-black">{stats.totalTemplatesUsed}</p>
                </div>
                <div className="w-16 h-16 bg-white border-4 border-black rounded-xl flex items-center justify-center shadow-[4px_4px_0px_0px_#000]">
                  <Target className="w-8 h-8 text-black" />
                </div>
              </div>
            </Card>

            <Card className="bg-yellow-400 border-4 border-black shadow-[6px_6px_0px_0px_#000] p-6 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-black text-black mb-1">PRODUCTIVITY</p>
                  <p className={`text-4xl font-black ${getProductivityColor(stats.productivityScore)}`}>
                    {stats.productivityScore}%
                  </p>
                </div>
                <div className="w-16 h-16 bg-white border-4 border-black rounded-xl flex items-center justify-center shadow-[4px_4px_0px_0px_#000]">
                  <TrendingUp className="w-8 h-8 text-black" />
                </div>
              </div>
            </Card>
          </div>

          {/* Secondary Metrics - More Brutal Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-orange-300 border-4 border-black shadow-[6px_6px_0px_0px_#000] p-6 transform rotate-2 hover:rotate-0 transition-transform duration-300">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-orange-500 border-3 border-black rounded-xl flex items-center justify-center shadow-[3px_3px_0px_0px_#000]">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-black text-black">WEEKLY ACTIVITY</p>
                  <p className="text-2xl font-black text-black">{stats.weeklyActivity}h</p>
                </div>
              </div>
            </Card>

            <Card className="bg-indigo-300 border-4 border-black shadow-[6px_6px_0px_0px_#000] p-6 transform -rotate-2 hover:rotate-0 transition-transform duration-300">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-indigo-500 border-3 border-black rounded-xl flex items-center justify-center shadow-[3px_3px_0px_0px_#000]">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-black text-black">COLLABORATIONS</p>
                  <p className="text-2xl font-black text-black">{stats.collaborations}</p>
                </div>
              </div>
            </Card>

            <Card className="bg-teal-300 border-4 border-black shadow-[6px_6px_0px_0px_#000] p-6 transform rotate-1 hover:rotate-0 transition-transform duration-300">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-teal-500 border-3 border-black rounded-xl flex items-center justify-center shadow-[3px_3px_0px_0px_#000]">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-black text-black">AVG NOTE LENGTH</p>
                  <p className="text-2xl font-black text-black">{stats.averageNoteLength}</p>
                </div>
              </div>
            </Card>

            <Card className="bg-red-300 border-4 border-black shadow-[6px_6px_0px_0px_#000] p-6 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-red-500 border-3 border-black rounded-xl flex items-center justify-center shadow-[3px_3px_0px_0px_#000]">
                  <Flame className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-black text-black">CURRENT STREAK</p>
                  <p className="text-2xl font-black text-black">{stats.streakDays}d</p>
                </div>
              </div>
            </Card>
          </div>
        </>
      )}

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Productivity Chart - Brutal Style */}
        <Card className="lg:col-span-2 bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] p-6 transform rotate-1 hover:rotate-0 transition-transform duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-black text-black">📈 PRODUCTIVITY TREND</h3>
            <div className="flex items-center space-x-4 text-sm font-bold text-black">
              <div className="flex items-center space-x-2 bg-blue-200 border-2 border-black px-3 py-1 shadow-[2px_2px_0px_0px_#000]">
                <div className="w-4 h-4 bg-blue-500 border-2 border-black"></div>
                <span>NOTES CREATED</span>
              </div>
              <div className="flex items-center space-x-2 bg-green-200 border-2 border-black px-3 py-1 shadow-[2px_2px_0px_0px_#000]">
                <div className="w-4 h-4 bg-green-500 border-2 border-black"></div>
                <span>TIME SPENT</span>
              </div>
            </div>
          </div>
          
          {productivityData.length > 0 ? (
            <div className="h-64 flex items-end justify-between space-x-3 bg-gray-100 border-3 border-black p-4 shadow-[4px_4px_0px_0px_#000]">
              {productivityData.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center space-y-2">
                  <div className="w-full flex flex-col justify-end h-48 space-y-1">
                    <div 
                      className="bg-blue-500 border-2 border-black shadow-[2px_2px_0px_0px_#000] transform hover:scale-105 transition-transform"
                      style={{ height: `${Math.max(4, (data.notes / Math.max(...productivityData.map(d => d.notes))) * 100)}%` }}
                    ></div>
                    <div 
                      className="bg-green-500 border-2 border-black shadow-[2px_2px_0px_0px_#000] transform hover:scale-105 transition-transform"
                      style={{ height: `${Math.max(4, (data.time / Math.max(...productivityData.map(d => d.time))) * 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-bold text-black bg-white border-2 border-black px-2 py-1 shadow-[2px_2px_0px_0px_#000] transform -rotate-12">
                    {new Date(data.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center bg-gray-100 border-3 border-black shadow-[4px_4px_0px_0px_#000]">
              <div className="text-center bg-white border-3 border-black p-6 shadow-[4px_4px_0px_0px_#000] transform -rotate-2">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-black" />
                <p className="font-black text-black">NO PRODUCTIVITY DATA AVAILABLE</p>
                <p className="text-sm font-bold text-gray-700 mt-2">Start creating notes to see your progress!</p>
              </div>
            </div>
          )}
        </Card>

        {/* Recent Activity - Brutal Style */}
        <Card className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_#000] p-6 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
          <h3 className="text-xl font-black text-black mb-6 bg-yellow-300 border-2 border-black p-2 shadow-[2px_2px_0px_0px_#000] transform rotate-1">
            🎯 RECENT ACTIVITY
          </h3>
          
          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.slice(0, 6).map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 bg-gray-50 border-2 border-black p-3 shadow-[3px_3px_0px_0px_#000] transform hover:scale-105 transition-transform">
                  <div className="w-10 h-10 bg-blue-400 border-2 border-black flex items-center justify-center flex-shrink-0 shadow-[2px_2px_0px_0px_#000]">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-black truncate">
                      {activity.title}
                    </p>
                    <div className="flex items-center space-x-2 text-xs font-bold text-gray-700">
                      <span className="bg-green-200 border border-black px-2 py-1">{activity.action}</span>
                      {activity.workspace && (
                        <>
                          <span>•</span>
                          <span className="bg-purple-200 border border-black px-2 py-1">{activity.workspace}</span>
                        </>
                      )}
                    </div>
                    <span className="text-xs font-bold text-gray-600 bg-white border border-black px-2 py-1 mt-1 inline-block">
                      {new Date(activity.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-100 border-3 border-black shadow-[4px_4px_0px_0px_#000]">
              <Calendar className="w-12 h-12 mx-auto mb-2 text-black" />
              <p className="text-lg font-black text-black">NO RECENT ACTIVITY</p>
              <p className="text-sm font-bold text-gray-700 mt-2">Start working to see your activity!</p>
            </div>
          )}
        </Card>
      </div>

      {/* Achievement Section - Brutal Style */}
      <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] p-8 transform rotate-1 hover:rotate-0 transition-transform duration-300">
        <h3 className="text-3xl font-black text-black mb-8 text-center bg-gradient-to-r from-yellow-400 to-orange-400 border-4 border-black p-4 shadow-[4px_4px_0px_0px_#000] transform -rotate-1">
          🏆 ACHIEVEMENTS & MILESTONES
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center bg-gradient-to-br from-yellow-200 to-yellow-300 border-4 border-black p-6 shadow-[6px_6px_0px_0px_#000] transform -rotate-2 hover:rotate-0 transition-transform duration-300">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 border-4 border-black flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_0px_0px_#000] transform rotate-12">
              <Award className="w-10 h-10 text-white" />
            </div>
            <h4 className="font-black text-black text-lg mb-2">PRODUCTIVITY CHAMPION</h4>
            <p className="text-sm font-bold text-black mb-4">Maintain 80%+ productivity for a week</p>
            <div className="mt-4">
              {stats && stats.productivityScore >= 80 ? (
                <span className="text-sm bg-green-400 text-black font-black px-4 py-2 border-3 border-black shadow-[3px_3px_0px_0px_#000] transform -rotate-1">
                  🎉 EARNED!
                </span>
              ) : (
                <span className="text-sm bg-gray-300 text-black font-black px-4 py-2 border-3 border-black shadow-[3px_3px_0px_0px_#000]">
                  {stats ? `${stats.productivityScore}% / 80%` : 'LOCKED'}
                </span>
              )}
            </div>
          </div>

          <div className="text-center bg-gradient-to-br from-blue-200 to-purple-300 border-4 border-black p-6 shadow-[6px_6px_0px_0px_#000] transform rotate-2 hover:rotate-0 transition-transform duration-300">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 border-4 border-black flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_0px_0px_#000] transform -rotate-12">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h4 className="font-black text-black text-lg mb-2">TEAM PLAYER</h4>
            <p className="text-sm font-bold text-black mb-4">Collaborate on 5+ workspaces</p>
            <div className="mt-4">
              {stats && stats.totalWorkspaces >= 5 ? (
                <span className="text-sm bg-green-400 text-black font-black px-4 py-2 border-3 border-black shadow-[3px_3px_0px_0px_#000] transform rotate-1">
                  🎉 EARNED!
                </span>
              ) : (
                <span className="text-sm bg-gray-300 text-black font-black px-4 py-2 border-3 border-black shadow-[3px_3px_0px_0px_#000]">
                  {stats ? `${stats.totalWorkspaces} / 5 WORKSPACES` : 'LOCKED'}
                </span>
              )}
            </div>
          </div>

          <div className="text-center bg-gradient-to-br from-green-200 to-teal-300 border-4 border-black p-6 shadow-[6px_6px_0px_0px_#000] transform -rotate-1 hover:rotate-0 transition-transform duration-300">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-teal-500 border-4 border-black flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_0px_0px_#000] transform rotate-6">
              <Zap className="w-10 h-10 text-white" />
            </div>
            <h4 className="font-black text-black text-lg mb-2">STREAK MASTER</h4>
            <p className="text-sm font-bold text-black mb-4">Maintain a 7-day active streak</p>
            <div className="mt-4">
              {stats && stats.streakDays >= 7 ? (
                <span className="text-sm bg-green-400 text-black font-black px-4 py-2 border-3 border-black shadow-[3px_3px_0px_0px_#000] transform -rotate-2">
                  🎉 EARNED!
                </span>
              ) : (
                <span className="text-sm bg-gray-300 text-black font-black px-4 py-2 border-3 border-black shadow-[3px_3px_0px_0px_#000]">
                  {stats ? `${stats.streakDays} / 7 DAYS` : 'LOCKED'}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
