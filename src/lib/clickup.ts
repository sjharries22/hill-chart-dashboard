import { Project, Task, getProjectColor } from './types';

const CLICKUP_API_BASE = 'https://api.clickup.com/api/v2';

interface ClickUpCustomField {
  name: string;
  type: string;
  value?: string | number;
  type_config?: {
    options?: Array<{ name: string; id: string; orderindex?: number }>;
  };
}

interface ClickUpTask {
  id: string;
  name: string;
  status: {
    status: string;
  };
  description?: string;
  parent?: string;
  custom_fields?: ClickUpCustomField[];
}

// Extract hill status from custom dropdown field
function getHillStatus(customFields?: ClickUpCustomField[]): string | null {
  if (!customFields) return null;

  // Look for a dropdown field named "Shape Up Hill Status" or with hill-related options
  for (const field of customFields) {
    if (field.type !== 'drop_down') continue;

    const fieldName = field.name.toLowerCase();
    const options = field.type_config?.options || [];
    const selectedOptionIndex = field.value as number;

    // Check if this is the hill status field by name or by options
    const isHillField =
      fieldName.includes('hill') ||
      fieldName.includes('shape up') ||
      options.some(
        (opt) =>
          opt.name.toLowerCase().includes('exploring') ||
          opt.name.toLowerCase().includes('climbing') ||
          opt.name.toLowerCase().includes('peak') ||
          opt.name.toLowerCase().includes('executing')
      );

    if (isHillField && selectedOptionIndex !== undefined && selectedOptionIndex !== null) {
      // ClickUp dropdown value is the orderindex of the selected option
      const selectedOption = options.find((opt) => opt.orderindex === selectedOptionIndex);
      if (selectedOption) {
        return selectedOption.name;
      }
    }
  }

  return null;
}

interface ClickUpList {
  statuses: Array<{
    status: string;
    orderindex: number;
  }>;
}

interface ClickUpSubtask {
  id: string;
  name: string;
  status: {
    status: string;
  };
  custom_fields?: ClickUpCustomField[];
}

