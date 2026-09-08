import { ProjectForm } from "@/components/projects/project-form";

export default function NewProjectPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">新規案件登録</h1>
      <ProjectForm />
    </div>
  );
}
