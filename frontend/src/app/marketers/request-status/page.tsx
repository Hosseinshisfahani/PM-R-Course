'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { marketerApi } from '@/lib/api';
import { MarketerRequest } from '@/types';

export default function MarketerRequestStatusPage() {
  const { user } = useAuth();
  const [request, setRequest] = useState<MarketerRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchRequest();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchRequest = async () => {
    try {
      const requestData = await marketerApi.getMyRequest();
      setRequest(requestData);
    } catch (error: any) {
      if (error.status === 404) {
        setRequest(null);
      } else {
        setError(error.message || 'Failed to fetch request status');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Please log in to view your application status</h1>
            <button
              onClick={() => window.location.href = '/login'}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Login
            </button>
          </div>
        </div>
    );
  }

  if (loading) {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Loading...</div>
        </div>
    );
  }

  if (error) {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchRequest}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
    );
  }

  if (!request) {
    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">No Application Found</h1>
            <p className="text-lg text-gray-600 mb-8">
              You haven't submitted a marketer application yet.
            </p>
            <button
              onClick={() => window.location.href = '/marketers/join'}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Apply Now
            </button>
          </div>
        </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        );
      case 'approved':
        return (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'rejected':
        return (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Application Status</h1>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          {/* Status Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                {getStatusIcon(request.status)}
                <span className="ml-2">{request.status_display}</span>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Applied on {new Date(request.created_at).toLocaleDateString()}
            </div>
          </div>

          {/* Application Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                  <dd className="text-sm text-gray-900">{request.full_name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Phone Number</dt>
                  <dd className="text-sm text-gray-900">{request.phone_number}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="text-sm text-gray-900">{request.email}</dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Professional Information</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Experience Level</dt>
                  <dd className="text-sm text-gray-900">{request.experience_display}</dd>
                </div>
                {request.current_job && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Current Job</dt>
                    <dd className="text-sm text-gray-900">{request.current_job}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-500">Interest Area</dt>
                  <dd className="text-sm text-gray-900">{request.interest_display}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Motivation */}
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Motivation</h3>
            <p className="text-sm text-gray-900 bg-gray-50 rounded-lg p-4">{request.motivation}</p>
          </div>

          {/* Marketing Experience */}
          {request.marketing_experience && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Marketing Experience</h3>
              <p className="text-sm text-gray-900 bg-gray-50 rounded-lg p-4">{request.marketing_experience}</p>
            </div>
          )}

          {/* Social Media */}
          {(request.instagram_handle || request.telegram_handle) && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Social Media</h3>
              <dl className="space-y-2">
                {request.instagram_handle && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Instagram</dt>
                    <dd className="text-sm text-gray-900">{request.instagram_handle}</dd>
                  </div>
                )}
                {request.telegram_handle && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Telegram</dt>
                    <dd className="text-sm text-gray-900">{request.telegram_handle}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {/* Admin Notes */}
          {request.admin_notes && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Admin Notes</h3>
              <p className="text-sm text-gray-900 bg-yellow-50 rounded-lg p-4">{request.admin_notes}</p>
            </div>
          )}

          {/* Review Information */}
          {request.reviewed_at && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Review Information</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Reviewed At</dt>
                  <dd className="text-sm text-gray-900">
                    {new Date(request.reviewed_at).toLocaleDateString()}
                  </dd>
                </div>
                {request.reviewed_by && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Reviewed By</dt>
                    <dd className="text-sm text-gray-900">Admin</dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            {request.status === 'approved' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Congratulations!</h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>Your application has been approved. You now have access to the marketer dashboard.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <button
                onClick={() => window.location.href = '/marketers/join'}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Update Application
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
    </div>
  );
}
