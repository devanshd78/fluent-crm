'use client'

import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { get, post } from '@/lib/api'

const MySwal = withReactContent(Swal)

export default function CampaignPage() {
    const [activities, setActivities] = useState<{ name: string; activityId: string }[]>([])
    const [templates, setTemplates] = useState<{ _id: string; name: string; content: string }[]>([])
    const [previousMails, setPreviousMails] = useState<{ _id: string; descriptionId: string; description: string }[]>([])

    const [contacts, setContacts] = useState<{ _id: string; email: string; name?: string }[]>([])

    const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null)
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
    const [selectedPreviousMailId, setSelectedPreviousMailId] = useState<string | null>(null)

    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)

    // Show Swal with timer & progress bar helper
    const showSwal = (icon: 'success' | 'error', title: string) => {
        MySwal.fire({
            icon,
            title,
            timer: 1500,
            timerProgressBar: true,
            showConfirmButton: false,
            position: 'top',
        })
    }

    // Fetch activity list on mount
    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const marketerId = localStorage.getItem('userId')
                if (!marketerId) {
                    showSwal('error', 'Marketer ID not found.')
                    return
                }

                const res = await get('/activity/select-campaign', {
                    marketerId,
                })

                setActivities(res.data || [])
            } catch (err) {
                console.error('Failed to load activities', err)
                showSwal('error', 'Failed to load activity list.')
            }
        }

        fetchActivities()
    }, [])

    // Fetch templates on mount
    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const res = await get('/template/list')
                setTemplates(res.data || [])
            } catch (err) {
                showSwal('error', 'Failed to load templates.')
            }
        }

        fetchTemplates()
    }, [])

    // Fetch previous mails when activity changes
    useEffect(() => {
        if (!selectedActivityId) {
            setPreviousMails([])
            setSelectedPreviousMailId(null)
            return
        }

        const fetchPreviousMails = async () => {
            try {
                const res = await get('/mail/description/list', { activityId: selectedActivityId })
                setPreviousMails(res.data || [])
            } catch (err) {
                console.error('Failed to load previous mails', err)
                showSwal('error', 'Failed to load previous mails.')
            }
        }

        fetchPreviousMails()
        setSelectedPreviousMailId(null)
    }, [selectedActivityId])

    // Fetch contacts when activity changes
    useEffect(() => {
        if (!selectedActivityId) {
            setContacts([])
            return
        }

        const fetchContacts = async () => {
            try {
                const res = await post('/activity/get-contacts', { activityId: selectedActivityId })
                if (res.status === 'success') {
                    setContacts(res.data || [])
                } else {
                    setContacts([])
                }
            } catch (err) {
                console.error('Failed to load contacts', err)
                showSwal('error', 'Failed to load contacts.')
            }
        }

        fetchContacts()
    }, [selectedActivityId])

    // When template changes, update message content and clear previous mail selection
    useEffect(() => {
        if (selectedTemplateId) {
            const template = templates.find((t) => t._id === selectedTemplateId)
            if (template) {
                setMessage(template.content)
                setSelectedPreviousMailId(null)
            }
        }
    }, [selectedTemplateId, templates])

    // When previous mail changes, update message content and clear template selection
    useEffect(() => {
        if (selectedPreviousMailId) {
            const prevMail = previousMails.find((m) => m.descriptionId === selectedPreviousMailId)
            if (prevMail) {
                setMessage(prevMail.description)
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
            console.error(err)
            showSwal('error', err.response?.data?.message || 'Failed to send email.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="mx-auto bg-white p-8 rounded-xl shadow-lg">
            <h1 className="text-3xl font-bold mb-8 text-gray-900">Launch Email Campaign</h1>

            <Card className="border border-gray-200 shadow-none">
                <CardContent className="p-8 space-y-8">
                    {/* Activity Select */}
                    <div className="flex flex-col">
                        <label htmlFor="activity" className="text-sm font-semibold text-gray-700 mb-2">
                            Select Activity
                        </label>
                        <Select
                            onValueChange={setSelectedActivityId}
                            value={selectedActivityId || ''}
                        >
                            <SelectTrigger
                                id="activity"
                                className="w-full border-gray-300 hover:border-blue-500 focus:ring-2 focus:ring-blue-400"
                            >
                                <SelectValue placeholder="Choose an activity" />
                            </SelectTrigger>
                            <SelectContent>
                                {activities.map((act) => (
                                    <SelectItem key={act.activityId} value={act.activityId}>
                                        {act.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedActivityId && (
                        <>
                            {/* Template & Previous Mail Selection in two columns */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                <div className="flex flex-col">
                                    <label htmlFor="template" className="text-sm font-semibold text-gray-700 mb-2">
                                        Select Template
                                    </label>
                                    <Select
                                        onValueChange={setSelectedTemplateId}
                                        value={selectedTemplateId || ''}
                                    >
                                        <SelectTrigger
                                            id="template"
                                            className="w-full border-gray-300 hover:border-blue-500 focus:ring-2 focus:ring-blue-400"
                                        >
                                            <SelectValue placeholder="Choose a template" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {templates.map((template) => (
                                                <SelectItem key={template._id} value={template._id}>
                                                    {template.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>


                                <div className="flex flex-col">
                                    <label htmlFor="previousMail" className="text-sm font-semibold text-gray-700 mb-2">
                                        Duplicate From Previous Mail
                                    </label>
                                    <Select
                                        onValueChange={setSelectedPreviousMailId}
                                        value={selectedPreviousMailId || ''}
                                    >
                                        <SelectTrigger
                                            id="previousMail"
                                            className="w-full border-gray-300 hover:border-blue-500 focus:ring-2 focus:ring-blue-400"
                                        >
                                            <SelectValue placeholder="Choose previous mail" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {previousMails.length === 0 ? (
                                                <SelectItem key="none" value="none" disabled>
                                                    No previous mails found
                                                </SelectItem>
                                            ) : (
                                                previousMails.map((mail) => (
                                                    <SelectItem key={mail.descriptionId} value={mail.descriptionId}>
                                                        {mail.description.length > 40
                                                            ? mail.description.slice(0, 40) + '...'
                                                            : mail.description}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-gray-200 my-8" />

                            {selectedActivityId && contacts.length > 0 && (
                                <div className="mt-6">
                                    <label className="block mb-2 text-sm font-semibold text-gray-800">Contacts (Emails)</label>
                                    <div className="flex flex-wrap gap-3 bg-blue-50 p-4 rounded-lg border border-blue-200 shadow-sm">
                                        {contacts.map((contact) => (
                                            <span
                                                key={contact._id}
                                                className="px-4 py-2 bg-blue-100 text-blue-800 font-medium rounded-full shadow-sm hover:bg-blue-200 cursor-default transition"
                                                title={contact.name ? `${contact.name} <${contact.email}>` : contact.email}
                                            >
                                                {contact.email}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="border-t border-gray-200 my-8" />
                            {/* Subject and Message */}
                            <div className="space-y-6">
                                <div className="flex flex-col">
                                    <label htmlFor="subject" className="text-sm font-semibold text-gray-700 mb-2">
                                        Subject
                                    </label>
                                    <Input
                                        id="subject"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        placeholder="Email subject"
                                        className="border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-400"
                                    />
                                </div>

                                <div className="flex flex-col">
                                    <label htmlFor="message" className="text-sm font-semibold text-gray-700 mb-2">
                                        Message
                                    </label>
                                    <Textarea
                                        id="message"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Write your email content here..."
                                        rows={8}
                                        className="border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-400"
                                    />
                                </div>

                                <Button
                                    onClick={handleSend}
                                    disabled={loading}
                                    className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
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