export async function fetchClickUpTasks(
  apiKey: string,
  folderId: string
): Promise<Project[]> {
  // First, get all lists in the folder
  const listsResponse = await fetch(
    `${CLICKUP_API_BASE}/folder/${folderId}/list?archived=false`,
    {
      headers: {
        Authorization: apiKey,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!listsResponse.ok) {
    throw new Error(`ClickUp API error fetching lists: ${listsResponse.status}`);
  }

  const listsData = await listsResponse.json();
  const lists = listsData.lists || [];

  // Fetch tasks from all lists in parallel (without subtasks to get parent tasks)
  const allTasks: ClickUpTask[] = [];

  await Promise.all(
    lists.map(async (list: { id: string }) => {
      try {
        const tasksResponse = await fetch(
          `${CLICKUP_API_BASE}/list/${list.id}/task?include_closed=true`,
          {
            headers: {
              Authorization: apiKey,
              'Content-Type': 'application/json',
            },
          }
        );

        if (tasksResponse.ok) {
          const tasksData = await tasksResponse.json();
          allTasks.push(...(tasksData.tasks || []));
        }
      } catch (e) {
        console.error(`Error fetching tasks from list ${list.id}:`, e);
      }
    })
  );

  // Filter for tasks that have the hill status dropdown set (these are projects)
  const hillTasks = allTasks.filter((task) => {
    const hillStatus = getHillStatus(task.custom_fields);
    return hillStatus !== null && !task.parent;
  });

  // Fetch subtasks for each hill task
  const projects: Project[] = await Promise.all(
    hillTasks.map(async (task, index) => {
      // Fetch task details with subtasks
      let subtasks: Task[] = [];
      let tasksByStatus: Record<string, Task[]> = {};

      try {
        const taskResponse = await fetch(
          `${CLICKUP_API_BASE}/task/${task.id}?include_subtasks=true`,
          {
            headers: {
              Authorization: apiKey,
              'Content-Type': 'application/json',
            },
          }
        );

        if (taskResponse.ok) {
          const taskData = await taskResponse.json();
          const rawSubtasks: ClickUpSubtask[] = taskData.subtasks || [];

          // Process subtasks - get their hill status or mark as "No Status"
          subtasks = rawSubtasks.map((st) => {
            const stHillStatus = getHillStatus(st.custom_fields);
            return {
              id: st.id,
              name: st.name,
              status: stHillStatus || 'No Status',
            };
          });

          // Group subtasks by their hill status
          for (const st of subtasks) {
            const status = st.status;
            if (!tasksByStatus[status]) {
              tasksByStatus[status] = [];
            }
            tasksByStatus[status].push(st);
          }
        }
      } catch (e) {
        console.error(`Error fetching subtasks for task ${task.id}:`, e);
      }

      // Extract notes from description or custom field
      let notes = task.description || '';
      const notesField = task.custom_fields?.find(
        (f) => f.name.toLowerCase() === 'notes' || f.name.toLowerCase() === 'hill notes'
      );
      if (notesField?.value) {
        notes = String(notesField.value);
      }

      // Get hill status from custom dropdown (for parent task positioning on hill)
      const hillStatus = getHillStatus(task.custom_fields) || task.status.status;

      return {
        id: task.id,
        name: task.name,
        status: hillStatus,
        notes: notes.slice(0, 200),
        color: getProjectColor(task.name, index),
        tasks: subtasks,
        tasksByStatus,
      };
    })
  );

  return projects;
}

// Mock data for development/testing
export function getMockProjects(): Project[] {
  return [
    {
      id: '1',
      name: 'CHIP Rollup V2',
      status: 'Climbing',
      notes: 'Overview Page still has unknowns, team still needs to review. Wireframes for metrics still need to be completed and reviewed.',
      color: '#E879A0',
      tasks: [
        { id: '1a', name: 'Design overview page', status: 'in progress' },
        { id: '1b', name: 'Create wireframes', status: 'to do' },
        { id: '1c', name: 'Review with team', status: 'to do' },
      ],
      tasksByStatus: {
        'in progress': [{ id: '1a', name: 'Design overview page', status: 'in progress' }],
        'to do': [
          { id: '1b', name: 'Create wireframes', status: 'to do' },
          { id: '1c', name: 'Review with team', status: 'to do' },
        ],
      },
    },
    {
      id: '2',
      name: 'Survey Tool',
      status: 'At Peak',
      notes: '3/4 of the way up the hill. Mostly know everything they need to scope.',
      color: '#1F2937',
      tasks: [
        { id: '2a', name: 'Finalize requirements', status: 'complete' },
        { id: '2b', name: 'Technical design', status: 'in progress' },
        { id: '2c', name: 'API integration', status: 'to do' },
      ],
      tasksByStatus: {
        'complete': [{ id: '2a', name: 'Finalize requirements', status: 'complete' }],
        'in progress': [{ id: '2b', name: 'Technical design', status: 'in progress' }],
        'to do': [{ id: '2c', name: 'API integration', status: 'to do' }],
      },
    },
    {
      id: '3',
      name: 'AI Microservice',
      status: 'Descending',
      notes: 'More unknowns, will be ironed out once we get an end-to-end demo completed.',
      color: '#4ADE80',
      tasks: [
        { id: '3a', name: 'Model selection', status: 'complete' },
        { id: '3b', name: 'Build demo', status: 'in progress' },
        { id: '3c', name: 'Integration testing', status: 'to do' },
        { id: '3d', name: 'Documentation', status: 'to do' },
      ],
      tasksByStatus: {
        'complete': [{ id: '3a', name: 'Model selection', status: 'complete' }],
        'in progress': [{ id: '3b', name: 'Build demo', status: 'in progress' }],
        'to do': [
          { id: '3c', name: 'Integration testing', status: 'to do' },
          { id: '3d', name: 'Documentation', status: 'to do' },
        ],
      },
    },
    {
      id: '4',
      name: 'SOC 2',
      status: 'Executing',
      notes: 'Status: Executing. On track for completion.',
      color: '#3B82F6',
      tasks: [
        { id: '4a', name: 'Evidence collection', status: 'complete' },
        { id: '4b', name: 'Control testing', status: 'complete' },
        { id: '4c', name: 'Audit preparation', status: 'in progress' },
        { id: '4d', name: 'Final review', status: 'to do' },
      ],
      tasksByStatus: {
        'complete': [
          { id: '4a', name: 'Evidence collection', status: 'complete' },
          { id: '4b', name: 'Control testing', status: 'complete' },
        ],
        'in progress': [{ id: '4c', name: 'Audit preparation', status: 'in progress' }],
        'to do': [{ id: '4d', name: 'Final review', status: 'to do' }],
      },
    },
  ];
}
