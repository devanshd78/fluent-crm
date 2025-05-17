'use client'

import { useEffect, useState } from 'react'
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

export default function CampaignPage() {
    const [activities, setActivities] = useState<{ _id: string; name: string; activityId: string }[]>([])
    const [templates, setTemplates] = useState<{ _id: string; name: string; content: string }[]>([])
    const [previousMails, setPreviousMails] = useState<{ _id: string; descriptionId: string; description: string }[]>([])
    const [contacts, setContacts] = useState<{ _id: string; email: string; name?: string }[]>([])

    const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null)
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
    const [selectedPreviousMailId, setSelectedPreviousMailId] = useState<string | null>(null)

    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)

    const showSwal = (icon: 'success' | 'error', title: string) => {
        MySwal.fire({
            icon,
            title,
            timer: 1800,
            timerProgressBar: true,
            showConfirmButton: false,
            position: 'top',
        })
    }

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
    }, [])

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
    }, [])

    useEffect(() => {
        if (!selectedActivityId) {
            setPreviousMails([])
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
    }, [selectedActivityId])

    useEffect(() => {
        if (!selectedActivityId) {
            setContacts([])
            return
        }
        const fetchContacts = async () => {
            try {
                const res = await post('/activity/get-contacts', { activityId: selectedActivityId })
                setContacts(res.status === 'success' ? res.data : [])
            } catch {
                showSwal('error', 'Failed to load contacts.')
            }
        }
        fetchContacts()
    }, [selectedActivityId])

    useEffect(() => {
        if (selectedTemplateId) {
            const t = templates.find(t => t._id === selectedTemplateId)
            if (t) {
                setMessage(t.content)
                setSelectedPreviousMailId(null)
            }
        }
    }, [selectedTemplateId, templates])

    useEffect(() => {
        if (selectedPreviousMailId) {
            const m = previousMails.find(m => m.descriptionId === selectedPreviousMailId)
            if (m) {
                setMessage(m.description)
                setSelectedTemplateId(null)
            }
        }
    }, [selectedPreviousMailId, previousMails])

    const handleSend = async () => {
        if (!selectedActivityId || !subject.trim() || !message.trim()) {
            return showSwal('error', 'Please fill all fields')
        }

        try {
            setLoading(true)
            const res = await post('/mail/send', {
                activityId: selectedActivityId,
                subject,
                description: message,
            })
            showSwal('success', res.data.message || 'Email sent!')
            setSubject('')
            setMessage('')
            setSelectedTemplateId(null)
            setSelectedPreviousMailId(null)
        } catch (err: any) {
            showSwal('error', err.response?.data?.message || 'Failed to send email.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="mx-auto p-4 sm:p-6 md:p-10 bg-white rounded-lg shadow">
            <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">Launch Email Campaign</h1>
            <Card className="shadow border">
                <CardContent className="p-6 space-y-6">
                    {/* Activity Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Select Activity</label>
                        <Select onValueChange={setSelectedActivityId} value={selectedActivityId || ''}>
                            <SelectTrigger className="border-gray-300 focus:ring-2 focus:ring-blue-500">
                                <SelectValue placeholder="Choose an activity" />
                            </SelectTrigger>
                            <SelectContent>
                                {activities.map(act => (
                                    <SelectItem key={act._id} value={act.activityId}>
                                        {act.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedActivityId && (
                        <>
                            {/* Template & Previous Mail */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Select Template</label>
                                    <Select onValueChange={setSelectedTemplateId} value={selectedTemplateId || ''}>
                                        <SelectTrigger className="border-gray-300 focus:ring-2 focus:ring-blue-500">
                                            <SelectValue placeholder="Choose a template" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {templates.map(template => (
                                                <SelectItem key={template._id} value={template._id}>
                                                    {template.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Duplicate from Previous Mail</label>
                                    <Select onValueChange={setSelectedPreviousMailId} value={selectedPreviousMailId || ''}>
                                        <SelectTrigger className="border-gray-300 focus:ring-2 focus:ring-blue-500">
                                            <SelectValue placeholder="Choose previous mail" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {previousMails.length === 0 ? (
                                                <SelectItem value="none" disabled>
                                                    No previous mails found
                                                </SelectItem>
                                            ) : (
                                                previousMails.map(mail => (
                                                    <SelectItem key={mail.descriptionId} value={mail.descriptionId}>
                                                        {mail.description.slice(0, 40)}...
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Contacts List */}
                            {contacts.length > 0 && (
                                <div>
                                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Contacts</label>
                                    <div className="flex flex-wrap gap-2 bg-blue-50 p-4 rounded-md border border-blue-200">
                                        {contacts.map(contact => (
                                            <span
                                                key={contact._id}
                                                title={contact.name ? `${contact.name} <${contact.email}>` : contact.email}
                                                className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
                                            >
                                                {contact.email}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Subject */}
                            <div className="space-y-2">
                                <label htmlFor="subject" className="text-sm font-semibold text-gray-700">
                                    Subject
                                </label>
                                <Input
                                    id="subject"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="Email subject"
                                    className="border-gray-300 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Message */}
                            <div className="space-y-2">
                                <label htmlFor="message" className="text-sm font-semibold text-gray-700">
                                    Message
                                </label>
                                <Textarea
                                    id="message"
                                    rows={6}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Email content"
                                    className="border-gray-300 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="pt-4">
                                <Button
                                    onClick={handleSend}
                                    disabled={loading}
                                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                                >
                                    {loading ? 'Sending...' : 'Send Email'}
                                </Button>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
