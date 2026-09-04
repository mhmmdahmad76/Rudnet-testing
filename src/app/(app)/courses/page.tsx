import { CourseCard } from "@/components/lisaan/course-card";
import { DEMO_COURSE } from "@/lib/demo-data";

export default function MyCoursesPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="t-h2 text-fg-primary">My courses</h1>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <CourseCard
          href={`/courses/${DEMO_COURSE.slug}/lessons/cafe-order`}
          title={DEMO_COURSE.title}
          level={DEMO_COURSE.level}
          meta={DEMO_COURSE.meta}
          progress={22}
        />
      </div>
    </div>
  );
}
