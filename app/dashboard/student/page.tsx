import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardHeader, StatCard, PageHeader } from "@/components/dashboard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, ClipboardList } from "lucide-react";

async function getStudentStats() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, school_id")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  // Get student's class enrollments
  const { data: enrollments } = await supabase
    .from("class_students")
    .select(
      `
      classes (
        id,
        name,
        grades (name),
        academic_years (name, is_current)
      )
    `,
    )
    .eq("student_id", user.id);

  const classIds = enrollments?.map((e) => e.classes?.id).filter(Boolean) || [];

  // Get subjects in student's classes
  let totalSubjects = 0;
  if (classIds.length > 0) {
    const { count } = await supabase
      .from("class_subjects")
      .select("id", { count: "exact", head: true })
      .in("class_id", classIds);
    totalSubjects = count || 0;
  }

  // Get scores
  const { data: scores } = await supabase
    .from("scores")
    .select("score, assessments (max_score)")
    .eq("student_id", user.id);

  const totalScores = scores?.length || 0;
  const averageScore =
    scores && scores.length > 0
      ? Math.round(
        scores.reduce((acc, s) => {
          if (s.score !== null && s.assessments?.max_score) {
            return acc + (s.score / s.assessments.max_score) * 100;
          }
          return acc;
        }, 0) / scores.length,
      )
      : 0;

  const { data: school } = await supabase
    .from("schools")
    .select("name")
    .eq("id", profile.school_id)
    .single();

  return {
    profile,
    school,
    enrollments: enrollments || [],
    totalClasses: classIds.length,
    totalSubjects,
    totalScores,
    averageScore,
  };
}

export default async function StudentDashboard() {
  const stats = await getStudentStats();

  if (!stats) {
    redirect("/auth/login");
  }

  const studentName =
    `${stats.profile.first_name || ""} ${stats.profile.last_name || ""}`.trim() ||
    "Student";

  return (
    <>
      <DashboardHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard/student" },
          { label: "Overview" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <PageHeader
          title={`Welcome, ${studentName}`}
          description="Track your classes, assessments, and academic performance."
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="My Classes"
            value={stats.totalClasses}
            description="Enrolled classes"
            icon="School"
          />
          <StatCard
            title="Subjects"
            value={stats.totalSubjects}
            description="Active subjects"
            icon="BookOpen"
          />
          <StatCard
            title="Assessments"
            value={stats.totalScores}
            description="Completed assessments"
            icon="ClipboardList"
          />
          <StatCard
            title="Average Score"
            value={`${stats.averageScore}%`}
            description="Overall average"
            icon="Award"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>My Classes</CardTitle>
              <CardDescription>Classes you are enrolled in</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.enrollments.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  You are not enrolled in any classes yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {stats.enrollments.map((enrollment, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium">
                          {enrollment.classes?.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {enrollment.classes?.grades?.name}
                        </p>
                      </div>
                      {enrollment.classes?.academic_years?.is_current && (
                        <Badge>Current</Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Access your academic information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <a
                  href="/dashboard/student/grades"
                  className="flex items-center gap-2 rounded-lg border p-3 hover:bg-muted transition-colors"
                >
                  <Award className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">View Grades</p>
                    <p className="text-xs text-muted-foreground">
                      Check your assessment scores
                    </p>
                  </div>
                </a>
                <a
                  href="/dashboard/student/assessments"
                  className="flex items-center gap-2 rounded-lg border p-3 hover:bg-muted transition-colors"
                >
                  <ClipboardList className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">View Assessments</p>
                    <p className="text-xs text-muted-foreground">
                      See upcoming and past assessments
                    </p>
                  </div>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
