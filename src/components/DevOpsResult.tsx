"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, ShieldAlert, Wrench, XCircle } from "lucide-react";

export interface FixPlan {
  action: "modify_file" | "install_package" | "install_dependency";
  file?: string;
  operation?: "append_line" | "replace_text";
  old_content?: string;
  content?: string;
  package_manager?: "npm" | "pnpm" | "yarn" | "pip";
  package?: string;
}

export interface AnalysisResult {
  status: string;
  repository: string;
  project_type: string;
  framework: string;
  exit_code: number;
  detected_error: string;
  error_type: string;
  root_cause: string;
  suggested_fix: string;
  confidence: number;
  fix_plan?: FixPlan | null;
  evidence?: string[];
  fixability?: string;
  agents?: Record<string, string>;
  final_status?: string;
}

interface FixResult {
  status: "success" | "failure";
  verification_exit_code: number;
  stdout: string;
  stderr: string;
  message: string;
}

interface RepositoryApplyResult {
  status: "success" | "failure";
  repository: string;
  branch?: string | null;
  changed_files: string[];
  commit_sha?: string | null;
  commit_message?: string | null;
  verification_command?: string | null;
  verification_exit_code?: number | null;
  push_status: "success" | "failure" | "not_attempted";
  pull_request_url?: string | null;
  pull_request_number?: number | null;
  pull_request_status: "success" | "failure" | "not_attempted";
  stages: string[];
  message: string;
}

interface DevOpsResultProps {
  repositoryUrl: string;
  analysis: AnalysisResult;
}

function isValidFixPlan(plan: FixPlan | null | undefined): plan is FixPlan {
  if (!plan || !["modify_file", "install_package", "install_dependency"].includes(plan.action)) return false;
  if (plan.action === "modify_file") return Boolean(plan.file && plan.content && (plan.operation === "append_line" || (plan.operation === "replace_text" && plan.old_content)));
  return Boolean(plan.package_manager && plan.package);
}

async function getErrorMessage(response: Response): Promise<string> {
  try {
    const body = await response.json();
    return body.detail || `Backend request failed with status ${response.status}`;
  } catch {
    return `Backend request failed with status ${response.status}`;
  }
}

