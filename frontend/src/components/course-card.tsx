"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Images, getCourseImage } from "@/lib/images";
import type { Course } from "@/lib/supabase/types";

interface CourseCardProps {
  course: Course;
  progress?: { completed: number; total: number } | null;
}

const Icons = {
  free: () => <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>,
  paid: () => <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  clock: () => <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  arrow: () => <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>,
  play: () => <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
};

export function CourseCard({ course, progress }: CourseCardProps) {
  const imageUrl = course.thumbnail_url || getCourseImage(course.id);
  
  return (
    <Link href={`/courses/${course.id}`} className="group block h-full">
      <motion.div
        whileHover={{ y: -8 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 h-full flex flex-col"
      >
        {/* Image */}
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={imageUrl}
            alt={course.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Price Badge */}
          <div className="absolute top-4 right-4">
            <Badge className={`text-sm font-semibold px-3 py-1.5 border-0 ${course.is_free ? "bg-green-500 text-white" : "bg-amber-500 text-white"}`}>
              {course.is_free ? "Free" : `$${course.price}`}
            </Badge>
          </div>
          
          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform duration-300">
              <Icons.play />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-grow flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-2 mb-2">
            {course.title}
          </h3>
          <p className="text-slate-600 text-sm line-clamp-2 mb-4 flex-grow">
            {course.description || "Learn AI development with hands-on projects and expert guidance."}
          </p>
          
          {/* Progress */}
          {progress && progress.total > 0 && (
            <div className="px-0 pb-2">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>{progress.completed}/{progress.total} lessons</span>
                <span className="font-medium text-emerald-600">{Math.round((progress.completed / progress.total) * 100)}%</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-emerald-500 rounded-full"
                  initial={{ width: "0%" }}
                  whileInView={{ width: `${(progress.completed / progress.total) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                />
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Icons.clock />
              <span>
                {new Date(course.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
              </span>
            </div>
            <span className="text-emerald-600 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
              View
              <Icons.arrow />
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
