import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { DataTable } from "../components/DataTable.jsx";
import { projectService } from "../services/projectService.js";

const emptyField = { fieldId: "", label: "", type: "text", required: false, options: [] };

export const ProjectsPage = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: "",
    code: "",
    description: "",
    status: "draft",
    formDefinition: [emptyField]
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: projectService.list
  });

  const createProject = useMutation({
    mutationFn: projectService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setForm({
        name: "",
        code: "",
        description: "",
        status: "draft",
        formDefinition: [emptyField]
      });
    }
  });

  const columns = [
    { key: "name", label: "Project" },
    { key: "code", label: "Code" },
    { key: "status", label: "Status" },
    {
      key: "fields",
      label: "Fields",
      render: (row) => row.formDefinition.length
    }
  ];

  const updateField = (index, key, value) => {
    setForm((current) => ({
      ...current,
      formDefinition: current.formDefinition.map((field, fieldIndex) =>
        fieldIndex === index ? { ...field, [key]: value } : field
      )
    }));
  };

  return (
    <section className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
      <form
        className="panel space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          createProject.mutate(form);
        }}
      >
        <div>
          <h3 className="text-xl font-semibold">Create project</h3>
          <p className="mt-2 text-sm text-slate-500">Design the survey schema once and reuse it across field teams.</p>
        </div>
        <input
          className="input"
          placeholder="Project name"
          value={form.name}
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
        />
        <input
          className="input"
          placeholder="Project code"
          value={form.code}
          onChange={(event) => setForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))}
        />
        <textarea
          className="input min-h-24"
          placeholder="Description"
          value={form.description}
          onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
        />
        <select
          className="input"
          value={form.status}
          onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
        >
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Survey builder</h4>
            <button
              className="button-secondary"
              type="button"
              onClick={() =>
                setForm((current) => ({
                  ...current,
                  formDefinition: [...current.formDefinition, { ...emptyField, fieldId: `field_${Date.now()}` }]
                }))
              }
            >
              Add Field
            </button>
          </div>
          {form.formDefinition.map((field, index) => (
            <div key={`${field.fieldId}-${index}`} className="rounded-2xl border border-slate-100 p-4">
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  className="input"
                  placeholder="Field ID"
                  value={field.fieldId}
                  onChange={(event) => updateField(index, "fieldId", event.target.value)}
                />
                <input
                  className="input"
                  placeholder="Label"
                  value={field.label}
                  onChange={(event) => updateField(index, "label", event.target.value)}
                />
                <select
                  className="input"
                  value={field.type}
                  onChange={(event) => updateField(index, "type", event.target.value)}
                >
                  <option value="text">Text</option>
                  <option value="textarea">Textarea</option>
                  <option value="number">Number</option>
                  <option value="radio">Radio</option>
                  <option value="select">Select</option>
                  <option value="checkbox">Checkbox</option>
                  <option value="date">Date</option>
                </select>
                <input
                  className="input"
                  placeholder="Options comma separated"
                  value={(field.options || []).map((option) => option.label).join(",")}
                  onChange={(event) =>
                    updateField(
                      index,
                      "options",
                      event.target.value
                        .split(",")
                        .map((option) => option.trim())
                        .filter(Boolean)
                        .map((option) => ({ label: option, value: option }))
                    )
                  }
                />
              </div>
            </div>
          ))}
        </div>
        <button className="button-primary w-full" disabled={createProject.isPending} type="submit">
          {createProject.isPending ? "Saving..." : "Create Project"}
        </button>
      </form>
      <div className="space-y-4">
        <div className="panel">
          <h3 className="text-xl font-semibold">Project inventory</h3>
          <p className="mt-2 text-sm text-slate-500">All projects with linked dynamic forms.</p>
        </div>
        <DataTable columns={columns} rows={projects} />
      </div>
    </section>
  );
};

