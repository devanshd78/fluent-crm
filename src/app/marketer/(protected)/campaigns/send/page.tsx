'use client'

import { useEffect, useState, useCallback } from 'react'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { get, post } from '@/lib/api'

const MySwal = withReactContent(Swal)

type Activity = { _id: string; name: string; activityId: string }
type Template = { _id: string; name: string; subject: string; content: string }
type PreviousMail = { _id: string; descriptionId: string; description: string }
type Contact = { _id: string; email: string; name?: string }

export default function CampaignPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [previousMails, setPreviousMails] = useState<PreviousMail[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])

  const [selectedActivityId, setSelectedActivityId] = useState<string>('')
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const [selectedPreviousMailId, setSelectedPreviousMailId] = useState<string>('')

  const [subject, setSubject] = useState<string>('')
  const [message, setMessage] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [contactsLoading, setContactsLoading] = useState<boolean>(false)

  const showSwal = useCallback((icon: 'success' | 'error', title: string) => {
    MySwal.fire({ icon, title, timer: 1800, timerProgressBar: true, showConfirmButton: false, position: 'top' })
  }, [])

  useEffect(() => {
    const fetchActivities = async () => {
      const marketerId = localStorage.getItem('userId')
      if (!marketerId) return showSwal('error', 'Marketer ID not found.')
      try {
        const res = await get('/activity/select-campaign', { marketerId })
        setActivities(res.data || [])
      } catch {
        showSwal('error', 'Failed to load activities.')
      }
    }
    fetchActivities()
  }, [showSwal])

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await get('/template/list')
        setTemplates(res.data || [])
      } catch {
        showSwal('error', 'Failed to load templates.')
      }
    }
    fetchTemplates()
  }, [showSwal])

  useEffect(() => {
    if (!selectedActivityId) {
      setPreviousMails([])
      setContacts([])
      return
    }
    const fetchPreviousMails = async () => {
      try {
        const res = await get('/mail/description/list', { activityId: selectedActivityId })
        setPreviousMails(res.data || [])
      } catch {
        showSwal('error', 'Failed to load previous mails.')
      }
    }
    fetchPreviousMails()

    const fetchContacts = async () => {
      setContactsLoading(true)
      try {
        const res = await post('/activity/get-contacts', { activityId: selectedActivityId })
        setContacts(res.status === 'success' ? res.data : [])
      } catch {
        showSwal('error', 'Failed to load contacts.')
      } finally {
        setContactsLoading(false)
      }
    }
    fetchContacts()
  }, [selectedActivityId, showSwal])

  useEffect(() => {
    if (selectedTemplateId) {
      const t = templates.find(t => t._id === selectedTemplateId)
      if (t) {
        setMessage(t.content)
        setSubject(t.subject)
        setSelectedPreviousMailId('')
      }
    }
  }, [selectedTemplateId, templates])

  useEffect(() => {
    if (selectedPreviousMailId) {
      const m = previousMails.find(m => m.descriptionId === selectedPreviousMailId)
      if (m) {
        setMessage(m.description)
        setSelectedTemplateId('')
      }
    }
  }, [selectedPreviousMailId, previousMails])

  const handleSend = async () => {
    if (!selectedActivityId || !subject.trim() || !message.trim()) {
      return showSwal('error', 'Please fill all fields')
    }
    setLoading(true)
    try {
      const res = await post('/mail/send', { activityId: selectedActivityId, subject, description: message, marketerId: localStorage.getItem('userId') })
      showSwal('success', res.data.message || 'Email sent!')
      handleReset()
    } catch (err: any) {
      showSwal('error', err.response?.data?.message || 'Failed to send email.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setSelectedActivityId('')
    setSelectedTemplateId('')
    setSelectedPreviousMailId('')
    setSubject('')
    setMessage('')
  }

  return (
    <div className="mx-auto p-6 bg-white rounded-xl shadow-lg max-w-5xl">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Launch Email Campaign</h1>
      <Card className="shadow border">
        <CardContent className="space-y-8">
          {/* Step 1: Choose Activity */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Select Activity</label>
            <Select onValueChange={setSelectedActivityId} value={selectedActivityId}>
              <SelectTrigger className="w-full border-gray-300 focus:ring-2 focus:ring-blue-500">
                <SelectValue placeholder="Choose an activity" />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-auto">
                {activities.length > 0 ? (
                  activities.map(act => (
                    <SelectItem key={act._id} value={act.activityId}>{act.name}</SelectItem>
                  ))
                ) : null}
              </SelectContent>
            </Select>
          </div>

          {selectedActivityId && (
            <>
              {/* Step 2: Choose Template or Previous Mail */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Select Template</label>
                  <Select onValueChange={setSelectedTemplateId} value={selectedTemplateId}>
                    <SelectTrigger className="border-gray-300 focus:ring-2 focus:ring-blue-500">
                      <SelectValue placeholder="Choose a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.length > 0 ? (
                        templates.map(t => <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>)
                      ) : null}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Step 3: Contacts */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Contacts</label>
                {contactsLoading ? (
                  <p className="text-sm text-gray-500">Loading contacts...</p>
                ) : contacts.length > 0 ? (
                  <div className="flex flex-wrap gap-2 bg-blue-50 p-4 rounded-md border border-blue-200">
                    {contacts.map(c => (
                      <span key={c._id} title={c.name ? `${c.name} <${c.email}>` : c.email} className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                        {c.email}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No contacts for this activity.</p>
                )}
              </div>

              {/* Step 4: Compose */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-semibold text-gray-700">Subject</label>
                  <Input id="subject" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Email subject" className="border-gray-300 focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-semibold text-gray-700">Message</label>
                  <Textarea id="message" rows={6} value={message} onChange={e => setMessage(e.target.value)} placeholder="Email content" className="border-gray-300 focus:ring-2 focus:ring-blue-500" />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-4 pt-4">
                  <Button variant="outline" onClick={handleReset} disabled={loading}>Reset</Button>
                  <Button onClick={handleSend} disabled={loading} className="bg-blue-600 hover:bg-blue-700">{loading ? 'Sending...' : 'Send Email'}</Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
