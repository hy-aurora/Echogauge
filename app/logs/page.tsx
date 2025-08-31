'use client';
import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Calendar, Tag } from "lucide-react"
import { format } from "date-fns"

export default function PersonalLogsPage() {
  const logs = useQuery(api.personalLogs.getAll)
  const createLog = useMutation(api.personalLogs.create)
  const updateLog = useMutation(api.personalLogs.update)
  const deleteLog = useMutation(api.personalLogs.remove)

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingLog, setEditingLog] = useState<any>(null)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    tags: [] as string[],
    mood: "",
  })

  const handleCreate = async () => {
    if (!formData.title.trim() || !formData.content.trim()) return

    await createLog({
      title: formData.title,
      content: formData.content,
      tags: formData.tags,
      mood: formData.mood || undefined,
    })

    setFormData({ title: "", content: "", tags: [], mood: "" })
    setIsCreateOpen(false)
  }

  const handleUpdate = async () => {
    if (!editingLog || !formData.title.trim() || !formData.content.trim()) return

    await updateLog({
      logId: editingLog._id,
      title: formData.title,
      content: formData.content,
      tags: formData.tags,
      mood: formData.mood || undefined,
    })

    setEditingLog(null)
    setFormData({ title: "", content: "", tags: [], mood: "" })
  }

  const handleDelete = async (logId: string) => {
    if (confirm("Are you sure you want to delete this log?")) {
      await deleteLog({ logId: logId as any })
    }
  }

  const openEditDialog = (log: any) => {
    setEditingLog(log)
    setFormData({
      title: log.title,
      content: log.content,
      tags: log.tags || [],
      mood: log.mood || "",
    })
  }

  const addTag = (tag: string) => {
    if (tag.trim() && !formData.tags.includes(tag.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag.trim()] }))
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }))
  }

  const moodOptions = ["😊 Happy", "😢 Sad", "😠 Angry", "😴 Tired", "🤔 Thoughtful", "🎉 Excited", "😌 Peaceful", "🤪 Crazy"]

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Personal Logs</h1>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Log
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Log</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Log Title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
              <Textarea
                placeholder="What's on your mind?"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={6}
              />
              <div>
                <label className="text-sm font-medium">Tags</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                      {tag} ×
                    </Badge>
                  ))}
                  <Input
                    placeholder="Add tag..."
                    className="w-24"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addTag((e.target as HTMLInputElement).value)
                        ;(e.target as HTMLInputElement).value = ''
                      }
                    }}
                  />
                </div>
              </div>
              <Select value={formData.mood} onValueChange={(value) => setFormData(prev => ({ ...prev, mood: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="How are you feeling?" />
                </SelectTrigger>
                <SelectContent>
                  {moodOptions.map(mood => (
                    <SelectItem key={mood} value={mood}>
                      {mood}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleCreate} className="w-full">
                Create Log
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {logs?.map((log) => (
          <Card key={log._id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{log.title}</CardTitle>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <Calendar className="w-4 h-4 mr-1" />
                    {format(new Date(log.createdAt), "MMM d, yyyy")}
                    {log.mood && <span className="ml-2">{log.mood}</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(log)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(log._id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                {log.content}
              </p>
              {log.tags && log.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {log.tags.map((tag: string) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingLog} onOpenChange={() => setEditingLog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Log</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Log Title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            />
            <Textarea
              placeholder="What's on your mind?"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              rows={6}
            />
            <div>
              <label className="text-sm font-medium">Tags</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                    {tag} ×
                  </Badge>
                ))}
                <Input
                  placeholder="Add tag..."
                  className="w-24"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addTag((e.target as HTMLInputElement).value)
                      ;(e.target as HTMLInputElement).value = ''
                    }
                  }}
                />
              </div>
            </div>
            <Select value={formData.mood} onValueChange={(value) => setFormData(prev => ({ ...prev, mood: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="How are you feeling?" />
              </SelectTrigger>
              <SelectContent>
                {moodOptions.map(mood => (
                  <SelectItem key={mood} value={mood}>
                    {mood}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleUpdate} className="w-full">
              Update Log
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
