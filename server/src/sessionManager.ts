const PA9_GUI_INTERNAL = process.env.PA9_GUI_INTERNAL || 'http://pa9-gui:6090';

interface Session {
  sessionId: string;
  display: number;
  vncPort: number;
  wsPort: number;
  workspaceDir: string;
  createdAt: string;
}

export async function createSession(): Promise<Session> {
  const res = await fetch(`${PA9_GUI_INTERNAL}/internal/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`Failed to create session: ${res.statusText}`);
  }

  const data = await res.json() as any;
  return {
    sessionId: data.sessionId,
    display: data.display,
    vncPort: data.vncPort,
    wsPort: data.wsPort,
    workspaceDir: data.workspaceDir,
    createdAt: new Date().toISOString(),
  };
}

export async function deleteSession(sessionId: string): Promise<void> {
  const res = await fetch(`${PA9_GUI_INTERNAL}/internal/sessions/${sessionId}`, {
    method: 'DELETE',
  });

  if (!res.ok && res.status !== 404) {
    throw new Error(`Failed to delete session: ${res.statusText}`);
  }
}

export async function getSession(sessionId: string): Promise<Session | null> {
  const res = await fetch(`${PA9_GUI_INTERNAL}/internal/sessions/${sessionId}`);

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`Failed to get session: ${res.statusText}`);
  }

  return await res.json() as Session;
}

export async function updateActivity(sessionId: string): Promise<void> {
  await fetch(`${PA9_GUI_INTERNAL}/internal/sessions/${sessionId}/activity`, {
    method: 'POST',
  });
}
