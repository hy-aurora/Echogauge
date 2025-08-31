"use client"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts"
import { 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  Clock, 
  Target, 
  Activity,
  Calendar,
  BarChart3
} from "lucide-react"
import { format } from "date-fns"

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export function AnalyticsClient() {
  const historyStats = useQuery(api.history.getStats)
  const sessionsData = useQuery(api.history.list, { limit: 100 })
  const logsData = useQuery(api.personalLogs.getAll)

  const sessions = sessionsData?.items || []
  const logs = logsData || []

  // Process data for charts
  const readabilityDistribution = sessions.reduce((acc: any, session: any) => {
    const readability = Math.round((session.metrics as any)?.readability || 0)
    const range = readability < 30 ? '0-30' : readability < 60 ? '30-60' : '60-100'
    acc[range] = (acc[range] || 0) + 1
    return acc
  }, {})

  const readabilityData = Object.entries(readabilityDistribution).map(([range, count]) => ({
    range,
    count
  }))

  // Weekly activity data
  const weeklyData = sessions.reduce((acc: any, session: any) => {
    const date = format(new Date(session.createdAt), 'yyyy-MM-dd')
    acc[date] = (acc[date] || 0) + 1
    return acc
  }, {})

  const weeklyChartData = Object.entries(weeklyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7)
    .map(([date, count]) => ({
      date: format(new Date(date), 'MMM dd'),
      sessions: count
    }))

  // Word count distribution
  const wordCountData = sessions.reduce((acc: any, session: any) => {
    const wordCount = (session.metrics as any)?.wordCount || 0
    const range = wordCount < 500 ? '0-500' : wordCount < 2000 ? '500-2000' : '2000+'
    acc[range] = (acc[range] || 0) + 1
    return acc
  }, {})

  const wordCountChartData = Object.entries(wordCountData).map(([range, count]) => ({
    range,
    count
  }))

  // Calculate trends
  const recentSessions = sessions.filter((s: any) => 
    Date.now() - s.createdAt < 7 * 24 * 60 * 60 * 1000
  )
  const previousWeekSessions = sessions.filter((s: any) => {
    const age = Date.now() - s.createdAt
    return age >= 7 * 24 * 60 * 60 * 1000 && age < 14 * 24 * 60 * 60 * 1000
  })

  const recentAvgReadability = recentSessions.length > 0
    ? recentSessions.reduce((sum: number, s: any) => sum + ((s.metrics as any)?.readability || 0), 0) / recentSessions.length
    : 0
  const previousAvgReadability = previousWeekSessions.length > 0
    ? previousWeekSessions.reduce((sum: number, s: any) => sum + ((s.metrics as any)?.readability || 0), 0) / previousWeekSessions.length
    : 0

  const readabilityTrend = recentAvgReadability - previousAvgReadability

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{historyStats?.totalAnalyses || 0}</div>
            <p className="text-xs text-muted-foreground">
              All time analyses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Readability</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{historyStats?.avgReadability || 0}%</div>
            <div className="flex items-center text-xs">
              {readabilityTrend > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={readabilityTrend > 0 ? "text-green-500" : "text-red-500"}>
                {Math.abs(readabilityTrend).toFixed(1)}% from last week
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Words</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(historyStats?.totalWords || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Words analyzed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Personal Logs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.length}</div>
            <p className="text-xs text-muted-foreground">
              Journal entries
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Weekly Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sessions" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Readability Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Readability Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={readabilityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ range, percent }) => `${range} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {readabilityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Word Count Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Word Count Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={wordCountChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sessions.slice(0, 5).map((session: any) => (
                <div key={session._id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {format(new Date(session.createdAt), "MMM d, yyyy")}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {(session.metrics as any)?.wordCount || 0} words • 
                      {(session.metrics as any)?.readability || 0}% readability
                    </div>
                  </div>
                  <Badge variant="outline">
                    {format(new Date(session.createdAt), "HH:mm")}
                  </Badge>
                </div>
              ))}
              {sessions.length === 0 && (
                <div className="text-center text-sm text-muted-foreground py-8">
                  No sessions yet. Upload a file to get started!
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
