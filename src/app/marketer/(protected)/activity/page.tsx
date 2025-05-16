'use client'

import React, { useEffect, useState } from 'react'
import { Clock, Eye, Trash2, Plus, Pencil } from 'lucide-react'
import Swal from 'sweetalert2'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { post } from '@/lib/api'
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'

type Activity = {
    activityId: string
    name: string
    createdAt: string
}

type Meta = {
    total: number
    page: number
    limit: number
    totalPages: number
}

export default function AdminActivityPage() {
    const router = useRouter()

    const [activities, setActivities] = useState<Activity[]>([])
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, limit: 5, totalPages: 1 })
    const [sortField, setSortField] = useState<'createdAt' | 'name'>('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [newActivityName, setNewActivityName] = useState('')
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editedName, setEditedName] = useState<string>('')


    const itemsPerPage = 5

    const fetchActivities = async () => {
        try {
            const marketerId = localStorage.getItem('userId') // move inside the function
            if (!marketerId) {
                console.warn('No marketer ID found in localStorage')
                return
            }

            const response = await post<{ data: Activity[]; meta: Meta }>(
                '/activity/getbymarketerId',
                {
                    marketerId,
                    page,
                    limit: itemsPerPage,
                    sortField,
                    sortOrder,
                    search,
                }
            )

            setActivities(response.data)
            setMeta(response.meta)
        } catch (err) {
            console.error('Failed to fetch activity list:', err)
        }
    }


    useEffect(() => {
        fetchActivities()
    }, [page, search, sortField, sortOrder, search])

    const handleDelete = async (id: string) => {
        const result = await Swal.fire({
            title: 'Delete this activity?',
            text: 'This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e3342f',
            confirmButtonText: 'Yes, delete it!',
        })

        if (result.isConfirmed) {
            try {
                const resData = await post<{ status: string; message: string }>(
                    '/activity/delete',
                    { activityId: id }
                )

                if (resData.status === 'success') {
                    Swal.fire({
                        icon: 'success',
                        title: 'Deleted!',
                        text: 'Activity has been removed.',
                        timer: 1000,
                        showConfirmButton: false,
                        timerProgressBar: true,
                    })

                    fetchActivities()
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: resData.message || 'Failed to delete.',
                        timer: 1000,
                        showConfirmButton: false,
                        timerProgressBar: true,
                    })

                }
            } catch (err: any) {
                console.error('Delete error:', err)
                Swal.fire({
                    icon: 'error',
                    title: 'Server Error',
                    text: err.response?.data?.message || 'Something went wrong.',
                    timer: 1000,
                    showConfirmButton: false,
                    timerProgressBar: true,
                })

            }
        }
    }

    const handleCreateActivity = async () => {
        if (!newActivityName.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Activity name is required.',
                timer: 1000,
                showConfirmButton: false,
                timerProgressBar: true,
            })

            return
        }

        try {
            const marketerId = localStorage.getItem('userId')
            if (!marketerId) {
                Swal.fire('Error', 'Marketer ID not found.', 'error')
                return
            }

            const res = await post('/activity/create', {
                name: newActivityName,
                marketerId,
            })

            if (res.status === 'success') {
                Swal.fire({
                    icon: 'success',
                    title: 'Activity created successfully.',
                    timer: 1000,
                    showConfirmButton: false,
                    timerProgressBar: true,
                })

                setNewActivityName('')
                fetchActivities()
            } else {
                Swal.fire('Error', res.message || 'Failed to create activity.', 'error')
            }
        } catch (err: any) {
            Swal.fire({
                icon: 'error',
                title: 'Server Error',
                text: err.response?.data?.message || 'Something went wrong.',
                timer: 1000,
                showConfirmButton: false,
                timerProgressBar: true,
            })

        }
    }

    const handleUpdateActivity = async () => {
        if (!editingId || !editedName.trim()) {
            Swal.fire('Error', 'Activity name is required.', 'warning')
            return
        }

        try {
            const res = await post('/activity/update', {
                activityId: editingId,
                name: editedName.trim(),
            })

            if (res.status === 'success') {
                Swal.fire({
                    icon: 'success',
                    title: 'Activity name updated.',
                    timer: 1000,
                    showConfirmButton: false,
                    timerProgressBar: true,
                })
                setEditingId(null)
                setEditedName('')
                fetchActivities()
            } else {
                Swal.fire('Error', res.message || 'Failed to update.', 'error')
            }
        } catch (err: any) {
            console.error(err)
            Swal.fire({
                icon: 'error',
                title: 'Server Error',
                text: err.response?.data?.message || 'Something went wrong.',
                timer: 1000,
                showConfirmButton: false,
                timerProgressBar: true,
            })
        }
    }

    return (
        <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Activity Logs</h1>
                    <p className="text-sm text-gray-600">Track recent activity actions.</p>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Create
                        </Button>
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Create Activity</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="activityName" className="text-right">
                                    Name
                                </Label>
                                <Input
                                    id="activityName"
                                    className="col-span-3"
                                    value={newActivityName}
                                    onChange={(e) => setNewActivityName(e.target.value)}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreateActivity}>Save</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Search */}
            <div className="flex justify-between items-center">
                <Input
                    type="text"
                    placeholder="Search activities..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value)
                        setPage(1)
                    }}
                    className="max-w-sm"
                />
            </div>

            {/* Table */}
            <div className="rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead
                                className="w-[40%] cursor-pointer select-none"
                                onClick={() => {
                                    if (sortField === 'name') {
                                        // toggle order
                                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                                    } else {
                                        setSortField('name')
                                        setSortOrder('asc')
                                    }
                                    setPage(1) // reset to page 1 on sort change
                                }}
                            >
                                Activity Name
                                {sortField === 'name' && (sortOrder === 'asc' ? ' ▲' : ' ▼')}
                            </TableHead>

                            <TableHead
                                className="w-[40%] text-center cursor-pointer select-none"
                                onClick={() => {
                                    if (sortField === 'createdAt') {
                                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                                    } else {
                                        setSortField('createdAt')
                                        setSortOrder('desc')
                                    }
                                    setPage(1)
                                }}
                            >
                                Date Created
                                {sortField === 'createdAt' && (sortOrder === 'asc' ? ' ▲' : ' ▼')}
                            </TableHead>

                            <TableHead className="w-[20%] text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {activities.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center text-gray-500 py-6">
                                    No activities found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            activities.map((activity) => (
                                <TableRow key={activity.activityId}>
                                    <TableCell>
                                        {editingId === activity.activityId ? (
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    value={editedName}
                                                    onChange={(e) => setEditedName(e.target.value)}
                                                    className="w-full"
                                                />
                                                <Button variant="default" size="sm" onClick={handleUpdateActivity}>
                                                    Save
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => setEditingId(null)}>
                                                    Cancel
                                                </Button>
                                            </div>
                                        ) : (
                                            activity.name
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center text-xs text-gray-500">
                                        <Clock className="inline-block w-4 h-4 mr-1" />
                                        {new Date(activity.createdAt).toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setEditingId(activity.activityId)
                                                setEditedName(activity.name)
                                            }}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                router.push(`/marketer/activity/view?id=${activity.activityId}`)
                                            }
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(activity.activityId)}
                                        >
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {meta.totalPages > 1 && (
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                href="#"
                                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                            />
                        </PaginationItem>
                        {Array.from({ length: meta.totalPages }, (_, i) => (
                            <PaginationItem key={i}>
                                <PaginationLink
                                    href="#"
                                    isActive={i + 1 === page}
                                    onClick={() => setPage(i + 1)}
                                >
                                    {i + 1}
                                </PaginationLink>
                            </PaginationItem>
                        ))}
                        <PaginationItem>
                            <PaginationNext
                                href="#"
                                onClick={() => setPage((p) => Math.min(p + 1, meta.totalPages))}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}
        </div>
    )
}
