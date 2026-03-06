import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/layout/AdminLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Textarea from '../../components/common/Textarea';
import Pagination from '../../components/common/Pagination';
import dashboardService from '../../services/dashboard.service';

const statusVariant = {
    pending: 'warning',
    approved: 'primary',
    completed: 'success',
    rejected: 'danger',
};

const AdminReturnRequests = () => {
    const [requests, setRequests] = useState([]);
    const [statusFilter, setStatusFilter] = useState('');
    const [disputedOnly, setDisputedOnly] = useState(true);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const PER_PAGE = 12;

    const [interventionModal, setInterventionModal] = useState({
        open: false,
        request: null,
        status: 'approved',
        note: '',
    });
    const [submitting, setSubmitting] = useState(false);

    const loadRequests = async () => {
        try {
            setLoading(true);
            const res = await dashboardService.getAdminReturnRequests({
                status: statusFilter || undefined,
                isDisputed: disputedOnly ? true : undefined,
            });
            if (res.success) setRequests(res.data.requests || []);
        } catch (err) {
            toast.error(err?.message || 'Failed to load return requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRequests();
    }, [statusFilter, disputedOnly]);

    const filteredRequests = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return requests;

        return requests.filter((req) =>
            [
                req.requestNumber,
                req.orderRef,
                req.itemName,
                req.userId?.firstName,
                req.userId?.lastName,
                req.userId?.email,
                req.sellerId?.storeName,
                req.disputeId?.disputeNumber,
            ]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(term))
        );
    }, [requests, search]);

    const totalPages = Math.max(1, Math.ceil(filteredRequests.length / PER_PAGE));
    const paginatedRequests = useMemo(() => {
        const start = (page - 1) * PER_PAGE;
        return filteredRequests.slice(start, start + PER_PAGE);
    }, [filteredRequests, page]);


    const openInterventionModal = (request) => {
        setInterventionModal({
            open: true,
            request,
            status: 'approved',
            note: request.adminNote || '',
        });
    };

    const closeInterventionModal = () => {
        setInterventionModal({ open: false, request: null, status: 'approved', note: '' });
    };

    const submitIntervention = async () => {
        if (!interventionModal.request?._id) return;

        try {
            setSubmitting(true);
            const res = await dashboardService.interveneInReturnRequest(interventionModal.request._id, {
                status: interventionModal.status,
                adminNote: interventionModal.note,
            });

            if (res.success) {
                setRequests((prev) => prev.map((r) => (r._id === interventionModal.request._id ? res.data.request : r)));
                toast.success(`Request marked ${interventionModal.status}`);
                closeInterventionModal();
            }
        } catch (err) {
            toast.error(err?.message || 'Failed to update request');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">Return Request Intervention</h1>

                <Card>
                    <div className="mb-4 flex flex-wrap items-center gap-3">
                        <input
                            className="input-field w-64"
                            placeholder="Search request, order, customer, seller..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        />
                        <select
                            className="input-field w-44"
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        >
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                            <option value="completed">Completed</option>
                        </select>
                        <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                            <input
                                type="checkbox"
                                checked={disputedOnly}
                                onChange={(e) => { setDisputedOnly(e.target.checked); setPage(1); }}
                            />
                            Show disputed only
                        </label>
                    </div>

                    {loading ? (
                        <div className="py-12 text-center text-gray-500">Loading return requests...</div>
                    ) : filteredRequests.length === 0 ? (
                        <div className="py-12 text-center text-gray-500">No return requests found.</div>
                    ) : (
                        <Table headers={['Request #', 'Order #', 'Customer', 'Seller', 'Item', 'Status', 'Dispute', 'Date', 'Actions']}>
                            {paginatedRequests.map((req) => (
                                <tr key={req._id}>
                                    <td className="px-6 py-4 text-sm font-mono">{req.requestNumber}</td>
                                    <td className="px-6 py-4 text-sm">{req.orderRef}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <div>{req.userId?.firstName} {req.userId?.lastName}</div>
                                        <div className="text-xs text-gray-500">{req.userId?.email}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm">{req.sellerId?.storeName || '-'}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <div>{req.itemName}</div>
                                        <div className="text-xs text-gray-500 capitalize">{req.reason}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant={statusVariant[req.status] || 'default'}>{req.status}</Badge>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        {req.disputeId?.disputeNumber ? (
                                            <Badge variant="danger">{req.disputeId.disputeNumber}</Badge>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(req.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        {req.isDisputed || req.disputeId ? (
                                            <Button
                                                variant="primary"
                                                className="px-3 py-1 text-sm"
                                                onClick={() => openInterventionModal(req)}
                                            >
                                                Intervene
                                            </Button>
                                        ) : (
                                            <span className="text-sm text-gray-400">No action</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </Table>
                    )}

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

            <Modal
                isOpen={interventionModal.open}
                onClose={closeInterventionModal}
                title="Admin Intervention"
                size="lg"
            >
                <div className="space-y-4">
                    <div className="rounded-md bg-gray-50 border p-3 text-sm text-gray-700">
                        <p><span className="font-medium">Request:</span> {interventionModal.request?.requestNumber}</p>
                        <p><span className="font-medium">Order:</span> {interventionModal.request?.orderRef}</p>
                        <p><span className="font-medium">Item:</span> {interventionModal.request?.itemName}</p>
                        {interventionModal.request?.disputeId?.disputeNumber && (
                            <p><span className="font-medium">Dispute:</span> {interventionModal.request.disputeId.disputeNumber}</p>
                        )}
                    </div>

                    <div className="w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Decision</label>
                        <select
                            className="input-field"
                            value={interventionModal.status}
                            onChange={(e) => setInterventionModal((prev) => ({ ...prev, status: e.target.value }))}
                        >
                            <option value="approved">Approve Return</option>
                            <option value="rejected">Reject Return</option>
                            <option value="completed">Mark Completed</option>
                        </select>
                    </div>

                    <Textarea
                        label="Admin note"
                        rows={4}
                        value={interventionModal.note}
                        onChange={(e) => setInterventionModal((prev) => ({ ...prev, note: e.target.value }))}
                    />

                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={closeInterventionModal} disabled={submitting}>Cancel</Button>
                        <Button variant="primary" onClick={submitIntervention} disabled={submitting}>
                            {submitting ? 'Saving...' : 'Submit Decision'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </AdminLayout>
    );
};

export default AdminReturnRequests;
