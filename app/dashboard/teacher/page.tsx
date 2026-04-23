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
import { ClipboardList, Users } from "lucide-react";

async function getTeacherStats() {
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

  // Get classes where this teacher teaches
  const { data: classSubjects } = await supabase
    .from("class_subjects")
    .select(
      `
      id,
      classes (id, name),
      subjects (name)
    `,
    )
    .eq("teacher_id", user.id);

  const classIds =
    classSubjects?.map((cs: any) =>
      Array.isArray(cs.classes) ? cs.classes[0]?.id : cs.classes?.id
    ).filter(Boolean) || [];
  const uniqueClassIds = [...new Set(classIds)];

  // Get student count in teacher's classes
  let totalStudents = 0;
  if (uniqueClassIds.length > 0) {
    const { count } = await supabase
      .from("class_students")
      .select("id", { count: "exact", head: true })
      .in("class_id", uniqueClassIds);
    totalStudents = count || 0;
  }

  // Get assessment count
  const classSubjectIds = classSubjects?.map((cs) => cs.id) || [];
  let totalAssessments = 0;
  if (classSubjectIds.length > 0) {
    const { count } = await supabase
      .from("assessments")
      .select("id", { count: "exact", head: true })
      .in("class_subject_id", classSubjectIds);
    totalAssessments = count || 0;
  }

  const { data: school } = await supabase
    .from("schools")
    .select("name")
    .eq("id", profile.school_id)
    .single();

  return {
    profile,
    school,
    totalClasses: uniqueClassIds.length,
    totalSubjects: classSubjects?.length || 0,
    totalStudents,
    totalAssessments,
    classSubjects: classSubjects || [],
  };
}

export default async function TeacherDashboard() {
  const stats = await getTeacherStats();

  if (!stats) {
    redirect("/auth/login");
  }

  const teacherName =
    `${stats.profile.first_name || ""} ${stats.profile.last_name || ""}`.trim() ||
    "Teacher";

  return (
    <>
      <DashboardHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard/teacher" },
          { label: "Overview" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <PageHeader
          title={`Welcome, ${teacherName}`}
          description="Manage your classes, assessments, and student performance."
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="My Classes"
            value={stats.totalClasses}
            description="Classes assigned"
            icon="School"
          />
          <StatCard
            title="Subjects"
            value={stats.totalSubjects}
            description="Subjects teaching"
            icon="BookOpen"
          />
          <StatCard
            title="Students"
            value={stats.totalStudents}
            description="Total students"
            icon="Users"
          />
          <StatCard
            title="Assessments"
            value={stats.totalAssessments}
            description="Created assessments"
            icon="ClipboardList"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>My Classes & Subjects</CardTitle>
              <CardDescription>
                Classes and subjects you are teaching
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.classSubjects.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No classes assigned yet. Contact your school administrator.
                </p>
              ) : (
                <div className="space-y-3">
                  {stats.classSubjects.map((cs: any) => {
                    const classObj = Array.isArray(cs.classes) ? cs.classes[0] : cs.classes;
                    const subjectObj = Array.isArray(cs.subjects) ? cs.subjects[0] : cs.subjects;

                    return (
                      <div
                        key={cs.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div>
                          <p className="font-medium">{classObj?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {subjectObj?.name}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common teaching tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <a
                  href="/dashboard/teacher/assessments"
                  className="flex items-center gap-2 rounded-lg border p-3 hover:bg-muted transition-colors"
                >
                  <ClipboardList className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Create Assessment</p>
                    <p className="text-xs text-muted-foreground">
                      Add new quiz, exam, or assignment
                    </p>
                  </div>
                </a>
                <a
                  href="/dashboard/teacher/students"
                  className="flex items-center gap-2 rounded-lg border p-3 hover:bg-muted transition-colors"
                >
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">View Students</p>
                    <p className="text-xs text-muted-foreground">
                      See students in your classes
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
