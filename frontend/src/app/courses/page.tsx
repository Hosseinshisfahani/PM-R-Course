import React from 'react';
import Link from 'next/link';
import { coursesApi } from '@/lib/api';
import { Course, Category } from '@/types';
import Layout from '@/components/Layout';
import CourseCard from '@/components/CourseCard';

interface CoursesPageProps {
  searchParams: {
    category?: string;
    difficulty?: string;
    featured?: string;
    search?: string;
  };
}

async function getCourses(searchParams: any): Promise<Course[]> {
  try {
    const params: any = {};
    if (searchParams.category) params.category = searchParams.category;
    if (searchParams.difficulty) params.difficulty = searchParams.difficulty;
    if (searchParams.featured === 'true') params.featured = true;
    
    if (searchParams.search) {
      const searchResult = await coursesApi.searchCourses(searchParams.search);
      return searchResult.courses || [];
    }
    
    const courses = await coursesApi.getCourses(params);
    return courses;
  } catch (error) {
    console.error('Failed to fetch courses:', error);
    return [];
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    const categories = await coursesApi.getCategories();
    return categories;
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const [courses, categories] = await Promise.all([
    getCourses(searchParams),
    getCategories(),
  ]);

  const difficulties = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">All Courses</h1>
          <p className="text-lg text-gray-600">
            Discover our comprehensive collection of medical education courses
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
              
              {/* Categories */}
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-900 mb-3">Categories</h4>
                <div className="space-y-2">
                  <Link
                    href="/courses"
                    className={`block text-sm ${
                      !searchParams.category 
                        ? 'text-blue-600 font-medium' 
                        : 'text-gray-600 hover:text-blue-600'
                    }`}
                  >
                    All Categories
                  </Link>
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/courses?category=${category.slug}`}
                      className={`block text-sm ${
                        searchParams.category === category.slug
                          ? 'text-blue-600 font-medium'
                          : 'text-gray-600 hover:text-blue-600'
                      }`}
                    >
                      {category.name} ({category.course_count})
                    </Link>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-900 mb-3">Difficulty</h4>
                <div className="space-y-2">
                  <Link
                    href="/courses"
                    className={`block text-sm ${
                      !searchParams.difficulty 
                        ? 'text-blue-600 font-medium' 
                        : 'text-gray-600 hover:text-blue-600'
                    }`}
                  >
                    All Levels
                  </Link>
                  {difficulties.map((difficulty) => (
                    <Link
                      key={difficulty.value}
                      href={`/courses?difficulty=${difficulty.value}`}
                      className={`block text-sm ${
                        searchParams.difficulty === difficulty.value
                          ? 'text-blue-600 font-medium'
                          : 'text-gray-600 hover:text-blue-600'
                      }`}
                    >
                      {difficulty.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Featured */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Featured</h4>
                <Link
                  href="/courses?featured=true"
                  className={`block text-sm ${
                    searchParams.featured === 'true'
                      ? 'text-blue-600 font-medium'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  Featured Courses
                </Link>
              </div>
            </div>
          </div>

          {/* Courses Grid */}
          <div className="lg:w-3/4">
            {courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your filters or search terms
                </p>
                <Link
                  href="/courses"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Clear Filters
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
