'use client'

import { useEffect, useState, useMemo, Fragment } from 'react'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { get, post } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ChevronDown, ChevronUp, Edit2, Trash2, Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const MySwal = withReactContent(Swal)

interface Template {
  _id: string
  name: string
  subject?: string
  content: string
}

export default function MailTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [formOpen, setFormOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  // Form fields
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => { fetchTemplates() }, [])

  const fetchTemplates = async () => {
    try {
      const res = await get('/template/list')
      setTemplates(res.data || [])
    } catch {
      MySwal.fire({ icon: 'error', title: 'Failed to load templates.', timer: 2000, toast: true })
    }
  }

  const resetForm = () => {
    setName('')
    setSubject('')
    setContent('')
    setEditingId(null)
  }

  const validate = () => {
    if (!name.trim() || !subject.trim() || !content.trim()) {
      MySwal.fire({ icon: 'warning', title: 'All fields required.', timer: 2000, toast: true })
      return false
    }
    return true
  }

  const handleSave = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      if (editingId) {
        await post('/template/update', { templateId: editingId, name, subject, content })
        MySwal.fire({ icon: 'success', title: 'Updated!', timer: 2000, toast: true })
      } else {
        await post('/template/create', { name, subject, content })
        MySwal.fire({ icon: 'success', title: 'Created!', timer: 2000, toast: true })
      }
      fetchTemplates()
      resetForm()
      setFormOpen(false)
    } catch {
      MySwal.fire({ icon: 'error', title: 'Save failed.', timer: 2000, toast: true })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (id: string) => {
    MySwal.fire({ title: 'Delete template?', icon: 'warning', showCancelButton: true }).then(async res => {
      if (res.isConfirmed) {
        try {
          await post('/template/delete', { templateId: id })
          MySwal.fire({ icon: 'success', title: 'Deleted!', timer: 2000, toast: true })
          fetchTemplates()
        } catch {
          MySwal.fire({ icon: 'error', title: 'Delete failed.', timer: 2000, toast: true })
        }
      }
    })
  }

  const openEdit = (tpl: Template) => {
    setEditingId(tpl._id)
    setName(tpl.name)
    setSubject(tpl.subject || '')
    setContent(tpl.content)
    setFormOpen(true)
  }

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const copy = new Set(prev)
      copy.has(id) ? copy.delete(id) : copy.add(id)
      return copy
    })
  }

  const filtered = useMemo(
    () => templates.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || (t.subject || '').toLowerCase().includes(search.toLowerCase())),
    [templates, search]
  )

  return (
    <Card className="space-y-6">
      <CardHeader className="flex justify-between items-center">
        <CardTitle>Mail Templates</CardTitle>
        <div className="flex space-x-2">
          <Input
            placeholder="Search by name or subject..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <Button variant="outline" size="sm" onClick={() => { setFormOpen(!formOpen); resetForm() }}>
            <Plus className="mr-1" size={14} /> {formOpen ? 'Cancel' : 'New'}
          </Button>
        </div>
      </CardHeader>

      <AnimatePresence>
        {formOpen && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-gray-50 p-4 rounded-md border"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
              <Input placeholder="Subject" value={subject} onChange={e => setSubject(e.target.value)} />
              <Textarea
                placeholder="Content"
                rows={4}
                value={content}
                onChange={e => setContent(e.target.value)}
                className="md:col-span-2"
              />
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={() => { setFormOpen(false); resetForm() }}>
                Cancel
              </Button>
              <Button className="ml-2" onClick={handleSave} disabled={loading}>
                {loading ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/3">Name</TableHead>
              <TableHead className="w-1/3">Subject</TableHead>
              <TableHead className="text-center w-1/6">Toggle</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(tpl => (
              <Fragment key={tpl._id}>
                <TableRow className="hover:bg-gray-100">
                  <TableCell>{tpl.name}</TableCell>
                  <TableCell>{tpl.subject || '-'}</TableCell>
                  <TableCell className="flex justify-center">
                    <Button variant="ghost" onClick={() => toggleExpand(tpl._id)}>
                      {expandedIds.has(tpl._id) ? <ChevronUp /> : <ChevronDown />}
                    </Button>
                  </TableCell>
                </TableRow>
                {expandedIds.has(tpl._id) && (
                  <TableRow className="bg-gray-50">
                    <TableCell colSpan={3} className="px-4 py-3 space-y-3">
                      <pre className="whitespace-pre-wrap text-gray-700">{tpl.content}</pre>
                      <div className="flex justify-end space-x-2">
                        <Button size="sm" variant="outline" onClick={() => openEdit(tpl)}>
                          <Edit2 size={14} />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(tpl._id)}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-gray-500 py-4">
                  No templates found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}