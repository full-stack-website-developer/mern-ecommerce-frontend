import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/layout/AdminLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import dashboardService from '../../services/dashboard.service';

const statusVariant = {
    open: 'warning',
    in_review: 'primary',
    resolved: 'success',
    closed: 'default',
};

const AdminDisputes = () => {
    const [disputes, setDisputes] = useState([]);
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const PER_PAGE = 10;

    useEffect(() => {
        (async () => {
            try {
                const res = await dashboardService.getAdminDisputes({ status: statusFilter || undefined });
                if (res.success) setDisputes(res.data.disputes);
            } catch (err) {
                toast.error(err?.message || 'Failed to load disputes');
            }
        })();
    }, [statusFilter]);

    const totalPages = Math.max(1, Math.ceil(disputes.length / PER_PAGE));
    const paginatedDisputes = useMemo(() => {
        const start = (page - 1) * PER_PAGE;
        return disputes.slice(start, start + PER_PAGE);
    }, [disputes, page]);

    const resolveDispute = async (disputeId, status, resolution, returnRequestStatus) => {
        try {
            const res = await dashboardService.updateAdminDispute(disputeId, {
                status,
                resolution,
                returnRequestStatus,
            });
            if (res.success) {
                setDisputes((prev) => prev.map((d) => (d._id === disputeId ? res.data.dispute : d)));
            }
        } catch (err) {
            toast.error(err?.message || 'Failed to update dispute');
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">Dispute Handling</h1>
                <Card>
                    <div className="mb-4">
                        <select
                            className="input-field w-44"
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        >
                            <option value="">All Status</option>
                            <option value="open">Open</option>
                            <option value="in_review">In Review</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                        </select>
                    </div>
                    <Table headers={['Dispute #', 'Type', 'Buyer', 'Seller', 'Order', 'Return Request', 'Status', 'Date', 'Actions']}>
                        {paginatedDisputes.map((d) => (
                            <tr key={d._id}>
                                <td className="px-6 py-4 text-sm font-mono">{d.disputeNumber}</td>
                                <td className="px-6 py-4 text-sm">{d.type}</td>
                                <td className="px-6 py-4 text-sm">{d.userId?.firstName} {d.userId?.lastName}</td>
                                <td className="px-6 py-4 text-sm">{d.sellerId?.storeName}</td>
                                <td className="px-6 py-4 text-sm">{d.orderId?.orderNumber}</td>
                                <td className="px-6 py-4 text-sm">{d.returnRequestId?.requestNumber || '-'}</td>
                                <td className="px-6 py-4"><Badge variant={statusVariant[d.status] || 'default'}>{d.status}</Badge></td>
                                <td className="px-6 py-4 text-sm">{new Date(d.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" onClick={() => resolveDispute(d._id, 'in_review', 'Under review')}>Review</Button>
                                        <Button
                                            size="sm"
                                            variant="primary"
                                            onClick={() => resolveDispute(d._id, 'resolved', 'Resolved by admin', d.returnRequestId ? 'approved' : undefined)}
                                        >
                                            Resolve
                                        </Button>
                                        <Button size="sm" variant="ghost" onClick={() => resolveDispute(d._id, 'closed', 'Closed')}>Close</Button>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {paginatedDisputes.length === 0 && (
                            <tr>
                                <td colSpan={9} className="px-6 py-10 text-center text-sm text-gray-500">
                                    No disputes found.
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

export default AdminDisputes;
