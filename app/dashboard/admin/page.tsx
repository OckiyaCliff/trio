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

async function getSchoolStats() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("school_id")
    .eq("id", user.id)
    .single();

  if (!profile?.school_id) return null;

  const schoolId = profile.school_id;

  const [
    profilesResult,
    gradesResult,
    subjectsResult,
    classesResult,
    schoolResult,
  ] = await Promise.all([
    supabase.from("profiles").select("id, role").eq("school_id", schoolId),
    supabase
      .from("grades")
      .select("id", { count: "exact", head: true })
      .eq("school_id", schoolId),
    supabase
      .from("subjects")
      .select("id", { count: "exact", head: true })
      .eq("school_id", schoolId),
    supabase
      .from("classes")
      .select("id", { count: "exact", head: true })
      .eq("school_id", schoolId),
    supabase.from("schools").select("name, code").eq("id", schoolId).single(),
  ]);

  const profiles = profilesResult.data || [];
  const roleCounts = profiles.reduce(
    (acc, p) => {
      acc[p.role] = (acc[p.role] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return {
    school: schoolResult.data,
    totalTeachers: roleCounts["teacher"] || 0,
    totalStudents: roleCounts["student"] || 0,
    totalParents: roleCounts["parent"] || 0,
    totalGrades: gradesResult.count || 0,
    totalSubjects: subjectsResult.count || 0,
    totalClasses: classesResult.count || 0,
  };
}

export default async function AdminDashboard() {
  const stats = await getSchoolStats();

  if (!stats) {
    redirect("/auth/login");
  }

  return (
    <>
      <DashboardHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard/admin" },
          { label: "Overview" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <PageHeader
          title={`Welcome to ${stats.school?.name || "School"}`}
          description="Manage your school's academic structure, classes, and users."
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Teachers"
            value={stats.totalTeachers}
            description="Active teachers"
            icon="Users"
          />
          <StatCard
            title="Students"
            value={stats.totalStudents}
            description="Enrolled students"
            icon="GraduationCap"
          />
          <StatCard
            title="Classes"
            value={stats.totalClasses}
            description="Active classes"
            icon="School"
          />
          <StatCard
            title="Subjects"
            value={stats.totalSubjects}
            description="Configured subjects"
            icon="BookOpen"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>School Information</CardTitle>
              <CardDescription>Your school details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">School Name</span>
                <span className="font-medium">{stats.school?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">School Code</span>
                <code className="rounded bg-muted px-2 py-1 text-sm">
                  {stats.school?.code}
                </code>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Grades</span>
                <span className="font-medium">{stats.totalGrades}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <a
                  href="/dashboard/admin/users"
                  className="flex items-center gap-2 rounded-lg border p-3 hover:bg-muted transition-colors"
                >
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Manage Users</p>
                    <p className="text-xs text-muted-foreground">
                      Add teachers, students, and parents
                    </p>
                  </div>
                </a>
                <a
                  href="/dashboard/admin/classes"
                  className="flex items-center gap-2 rounded-lg border p-3 hover:bg-muted transition-colors"
                >
                  <School className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Manage Classes</p>
                    <p className="text-xs text-muted-foreground">
                      Create and configure classes
                    </p>
                  </div>
                </a>
                <a
                  href="/dashboard/admin/subjects"
                  className="flex items-center gap-2 rounded-lg border p-3 hover:bg-muted transition-colors"
                >
                  <BookOpen className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Manage Subjects</p>
                    <p className="text-xs text-muted-foreground">
                      Add and edit subjects
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
