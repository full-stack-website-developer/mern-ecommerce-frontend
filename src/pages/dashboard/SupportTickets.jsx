import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';
import Badge from '../../components/common/Badge';
import dashboardService from '../../services/dashboard.service';

const statusVariant = {
    open: 'warning',
    in_progress: 'primary',
    resolved: 'success',
    escalated: 'danger',
    closed: 'default',
};

const SupportTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [form, setForm] = useState({
        subject: '',
        category: 'order',
        priority: 'medium',
        orderRef: '',
        message: '',
    });
    const [submitting, setSubmitting] = useState(false);

    const loadTickets = async () => {
        try {
            const res = await dashboardService.getUserTickets();
            if (res.success) setTickets(res.data.tickets);
        } catch (err) {
            toast.error(err?.message || 'Failed to load tickets');
        }
    };

    useEffect(() => {
        loadTickets();
    }, []);

    const submitTicket = async () => {
        if (!form.subject.trim() || !form.message.trim()) {
            toast.error('Subject and message are required');
            return;
        }

        try {
            setSubmitting(true);
            const res = await dashboardService.createUserTicket(form);
            if (res.success) {
                setTickets((prev) => [res.data.ticket, ...prev]);
                setForm({
                    subject: '',
                    category: 'order',
                    priority: 'medium',
                    orderRef: '',
                    message: '',
                });
                toast.success('Ticket submitted');
            }
        } catch (err) {
            toast.error(err?.message || 'Failed to create ticket');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">Support Tickets</h1>

                <Card>
                    <h2 className="text-xl font-bold mb-6">Create New Ticket</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <Input
                            label="Subject"
                            className="md:col-span-2"
                            value={form.subject}
                            onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
                        />
                        <Select
                            label="Category"
                            value={form.category}
                            onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                            options={[
                                { value: 'order', label: 'Order & Shipping' },
                                { value: 'refund', label: 'Returns & Refunds' },
                                { value: 'product', label: 'Product Question' },
                                { value: 'account', label: 'Account & Security' },
                                { value: 'other', label: 'Other' },
                            ]}
                        />
                        <Select
                            label="Priority"
                            value={form.priority}
                            onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value }))}
                            options={[
                                { value: 'low', label: 'Low' },
                                { value: 'medium', label: 'Medium' },
                                { value: 'high', label: 'High' },
                            ]}
                        />
                        <Input
                            label="Order ID (optional)"
                            className="md:col-span-2"
                            value={form.orderRef}
                            onChange={(e) => setForm((prev) => ({ ...prev, orderRef: e.target.value }))}
                        />
                    </div>
                    <Textarea
                        label="Message"
                        rows={5}
                        value={form.message}
                        onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
                    />
                    <div className="mt-4">
                        <Button variant="primary" onClick={submitTicket} disabled={submitting}>
                            {submitting ? 'Submitting...' : 'Submit Ticket'}
                        </Button>
                    </div>
                </Card>

                <Card>
                    <h2 className="text-xl font-bold mb-6">My Tickets</h2>
                    <div className="space-y-4">
                        {tickets.length === 0 && (
                            <p className="text-gray-500">No support tickets found.</p>
                        )}
                        {tickets.map((ticket) => (
                            <div
                                key={ticket._id}
                                className="flex flex-col sm:flex-row sm:items-center justify-between border border-gray-200 rounded-lg p-4"
                            >
                                <div className="flex-1 mb-3 sm:mb-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-mono text-sm text-gray-600">{ticket.ticketNumber}</span>
                                        <Badge variant={statusVariant[ticket.status] || 'default'}>
                                            {ticket.status}
                                        </Badge>
                                        <span className="text-sm text-gray-500">{ticket.priority} priority</span>
                                    </div>
                                    <h3 className="font-semibold mt-1">{ticket.subject}</h3>
                                    <p className="text-sm text-gray-600">Created: {new Date(ticket.createdAt).toLocaleDateString()}</p>
                                    {ticket.adminReply && (
                                        <p className="text-xs text-primary-700 mt-2">Admin reply: {ticket.adminReply}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default SupportTickets;