export default function DevOpsResult({ repositoryUrl, analysis }: DevOpsResultProps) {
  const [fixState, setFixState] = useState<"idle" | "running" | "success" | "failure">("idle");
  const [fixResult, setFixResult] = useState<FixResult | null>(null);
  const [fixError, setFixError] = useState("");
  const [repositoryState, setRepositoryState] = useState<"idle" | "running" | "success" | "failure" | "declined">("idle");
  const [repositoryResult, setRepositoryResult] = useState<RepositoryApplyResult | null>(null);
  const [repositoryError, setRepositoryError] = useState("");
  const plan = isValidFixPlan(analysis.fix_plan) ? analysis.fix_plan : null;

  const applyFix = async () => {
    if (!plan) return;
    setFixState("running");
    setFixResult(null);
    setFixError("");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 360000);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      const response = await fetch(`${baseUrl}/api/fix`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repository_url: repositoryUrl, plan }),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(await getErrorMessage(response));
      const result = (await response.json()) as FixResult;
      setFixResult(result);
      setFixState(result.status === "success" ? "success" : "failure");
    } catch (error) {
      setFixState("failure");
      setFixError(error instanceof DOMException && error.name === "AbortError" ? "The fix request timed out." : error instanceof Error ? error.message : "The fix request failed unexpectedly.");
    } finally {
      window.clearTimeout(timeout);
    }
  };

  const applyToRepository = async () => {
    if (!plan) return;
    setRepositoryState("running");
    setRepositoryResult(null);
    setRepositoryError("");
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      const response = await fetch(`${baseUrl}/api/apply-to-repository`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repository_url: repositoryUrl, fix_plan: plan }),
      });
      if (!response.ok) throw new Error(await getErrorMessage(response));
      const result = (await response.json()) as RepositoryApplyResult;
      setRepositoryResult(result);
      setRepositoryState(result.status === "success" && result.push_status === "success" ? "success" : "failure");
    } catch (error) {
      setRepositoryState("failure");
      setRepositoryError(error instanceof Error ? error.message : "The repository update failed unexpectedly.");
    }
  };

  return (
    <section className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-[#11161C] p-4"><p className="text-xs uppercase tracking-widest text-[#9DA7B3]">Project</p><p className="mt-2 text-white">{analysis.project_type}</p><p className="text-sm text-[#9DA7B3]">{analysis.framework}</p></div>
        <div className="rounded-xl border border-white/10 bg-[#11161C] p-4"><p className="text-xs uppercase tracking-widest text-[#9DA7B3]">Status</p><p className={`mt-2 font-semibold ${analysis.status === "success" ? "text-green-400" : "text-red-400"}`}>{analysis.status === "success" ? "Checks passed" : "Failure detected"}</p><p className="text-sm text-[#9DA7B3]">Exit code: {analysis.exit_code}</p></div>
        <div className="rounded-xl border border-white/10 bg-[#11161C] p-4"><p className="text-xs uppercase tracking-widest text-[#9DA7B3]">Confidence</p><p className="mt-2 text-2xl font-semibold text-[#4F9CF9]">{analysis.confidence}%</p></div>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#11161C] p-5 space-y-4">
        <div><p className="text-xs uppercase tracking-widest text-[#9DA7B3]">Repository</p><p className="mt-1 break-all text-white">{repositoryUrl}</p></div>
        <div><p className="text-xs uppercase tracking-widest text-[#9DA7B3]">Detected error</p><p className="mt-1 whitespace-pre-wrap font-mono text-sm text-red-300">{analysis.detected_error || "No error detected."}</p><p className="mt-2 text-sm text-[#9DA7B3]">Type: <span className="text-white">{analysis.error_type}</span></p></div>
        <div><p className="text-xs uppercase tracking-widest text-[#9DA7B3]">Root cause</p><p className="mt-1 whitespace-pre-wrap text-[#D9E0E8]">{analysis.root_cause}</p></div>
        <div><p className="text-xs uppercase tracking-widest text-[#9DA7B3]">Suggested fix</p><p className="mt-1 whitespace-pre-wrap text-[#D9E0E8]">{analysis.suggested_fix}</p></div>
        <div><p className="text-xs uppercase tracking-widest text-[#9DA7B3]">Evidence</p>{analysis.evidence?.length ? <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-[#D9E0E8]">{analysis.evidence.map((item) => <li key={item}>{item}</li>)}</ul> : <p className="mt-1 text-sm text-[#9DA7B3]">No additional evidence was returned.</p>}</div>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#11161C] p-5">
        <p className="text-xs uppercase tracking-widest text-[#9DA7B3]">Agent pipeline</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {Object.entries(analysis.agents || {}).map(([agent, status]) => <div key={agent} className="flex items-center justify-between rounded-lg border border-white/5 bg-[#0B0F14] px-3 py-2 text-sm"><span className="text-[#D9E0E8]">{agent.replaceAll("_", " ")}</span><span className={status === "completed" ? "text-green-400" : "text-yellow-400"}>{status}</span></div>)}
        </div>
        <p className="mt-3 text-sm text-[#9DA7B3]">Final status: <span className="text-white">{analysis.final_status || "ANALYSIS_ONLY"}</span> · Fixability: <span className="text-white">{analysis.fixability || "uncertain"}</span></p>
      </div>

      <div className="rounded-xl border border-[#4F9CF9]/25 bg-[#11161C] p-5">
        <div className="flex items-center gap-2 text-white"><Wrench size={18} className="text-[#4F9CF9]" /><h3 className="font-semibold">Fix Plan</h3></div>
        {plan ? (
          <>
            <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
              <div><dt className="text-[#9DA7B3]">Action</dt><dd className="text-white">{plan.action}</dd></div>
              {plan.file && <div><dt className="text-[#9DA7B3]">File</dt><dd className="font-mono text-white">{plan.file}</dd></div>}
              {plan.operation && <div><dt className="text-[#9DA7B3]">Operation</dt><dd className="text-white">{plan.operation}</dd></div>}
              {plan.package_manager && <div><dt className="text-[#9DA7B3]">Package manager</dt><dd className="text-white">{plan.package_manager}</dd></div>}
              {plan.package && <div><dt className="text-[#9DA7B3]">Package</dt><dd className="font-mono text-white">{plan.package}</dd></div>}
            </dl>
            <pre className="mt-4 overflow-x-auto rounded-lg border border-white/10 bg-[#05070A] p-3 text-xs text-[#9DA7B3]">{JSON.stringify(plan, null, 2)}</pre>
            <button type="button" onClick={applyFix} disabled={fixState === "running"} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#4F9CF9] px-5 py-3 font-medium text-white hover:bg-[#3A8BE6] disabled:cursor-wait disabled:opacity-60">{fixState === "running" ? <Loader2 size={18} className="animate-spin" /> : <Wrench size={18} />}{fixState === "running" ? "Applying Fix..." : "Apply Fix"}</button>
          </>
        ) : <p className="mt-4 flex items-start gap-2 text-sm text-[#9DA7B3]"><ShieldAlert size={17} className="mt-0.5 shrink-0 text-yellow-400" />No safely validated fix plan was returned. No Apply Fix action is available.</p>}
      </div>

      {fixState === "running" && <div className="rounded-xl border border-[#4F9CF9]/25 bg-[#11161C] p-5 text-[#D9E0E8]"><div className="flex items-center gap-2"><Loader2 size={18} className="animate-spin text-[#4F9CF9]" />Validating and verifying the fix in an isolated clone...</div><p className="mt-2 text-sm text-[#9DA7B3]">The backend is applying the validated plan and running its verification command.</p></div>}
      {fixState === "success" && fixResult && <div className="rounded-xl border border-green-400/25 bg-green-400/10 p-5"><div className="flex items-center gap-2 font-semibold text-green-300"><CheckCircle2 size={19} />Fix Applied Successfully</div><p className="mt-3 text-sm text-[#D9E0E8]">Verification: <strong>PASSED</strong></p><p className="text-sm text-[#D9E0E8]">Exit code: <strong>{fixResult.verification_exit_code}</strong></p><p className="mt-3 text-sm text-[#9FE3B1]">Fix verified in an isolated clone. The original repository has not been modified.</p><div className="mt-4 border-t border-green-300/20 pt-4"><p className="font-semibold text-white">Fix verified successfully.</p><p className="mt-1 text-sm text-[#D9E0E8]">Do you want to apply this verified fix to the original GitHub repository?</p>{repositoryState === "idle" && <div className="mt-4 flex flex-wrap gap-3"><button type="button" onClick={applyToRepository} className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 font-medium text-[#07110A] hover:bg-green-400"><Wrench size={17} />Yes, Apply to Repository</button><button type="button" onClick={() => setRepositoryState("declined")} className="rounded-lg border border-white/20 px-4 py-2 font-medium text-white hover:bg-white/10">No, Keep Repository Unchanged</button></div>}{repositoryState === "running" && <div className="mt-4 flex items-center gap-2 text-sm text-[#D9E0E8]"><Loader2 size={17} className="animate-spin" />Applying the verified fix to a new branch and verifying it again...</div>}{repositoryState === "declined" && <p className="mt-4 text-sm font-semibold text-[#9FE3B1]">Repository unchanged.</p>}{repositoryState === "failure" && <div className="mt-4 rounded-lg border border-red-300/20 bg-red-300/10 p-3 text-sm text-red-100"><p className="font-semibold">Repository update failed</p><p className="mt-1 whitespace-pre-wrap">{repositoryError || repositoryResult?.message}</p></div>}{repositoryState === "success" && repositoryResult && <div className="mt-4 rounded-lg border border-green-300/20 bg-green-300/10 p-4 text-sm text-[#D9E0E8]"><p className="font-semibold text-green-200">Fix Applied to Repository</p><p className="mt-2">Branch: <strong>{repositoryResult.branch}</strong></p><p>Changed files: <strong>{repositoryResult.changed_files.join(", ")}</strong></p><p>Commit: <strong>{repositoryResult.commit_sha}</strong></p><p>Verification: <strong>PASSED</strong></p><p>Push: <strong>SUCCESS</strong></p><p>Pull Request: <strong>{repositoryResult.pull_request_url || `#${repositoryResult.pull_request_number}`}</strong></p><p className="mt-2 text-[#9FE3B1]">The verified fix was pushed to the new branch and a Pull Request was created.</p></div>}</div></div>}
      {fixState === "failure" && <div className="rounded-xl border border-red-400/25 bg-red-400/10 p-5"><div className="flex items-center gap-2 font-semibold text-red-300"><XCircle size={19} />Fix Failed</div><p className="mt-3 whitespace-pre-wrap text-sm text-red-100">{fixError || fixResult?.message || "The backend could not verify the fix."}</p>{fixResult && <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap text-xs text-red-200">{fixResult.stderr || fixResult.stdout}</pre>}</div>}
    </section>
  );
}
