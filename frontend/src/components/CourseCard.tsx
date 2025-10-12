import React from 'react';
import Link from 'next/link';
import { Course } from '@/types';

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {course.thumbnail && (
        <div className="aspect-w-16 aspect-h-9">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-48 object-cover"
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
            {course.category_name}
          </span>
          <span className="text-sm text-gray-500 capitalize">
            {course.difficulty}
          </span>
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
          {course.title}
        </h3>
        
        <p className="text-gray-600 mb-4 line-clamp-3">
          {course.short_description}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            {course.average_rating && (
              <div className="flex items-center">
                <span className="text-yellow-400">★</span>
                <span className="ml-1 text-sm text-gray-600">
                  {course.average_rating} ({course.review_count})
                </span>
              </div>
            )}
          </div>
          <div className="text-sm text-gray-500">
            {course.duration_hours || 0}h • {course.total_videos || 0} videos
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-gray-900">
            {course.is_free ? 'Free' : `$${course.effective_price}`}
          </div>
          <Link
            href={`/courses/${course.slug}`}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            View Course
          </Link>
        </div>
      </div>
    </div>
  );
}
