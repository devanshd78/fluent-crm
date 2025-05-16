"use client"

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import axios from 'axios'
import { get, post } from '@/lib/api'

export default function CampaignPage() {
    const [activities, setActivities] = useState<{ name: string; activityId: string }[]>([])
    const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null)
    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)

    // Fetch activity list on mount
    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const marketerId = localStorage.getItem('userId');
                if (!marketerId) {
                    toast.error('Marketer ID not found.');
                    return;
                }

                const res = await get('/activity/select-campaign', {
                    marketerId,
                });

                setActivities(res.data || []);
            } catch (err) {
                console.error('Failed to load activities', err);
                toast.error('Failed to load activity list.');
            }
        };

        fetchActivities();
    }, []);


    const handleSend = async () => {
        if (!selectedActivityId || !subject || !message) {
            return toast.error('Please fill all fields.')
        }

        try {
            setLoading(true)
            const res = await post('/mail/send', {
                activityId: selectedActivityId,
                subject,
                description: message
            })
            toast.success(res.data.message || 'Email sent!')
            setSubject('')
            setMessage('')
        } catch (err: any) {
            console.error(err)
            toast.error(err.response?.data?.message || 'Failed to send email.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
            <h1 className="text-2xl font-semibold">Launch Email Campaign</h1>

            <Card>
                <CardContent className="p-6 space-y-4">
                    <div>
                        <label className="text-sm font-medium mb-1 block">Select Activity</label>
                        <Select onValueChange={setSelectedActivityId}>
                            <SelectTrigger>
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
                        <div className="space-y-4 border-t pt-4">
                            <div>
                                <label className="text-sm font-medium mb-1 block">Subject</label>
                                <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Email subject" />
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-1 block">Message</label>
                                <Textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Write your email content here..."
                                    rows={6}
                                />
                            </div>

                            <Button onClick={handleSend} disabled={loading}>
                                {loading ? 'Sending...' : 'Send Email'}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
