import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/layout/AdminLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import dashboardService from '../../services/dashboard.service';

const statusVariant = {
    open: 'warning',
    in_progress: 'primary',
    resolved: 'success',
    escalated: 'danger',
    closed: 'default',
};

const priorityVariant = { high: 'danger', medium: 'warning', low: 'default' };

const AdminSupportTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [page, setPage] = useState(1);
    const PER_PAGE = 12;

    useEffect(() => {
        (async () => {
            try {
                const res = await dashboardService.getAdminTickets({
                    status: statusFilter || undefined,
                    priority: priorityFilter || undefined,
                });
                if (res.success) setTickets(res.data.tickets);
            } catch (err) {
                toast.error(err?.message || 'Failed to fetch tickets');
            }
        })();
    }, [statusFilter, priorityFilter]);

    const updateTicket = async (ticketId, patch) => {
        try {
            const res = await dashboardService.updateAdminTicket(ticketId, patch);
            if (res.success) {
                setTickets((prev) => prev.map((t) => (t._id === ticketId ? res.data.ticket : t)));
            }
        } catch (err) {
            toast.error(err?.message || 'Failed to update ticket');
        }
    };

    const stats = {
        open: tickets.filter((t) => t.status === 'open').length,
        inProgress: tickets.filter((t) => t.status === 'in_progress').length,
        escalated: tickets.filter((t) => t.status === 'escalated').length,
        resolved: tickets.filter((t) => t.status === 'resolved').length,
    };

    const totalPages = Math.max(1, Math.ceil(tickets.length / PER_PAGE));
    const paginatedTickets = useMemo(() => {
        const start = (page - 1) * PER_PAGE;
        return tickets.slice(start, start + PER_PAGE);
    }, [tickets, page]);

    return (
        <AdminLayout>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">Support Ticket Escalation</h1>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card><p className="text-sm text-gray-600">Open</p><p className="text-2xl font-bold mt-1 text-yellow-600">{stats.open}</p></Card>
                    <Card><p className="text-sm text-gray-600">In Progress</p><p className="text-2xl font-bold mt-1 text-primary-600">{stats.inProgress}</p></Card>
                    <Card><p className="text-sm text-gray-600">Escalated</p><p className="text-2xl font-bold mt-1 text-red-600">{stats.escalated}</p></Card>
                    <Card><p className="text-sm text-gray-600">Resolved</p><p className="text-2xl font-bold mt-1 text-green-600">{stats.resolved}</p></Card>
                </div>

                <Card>
                    <div className="mb-6 flex gap-3">
                        <select
                            className="input-field w-44"
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        >
                            <option value="">All Status</option>
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="escalated">Escalated</option>
                            <option value="closed">Closed</option>
                        </select>
                        <select
                            className="input-field w-44"
                            value={priorityFilter}
                            onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
                        >
                            <option value="">All Priority</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>
                    </div>
                    <Table headers={['Ticket #', 'Subject', 'User', 'Priority', 'Status', 'Date', 'Actions']}>
                        {paginatedTickets.map((ticket) => (
                            <tr key={ticket._id}>
                                <td className="px-6 py-4 text-sm font-mono">{ticket.ticketNumber}</td>
                                <td className="px-6 py-4 text-sm">{ticket.subject}</td>
                                <td className="px-6 py-4 text-sm">{ticket.userId?.firstName} {ticket.userId?.lastName}</td>
                                <td className="px-6 py-4"><Badge variant={priorityVariant[ticket.priority] || 'default'}>{ticket.priority}</Badge></td>
                                <td className="px-6 py-4"><Badge variant={statusVariant[ticket.status] || 'default'}>{ticket.status}</Badge></td>
                                <td className="px-6 py-4 text-sm">{new Date(ticket.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" onClick={() => updateTicket(ticket._id, { status: 'in_progress' })}>In Progress</Button>
                                        <Button size="sm" variant="ghost" onClick={() => updateTicket(ticket._id, { status: 'resolved' })}>Resolve</Button>
                                        <Button size="sm" variant="ghost" className="text-red-600" onClick={() => updateTicket(ticket._id, { status: 'escalated', escalated: true })}>Escalate</Button>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {paginatedTickets.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500">
                                    No tickets found.
                                </td>
                            </tr>
                        )}
                    </Table>

                    {totalPages > 1 && (
                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={setPage}
                            scrollToTop
                        />
                    )}
                </Card>
            </div>
        </AdminLayout>
    );
};

export default AdminSupportTickets;
