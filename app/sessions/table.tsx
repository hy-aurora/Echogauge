"use client"
import { useState, useMemo } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Search, Download, Filter, TrendingUp, Calendar, FileText, BarChart3 } from "lucide-react"
import { format } from "date-fns"

export function SessionsTable() {
  const data = useQuery(api.history.list, { limit: 100 })
  const rows = data?.items || []

  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [filterPeriod, setFilterPeriod] = useState("all")

  const filteredAndSortedRows = useMemo(() => {
    let filtered = rows.filter((row: any) => {
      const matchesSearch = !searchTerm ||
        (row.metrics?.wordCount?.toString().includes(searchTerm) ||
         row.metrics?.readability?.toString().includes(searchTerm) ||
         format(new Date(row.createdAt), "PPP").toLowerCase().includes(searchTerm.toLowerCase()))

      const now = new Date()
      const rowDate = new Date(row.createdAt)
      let matchesPeriod = true

      switch (filterPeriod) {
        case "today":
          matchesPeriod = rowDate.toDateString() === now.toDateString()
          break
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          matchesPeriod = rowDate >= weekAgo
          break
        case "month":
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          matchesPeriod = rowDate >= monthAgo
          break
      }

      return matchesSearch && matchesPeriod
    })

    filtered.sort((a: any, b: any) => {
      let aVal: any, bVal: any

      switch (sortBy) {
        case "createdAt":
          aVal = a.createdAt
          bVal = b.createdAt
          break
        case "wordCount":
          aVal = a.metrics?.wordCount || 0
          bVal = b.metrics?.wordCount || 0
          break
        case "readability":
          aVal = a.metrics?.readability || 0
          bVal = b.metrics?.readability || 0
          break
        default:
          aVal = a.createdAt
          bVal = b.createdAt
      }

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

    return filtered
  }, [rows, searchTerm, sortBy, sortOrder, filterPeriod])

  const stats = useMemo(() => {
    const totalSessions = filteredAndSortedRows.length
    const avgReadability = filteredAndSortedRows.length > 0
      ? filteredAndSortedRows.reduce((sum: number, row: any) => sum + (row.metrics?.readability || 0), 0) / filteredAndSortedRows.length
      : 0
    const totalWords = filteredAndSortedRows.reduce((sum: number, row: any) => sum + (row.metrics?.wordCount || 0), 0)

    return { totalSessions, avgReadability: Math.round(avgReadability), totalWords }
  }, [filteredAndSortedRows])

  const exportData = () => {
    const csvContent = [
      ["Date", "Words", "Readability", "Session Link"],
      ...filteredAndSortedRows.map((row: any) => [
        format(new Date(row.createdAt), "yyyy-MM-dd HH:mm:ss"),
        row.metrics?.wordCount || 0,
        row.metrics?.readability || 0,
        `${window.location.origin}/session/${row._id}`
      ])
    ].map(row => row.join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `sessions-export-${format(new Date(), "yyyy-MM-dd")}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getReadabilityColor = (score: number) => {
    if (score >= 70) return "bg-green-500"
    if (score >= 50) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Sessions</p>
              <p className="text-2xl font-bold">{stats.totalSessions}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg Readability</p>
              <p className="text-2xl font-bold">{stats.avgReadability}%</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Words</p>
              <p className="text-2xl font-bold">{stats.totalWords.toLocaleString()}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 items-center flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search sessions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterPeriod} onValueChange={setFilterPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Date</SelectItem>
                <SelectItem value="wordCount">Words</SelectItem>
                <SelectItem value="readability">Readability</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            >
              {sortOrder === "asc" ? "↑" : "↓"}
            </Button>
          </div>
          <Button onClick={exportData} variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </Card>

      {/* Sessions Table */}
      <Card className="overflow-hidden">
        <div className="border-b p-4 text-sm font-medium flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Sessions ({filteredAndSortedRows.length})
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Words</TableHead>
              <TableHead>Readability</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedRows.map((r: any) => (
              <TableRow key={r._id}>
                <TableCell className="text-muted-foreground">
                  {format(new Date(r.createdAt), "MMM d, yyyy HH:mm")}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{r.metrics?.wordCount?.toLocaleString() ?? '-'}</span>
                    {r.metrics?.wordCount > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {r.metrics.wordCount > 500 ? "Long" : r.metrics.wordCount > 200 ? "Medium" : "Short"}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {r.metrics?.readability ? (
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getReadabilityColor(r.metrics.readability)}`} />
                      <span>{Math.round(r.metrics.readability)}%</span>
                    </div>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={r.status === "done" ? "default" : "secondary"}>
                    {r.status || "completed"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Link
                    className="text-primary underline-offset-4 hover:underline font-medium"
                    href={`/session/${r._id}`}
                  >
                    View Details →
                  </Link>
                </TableCell>
              </TableRow>
            ))}
            {filteredAndSortedRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">
                  {rows.length === 0 ? "No sessions yet. Upload a file to get started!" : "No sessions match your filters."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
