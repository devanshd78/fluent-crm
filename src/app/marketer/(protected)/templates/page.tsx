'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { get, post } from '@/lib/api' // your api functions

export default function MailTemplatesPage() {
  const [templates, setTemplates] = useState<{ _id: string; name: string; content: string }[]>([])
  const [selectedContent, setSelectedContent] = useState('')
  const [open, setOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newContent, setNewContent] = useState('')

  const fetchTemplates = async () => {
    try {
      const res = await get('/template/list') // adjust to your backend endpoint
      setTemplates(res.data || [])
    } catch (err) {
      toast.error('Failed to load templates.')
    }
  }

  const handleCreateTemplate = async () => {
    if (!newName.trim() || !newContent.trim()) return toast.error('All fields are required.')
    try {
      await post('/template/create', { name: newName, content: newContent })
      toast.success('Template created successfully!')
      setOpen(false)
      setNewName('')
      setNewContent('')
      fetchTemplates()
    } catch (err) {
      toast.error('Failed to create template.')
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Mail Templates</h1>
        <Button onClick={() => setOpen(true)}>+ Create Template</Button>
      </div>

      <div className="grid gap-4 mb-6">
        {templates.map((template) => (
          <div
            key={template._id}
            className="p-4 rounded border cursor-pointer hover:bg-gray-50"
            onClick={() => setSelectedContent(template.content)}
          >
            <h2 className="font-medium text-lg">{template.name}</h2>
            <p className="text-sm text-gray-500 truncate">{template.content}</p>
          </div>
        ))}
      </div>

      <div>
        <label className="block mb-2 font-medium">Selected Template Content</label>
        <Textarea rows={8} value={selectedContent} onChange={(e) => setSelectedContent(e.target.value)} />
      </div>

      {/* Modal for creating a new template */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Mail Template</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <Input
              placeholder="Template Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <Textarea
              placeholder="Template Content"
              rows={6}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
            />
            <Button onClick={handleCreateTemplate}>Save Template</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}