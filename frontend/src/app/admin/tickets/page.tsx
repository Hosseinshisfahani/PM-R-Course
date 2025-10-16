'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/lib/auth';
import { adminApi } from '@/lib/api';

interface Ticket {
  id: number;
  user: {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  subject: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  assigned_to?: {
    username: string;
  };
  created_at: string;
  updated_at: string;
  message_count: number;
}

export default function AdminTickets() {
  const { user } = useAuth();
  const { canAccessAdminFeatures } = useRole();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');

  useEffect(() => {
    if (canAccessAdminFeatures) {
      fetchTickets();
    }
  }, [canAccessAdminFeatures]);

  const fetchTickets = async () => {
    try {
      const params: { search?: string; status?: string; priority?: string; category?: string } = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (categoryFilter) params.category = categoryFilter;

      const data = await adminApi.getTickets(params);
      setTickets(data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setLoading(true);
    fetchTickets();
  };

  const handleTicketClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowModal(true);
  };

  const handleStatusChange = async (ticketId: number, newStatus: string) => {
    try {
      await adminApi.updateTicket(ticketId, { status: newStatus });
      fetchTickets();
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating ticket status:', error);
    }
  };

  const handleReply = async (ticketId: number) => {
    if (!replyMessage.trim()) return;

    try {
      await adminApi.replyToTicket(ticketId, replyMessage);
      setReplyMessage('');
      fetchTickets();
    } catch (error) {
      console.error('Error sending reply:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      open: { class: 'bg-danger', text: 'باز' },
      in_progress: { class: 'bg-warning', text: 'در حال بررسی' },
      closed: { class: 'bg-success', text: 'بسته شده' },
    };
    const badge = badges[status as keyof typeof badges] || { class: 'bg-secondary', text: 'نامشخص' };
    return <span className={`badge ${badge.class}`}>{badge.text}</span>;
  };

  const getPriorityBadge = (priority: string) => {
    const badges = {
      low: { class: 'bg-info', text: 'کم' },
      medium: { class: 'bg-warning', text: 'متوسط' },
      high: { class: 'bg-danger', text: 'بالا' },
      urgent: { class: 'bg-dark', text: 'فوری' },
    };
    const badge = badges[priority as keyof typeof badges] || { class: 'bg-secondary', text: 'نامشخص' };
    return <span className={`badge ${badge.class}`}>{badge.text}</span>;
  };

  const getCategoryText = (category: string) => {
    const categories = {
      technical: 'مشکل فنی',
      billing: 'مسائل مالی',
      course_access: 'دسترسی به دوره',
      account: 'حساب کاربری',
      general: 'عمومی',
      other: 'سایر',
    };
    return categories[category as keyof typeof categories] || category;
  };

  if (!canAccessAdminFeatures) {
    return (
      <div className="text-center py-5">
        <i className="fas fa-lock fa-3x text-muted mb-3"></i>
        <h3>دسترسی غیرمجاز</h3>
        <p className="text-muted">شما دسترسی لازم برای مشاهده این صفحه را ندارید.</p>
      </div>
    );
  }

  return (
    <div className="admin-tickets">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>تیکت‌های پشتیبانی</h2>
        <button className="btn btn-primary" onClick={fetchTickets}>
          <i className="fas fa-sync-alt me-1"></i>
          به‌روزرسانی
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">جستجو</label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="موضوع یا کاربر..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="btn btn-outline-secondary" onClick={handleSearch}>
                  <i className="fas fa-search"></i>
                </button>
              </div>
            </div>
            <div className="col-md-2">
              <label className="form-label">وضعیت</label>
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">همه</option>
                <option value="open">باز</option>
                <option value="in_progress">در حال بررسی</option>
                <option value="closed">بسته شده</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">اولویت</label>
              <select
                className="form-select"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="">همه</option>
                <option value="low">کم</option>
                <option value="medium">متوسط</option>
                <option value="high">بالا</option>
                <option value="urgent">فوری</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">دسته‌بندی</label>
              <select
                className="form-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">همه</option>
                <option value="technical">مشکل فنی</option>
                <option value="billing">مسائل مالی</option>
                <option value="course_access">دسترسی به دوره</option>
                <option value="account">حساب کاربری</option>
                <option value="general">عمومی</option>
                <option value="other">سایر</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">&nbsp;</label>
              <button className="btn btn-outline-secondary w-100" onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setPriorityFilter('');
                setCategoryFilter('');
                setLoading(true);
                fetchTickets();
              }}>
                <i className="fas fa-times me-1"></i>
                پاک کردن
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">در حال بارگذاری...</span>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>تیکت</th>
                    <th>کاربر</th>
                    <th>موضوع</th>
                    <th>وضعیت</th>
                    <th>اولویت</th>
                    <th>دسته‌بندی</th>
                    <th>تاریخ</th>
                    <th>عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td>
                        <div>
                          <strong>#{ticket.id}</strong>
                          <br />
                          <small className="text-muted">
                            {ticket.message_count} پیام
                          </small>
                        </div>
                      </td>
                      <td>
                        <div>
                          <strong>{ticket.user.first_name} {ticket.user.last_name}</strong>
                          <br />
                          <small className="text-muted">@{ticket.user.username}</small>
                        </div>
                      </td>
                      <td>
                        <div>
                          <strong>{ticket.subject}</strong>
                          <br />
                          <small className="text-muted">
                            {ticket.description.length > 50 
                              ? ticket.description.substring(0, 50) + '...'
                              : ticket.description
                            }
                          </small>
                        </div>
                      </td>
                      <td>{getStatusBadge(ticket.status)}</td>
                      <td>{getPriorityBadge(ticket.priority)}</td>
                      <td>{getCategoryText(ticket.category)}</td>
                      <td>{new Date(ticket.created_at).toLocaleDateString('fa-IR')}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleTicketClick(ticket)}
                        >
                          <i className="fas fa-eye me-1"></i>
                          مشاهده
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Ticket Detail Modal */}
      {showModal && selectedTicket && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  تیکت #{selectedTicket.id} - {selectedTicket.subject}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row mb-4">
                  <div className="col-md-6">
                    <h6>اطلاعات تیکت</h6>
                    <p><strong>کاربر:</strong> {selectedTicket.user.first_name} {selectedTicket.user.last_name} (@{selectedTicket.user.username})</p>
                    <p><strong>ایمیل:</strong> {selectedTicket.user.email}</p>
                    <p><strong>وضعیت:</strong> {getStatusBadge(selectedTicket.status)}</p>
                    <p><strong>اولویت:</strong> {getPriorityBadge(selectedTicket.priority)}</p>
                    <p><strong>دسته‌بندی:</strong> {getCategoryText(selectedTicket.category)}</p>
                  </div>
                  <div className="col-md-6">
                    <h6>تغییر وضعیت</h6>
                    <div className="btn-group" role="group">
                      <button
                        className={`btn btn-sm ${selectedTicket.status === 'open' ? 'btn-danger' : 'btn-outline-danger'}`}
                        onClick={() => handleStatusChange(selectedTicket.id, 'open')}
                      >
                        باز
                      </button>
                      <button
                        className={`btn btn-sm ${selectedTicket.status === 'in_progress' ? 'btn-warning' : 'btn-outline-warning'}`}
                        onClick={() => handleStatusChange(selectedTicket.id, 'in_progress')}
                      >
                        در حال بررسی
                      </button>
                      <button
                        className={`btn btn-sm ${selectedTicket.status === 'closed' ? 'btn-success' : 'btn-outline-success'}`}
                        onClick={() => handleStatusChange(selectedTicket.id, 'closed')}
                      >
                        بسته شده
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h6>توضیحات</h6>
                  <div className="border rounded p-3">
                    {selectedTicket.description}
                  </div>
                </div>

                <div className="mb-4">
                  <h6>پاسخ به تیکت</h6>
                  <textarea
                    className="form-control"
                    rows={4}
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="پاسخ خود را اینجا بنویسید..."
                  />
                  <div className="mt-2">
                    <button
                      className="btn btn-primary"
                      onClick={() => handleReply(selectedTicket.id)}
                      disabled={!replyMessage.trim()}
                    >
                      <i className="fas fa-paper-plane me-1"></i>
                      ارسال پاسخ
                    </button>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  بستن
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
