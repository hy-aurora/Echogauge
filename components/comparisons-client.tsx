"use client"
import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Plus, 
  Trash2, 
  BarChart3, 
  TrendingUp, 
  FileText, 
  Target,
  Calendar,
  Tag
} from "lucide-react"
import { format } from "date-fns"

export function ComparisonsClient() {
  const comparisons = useQuery(api.comparisons.getAll)
  const sessions = useQuery(api.history.list, { limit: 100 })
  const createComparison = useMutation(api.comparisons.create)
  const deleteComparison = useMutation(api.comparisons.remove)

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedAnalyses, setSelectedAnalyses] = useState<string[]>([])
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })

  const handleCreate = async () => {
    if (!formData.name.trim() || selectedAnalyses.length < 2) return

    try {
      await createComparison({
        name: formData.name,
        description: formData.description || undefined,
        analysisIds: selectedAnalyses as any,
      })

      setFormData({ name: "", description: "" })
      setSelectedAnalyses([])
      setIsCreateOpen(false)
    } catch (error) {
      console.error("Failed to create comparison:", error)
    }
  }

  const handleDelete = async (comparisonId: string) => {
    if (confirm("Are you sure you want to delete this comparison?")) {
      await deleteComparison({ comparisonId: comparisonId as any })
    }
  }

  const toggleAnalysis = (analysisId: string) => {
    setSelectedAnalyses(prev => 
      prev.includes(analysisId) 
        ? prev.filter(id => id !== analysisId)
        : [...prev, analysisId]
    )
  }

  const availableSessions = sessions?.items || []

  return (
    <div className="space-y-6">
      {/* Create Comparison Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Your Comparisons</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Comparison
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Comparison</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Comparison Name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
              <Textarea
                placeholder="Description (optional)"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
              
              <div>
                <h3 className="font-medium mb-3">Select Analyses to Compare (min 2)</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {availableSessions.map((session: any) => (
                    <div key={session._id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Checkbox
                        checked={selectedAnalyses.includes(session._id)}
                        onCheckedChange={() => toggleAnalysis(session._id)}
                      />
                      <div className="flex-1">
                        <div className="font-medium">
                          {format(new Date(session.createdAt), "MMM d, yyyy")}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {(session.metrics as any)?.wordCount || 0} words • 
                          {(session.metrics as any)?.readability || 0}% readability
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  Selected: {selectedAnalyses.length} analyses
                </div>
              </div>

              <Button 
                onClick={handleCreate} 
                disabled={!formData.name.trim() || selectedAnalyses.length < 2}
                className="w-full"
              >
                Create Comparison
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Comparisons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {comparisons?.map((comparison) => {
          const data = comparison.comparisonData as any
          return (
            <Card key={comparison._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{comparison.name}</CardTitle>
                    {comparison.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {comparison.description}
                      </p>
                    )}
                    <div className="flex items-center text-sm text-muted-foreground mt-2">
                      <Calendar className="w-4 h-4 mr-1" />
                      {format(new Date(comparison.createdAt), "MMM d, yyyy")}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(comparison._id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {data?.totalAnalyses || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Documents</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {Math.round(data?.avgReadability || 0)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Avg Readability</div>
                  </div>
                </div>

                {/* Readability Range */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Readability Range</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{data?.readabilityRange?.min || 0}%</span>
                    <span>{data?.readabilityRange?.max || 0}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 mt-1">
                    <div 
                      className="bg-primary h-2 rounded-full"
                      style={{
                        width: `${((data?.readabilityRange?.max || 0) - (data?.readabilityRange?.min || 0)) / 100 * 100}%`
                      }}
                    />
                  </div>
                </div>

                {/* Common Suggestions */}
                {data?.commonSuggestions && data.commonSuggestions.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Tag className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Common Suggestions</span>
                    </div>
                    <div className="space-y-1">
                      {data.commonSuggestions.slice(0, 2).map((suggestion: any, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {suggestion.suggestion} ({suggestion.count})
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tone Variety */}
                {data?.toneVariety && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Tone Variety</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {data.toneVariety.uniqueTones} unique tones
                      </Badge>
                      {data.toneVariety.mostCommonTone && (
                        <Badge variant="outline">
                          Most: {data.toneVariety.mostCommonTone}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <Button variant="outline" className="w-full">
                  View Details
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {comparisons?.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No comparisons yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first comparison to analyze multiple documents together
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Comparison
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
