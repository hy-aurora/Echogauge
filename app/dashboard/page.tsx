import DashboardClient from "@/components/dashboard-client"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, TrendingUp, Calendar, Plus, BarChart3, BookOpen, Upload, Sparkles } from "lucide-react"
import Link from "next/link"
import { QuickAnalyzer } from "@/components/quick-analyzer"
import { DashboardStats } from "@/components/dashboard-stats"

export default async function Page() {
  const user = await currentUser()
  if (!user) redirect("/auth")

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Welcome back, {user.firstName || user.username || 'User'}!
            </h1>
            <p className="text-lg text-muted-foreground">
              Analyze your content and get AI-powered insights
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild size="lg" className="shadow-lg">
              <Link href="/logs">
                <BookOpen className="w-5 h-5 mr-2" />
                New Log
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="#upload">
                <Upload className="w-5 h-5 mr-2" />
                Upload Content
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <Suspense fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-3">
                  <div className="h-4 bg-muted rounded w-24"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-muted rounded w-16"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        }>
          <DashboardStats />
        </Suspense>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section - Takes 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-card to-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button asChild variant="outline" className="h-24 flex-col gap-3 text-left p-6 hover:bg-primary/5 transition-colors">
                    <Link href="#upload">
                      <Upload className="w-8 h-8 text-primary" />
                      <div>
                        <div className="font-semibold">Upload & Analyze</div>
                        <div className="text-sm text-muted-foreground">PDF, images, documents</div>
                      </div>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-24 flex-col gap-3 text-left p-6 hover:bg-primary/5 transition-colors">
                    <Link href="/logs">
                      <BookOpen className="w-8 h-8 text-primary" />
                      <div>
                        <div className="font-semibold">Write Log</div>
                        <div className="text-sm text-muted-foreground">Personal notes & insights</div>
                      </div>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Upload Area */}
            <div id="upload">
              <DashboardClient />
            </div>
          </div>

          {/* Sidebar - Takes 1 column */}
          <div className="space-y-6">
            {/* Quick Text Analyzer */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Quick Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <QuickAnalyzer />
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Content analyzed</div>
                      <div className="text-xs text-muted-foreground">2 minutes ago</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">New log created</div>
                      <div className="text-xs text-muted-foreground">1 hour ago</div>
                    </div>
                  </div>
                </div>
                <Button asChild variant="ghost" className="w-full mt-4">
                  <Link href="/sessions">View All Activity</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
