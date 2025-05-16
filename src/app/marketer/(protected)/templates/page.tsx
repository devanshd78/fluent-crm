'use client'

import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { get, post } from '@/lib/api'

const MySwal = withReactContent(Swal)

export default function MailTemplatesPage() {
  const [templates, setTemplates] = useState<{ _id: string; name: string; content: string }[]>([])
  const [newName, setNewName] = useState('')
  const [newContent, setNewContent] = useState('')

  const fetchTemplates = async () => {
    try {
      const res = await get('/template/list')
      setTemplates(res.data || [])
    } catch (err) {
      MySwal.fire({
        icon: 'error',
        title: 'Failed to load templates.',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        position: 'top-end',
        toast: true,
      })
    }
  }

  const handleCreateTemplate = async () => {
    if (!newName.trim() || !newContent.trim()) {
      return MySwal.fire({
        icon: 'warning',
        title: 'All fields are required.',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        position: 'top-end',
        toast: true,
      })
    }
    try {
      await post('/template/create', { name: newName, content: newContent })
      MySwal.fire({
        icon: 'success',
        title: 'Template created successfully!',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        position: 'top-end',
        toast: true,
      })
      setNewName('')
      setNewContent('')
      fetchTemplates()
    } catch (err) {
      MySwal.fire({
        icon: 'error',
        title: 'Failed to create template.',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        position: 'top-end',
        toast: true,
      })
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Mail Templates</h1>
      </div>

      <div className="grid gap-4 mb-6">
        {templates.map((template) => (
          <div
            key={template._id}
            className="p-4 rounded border bg-gray-50"
          >
            <h2 className="font-medium text-lg">{template.name}</h2>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{template.content}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-medium">Create New Template</h2>
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
    </div>
  )
}
