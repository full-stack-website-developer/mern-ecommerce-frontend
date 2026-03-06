import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import SellerLayout from '../../components/layout/SellerLayout';
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

const SellerReturnRequests = () => {
    const [requests, setRequests] = useState([]);
    const [statusFilter, setStatusFilter] = useState('');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const PER_PAGE = 12;

    const [decisionModal, setDecisionModal] = useState({
        open: false,
        decision: 'approved',
        note: '',
        request: null,
    });
    const [submitting, setSubmitting] = useState(false);

    const loadRequests = async () => {
        try {
            setLoading(true);
            const res = await dashboardService.getSellerReturnRequests({
                status: statusFilter || undefined,
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
    }, [statusFilter]);

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


    const openDecisionModal = (request, decision) => {
        setDecisionModal({
            open: true,
            decision,
            note: '',
            request,
        });
    };

    const closeDecisionModal = () => {
        setDecisionModal({ open: false, decision: 'approved', note: '', request: null });
    };

    const submitDecision = async () => {
        if (!decisionModal.request?._id) return;

        try {
            setSubmitting(true);
            const res = await dashboardService.decideSellerReturnRequest(decisionModal.request._id, {
                decision: decisionModal.decision,
                sellerNote: decisionModal.note,
            });

            if (res.success) {
                setRequests((prev) => prev.map((r) => (r._id === decisionModal.request._id ? res.data.request : r)));
                toast.success(`Request ${decisionModal.decision}`);
                closeDecisionModal();
            }
        } catch (err) {
            toast.error(err?.message || 'Failed to update return request');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SellerLayout>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">Return Requests</h1>

                <Card>
                    <div className="mb-4 flex flex-wrap items-center gap-3">
                        <input
                            className="input-field w-64"
                            placeholder="Search by request, order, customer..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        />
                        <select
                            className="input-field w-52"
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        >
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>

                    {loading ? (
                        <div className="py-12 text-center text-gray-500">Loading return requests...</div>
                    ) : filteredRequests.length === 0 ? (
                        <div className="py-12 text-center text-gray-500">No return requests found.</div>
                    ) : (
                        <Table headers={['Request #', 'Order #', 'Customer', 'Item', 'Reason', 'Status', 'Date', 'Actions']}>
                            {paginatedRequests.map((req) => (
                                <tr key={req._id}>
                                    <td className="px-6 py-4 text-sm font-mono">{req.requestNumber}</td>
                                    <td className="px-6 py-4 text-sm">{req.orderRef}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <div>{req.userId?.firstName} {req.userId?.lastName}</div>
                                        <div className="text-xs text-gray-500">{req.userId?.email}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <div>{req.itemName}</div>
                                        <div className="text-xs text-gray-500">Qty: {req.quantity}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <div className="capitalize">{req.reason}</div>
                                        {req.details && <div className="text-xs text-gray-500 line-clamp-2">{req.details}</div>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant={statusVariant[req.status] || 'default'}>{req.status}</Badge>
                                        {req.isDisputed && <Badge variant="danger" className="ml-2">disputed</Badge>}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(req.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        {req.status === 'pending' ? (
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="primary"
                                                    className="px-3 py-1 text-sm"
                                                    onClick={() => openDecisionModal(req, 'approved')}
                                                >
                                                    Approve
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    className="px-3 py-1 text-sm"
                                                    onClick={() => openDecisionModal(req, 'rejected')}
                                                >
                                                    Reject
                                                </Button>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-gray-400">-</span>
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
                isOpen={decisionModal.open}
                onClose={closeDecisionModal}
                title={`Confirm ${decisionModal.decision === 'approved' ? 'Approval' : 'Rejection'}`}
            >
                <div className="space-y-4">
                    <div className="rounded-md bg-gray-50 border p-3 text-sm text-gray-700">
                        <p><span className="font-medium">Request:</span> {decisionModal.request?.requestNumber}</p>
                        <p><span className="font-medium">Order:</span> {decisionModal.request?.orderRef}</p>
                        <p><span className="font-medium">Item:</span> {decisionModal.request?.itemName}</p>
                    </div>

                    <Textarea
                        label="Note to customer (optional)"
                        value={decisionModal.note}
                        onChange={(e) => setDecisionModal((prev) => ({ ...prev, note: e.target.value }))}
                        rows={4}
                    />

                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={closeDecisionModal} disabled={submitting}>Cancel</Button>
                        <Button
                            variant={decisionModal.decision === 'approved' ? 'primary' : 'danger'}
                            onClick={submitDecision}
                            disabled={submitting}
                        >
                            {submitting ? 'Saving...' : `Confirm ${decisionModal.decision}`}
                        </Button>
                    </div>
                </div>
            </Modal>
        </SellerLayout>
    );
};

export default SellerReturnRequests;
